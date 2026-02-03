import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';

export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Generic storage methods
  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error storing item with key ${key}:`, error);
      throw error;
    }
  }

  public async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error retrieving item with key ${key}:`, error);
      return null;
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item with key ${key}:`, error);
      throw error;
    }
  }

  public async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  public async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  // App-specific storage methods
  public async getSettings() {
    return this.getItem(STORAGE_KEYS.SETTINGS);
  }

  public async setSettings(settings: any) {
    return this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  public async getHistory() {
    return this.getItem(STORAGE_KEYS.HISTORY);
  }

  public async setHistory(history: any) {
    return this.setItem(STORAGE_KEYS.HISTORY, history);
  }

  public async getPracticeProgress() {
    return this.getItem(STORAGE_KEYS.PRACTICE_PROGRESS);
  }

  public async setPracticeProgress(progress: any) {
    return this.setItem(STORAGE_KEYS.PRACTICE_PROGRESS, progress);
  }

  public async getCurrentWord() {
    return this.getItem(STORAGE_KEYS.CURRENT_WORD);
  }

  public async setCurrentWord(word: string) {
    return this.setItem(STORAGE_KEYS.CURRENT_WORD, word);
  }

  public async getAuthToken() {
    return this.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  public async setAuthToken(token: string) {
    return this.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  public async removeAuthToken() {
    return this.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Utility methods
  public async getStorageSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  public async exportData(): Promise<Record<string, any>> {
    try {
      const keys = await this.getAllKeys();
      const data: Record<string, any> = {};

      for (const key of keys) {
        const value = await this.getItem(key);
        if (value !== null) {
          data[key] = value;
        }
      }

      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return {};
    }
  }

  public async importData(data: Record<string, any>): Promise<void> {
    try {
      for (const [key, value] of Object.entries(data)) {
        await this.setItem(key, value);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  public async clearAppData(): Promise<void> {
    try {
      const appKeys = Object.values(STORAGE_KEYS);
      for (const key of appKeys) {
        await this.removeItem(key);
      }
    } catch (error) {
      console.error('Error clearing app data:', error);
      throw error;
    }
  }
}

export const storageService = StorageService.getInstance();