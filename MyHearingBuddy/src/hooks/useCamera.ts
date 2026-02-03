import { useState, useEffect, useRef, useCallback } from 'react';
import { CameraView, CameraType } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { cameraService } from '../services/cameraService';
import { CameraType as CustomCameraType, DetectionStatus } from '../types';
import { HAPTIC_PATTERNS } from '../utils/constants';

export const useCamera = () => {
  const [cameraType, setCameraType] = useState<CustomCameraType>('back');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState<DetectionStatus>('idle');
  const cameraRef = useRef<CameraView>(null);

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
    cameraService.reset();
  }, []);

  const toggleDetection = useCallback(() => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  }, [isDetecting, startDetection, stopDetection]);

  const captureImage = useCallback(async (options?: {
    quality?: number;
    skipProcessingCheck?: boolean;
  }): Promise<string | null> => {
    if (!cameraRef.current) {
      return null;
    }

    try {
      setDetectionStatus('processing');
      const imageBase64 = await cameraService.captureAndProcessImage(cameraRef, {
        ...options,
        base64: true,
      });
      
      return imageBase64;
    } catch (error) {
      console.error('Error capturing image:', error);
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
  }, [isDetecting]);

  const canCapture = useCallback((detectionSpeed?: number): boolean => {
    return cameraService.canCapture(detectionSpeed);
  }, []);

  const getCameraSettings = useCallback(() => {
    return {
      ...cameraService.getOptimalCameraSettings(),
      facing: cameraType,
    };
  }, [cameraType]);

  return {
    // State
    cameraType,
    isDetecting,
    detectionStatus,
    cameraRef,
    
    // Actions
    switchCamera,
    startDetection,
    stopDetection,
    toggleDetection,
    captureImage,
    canCapture,
    getCameraSettings,
  };
};