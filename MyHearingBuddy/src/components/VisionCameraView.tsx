import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { useVisionCamera } from '../hooks/useVisionCamera';
import { tensorflowService } from '../services/tensorflowService';

interface VisionCameraViewProps {
  onDetection?: (result: {
    letter: string;
    confidence: number;
    allPredictions: Array<{ letter: string; confidence: number }>;
  }) => void;
  style?: any;
}

export const VisionCameraView: React.FC<VisionCameraViewProps> = ({
  onDetection,
  style
}) => {
  const {
    device,
    hasPermission,
    cameraRef,
    frameProcessor,
    isDetecting,
    detectionStatus
  } = useVisionCamera();

  // Initialize TensorFlow.js on component mount
  useEffect(() => {
    const initializeTensorFlow = async () => {
      try {
        await tensorflowService.initialize();
        await tensorflowService.loadModel();
        console.log('✅ TensorFlow.js ready for on-device inference');
      } catch (error) {
        console.error('❌ Failed to initialize TensorFlow.js:', error);
      }
    };

    initializeTensorFlow();

    // Cleanup on unmount
    return () => {
      tensorflowService.dispose();
    };
  }, []);

  if (!hasPermission) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.permissionText}>
          Camera permission is required for sign language detection
        </Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.permissionText}>
          Camera device not available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={1} // Process 1 frame per second for efficiency
        photo={true}
        video={false}
        audio={false}
      />
      
      {/* Detection status overlay */}
      {isDetecting && (
        <View style={styles.statusOverlay}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {detectionStatus === 'detecting' && '🔍 Detecting...'}
              {detectionStatus === 'processing' && '⚡ Processing...'}
              {detectionStatus === 'error' && '❌ Error'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionText: {
    color: '#fff',
    textAlign: 'center',
    margin: 20,
    fontSize: 16,
  },
  statusOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});