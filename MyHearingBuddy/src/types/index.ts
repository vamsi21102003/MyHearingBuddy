// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  LiveDetect: undefined;
  History: undefined;
  Practice: undefined;
  Settings: undefined;
};

// API Types
export interface DetectionResponse {
  gesture: string;
  confidence: number;
}

export interface DetectionRequest {
  image: string; // base64 encoded image
}

// Sign Language Detection API Types (Flask Server)
export interface SignLanguageDetectionResponse {
  success: boolean;
  prediction: string;
  confidence: number;
  bounding_box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  landmarks: Array<{
    x: number;
    y: number;
  }>;
  message?: string; // Optional message for cases like "No hand found"
}

export interface TextCompletionResponse {
  success: boolean;
  original_text: string;
  completed_text: string;
}

export interface HealthCheckResponse {
  status: string;
  model_loaded: boolean;
  detector_loaded: boolean;
  openai_available: boolean;
}

// App State Types
export interface DetectionResult {
  id: string;
  letter: string; // Changed from gesture to letter for consistency
  confidence: number;
  timestamp: number; // Changed to number for easier processing
  processingTime?: number; // Time taken for processing
  isValid: boolean; // Whether confidence meets threshold
  allPredictions?: Array<{ letter: string; confidence: number }>; // All model predictions
  source: 'backend' | 'on-device'; // Detection source
  image?: string;
}

export interface HistorySession {
  id: string;
  date: Date;
  duration: number;
  gestureCount: number;
  gestures: DetectionResult[];
  thumbnail?: string;
}

export interface AppSettings {
  detectionSpeed: number; // milliseconds
  backendUrl: string;
  darkMode: boolean;
  language: 'en' | 'hi';
  hapticsEnabled: boolean;
  detectionMode: 'backend' | 'on-device' | 'hybrid'; // Detection mode setting
  confidenceThreshold: number; // Minimum confidence for valid detection
}

export interface OpenAICompletion {
  id: string;
  original_text: string;
  completed_text: string;
  timestamp: number;
  session_id?: string;
  created_at: string;
}

export interface PracticeProgress {
  letter: string;
  mastered: boolean;
  attempts: number;
  accuracy: number;
}

// Component Props Types
export interface CameraOverlayProps {
  isDetecting: boolean;
  onToggleDetection: () => void;
  onSwitchCamera: () => void;
  onSpeak: () => void;
}

export interface DetectionResultProps {
  result: DetectionResult | null;
  isLoading: boolean;
}

export interface GestureCardProps {
  letter: string;
  isExpanded: boolean;
  onPress: () => void;
  progress: PracticeProgress;
}

// Context Types
export interface AppContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  detectionHistory: DetectionResult[];
  addDetectionResult: (result: DetectionResult) => Promise<void>;
  clearHistory: () => Promise<void>;
  practiceProgress: PracticeProgress[];
  updateProgress: (letter: string, progress: Partial<PracticeProgress>) => Promise<void>;
  currentWord: string;
  addToWord: (letter: string) => void;
  clearWord: () => void;
  
  // OpenAI Completions
  openaiCompletions: OpenAICompletion[];
  addOpenAICompletion: (original: string, completed: string) => Promise<void>;
  clearOpenAICompletions: () => Promise<void>;
  
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  
  // Database
  initializeDatabase: () => Promise<void>;
  getDatabaseStats: () => Promise<any>;
}

// Utility Types
export type CameraType = 'front' | 'back';
export type DetectionStatus = 'idle' | 'detecting' | 'processing' | 'error';
export type NetworkStatus = 'online' | 'offline' | 'connecting';

// TensorFlow.js Types
export interface TensorFlowPrediction {
  letter: string;
  confidence: number;
  allPredictions: Array<{ letter: string; confidence: number }>;
}

export interface ModelInfo {
  classes: string[];
  isLoaded: boolean;
}

// VisionCamera Types
export interface VisionCameraProps {
  onDetection?: (result: TensorFlowPrediction) => void;
  style?: any;
}

// On-Device Detection Stats
export interface DetectionStats {
  totalDetections: number;
  validDetections: number;
  averageConfidence: number;
  averageProcessingTime: number;
  isModelLoaded: boolean;
}