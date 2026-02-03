import { useState, useCallback, useRef } from 'react';
import { tensorflowService } from '../services/tensorflowService';
import { DetectionResult } from '../types';
import * as Haptics from 'expo-haptics';

export const useOnDeviceDetection = () => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<DetectionResult | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const detectionCount = useRef(0);
  const lastDetectionTime = useRef(0);
  const confidenceThreshold = 0.7; // Minimum confidence for valid detection

  const processImage = useCallback(async (
    imageSource: string,
    isBase64: boolean = false
  ): Promise<DetectionResult | null> => {
    if (isProcessing || !tensorflowService.isModelLoaded()) {
      return null;
    }

    try {
      setIsProcessing(true);
      
      // Run inference on device
      const prediction = isBase64 
        ? await tensorflowService.predictFromBase64(imageSource)
        : await tensorflowService.predictFromImageUri(imageSource);

      if (!prediction) {
        return null;
      }

      const now = Date.now();
      const detectionResult: DetectionResult = {
        id: `detection_${detectionCount.current++}`,
        letter: prediction.letter,
        confidence: prediction.confidence,
        timestamp: now,
        processingTime: now - lastDetectionTime.current,
        isValid: prediction.confidence >= confidenceThreshold,
        allPredictions: prediction.allPredictions,
        source: 'on-device'
      };

      lastDetectionTime.current = now;
      setLastDetection(detectionResult);

      // Add to history if confidence is high enough
      if (detectionResult.isValid) {
        setDetectionHistory(prev => [detectionResult, ...prev.slice(0, 49)]); // Keep last 50
        
        // Haptic feedback for successful detection
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      return detectionResult;
    } catch (error) {
      console.error('Error in on-device detection:', error);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, confidenceThreshold]);

  const startDetection = useCallback(() => {
    setIsDetecting(true);
  }, []);

  const stopDetection = useCallback(() => {
    setIsDetecting(false);
  }, []);

  const clearHistory = useCallback(() => {
    setDetectionHistory([]);
    setLastDetection(null);
  }, []);

  const getDetectionStats = useCallback(() => {
    const validDetections = detectionHistory.filter(d => d.isValid);
    const averageConfidence = validDetections.length > 0
      ? validDetections.reduce((sum, d) => sum + d.confidence, 0) / validDetections.length
      : 0;
    
    const averageProcessingTime = detectionHistory.length > 0
      ? detectionHistory.reduce((sum, d) => sum + (d.processingTime || 0), 0) / detectionHistory.length
      : 0;

    return {
      totalDetections: detectionHistory.length,
      validDetections: validDetections.length,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      averageProcessingTime: Math.round(averageProcessingTime),
      isModelLoaded: tensorflowService.isModelLoaded()
    };
  }, [detectionHistory]);

  return {
    // State
    isDetecting,
    isProcessing,
    lastDetection,
    detectionHistory,
    
    // Actions
    processImage,
    startDetection,
    stopDetection,
    clearHistory,
    getDetectionStats,
    
    // Config
    confidenceThreshold
  };
};