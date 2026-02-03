export const API_CONFIG = {
  DEFAULT_BACKEND_URL: 'http://10.117.64.159:5000', // Use network IP for mobile devices
  DETECTION_ENDPOINT: '/detect',
  TIMEOUT: 15000, // Increased timeout for ML processing
  MAX_RETRIES: 3,
};

export const CAMERA_CONFIG = {
  DETECTION_INTERVAL: 200, // milliseconds
  MAX_FPS: 5,
  QUALITY: 0.7,
  ASPECT_RATIO: '16:9' as const,
};

export const STORAGE_KEYS = {
  SETTINGS: '@myhearingbuddy_settings',
  HISTORY: '@myhearingbuddy_history',
  PRACTICE_PROGRESS: '@myhearingbuddy_practice',
  AUTH_TOKEN: '@myhearingbuddy_auth',
  CURRENT_WORD: '@myhearingbuddy_word',
};

export const ISL_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z'
];

// Sign Language Detection Labels (matches Flask server)
export const SIGN_LANGUAGE_LABELS = {
  0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
  10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S', 19: 'T',
  20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z', 26: 'SPACE', 27: 'SEND'
};

export const DEFAULT_SETTINGS = {
  detectionSpeed: 200,
  backendUrl: 'http://10.117.64.159:5000', // Use network IP for mobile devices
  darkMode: false,
  language: 'en' as const,
  hapticsEnabled: true,
  detectionMode: 'manual' as const, // Default to manual mode (no flash/sound)
};

export const ANIMATIONS = {
  SPLASH_DURATION: 3000,
  FADE_DURATION: 300,
  SLIDE_DURATION: 400,
  BOUNCE_DURATION: 600,
};

export const HAPTIC_PATTERNS = {
  SUCCESS: 'notificationSuccess' as const,
  ERROR: 'notificationError' as const,
  WARNING: 'notificationWarning' as const,
  LIGHT: 'light' as const,
  MEDIUM: 'medium' as const,
  HEAVY: 'heavy' as const,
};

export const DETECTION_CONFIDENCE_THRESHOLD = 0.7;
export const MAX_WORD_LENGTH = 50;
export const MAX_HISTORY_ITEMS = 1000;