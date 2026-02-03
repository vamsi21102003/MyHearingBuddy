import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AppContextType, 
  AppSettings, 
  DetectionResult, 
  PracticeProgress,
  OpenAICompletion
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { asyncStorageService } from '../services/asyncStorageService';

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({} as AppSettings);
  const [detectionHistory, setDetectionHistory] = useState<DetectionResult[]>([]);
  const [practiceProgress, setPracticeProgress] = useState<PracticeProgress[]>([]);
  const [openaiCompletions, setOpenaiCompletions] = useState<OpenAICompletion[]>([]);
  const [currentWord, setCurrentWord] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize app data
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing MyHearingBuddy app with AsyncStorage...');
      
      // Load all data from AsyncStorage
      const [
        loadedSettings,
        loadedHistory,
        loadedProgress,
        loadedCompletions,
        savedWord,
        authToken
      ] = await Promise.all([
        asyncStorageService.getSettings(),
        asyncStorageService.getDetectionHistory(),
        asyncStorageService.getPracticeProgress(),
        asyncStorageService.getOpenAICompletions(),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENT_WORD),
        AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      ]);

      // Set all state
      setSettings(loadedSettings);
      setDetectionHistory(loadedHistory);
      setPracticeProgress(loadedProgress);
      setOpenaiCompletions(loadedCompletions);
      setCurrentWord(savedWord || '');
      setIsAuthenticated(!!authToken);
      setIsInitialized(true);

      console.log('✅ App initialized successfully');
      console.log(`📊 Loaded: ${loadedHistory.length} detections, ${loadedProgress.length} practice items, ${loadedCompletions.length} AI completions`);
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      setIsInitialized(true); // Still mark as initialized to prevent infinite loading
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await asyncStorageService.saveSettings(updatedSettings);
      console.log('✅ Settings updated');
    } catch (error) {
      console.error('❌ Error updating settings:', error);
    }
  };

  const addDetectionResult = async (result: DetectionResult): Promise<void> => {
    try {
      // Add to local state immediately
      setDetectionHistory(prev => [result, ...prev].slice(0, 1000));
      
      // Save to AsyncStorage
      await asyncStorageService.addDetectionResult(result);
      console.log('✅ Detection result added');
    } catch (error) {
      console.error('❌ Error adding detection result:', error);
    }
  };

  const clearHistory = async (): Promise<void> => {
    try {
      setDetectionHistory([]);
      await asyncStorageService.clearDetectionHistory();
      console.log('✅ Detection history cleared');
    } catch (error) {
      console.error('❌ Error clearing history:', error);
    }
  };

  const updateProgress = async (letter: string, progressUpdate: Partial<PracticeProgress>): Promise<void> => {
    try {
      // Update local state
      const updatedProgress = practiceProgress.map(p => 
        p.letter === letter ? { ...p, ...progressUpdate } : p
      );
      setPracticeProgress(updatedProgress);

      // Save to AsyncStorage
      const letterProgress = updatedProgress.find(p => p.letter === letter);
      if (letterProgress) {
        await asyncStorageService.savePracticeProgress(letterProgress);
        console.log(`✅ Progress updated for letter: ${letter}`);
      }
    } catch (error) {
      console.error('❌ Error updating progress:', error);
    }
  };

  const addToWord = (letter: string) => {
    const newWord = currentWord + letter;
    setCurrentWord(newWord);
    AsyncStorage.setItem(STORAGE_KEYS.CURRENT_WORD, newWord);
  };

  const clearWord = () => {
    setCurrentWord('');
    AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_WORD);
  };

  const addOpenAICompletion = async (original: string, completed: string): Promise<void> => {
    console.log('🔍 Adding OpenAI completion:', { original, completed });
    
    try {
      // Save to AsyncStorage and get the ID
      const completionId = await asyncStorageService.addOpenAICompletion({
        original_text: original,
        completed_text: completed
      });

      // Create completion object for local state
      const newCompletion: OpenAICompletion = {
        id: completionId,
        original_text: original,
        completed_text: completed,
        timestamp: Date.now(),
        created_at: new Date().toISOString()
      };

      // Add to local state
      setOpenaiCompletions(prev => {
        const updated = [newCompletion, ...prev].slice(0, 100);
        console.log('📊 Updated completions state:', updated.length, 'items');
        console.log('📊 Latest completion:', updated[0]);
        return updated;
      });
      
      console.log('✅ OpenAI completion saved successfully');
    } catch (error) {
      console.error('❌ Error adding OpenAI completion:', error);
      
      // Even if storage fails, add to local state so user sees it immediately
      const fallbackCompletion: OpenAICompletion = {
        id: `temp_${Date.now()}`,
        original_text: original,
        completed_text: completed,
        timestamp: Date.now(),
        created_at: new Date().toISOString()
      };
      
      setOpenaiCompletions(prev => [fallbackCompletion, ...prev].slice(0, 100));
      console.log('⚠️ Added to local state only (storage failed)');
    }
  };

  const clearOpenAICompletions = async (): Promise<void> => {
    try {
      setOpenaiCompletions([]);
      await asyncStorageService.clearOpenAICompletions();
      console.log('✅ OpenAI completions cleared');
    } catch (error) {
      console.error('❌ Error clearing OpenAI completions:', error);
    }
  };

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    if (value) {
      AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'demo_token');
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  };

  const initializeDatabase = async (): Promise<void> => {
    // No-op function for compatibility
    console.log('ℹ️ Using AsyncStorage - no database initialization needed');
  };

  const getDatabaseStats = async () => {
    try {
      return await asyncStorageService.getAppStats();
    } catch (error) {
      console.error('❌ Error getting app stats:', error);
      return {
        detectionCount: detectionHistory.length,
        practiceCount: practiceProgress.length,
        completionCount: openaiCompletions.length,
        sessionCount: 0
      };
    }
  };

  const contextValue: AppContextType = {
    settings,
    updateSettings,
    detectionHistory,
    addDetectionResult,
    clearHistory,
    practiceProgress,
    updateProgress,
    currentWord,
    addToWord,
    clearWord,
    openaiCompletions,
    addOpenAICompletion,
    clearOpenAICompletions,
    isAuthenticated,
    setAuthenticated,
    initializeDatabase,
    getDatabaseStats
  };

  // Don't render children until app is initialized
  if (!isInitialized) {
    return null; // Or a loading screen
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};