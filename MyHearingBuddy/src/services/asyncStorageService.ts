import AsyncStorage from '@react-native-async-storage/async-storage';
import { DetectionResult, PracticeProgress, AppSettings, OpenAICompletion } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS, ISL_ALPHABET } from '../utils/constants';

export interface AppStats {
  detectionCount: number;
  practiceCount: number;
  completionCount: number;
  sessionCount: number;
}

export class AsyncStorageService {
  private static instance: AsyncStorageService;

  public static getInstance(): AsyncStorageService {
    if (!AsyncStorageService.instance) {
      AsyncStorageService.instance = new AsyncStorageService();
    }
    return AsyncStorageService.instance;
  }

  // Settings methods
  async getSettings(): Promise<AppSettings> {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // Detection history methods
  async getDetectionHistory(): Promise<DetectionResult[]> {
    try {
      const savedHistory = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        return history.map((item: any) => ({
          ...item,
          timestamp: typeof item.timestamp === 'string' ? new Date(item.timestamp).getTime() : item.timestamp
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading detection history:', error);
      return [];
    }
  }

  async addDetectionResult(result: DetectionResult): Promise<void> {
    try {
      const history = await this.getDetectionHistory();
      const updated = [result, ...history].slice(0, 1000); // Keep only last 1000 items
      await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding detection result:', error);
      throw error;
    }
  }

  async clearDetectionHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (error) {
      console.error('Error clearing detection history:', error);
      throw error;
    }
  }

  // Practice progress methods
  async getPracticeProgress(): Promise<PracticeProgress[]> {
    try {
      const savedProgress = await AsyncStorage.getItem(STORAGE_KEYS.PRACTICE_PROGRESS);
      if (savedProgress) {
        return JSON.parse(savedProgress);
      }
      
      // Initialize progress for all letters if not exists
      const initialProgress = ISL_ALPHABET.map(letter => ({
        letter,
        mastered: false,
        attempts: 0,
        accuracy: 0
      }));
      
      await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_PROGRESS, JSON.stringify(initialProgress));
      return initialProgress;
    } catch (error) {
      console.error('Error loading practice progress:', error);
      return [];
    }
  }

  async savePracticeProgress(progress: PracticeProgress): Promise<void> {
    try {
      const allProgress = await this.getPracticeProgress();
      const updated = allProgress.map(p => 
        p.letter === progress.letter ? progress : p
      );
      await AsyncStorage.setItem(STORAGE_KEYS.PRACTICE_PROGRESS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving practice progress:', error);
      throw error;
    }
  }

  // OpenAI completions methods
  async getOpenAICompletions(): Promise<OpenAICompletion[]> {
    try {
      const savedCompletions = await AsyncStorage.getItem('@myhearingbuddy_openai_completions');
      if (savedCompletions) {
        return JSON.parse(savedCompletions);
      }
      return [];
    } catch (error) {
      console.error('Error loading OpenAI completions:', error);
      return [];
    }
  }

  async addOpenAICompletion(completion: {
    original_text: string;
    completed_text: string;
  }): Promise<string> {
    try {
      const completions = await this.getOpenAICompletions();
      const id = `completion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newCompletion: OpenAICompletion = {
        id,
        original_text: completion.original_text,
        completed_text: completion.completed_text,
        timestamp: Date.now(),
        created_at: new Date().toISOString()
      };

      const updated = [newCompletion, ...completions].slice(0, 100); // Keep only last 100 items
      await AsyncStorage.setItem('@myhearingbuddy_openai_completions', JSON.stringify(updated));
      
      return id;
    } catch (error) {
      console.error('Error adding OpenAI completion:', error);
      throw error;
    }
  }

  async clearOpenAICompletions(): Promise<void> {
    try {
      await AsyncStorage.removeItem('@myhearingbuddy_openai_completions');
    } catch (error) {
      console.error('Error clearing OpenAI completions:', error);
      throw error;
    }
  }

  // Stats methods
  async getAppStats(): Promise<AppStats> {
    try {
      const [detections, progress, completions] = await Promise.all([
        this.getDetectionHistory(),
        this.getPracticeProgress(),
        this.getOpenAICompletions()
      ]);

      return {
        detectionCount: detections.length,
        practiceCount: progress.length,
        completionCount: completions.length,
        sessionCount: 0 // Not tracked in AsyncStorage
      };
    } catch (error) {
      console.error('Error getting app stats:', error);
      return {
        detectionCount: 0,
        practiceCount: 0,
        completionCount: 0,
        sessionCount: 0
      };
    }
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.HISTORY),
        AsyncStorage.removeItem(STORAGE_KEYS.PRACTICE_PROGRESS),
        AsyncStorage.removeItem('@myhearingbuddy_openai_completions'),
        AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_WORD),
        AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
      ]);
      console.log('✅ All app data cleared');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  async exportData(): Promise<string> {
    try {
      const [settings, history, progress, completions] = await Promise.all([
        this.getSettings(),
        this.getDetectionHistory(),
        this.getPracticeProgress(),
        this.getOpenAICompletions()
      ]);

      const exportData = {
        settings,
        detectionHistory: history,
        practiceProgress: progress,
        openaiCompletions: completions,
        exportDate: new Date().toISOString()
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }
}

export const asyncStorageService = AsyncStorageService.getInstance();