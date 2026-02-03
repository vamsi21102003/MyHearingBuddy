import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const CAMERA_CONFIG = {
  // Feature flag for VisionCamera vs Expo Camera
  useVisionCamera: () => {
    // Disable VisionCamera in web
    if (Platform.OS === 'web') return false;
    
    // Disable VisionCamera in Expo Go
    if (Constants?.appOwnership === 'expo') return false;
    
    // Enable VisionCamera in development builds only
    return __DEV__ && Platform.OS !== 'web';
  },

  // Detection intervals
  EXPO_DETECTION_INTERVAL: 200, // 200ms for Expo Camera
  VISION_DETECTION_INTERVAL: 2500, // 2.5s for VisionCamera silent capture
  
  // Confidence thresholds
  EXPO_CONFIDENCE_THRESHOLD: 0.25, // Lower threshold for backend detection
  VISION_CONFIDENCE_THRESHOLD: 0.7, // Higher threshold for on-device detection
  
  // Camera settings
  getOptimalSettings: (useVisionCamera: boolean) => ({
    quality: useVisionCamera ? 0.85 : 0.2, // Higher quality for on-device processing
    skipProcessing: true,
    base64: true,
    exif: false,
  }),
};

export const getCameraMode = () => {
  const useVision = CAMERA_CONFIG.useVisionCamera();
  return {
    mode: useVision ? 'vision' : 'expo',
    interval: useVision ? CAMERA_CONFIG.VISION_DETECTION_INTERVAL : CAMERA_CONFIG.EXPO_DETECTION_INTERVAL,
    threshold: useVision ? CAMERA_CONFIG.VISION_CONFIDENCE_THRESHOLD : CAMERA_CONFIG.EXPO_CONFIDENCE_THRESHOLD,
    settings: CAMERA_CONFIG.getOptimalSettings(useVision),
  };
};