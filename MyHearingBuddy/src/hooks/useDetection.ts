import { useState, useCallback, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { detectSignWithRetry, signLanguageService } from '../services/signLanguageService';
import { DetectionResult, NetworkStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import { DETECTION_CONFIDENCE_THRESHOLD, HAPTIC_PATTERNS } from '../utils/constants';

export const useDetection = () => {
  const { settings, addDetectionResult, addToWord } = useAppContext();
  const [currentResult, setCurrentResult] = useState<DetectionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('online');
  
  const detectionQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);
  const lastDetectionTime = useRef(0);

  // Process detection queue
  const processDetectionQueue = useCallback(async () => {
    if (isProcessingQueue.current || detectionQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Get the latest image from queue (discard older ones for real-time performance)
      const imageBase64 = detectionQueue.current.pop();
      detectionQueue.current = []; // Clear queue

      if (!imageBase64) {
        return;
      }

      setNetworkStatus('connecting');
      
      const response = await detectSignWithRetry(imageBase64);
      
      setNetworkStatus('online');

      // Only process high-confidence results
      if (response.confidence >= DETECTION_CONFIDENCE_THRESHOLD) {
        const result: DetectionResult = {
          id: Date.now().toString(),
          gesture: response.prediction,
          confidence: response.confidence,
          timestamp: new Date(),
          image: imageBase64,
        };

        setCurrentResult(result);
        await addDetectionResult(result);
        
        // Handle special commands and letters
        if (response.prediction === 'SPACE') {
          await addToWord(' ');
        } else if (response.prediction === 'SEND') {
          // SEND command - could trigger text completion or submission
          // For now, just add it to the word
          await addToWord('[SEND]');
        } else if (/^[A-Z]$/.test(response.prediction)) {
          // Regular letter
          await addToWord(response.prediction);
        }

        // Haptic feedback for successful detection
        if (settings.hapticsEnabled) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }

      lastDetectionTime.current = Date.now();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Detection failed';
      setError(errorMessage);
      setNetworkStatus('offline');
      
      console.error('Detection error:', err);
      
      // Haptic feedback for error
      if (settings.hapticsEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
      isProcessingQueue.current = false;
    }
  }, [settings, addDetectionResult, addToWord]);

  // Add image to detection queue
  const queueDetection = useCallback((imageBase64: string) => {
    // Throttle detections based on settings
    const now = Date.now();
    const timeSinceLastDetection = now - lastDetectionTime.current;
    
    if (timeSinceLastDetection < settings.detectionSpeed) {
      return;
    }

    // Add to queue (keep only latest few images for performance)
    detectionQueue.current.push(imageBase64);
    if (detectionQueue.current.length > 3) {
      detectionQueue.current.shift(); // Remove oldest
    }

    // Process queue
    processDetectionQueue();
  }, [settings.detectionSpeed, processDetectionQueue]);

  // Manual detection (for single image)
  const detectSingle = useCallback(async (imageBase64: string): Promise<DetectionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      setNetworkStatus('connecting');
      
      const response = await detectSignWithRetry(imageBase64);
      
      setNetworkStatus('online');

      const result: DetectionResult = {
        id: Date.now().toString(),
        gesture: response.prediction,
        confidence: response.confidence,
        timestamp: new Date(),
        image: imageBase64,
      };

      setCurrentResult(result);
      await addDetectionResult(result);

      // Haptic feedback
      if (settings.hapticsEnabled) {
        if (response.confidence >= DETECTION_CONFIDENCE_THRESHOLD) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Detection failed';
      setError(errorMessage);
      setNetworkStatus('offline');
      
      console.error('Single detection error:', err);
      
      if (settings.hapticsEnabled) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [settings, addDetectionResult]);

  // Clear current result
  const clearResult = useCallback(() => {
    setCurrentResult(null);
    setError(null);
  }, []);

  // Clear detection queue
  const clearQueue = useCallback(() => {
    detectionQueue.current = [];
    isProcessingQueue.current = false;
    setIsLoading(false);
  }, []);

  // Get detection statistics
  const getStats = useCallback(() => {
    return {
      queueLength: detectionQueue.current.length,
      isProcessing: isProcessingQueue.current,
      lastDetectionTime: lastDetectionTime.current,
      timeSinceLastDetection: Date.now() - lastDetectionTime.current,
    };
  }, []);

  // Complete text using AI
  const completeCurrentText = useCallback(async (text: string): Promise<string> => {
    try {
      return await signLanguageService.completeText(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Text completion failed';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Speak text using server TTS
  const speakText = useCallback(async (text: string): Promise<void> => {
    try {
      await signLanguageService.speakText(text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Speech failed';
      setError(errorMessage);
      throw error;
    }
  }, []);

  // Check server connection
  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      return await signLanguageService.getConnectionStatus();
    } catch (error) {
      setNetworkStatus('offline');
      return false;
    }
  }, []);

  return {
    // State
    currentResult,
    isLoading,
    error,
    networkStatus,
    
    // Actions
    queueDetection,
    detectSingle,
    clearResult,
    clearQueue,
    getStats,
    completeCurrentText,
    speakText,
    checkConnection,
  };
};