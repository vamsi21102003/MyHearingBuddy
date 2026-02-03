import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { DetectionRequest, DetectionResponse, SignLanguageDetectionResponse, TextCompletionResponse } from '../types';
import { API_CONFIG } from '../utils/constants';

class ApiService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.DEFAULT_BACKEND_URL) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  public updateBaseURL(newBaseURL: string) {
    this.baseURL = newBaseURL;
    this.client.defaults.baseURL = newBaseURL;
  }

  public async detectGesture(imageBase64: string): Promise<DetectionResponse> {
    try {
      const response: AxiosResponse<SignLanguageDetectionResponse> = await this.client.post(
        API_CONFIG.DETECTION_ENDPOINT,
        {
          image: imageBase64
        }
      );

      // Convert the Flask API response to our expected format
      return {
        gesture: response.data.prediction,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Gesture detection failed:', error);
      throw this.handleApiError(error);
    }
  }

  public async completeText(text: string): Promise<TextCompletionResponse> {
    try {
      const response: AxiosResponse<TextCompletionResponse> = await this.client.post(
        '/complete_text',
        {
          text: text
        }
      );

      return response.data;
    } catch (error) {
      console.error('Text completion failed:', error);
      throw this.handleApiError(error);
    }
  }

  public async speakText(text: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await this.client.post(
        '/speak',
        {
          text: text
        }
      );

      return response.data;
    } catch (error) {
      console.error('Text-to-speech failed:', error);
      throw this.handleApiError(error);
    }
  }

  public async getLabels(): Promise<{ labels: Record<number, string>; total_classes: number }> {
    try {
      const response = await this.client.get('/labels');
      return response.data;
    } catch (error) {
      console.error('Failed to get labels:', error);
      throw this.handleApiError(error);
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      // Try a simple request to test connectivity
      await this.client.get('/health', { timeout: 5000 });
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  private handleApiError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${message}`);
        case 401:
          return new Error('Unauthorized: Please check your credentials');
        case 403:
          return new Error('Forbidden: Access denied');
        case 404:
          return new Error('Not Found: Detection endpoint not available');
        case 429:
          return new Error('Too Many Requests: Please slow down');
        case 500:
          return new Error('Server Error: Please try again later');
        default:
          return new Error(`API Error (${status}): ${message}`);
      }
    } else if (error.request) {
      // Network error
      return new Error('Network Error: Please check your internet connection');
    } else {
      // Other error
      return new Error(`Request Error: ${error.message}`);
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Utility functions for common operations
export const detectGestureWithRetry = async (
  imageBase64: string, 
  maxRetries: number = API_CONFIG.MAX_RETRIES
): Promise<DetectionResponse> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiService.detectGesture(imageBase64);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Detection attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

export const updateApiBaseURL = (newURL: string) => {
  apiService.updateBaseURL(newURL);
};

export const testApiConnection = () => {
  return apiService.testConnection();
};