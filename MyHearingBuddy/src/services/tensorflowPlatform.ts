import * as tf from '@tensorflow/tfjs-react-native';

// Import platform adapters
import '@tensorflow/tfjs-react-native/dist/platform_react_native';

// Optional: Import additional backends for better performance
// import '@tensorflow/tfjs-backend-webgl/dist/tf-backend-webgl';

export class TensorFlowPlatform {
  private static initialized = false;

  public static async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('🤖 Initializing TensorFlow.js platform...');
      
      // Wait for TensorFlow.js to be ready
      await tf.ready();
      
      console.log('✅ TensorFlow.js platform initialized');
      console.log('📊 Backend:', tf.getBackend());
      console.log('🔧 Available backends:', tf.engine().registryFactory);
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize TensorFlow.js platform:', error);
      throw error;
    }
  }

  public static isInitialized(): boolean {
    return this.initialized;
  }

  public static getInfo(): {
    backend: string;
    version: string;
    isReady: boolean;
  } {
    return {
      backend: tf.getBackend(),
      version: tf.version.tfjs,
      isReady: this.initialized
    };
  }
}