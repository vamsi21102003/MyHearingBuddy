import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';

import { colors, typography, spacing } from '../../utils/theme';
import { useAppContext } from '../../context/AppContext';
import NetworkStatus from '../../components/NetworkStatus';
// import { HandLandmarkOverlay } from '../../components/HandLandmarkOverlay'; // Removed - no longer needed
import { signLanguageService } from '../../services/signLanguageService';
import { generateAnimatedLandmarks } from '../../utils/mockLandmarks';

// VisionCamera imports (commented out for Expo Go compatibility)
// import { VisionCameraView } from '../../components/VisionCameraView';
// import { useOnDeviceDetection } from '../../hooks/useOnDeviceDetection';
// import { tensorflowService } from '../../services/tensorflowService';

const { width, height } = Dimensions.get('window');

const LiveDetectScreen: React.FC = () => {
  const { settings, addToWord, clearWord, addOpenAICompletion } = useAppContext();
  const [permission, requestPermission] = useCameraPermissions();
  
  // Camera state (restored Expo Camera implementation)
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Feature flag for VisionCamera (future development builds)
  const USE_VISION_CAMERA = __DEV__ && Platform.OS !== 'web' && Constants?.appOwnership !== 'expo';
  
  // On-device detection hook (commented out for now)
  // const {
  //   isDetecting: onDeviceDetecting,
  //   isProcessing,
  //   lastDetection,
  //   detectionHistory,
  //   processImage,
  //   startDetection: startOnDeviceDetection,
  //   stopDetection: stopOnDeviceDetection,
  //   clearHistory,
  //   getDetectionStats
  // } = useOnDeviceDetection();
  
  // Detection state (exact logic from inference_classifier.py)
  const [accumulatedText, setAccumulatedText] = useState('');
  const [currentPrediction, setCurrentPrediction] = useState('');
  const [lastPrediction, setLastPrediction] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'connecting'>('online');
  const [frameCount, setFrameCount] = useState(0);
  const [newLetterAdded, setNewLetterAdded] = useState(false); // For animation effect
  
  // Use refs for values that need to be current in callbacks
  const lastPredictionRef = useRef('');
  const stablePredictionStartRef = useRef(0);
  const handleSendGestureRef = useRef<(() => Promise<void>) | null>(null);
  
  // Prediction stability tracking (exact from inference_classifier.py)
  const [stablePredictionStart, setStablePredictionStart] = useState(0);
  const [isHoldingSend, setIsHoldingSend] = useState(false);
  const [sendGestureStartTime, setSendGestureStartTime] = useState(0);
  const [sendProgress, setSendProgress] = useState(0);
  
  // Detection processing
  const detectionInterval = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const isProcessingFrame = useRef(false);
  const isDetectingRef = useRef(false);

  // Parameters matching inference_classifier.py EXACTLY
  const DETECTION_INTERVAL = 200; // 200ms like inference_classifier.py
  const PREDICTION_STABILITY_TIME = 400; // 0.4 seconds - easier to hold gestures
  const SEND_GESTURE_HOLD_TIME = 900; // 0.9 seconds for SEND gesture
  const CONFIDENCE_THRESHOLD = 0.25;

  // Setup silent audio (restored original implementation)
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('🎯 Real-time detection mode - silent audio configured');
      } catch (error) {
        console.log('Audio setup error:', error);
      }
    };

    setupAudio();
  }, []);

  // Real-time capture and detect (restored original 200ms intervals)
  const captureAndDetect = useCallback(async () => {
    if (!cameraRef.current || !isCameraReady || isProcessingFrame.current || !isDetectingRef.current) {
      return;
    }

    isProcessingFrame.current = true;
    setFrameCount(prev => prev + 1);

    try {
      // Optimized capture settings for real-time performance
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.2, // Low quality for speed
        base64: true,
        skipProcessing: true,
        exif: false,
        imageType: 'jpg',
      });

      if (photo.base64) {
        setNetworkStatus('connecting');
        
        const response = await signLanguageService.detectSign(photo.base64);

        if (response.success && response.confidence >= CONFIDENCE_THRESHOLD) {
          const prediction = response.prediction;
          setCurrentPrediction(prediction);
          setConfidence(response.confidence);
          setNetworkStatus('online');
          
          console.log(`🎯 Detection: ${prediction} (${Math.round(response.confidence * 100)}%)`);
          
          // Process prediction with EXACT inference_classifier.py logic
          processDetectionResult(prediction, response.confidence);
          
          // Haptic feedback
          if (settings.hapticsEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } else {
          // Handle "No hand found" or low confidence detection
          if (response.message) {
            // Display the message (e.g., "No hand found") instead of empty
            setCurrentPrediction(response.message);
            setConfidence(0);
            console.log(`ℹ️ ${response.message}`);
          } else {
            // No valid detection - this is normal when no hand is present
            setCurrentPrediction('');
            setConfidence(0);
          }
          
          setNetworkStatus('online');
          
          // Reset prediction tracking when no hand detected
          setLastPrediction('');
          setStablePredictionStart(0);
          resetSendGesture();
        }
      }
    } catch (error) {
      console.error('🚨 Detection error:', error);
      setNetworkStatus('offline');
      setCurrentPrediction('Connection Error');
      setConfidence(0);
    } finally {
      isProcessingFrame.current = false;
    }
  }, [isCameraReady, frameCount, settings.hapticsEnabled, processDetectionResult]);

  // Handle detection results (placeholder for VisionCamera integration)
  const handleDetection = useCallback((result: {
    letter: string;
    confidence: number;
    allPredictions: Array<{ letter: string; confidence: number }>;
  }) => {
    // This will be used when VisionCamera is enabled
    setCurrentPrediction(result.letter);
    setConfidence(result.confidence);
    setFrameCount(prev => prev + 1);
    
    console.log(`🎯 On-device Detection: ${result.letter} (${Math.round(result.confidence * 100)}%)`);
    
    // Process prediction with EXACT inference_classifier.py logic
    processDetectionResult(result.letter, result.confidence);
    
    // Haptic feedback
    if (settings.hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [settings.hapticsEnabled, processDetectionResult]);

  // EXACT prediction processing logic from inference_classifier.py
  const processDetectionResult = useCallback((prediction: string, confidence: number) => {
    const currentTime = Date.now();

    // 🔍 DEBUG: Always log when this function is called
    console.log(`🔍 processDetectionResult called: ${prediction} (${confidence})`);
    console.log(`🔍 Processing: ${prediction}, Last: "${lastPredictionRef.current}", Stable start: ${stablePredictionStartRef.current}`);
    console.log(`🔍 Comparison: "${prediction}" === "${lastPredictionRef.current}" = ${prediction === lastPredictionRef.current}`);

    if (prediction === lastPredictionRef.current) {
      console.log(`🔍 SAME prediction detected!`);
      if (stablePredictionStartRef.current === 0) {
        stablePredictionStartRef.current = currentTime;
        setStablePredictionStart(currentTime);
        console.log(`⏱️ Started stability timer for: ${prediction}`);
      } else if (currentTime - stablePredictionStartRef.current >= PREDICTION_STABILITY_TIME) {
        console.log(`✅ Prediction stable for ${currentTime - stablePredictionStartRef.current}ms: ${prediction}`);
        
        // Special handling for SEND gesture (EXACT logic from inference_classifier.py)
        if (prediction === 'SEND') {
          console.log(`🚀 SEND gesture detected! isHoldingSend: ${isHoldingSend}`);
          if (!isHoldingSend) {
            // Start holding SEND gesture
            setIsHoldingSend(true);
            setSendGestureStartTime(currentTime);
            console.log('🚀 Starting SEND gesture hold timer (0.9 seconds)...');
            
            // Start progress tracking
            if (progressInterval.current) {
              clearInterval(progressInterval.current);
            }
            progressInterval.current = setInterval(() => {
              const elapsed = Date.now() - currentTime;
              const progress = Math.min(elapsed / SEND_GESTURE_HOLD_TIME, 1);
              setSendProgress(progress);
              console.log(`🚀 SEND progress: ${Math.round(progress * 100)}% (${elapsed}ms / ${SEND_GESTURE_HOLD_TIME}ms)`);
              
              if (progress >= 1) {
                // SEND gesture completed
                console.log('🚀 SEND gesture completed! Calling handleSendGesture...');
                if (progressInterval.current) {
                  clearInterval(progressInterval.current);
                  progressInterval.current = null;
                }
                // Use ref to avoid closure issues
                if (handleSendGestureRef.current) {
                  console.log('🚀 Executing handleSendGesture via ref...');
                  handleSendGestureRef.current();
                } else {
                  console.log('🚀 handleSendGestureRef.current is null!');
                }
              }
            }, 50);
            
          } else if (currentTime - sendGestureStartTime >= SEND_GESTURE_HOLD_TIME) {
            // SEND gesture held long enough
            console.log('🚀 SEND gesture held long enough! Calling handleSendGesture...');
            handleSendGesture();
          }
        } else {
          // 🔍 DEBUG: Log before letter addition
          console.log(`🔍 About to add letter: ${prediction}`);
          
          // Regular letter or SPACE (EXACT logic from inference_classifier.py)
          if (prediction === 'SPACE') {
            console.log(`🔍 Adding SPACE...`);
            setAccumulatedText(prev => {
              const newText = prev + ' ';
              console.log(`✅ Added SPACE to text box. New text: "${newText}"`);
              return newText;
            });
            addToWord(' ');
          } else if (prediction.match(/^[A-Z]$/)) {
            console.log(`🔍 Adding letter ${prediction}...`);
            setAccumulatedText(prev => {
              const newText = prev + prediction;
              console.log(`✅ Added letter "${prediction}" to text box. New text: "${newText}"`);
              return newText;
            });
            addToWord(prediction);
          } else {
            console.log(`🔍 Prediction "${prediction}" doesn't match letter pattern`);
          }
          
          // Trigger animation effect for new letter
          setNewLetterAdded(true);
          setTimeout(() => setNewLetterAdded(false), 500);
          
          // Reset stability timer
          stablePredictionStartRef.current = 0;
          setStablePredictionStart(0);
          // Reset SEND gesture tracking
          resetSendGesture();
        }
      } else {
        const elapsed = currentTime - stablePredictionStartRef.current;
        console.log(`⏳ Waiting for stability: ${elapsed}ms / ${PREDICTION_STABILITY_TIME}ms for ${prediction}`);
      }
    } else {
      // Different prediction, reset all timers (EXACT logic from inference_classifier.py)
      console.log(`🔍 DIFFERENT prediction detected!`);
      console.log(`🔄 Prediction changed from "${lastPredictionRef.current}" to "${prediction}" - resetting timers`);
      lastPredictionRef.current = prediction;
      setLastPrediction(prediction);
      stablePredictionStartRef.current = 0;
      setStablePredictionStart(0);
      resetSendGesture();
    }
  }, [isHoldingSend, sendGestureStartTime, addToWord]);

  // Reset SEND gesture tracking
  const resetSendGesture = useCallback(() => {
    setIsHoldingSend(false);
    setSendGestureStartTime(0);
    setSendProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  // SEND gesture handling (matching inference_classifier.py)
  const handleSendGesture = useCallback(async () => {
    console.log('🚀 handleSendGesture called!');
    console.log(`🚀 Accumulated text: "${accumulatedText}"`);
    console.log(`🚀 Accumulated text length: ${accumulatedText.length}`);
    console.log(`🚀 Accumulated text trimmed: "${accumulatedText.trim()}"`);
    console.log(`🚀 Accumulated text trimmed length: ${accumulatedText.trim().length}`);
    
    if (accumulatedText.trim()) {
      console.log('🚀 Text exists, proceeding with OpenAI call...');
      try {
        console.log(`🚀 About to call signLanguageService.completeText with: '${accumulatedText}'`);
        
        // Try AI completion first
        const completedText = await signLanguageService.completeText(
          accumulatedText,
          addOpenAICompletion // Pass the database save function
        );
        console.log(`🚀 OpenAI Response received: ${completedText}`);
        
        // Speak immediately (don't wait for alert)
        console.log('🚀 Starting speech immediately...');
        Speech.speak(completedText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.8,
        });
        console.log('🚀 Speech started (non-blocking)');
        
        // Show alert
        console.log('🚀 About to show success alert...');
        Alert.alert(
          'Text Sent & Completed! ✅',
          `Original: "${accumulatedText}"\n\nCompleted: "${completedText}"`,
          [{ text: 'OK' }]
        );
        console.log('🚀 Success alert shown');
      } catch (error) {
        console.log('🚀 OpenAI call failed, error:', error);
        // Fallback to just speaking the original text
        console.log('🚀 AI completion failed, speaking original text');
        await Speech.speak(accumulatedText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.8,
        });
        
        Alert.alert(
          'Text Sent! ✅',
          `Sent: "${accumulatedText}"`,
          [{ text: 'OK' }]
        );
      }
    } else {
      console.log('🚀 No text to send - accumulatedText is empty or whitespace only');
      Alert.alert('No Text', 'No text to send. Start detecting gestures first.');
    }
    
    console.log('🚀 About to clear text and reset...');
    // Clear text after sending (matching inference_classifier.py)
    setAccumulatedText('');
    clearWord();
    resetSendGesture();
    
    // Reset stability to prevent immediate re-trigger
    setStablePredictionStart(0);
    
    // Haptic feedback
    if (settings.hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    console.log('🚀 handleSendGesture completed');
  }, [accumulatedText, clearWord, resetSendGesture, settings.hapticsEnabled]);

  // Update ref when function changes
  useEffect(() => {
    handleSendGestureRef.current = handleSendGesture;
  }, [handleSendGesture]);

  // Start/stop detection (restored original implementation)
  const toggleDetection = useCallback(() => {
    if (!isCameraReady) {
      Alert.alert('Camera Not Ready', 'Please wait for the camera to initialize.');
      return;
    }

    if (USE_VISION_CAMERA) {
      // VisionCamera implementation (for development builds)
      // if (!tensorflowService.isModelLoaded()) {
      //   Alert.alert('Model Not Ready', 'Please wait for the TensorFlow.js model to load.');
      //   return;
      // }
      // 
      // if (isDetecting) {
      //   console.log('🛑 Stopping on-device detection');
      //   stopDetection();
      //   isDetectingRef.current = false;
      // } else {
      //   console.log('🎯 Starting on-device detection (silent frame capture every 2.5s)');
      //   startDetection();
      //   isDetectingRef.current = true;
      // }
    } else {
      // Expo Camera implementation (current)
      if (isDetecting) {
        // If SEND gesture is in progress, warn user before stopping
        if (isHoldingSend && sendProgress > 0.1) { // If more than 10% complete
          Alert.alert(
            'SEND in Progress',
            `SEND gesture is ${Math.round(sendProgress * 100)}% complete. Stop anyway?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Stop Detection', 
                style: 'destructive',
                onPress: () => {
                  console.log('🛑 Force stopping detection (SEND gesture cancelled)');
                  setIsDetecting(false);
                  isDetectingRef.current = false;
                  
                  if (detectionInterval.current) {
                    clearInterval(detectionInterval.current);
                    detectionInterval.current = null;
                  }
                  
                  resetSendGesture();
                  setCurrentPrediction('');
                  setConfidence(0);
                  setFrameCount(0);
                  setNetworkStatus('online');
                  setLastPrediction('');
                  setStablePredictionStart(0);
                }
              }
            ]
          );
          return; // Don't stop detection immediately
        }
        
        console.log('🛑 Stopping real-time detection');
        setIsDetecting(false);
        isDetectingRef.current = false;
        
        if (detectionInterval.current) {
          clearInterval(detectionInterval.current);
          detectionInterval.current = null;
        }
        
        resetSendGesture();
        setCurrentPrediction('');
        setConfidence(0);
        setFrameCount(0);
        setNetworkStatus('online');
        setLastPrediction('');
        setStablePredictionStart(0);
      } else {
        console.log('🎯 Starting real-time detection (200ms intervals like inference_classifier.py)');
        setIsDetecting(true);
        isDetectingRef.current = true;
        setFrameCount(0);
        setLastPrediction('');
        setStablePredictionStart(0);
        resetSendGesture();
        
        // Start detection loop (200ms intervals like inference_classifier.py)
        detectionInterval.current = setInterval(() => {
          if (isDetectingRef.current) {
            captureAndDetect();
          }
        }, DETECTION_INTERVAL);
        
        // Start immediately
        setTimeout(() => {
          if (isDetectingRef.current) {
            captureAndDetect();
          }
        }, 100);
      }
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [isCameraReady, isDetecting, captureAndDetect, resetSendGesture, USE_VISION_CAMERA, isHoldingSend, sendProgress]);

  // Camera controls (restored)
  const switchCamera = useCallback(() => {
    setCameraType(prev => prev === 'back' ? 'front' : 'back');
  }, []);

  const clearText = useCallback(() => {
    setAccumulatedText('');
    clearWord();
    setCurrentPrediction('');
    setConfidence(0);
    setLastPrediction('');
    setStablePredictionStart(0);
    setNewLetterAdded(false); // Reset animation state
    // setHandLandmarks([]); // Clear landmarks (disabled)
    resetSendGesture();
    // clearHistory(); // Uncomment when using VisionCamera
  }, [clearWord, resetSendGesture]);

  // Toggle landmark visibility (removed - landmarks disabled)
  // const toggleLandmarks = useCallback(() => {
  //   setShowLandmarks(prev => !prev);
  //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  // }, []);

  // Manual clear (like 'c' key in inference_classifier.py)
  const handleManualClear = useCallback(() => {
    console.log('Text cleared');
    clearText();
  }, [clearText]);

  // Manual send (like 's' key in inference_classifier.py)
  const handleManualSend = useCallback(async () => {
    if (accumulatedText.trim()) {
      console.log(`Manually sending text to OpenAI: '${accumulatedText}'`);
      await handleSendGesture();
    } else {
      console.log('No text to send');
      Alert.alert('No Text', 'No text to send. Start detecting gestures first.');
    }
  }, [accumulatedText, handleSendGesture]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      isDetectingRef.current = false;
      // tensorflowService.dispose(); // Uncomment when using TensorFlow.js
    };
  }, []);

  // Permission handling (restored)
  useEffect(() => {
    if (permission === null) return;

    if (permission && !permission.granted) {
      Alert.alert(
        'Camera Permission Required',
        'MyHearingBuddy needs camera access for real-time detection.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: requestPermission },
        ]
      );
    }
  }, [permission, requestPermission]);

  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Camera View - Conditional rendering for future VisionCamera support */}
      <View style={styles.cameraContainer}>
        {USE_VISION_CAMERA ? (
          // VisionCamera implementation (for development builds)
          <View style={styles.camera}>
            {/* <VisionCameraView
              style={styles.camera}
              onDetection={handleDetection}
            /> */}
            <Text style={styles.developmentText}>
              VisionCamera requires development build{'\n'}
              Run: expo run:android
            </Text>
          </View>
        ) : (
          // Expo Camera implementation (current - works in Expo Go)
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraType}
            onCameraReady={() => {
              console.log('🎯 Camera ready for real-time detection');
              setTimeout(() => {
                setIsCameraReady(true);
                console.log('🎯 Ready for real-time detection (200ms intervals)');
              }, 1000);
            }}
          />
        )}
        
        {/* Hand Landmark Overlay - Removed for cleaner detection view */}
        {/* <HandLandmarkOverlay
          landmarks={handLandmarks}
          width={width}
          height={height}
          isVisible={showLandmarks && handLandmarks.length > 0}
        /> */}
        
        {/* Detection Frame */}
        <View style={styles.frameOverlay}>
          <View style={[
            styles.detectionFrame,
            isDetecting && styles.detectionFrameActive,
            networkStatus === 'offline' && styles.detectionFrameError
          ]} />
          
          {/* Detection Info */}
          <View style={styles.enhancedInfo}>
            <Text style={styles.enhancedInfoTitle}>
              {USE_VISION_CAMERA ? 'VisionCamera Mode' : 'Expo Camera Mode'}
            </Text>
            <Text style={styles.enhancedInfoText}>
              {USE_VISION_CAMERA ? (
                '✅ Silent frame capture\n✅ On-device TensorFlow.js\n✅ No backend calls\n⚠️ Requires development build'
              ) : (
                '✅ Backend integration\n✅ Real-time detection\n✅ 200ms intervals\n✅ Works in Expo Go'
              )}
            </Text>
          </View>
        </View>

        {/* Top Status */}
        <SafeAreaView style={styles.topBar}>
          <NetworkStatus status={networkStatus} />
        </SafeAreaView>

        {/* Detection Results */}
        <View style={styles.resultContainer}>
          {currentPrediction && (
            <View style={[
              styles.predictionContainer,
              currentPrediction === 'No hand found' && styles.noHandContainer,
              currentPrediction === 'Connection Error' && styles.errorContainer
            ]}>
              <Text style={styles.predictionLabel}>
                {currentPrediction === 'No hand found' ? 'Status:' : 
                 currentPrediction === 'Connection Error' ? 'Error:' : 'Current:'}
              </Text>
              <Text style={[
                styles.predictionText,
                currentPrediction === 'No hand found' && styles.noHandText,
                currentPrediction === 'Connection Error' && styles.errorText
              ]}>
                {currentPrediction}
              </Text>
              {currentPrediction !== 'No hand found' && currentPrediction !== 'Connection Error' && (
                <Text style={styles.confidenceText}>{Math.round(confidence * 100)}%</Text>
              )}
            </View>
          )}
          
          {/* SEND Gesture Progress - Enhanced */}
          {isHoldingSend && (
            <View style={styles.sendProgressContainer}>
              <Text style={styles.sendProgressLabel}>🚀 Sending to AI...</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${sendProgress * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.sendProgressText}>
                  {((1 - sendProgress) * 2).toFixed(1)}s
                </Text>
              </View>
              <Text style={styles.sendInstructionText}>
                Keep holding SEND gesture...
              </Text>
            </View>
          )}
          
          {isDetecting && (
            <View style={styles.statusContainer}>
              <MaterialIcons 
                name={USE_VISION_CAMERA ? "offline-bolt" : "camera-alt"} 
                size={12} 
                color={colors.success} 
              />
              <Text style={styles.statusText}>
                Frame #{frameCount} ({USE_VISION_CAMERA ? 'On-Device' : '200ms'})
              </Text>
            </View>
          )}
          
          {/* Stability indicator */}
          {stablePredictionStart > 0 && currentPrediction && (
            <View style={styles.stabilityContainer}>
              <Text style={styles.stabilityText}>
                Stabilizing: {currentPrediction}
              </Text>
            </View>
          )}
        </View>

        {/* Text Accumulation Box - Enhanced Display */}
        <View style={styles.textContainer}>
          <View style={styles.textDisplay}>
            <View style={styles.textHeader}>
              <Text style={styles.textLabel}>📝 Accumulated Text:</Text>
              <View style={styles.textControls}>
                <TouchableOpacity 
                  style={[styles.textControlButton, { backgroundColor: accumulatedText.trim() ? colors.success : 'rgba(255, 255, 255, 0.2)' }]}
                  onPress={handleManualSend}
                  disabled={!accumulatedText.trim()}
                >
                  <MaterialIcons 
                    name="send" 
                    size={16} 
                    color={colors.surface} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.textControlButton, { backgroundColor: colors.error }]}
                  onPress={handleManualClear}
                >
                  <MaterialIcons 
                    name="clear" 
                    size={16} 
                    color={colors.surface} 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Letter-by-Letter Display Boxes */}
            <View style={styles.accumulationBox}>
              <Text style={styles.boxTitle}>Detected Letters:</Text>
              <View style={styles.letterBoxContainer}>
                {accumulatedText.split('').map((letter, index) => (
                  <View key={index} style={[
                    styles.individualLetterBox,
                    index === accumulatedText.length - 1 && styles.latestLetterBox
                  ]}>
                    <Text style={styles.letterBoxText}>
                      {letter === ' ' ? '␣' : letter}
                    </Text>
                  </View>
                ))}
                {accumulatedText.length === 0 && (
                  <View style={styles.emptyLetterBox}>
                    <Text style={styles.emptyLetterText}>Start signing...</Text>
                  </View>
                )}
              </View>
              
              {/* Full Text Preview */}
              <View style={styles.fullTextPreview}>
                <Text style={styles.fullTextLabel}>Complete Text:</Text>
                <Text style={styles.textContent}>
                  {accumulatedText || 'No letters detected yet'}
                </Text>
                {accumulatedText && (
                  <Text style={styles.letterCount}>
                    {accumulatedText.length} characters
                  </Text>
                )}
              </View>
            </View>
            
            {/* Current Detection Status */}
            {currentPrediction && currentPrediction !== 'No hand found' && currentPrediction !== 'Connection Error' && (
              <View style={styles.currentDetectionBox}>
                <Text style={styles.currentDetectionLabel}>Current:</Text>
                <Text style={styles.currentDetectionText}>{currentPrediction}</Text>
                <Text style={styles.confidenceText}>{Math.round(confidence * 100)}%</Text>
              </View>
            )}
            
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionText}>
                🎯 Sign Language Text System{'\n'}
                • Hold letters 0.4s to add to box{'\n'}
                • Use SPACE gesture for spaces{'\n'}
                • Hold SEND 0.9s to complete with AI{'\n'}
                • Manual send/clear buttons available
              </Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleManualClear}
          >
            <MaterialIcons name="clear" size={24} color={colors.surface} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={switchCamera}
          >
            <MaterialIcons name="flip-camera-ios" size={24} color={colors.surface} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.recordButton,
              { 
                backgroundColor: !isCameraReady ? colors.textSecondary : 
                                isHoldingSend ? colors.primary :
                                isDetecting ? colors.error : colors.success 
              }
            ]}
            onPress={toggleDetection}
            disabled={!isCameraReady}
          >
            {isHoldingSend ? (
              <View style={styles.sendProgressIndicator}>
                <MaterialIcons name="send" size={32} color={colors.surface} />
                <View style={styles.progressRing}>
                  <View 
                    style={[
                      styles.progressRingFill,
                      { 
                        transform: [{ rotate: `${sendProgress * 360}deg` }]
                      }
                    ]}
                  />
                </View>
              </View>
            ) : (
              <MaterialIcons 
                name={!isCameraReady ? "camera" : isDetecting ? "stop" : "play-arrow"} 
                size={32} 
                color={colors.surface} 
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              Alert.alert(
                'Detection Info',
                `Detection Mode: ${USE_VISION_CAMERA ? 'VisionCamera' : 'Expo Camera'}\nFrames Processed: ${frameCount}\nNetwork Status: ${networkStatus}\n\nHand landmark drawing has been disabled for cleaner detection view.`
              );
            }}
          >
            <MaterialIcons name="info" size={24} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  permissionText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  frameOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detectionFrame: {
    width: width * 0.7,
    height: height * 0.5,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
  },
  detectionFrameActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  detectionFrameError: {
    borderColor: colors.error,
  },
  enhancedInfo: {
    position: 'absolute',
    top: -160,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  enhancedInfoTitle: {
    color: colors.primary,
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  enhancedInfoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 16,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  resultContainer: {
    position: 'absolute',
    top: 100,
    right: spacing.md,
  },
  predictionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  predictionLabel: {
    color: colors.surface,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.medium,
  },
  predictionText: {
    color: colors.primary,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
  },
  noHandContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.9)', // Amber background for "No hand found"
  },
  noHandText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)', // Red background for errors
  },
  errorText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
  },
  confidenceText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.sizes.xs,
  },
  sendProgressContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.xs,
    minWidth: 200,
    alignItems: 'center',
  },
  sendProgressLabel: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginRight: spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.surface,
    borderRadius: 3,
  },
  sendProgressText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    minWidth: 35,
    textAlign: 'center',
  },
  sendInstructionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  statusText: {
    color: colors.surface,
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    marginLeft: 2,
  },
  stabilityContainer: {
    backgroundColor: 'rgba(255, 193, 7, 0.8)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stabilityText: {
    color: colors.surface,
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  textContainer: {
    position: 'absolute',
    bottom: 140,
    left: spacing.md,
    right: spacing.md,
  },
  textDisplay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  textLabel: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
  },
  textControls: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  textControlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    minHeight: 40,
  },
  accumulationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 2,
    borderColor: colors.primary,
    minHeight: 120,
  },
  boxTitle: {
    color: colors.primary,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  letterBoxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: 50,
  },
  individualLetterBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    borderRadius: 8,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  latestLetterBox: {
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    borderWidth: 2,
    transform: [{ scale: 1.1 }],
  },
  letterBoxText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  emptyLetterBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderStyle: 'dashed',
  },
  emptyLetterText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    fontStyle: 'italic',
  },
  fullTextPreview: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fullTextLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.xs,
  },
  textContent: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
    minHeight: 20,
  },
  letterCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  currentDetectionBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 6,
    padding: spacing.xs,
    marginVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentDetectionLabel: {
    color: colors.surface,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.medium,
  },
  currentDetectionText: {
    color: colors.success,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
  },
  instructionsContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: spacing.xs,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  sendProgressIndicator: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  progressRingFill: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: colors.surface,
    transformOrigin: 'right center',
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  developmentText: {
    color: colors.surface,
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    margin: spacing.xl,
  },
});

export default LiveDetectScreen;