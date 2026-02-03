import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import * as Haptics from 'expo-haptics';
import { runOnJS } from 'react-native-reanimated';
import { CameraType as CustomCameraType, DetectionStatus } from '../types';
import { HAPTIC_PATTERNS } from '../utils/constants';

export const useVisionCamera = () => {
  const [cameraType, setCameraType] = useState<CustomCameraType>('back');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>('idle');
  const [hasPermission, setHasPermission] = useState(false);
  
  const cameraRef = useRef<Camera>(null);
  const lastFrameTime = useRef(0);
  const detectionInterval = 2500; // 2.5 seconds between detections
  
  // Get camera device
  const backDevice = useCameraDevice('back');
  const frontDevice = useCameraDevice('front');
  const device = cameraType === 'back' ? backDevice : frontDevice;

  // Request camera permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');
    };
    requestPermissions();
  }, []);

  // Frame processor for silent capture
  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    
    if (!isDetecting) return;
    
    const now = Date.now();
    if (now - lastFrameTime.current < detectionInterval) return;
    
    lastFrameTime.current = now;
    
    // Process frame silently
    runOnJS(processFrame)(frame);
  }, [isDetecting]);

  const processFrame = useCallback(async (frame: any) => {
    try {
      setDetectionStatus('processing');
      
      // Convert frame to base64 for processing
      // Note: This is a placeholder - actual implementation depends on your TF.js model
      const base64Image = await convertFrameToBase64(frame);
      
      // Here you would run your TensorFlow.js model
      // const prediction = await runTensorFlowModel(base64Image);
      
      console.log('Frame processed silently');
      
    } catch (error) {
      console.error('Error processing frame:', error);
      setDetectionStatus('error');
    } finally {
      if (isDetecting) {
        setDetectionStatus('detecting');
      } else {
        setDetectionStatus('idle');
      }
    }
  }, [isDetecting]);

  const convertFrameToBase64 = async (frame: any): Promise<string> => {
    // Placeholder implementation
    // In real implementation, you'd convert the frame buffer to base64
    return '';
  };

  const switchCamera = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCameraType(prev => prev === 'back' ? 'front' : 'back');
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  }, []);

  const startDetection = useCallback(() => {
    setIsDetecting(true);
    setDetectionStatus('detecting');
  }, []);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
    setDetectionStatus('idle');
  }, []);

  const toggleDetection = useCallback(() => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  }, [isDetecting, startDetection, stopDetection]);

  const capturePhoto = useCallback(async (): Promise<string | null> => {
    if (!cameraRef.current || !device) {
      return null;
    }

    try {
      setDetectionStatus('processing');
      
      // Silent photo capture without shutter sound
      const photo = await cameraRef.current.takePhoto({
        enableShutterSound: false,
        quality: 85,
      });
      
      return photo.path;
    } catch (error) {
      console.error('Error capturing photo:', error);
      setDetectionStatus('error');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return null;
    } finally {
      if (isDetecting) {
        setDetectionStatus('detecting');
      } else {
        setDetectionStatus('idle');
      }
    }
  }, [device, isDetecting]);

  return {
    // State
    cameraType,
    isDetecting,
    detectionStatus,
    hasPermission,
    device,
    cameraRef,
    
    // Actions
    switchCamera,
    startDetection,
    stopDetection,
    toggleDetection,
    capturePhoto,
    frameProcessor,
  };
};