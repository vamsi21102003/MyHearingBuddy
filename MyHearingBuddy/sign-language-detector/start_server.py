#!/usr/bin/env python3
"""
Startup script for Sign Language Detection API Server
Handles initialization, dependency checking, and server startup
"""

import os
import sys
import subprocess
import importlib
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_dependencies():
    """Check if all required dependencies are installed"""
    required_packages = [
        'cv2', 'numpy', 'mediapipe', 'sklearn', 
        'flask', 'flask_cors', 'PIL', 'pickle'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'cv2':
                importlib.import_module('cv2')
            elif package == 'PIL':
                importlib.import_module('PIL')
            elif package == 'sklearn':
                importlib.import_module('sklearn')
            elif package == 'flask_cors':
                importlib.import_module('flask_cors')
            else:
                importlib.import_module(package)
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    return missing_packages

def install_dependencies(missing_packages):
    """Install missing dependencies"""
    if not missing_packages:
        return True
    
    print(f"\n📦 Installing missing packages: {', '.join(missing_packages)}")
    
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'
        ])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_model_files():
    """Check if required model files exist"""
    required_files = [
        'model.p',
        'hand_landmarker.task'
    ]
    
    missing_files = []
    
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            missing_files.append(file)
            print(f"❌ {file}")
    
    return missing_files

def download_hand_landmarker():
    """Download MediaPipe hand landmarker model"""
    print("📥 Downloading MediaPipe hand landmarker model...")
    
    try:
        import urllib.request
        url = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
        urllib.request.urlretrieve(url, 'hand_landmarker.task')
        print("✅ Hand landmarker model downloaded")
        return True
    except Exception as e:
        print(f"❌ Failed to download hand landmarker: {e}")
        return False

def check_trained_model():
    """Check if the trained model exists, if not provide instructions"""
    if not os.path.exists('model.p'):
        print("\n⚠️ Trained model (model.p) not found!")
        print("To create the trained model:")
        print("1. Run: python collect_imgs.py  (to collect training data)")
        print("2. Run: python create_dataset.py  (to process the data)")
        print("3. Run: python train_classifier.py  (to train the model)")
        print("\nOr use an existing model.p file if you have one.")
        return False
    return True

def test_openai_integration():
    """Test OpenAI integration"""
    try:
        from openai_integration import OpenAIIntegrator
        # Don't actually initialize to avoid API calls during startup
        print("✅ OpenAI integration available")
        return True
    except ImportError as e:
        print(f"⚠️ OpenAI integration not available: {e}")
        return False
    except Exception as e:
        print(f"⚠️ OpenAI integration error: {e}")
        return False

def get_local_ip():
    """Get local IP address for mobile device connection"""
    try:
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def main():
    """Main startup function"""
    print("🚀 Sign Language Detection API Server Startup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    print("\n📋 Checking dependencies...")
    missing_packages = check_dependencies()
    
    if missing_packages:
        print(f"\n⚠️ Missing packages: {', '.join(missing_packages)}")
        install = input("Install missing packages? (y/n): ").lower().strip()
        
        if install == 'y':
            if not install_dependencies(missing_packages):
                print("❌ Failed to install dependencies. Please install manually:")
                print("pip install -r requirements.txt")
                sys.exit(1)
        else:
            print("❌ Cannot start server without required dependencies")
            sys.exit(1)
    
    print("\n📁 Checking model files...")
    missing_files = check_model_files()
    
    # Handle missing hand landmarker
    if 'hand_landmarker.task' in missing_files:
        download = input("Download MediaPipe hand landmarker model? (y/n): ").lower().strip()
        if download == 'y':
            if download_hand_landmarker():
                missing_files.remove('hand_landmarker.task')
        else:
            print("❌ Hand landmarker model is required")
            sys.exit(1)
    
    # Handle missing trained model
    if 'model.p' in missing_files:
        if not check_trained_model():
            use_anyway = input("Start server anyway? (Limited functionality) (y/n): ").lower().strip()
            if use_anyway != 'y':
                sys.exit(1)
    
    print("\n🤖 Testing integrations...")
    test_openai_integration()
    
    # Get network info
    local_ip = get_local_ip()
    
    print("\n" + "=" * 50)
    print("✅ Startup checks complete!")
    print("=" * 50)
    
    print(f"\n🌐 Server will be available at:")
    print(f"   Local:    http://localhost:5000")
    print(f"   Network:  http://{local_ip}:5000")
    print(f"\n📱 For React Native (physical device):")
    print(f"   Use: http://{local_ip}:5000")
    
    print(f"\n🔧 Available endpoints:")
    print(f"   GET  /health - Health check")
    print(f"   POST /detect - Sign language detection")
    print(f"   POST /complete_text - Text completion")
    print(f"   POST /speak - Text-to-speech")
    print(f"   GET  /labels - Available labels")
    print(f"   GET  /model_info - Model information")
    
    print(f"\n🧪 Test the API:")
    print(f"   python test_api.py")
    
    # Ask user if they want to start the server
    start = input("\nStart the server now? (y/n): ").lower().strip()
    
    if start == 'y':
        print("\n🚀 Starting API server...")
        print("Press Ctrl+C to stop the server")
        time.sleep(2)
        
        try:
            # Import and run the server
            from api_server import app, initialize_models
            
            # Initialize models
            if not initialize_models():
                print("❌ Failed to initialize models")
                sys.exit(1)
            
            # Start the server
            app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
            
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped by user")
        except Exception as e:
            print(f"\n❌ Server error: {e}")
            sys.exit(1)
    else:
        print("\n👋 Setup complete. Run 'python api_server.py' when ready to start the server.")

if __name__ == "__main__":
    main()