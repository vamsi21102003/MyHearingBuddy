import { apiService } from './api';
import { SignLanguageDetectionResponse, TextCompletionResponse, HealthCheckResponse } from '../types';
import { API_CONFIG } from '../utils/constants';

/**
 * Sign Language Detection Service
 * Provides high-level interface for sign language detection functionality
 */
class SignLanguageService {
  private isConnected: boolean = false;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  /**
   * Check if the sign language detection server is healthy
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    try {
      const response = await fetch(`${API_CONFIG.DEFAULT_BACKEND_URL}/health`);
      const healthData: HealthCheckResponse = await response.json();
      
      this.isConnected = healthData.status === 'healthy' && healthData.model_loaded;
      this.lastHealthCheck = Date.now();
      
      return healthData;
    } catch (error) {
      this.isConnected = false;
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get connection status (with automatic health check if needed)
   */
  async getConnectionStatus(): Promise<boolean> {
    const now = Date.now();
    
    // Auto health check if it's been too long
    if (now - this.lastHealthCheck > this.healthCheckInterval) {
      try {
        await this.checkHealth();
      } catch {
        this.isConnected = false;
      }
    }
    
    return this.isConnected;
  }

  /**
   * Detect sign language from base64 image
   */
  async detectSign(imageBase64: string): Promise<SignLanguageDetectionResponse> {
    if (!await this.getConnectionStatus()) {
      throw new Error('Sign language detection server is not available');
    }

    try {
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(`${API_CONFIG.DEFAULT_BACKEND_URL}/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle "No hand detected" as a normal response, not an error
        if (response.status === 400 && errorData.error === 'No hand detected') {
          return {
            success: false,
            prediction: '',
            confidence: 0,
            bounding_box: { x1: 0, y1: 0, x2: 0, y2: 0 },
            landmarks: [],
            message: 'No hand found'
          };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: SignLanguageDetectionResponse = await response.json();
      return result;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Detection request timed out');
        }
        throw error;
      }
      throw new Error(`Detection failed: ${String(error)}`);
    }
  }

  /**
   * Complete text using OpenAI integration and save to database
   */
  async completeText(text: string, saveToDatabase?: (original: string, completed: string) => Promise<void>): Promise<string> {
    if (!text.trim()) {
      throw new Error('No text provided for completion');
    }

    try {
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(`${API_CONFIG.DEFAULT_BACKEND_URL}/complete_text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim()
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: TextCompletionResponse = await response.json();
      
      // Save to database if callback provided
      if (saveToDatabase && result.success) {
        try {
          console.log('🔍 Calling saveToDatabase callback with:', result.original_text, '→', result.completed_text);
          await saveToDatabase(result.original_text, result.completed_text);
          console.log('✅ OpenAI completion saved to database via callback');
        } catch (error) {
          console.error('❌ Failed to save OpenAI completion to database:', error);
        }
      } else {
        console.log('⚠️ SaveToDatabase callback not provided or result not successful:', { 
          hasCallback: !!saveToDatabase, 
          success: result.success 
        });
      }
      
      return result.completed_text;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Text completion request timed out');
        }
        throw error;
      }
      throw new Error(`Text completion failed: ${String(error)}`);
    }
  }

  /**
   * Speak text using server-side TTS
   */
  async speakText(text: string): Promise<void> {
    if (!text.trim()) {
      throw new Error('No text provided for speech');
    }

    try {
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(`${API_CONFIG.DEFAULT_BACKEND_URL}/speak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim()
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Server-side TTS doesn't return audio data, just confirmation
      await response.json();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Speech request timed out');
        }
        throw error;
      }
      throw new Error(`Speech failed: ${String(error)}`);
    }
  }

  /**
   * Get available sign language labels
   */
  async getLabels(): Promise<Record<number, string>> {
    try {
      const response = await fetch(`${API_CONFIG.DEFAULT_BACKEND_URL}/labels`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.labels;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to get labels: ${String(error)}`);
    }
  }

  /**
   * Update the server URL (for switching between local and remote servers)
   */
  updateServerUrl(newUrl: string): void {
    // Update the API service base URL as well
    apiService.updateBaseURL(newUrl);
    
    // Reset connection status to force a new health check
    this.isConnected = false;
    this.lastHealthCheck = 0;
  }

  /**
   * Process accumulated text for special commands
   */
  processAccumulatedText(text: string): { 
    processedText: string; 
    shouldSend: boolean; 
    shouldComplete: boolean; 
  } {
    let processedText = text;
    let shouldSend = false;
    let shouldComplete = false;

    // Check for SEND command
    if (text.includes('SEND')) {
      shouldSend = true;
      processedText = text.replace(/SEND/g, '').trim();
    }

    // Check if text ends with incomplete word (for auto-completion)
    const words = processedText.split(' ');
    const lastWord = words[words.length - 1];
    
    // Trigger completion if last word is 3+ characters and no SEND command
    if (lastWord && lastWord.length >= 3 && !shouldSend) {
      shouldComplete = true;
    }

    return {
      processedText,
      shouldSend,
      shouldComplete
    };
  }
}

// Create singleton instance
export const signLanguageService = new SignLanguageService();

// Utility functions
export const detectSignWithRetry = async (
  imageBase64: string, 
  maxRetries: number = API_CONFIG.MAX_RETRIES
): Promise<SignLanguageDetectionResponse> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await signLanguageService.detectSign(imageBase64);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Sign detection attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

export const checkSignLanguageConnection = () => {
  return signLanguageService.getConnectionStatus();
};

export const updateSignLanguageServerUrl = (newUrl: string) => {
  signLanguageService.updateServerUrl(newUrl);
};