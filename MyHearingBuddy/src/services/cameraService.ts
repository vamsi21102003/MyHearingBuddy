import { CameraView } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { CAMERA_CONFIG } from '../utils/constants';

export class CameraService {
  private static instance: CameraService;
  private isProcessing = false;
  private lastCaptureTime = 0;

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  public canCapture(detectionSpeed: number = CAMERA_CONFIG.DETECTION_INTERVAL): boolean {
    const now = Date.now();
    const timeSinceLastCapture = now - this.lastCaptureTime;
    
    return !this.isProcessing && timeSinceLastCapture >= detectionSpeed;
  }

  public async captureAndProcessImage(
    cameraRef: React.RefObject<CameraView>,
    options: {
      quality?: number;
      base64?: boolean;
      skipProcessingCheck?: boolean;
    } = {}
  ): Promise<string | null> {
    const {
      quality = CAMERA_CONFIG.QUALITY,
      base64 = true,
      skipProcessingCheck = false
    } = options;

    if (!skipProcessingCheck && this.isProcessing) {
      return null;
    }

    if (!cameraRef.current) {
      throw new Error('Camera reference is not available');
    }

    try {
      this.isProcessing = true;
      this.lastCaptureTime = Date.now();

      // Capture image
      const photo = await cameraRef.current.takePictureAsync({
        quality,
        base64,
        skipProcessingCheck: true,
      });

      if (!photo) {
        return null;
      }

      // Process image for better detection
      const processedImage = await this.processImageForDetection(photo.uri);
      
      return processedImage;
    } catch (error) {
      console.error('Error capturing image:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  private async processImageForDetection(imageUri: string): Promise<string> {
    try {
      // Resize and optimize image for detection
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          { resize: { width: 640, height: 480 } }, // Optimize size for detection
        ],
        {
          compress: CAMERA_CONFIG.QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipulatedImage.base64) {
        throw new Error('Failed to generate base64 image');
      }

      return manipulatedImage.base64;
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  }

  public async convertUriToBase64(uri: string): Promise<string> {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [],
        {
          compress: CAMERA_CONFIG.QUALITY,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipulatedImage.base64) {
        throw new Error('Failed to convert image to base64');
      }

      return manipulatedImage.base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  public getOptimalCameraSettings() {
    return {
      facing: 'back' as const,
      // Removed deprecated constants for SDK 54 compatibility
    };
  }

  public reset() {
    this.isProcessing = false;
    this.lastCaptureTime = 0;
  }
}

export const cameraService = CameraService.getInstance();