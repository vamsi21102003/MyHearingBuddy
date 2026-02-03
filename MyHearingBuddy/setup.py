#!/usr/bin/env python3
"""
Setup script for MyHearingBuddy Sign Language Detection System
This script helps users set up the project by downloading required files and setting up the environment.
"""

import os
import sys
import subprocess
import urllib.request
from pathlib import Path

def print_step(step, message):
    """Print a formatted step message"""
    print(f"\n{'='*50}")
    print(f"STEP {step}: {message}")
    print(f"{'='*50}")

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        sys.exit(1)
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")

def install_requirements():
    """Install Python requirements"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "sign-language-detector/requirements.txt"])
        print("✅ Python requirements installed successfully")
    except subprocess.CalledProcessError:
        print("❌ Failed to install Python requirements")
        return False
    return True

def setup_environment():
    """Set up environment variables"""
    env_example = Path(".env.example")
    env_file = Path(".env")
    
    if not env_file.exists() and env_example.exists():
        # Copy .env.example to .env
        with open(env_example, 'r') as src, open(env_file, 'w') as dst:
            dst.write(src.read())
        print("✅ Created .env file from template")
        print("⚠️  Please edit .env and add your OpenAI API key")
    elif env_file.exists():
        print("✅ .env file already exists")
    else:
        print("❌ .env.example not found")
        return False
    return True

def download_mediapipe_model():
    """Download MediaPipe hand landmarker model"""
    model_path = Path("sign-language-detector/hand_landmarker.task")
    
    if model_path.exists():
        print("✅ MediaPipe model already exists")
        return True
    
    print("📥 Downloading MediaPipe hand landmarker model...")
    url = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
    
    try:
        urllib.request.urlretrieve(url, model_path)
        print("✅ MediaPipe model downloaded successfully")
        return True
    except Exception as e:
        print(f"❌ Failed to download MediaPipe model: {e}")
        print("Please download manually from: https://developers.google.com/mediapipe/solutions/vision/hand_landmarker")
        return False

def check_node_npm():
    """Check if Node.js and npm are installed"""
    try:
        subprocess.check_output(["node", "--version"], stderr=subprocess.DEVNULL)
        subprocess.check_output(["npm", "--version"], stderr=subprocess.DEVNULL)
        print("✅ Node.js and npm are installed")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js and npm are required for the React Native app")
        print("Please install from: https://nodejs.org/")
        return False

def install_npm_dependencies():
    """Install npm dependencies"""
    try:
        subprocess.check_call(["npm", "install"], cwd=".")
        print("✅ npm dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install npm dependencies")
        return False

def main():
    """Main setup function"""
    print("🚀 MyHearingBuddy Setup Script")
    print("This script will help you set up the project")
    
    # Step 1: Check Python version
    print_step(1, "Checking Python version")
    check_python_version()
    
    # Step 2: Install Python requirements
    print_step(2, "Installing Python requirements")
    if not install_requirements():
        print("Setup failed. Please check the error messages above.")
        sys.exit(1)
    
    # Step 3: Set up environment variables
    print_step(3, "Setting up environment variables")
    if not setup_environment():
        print("Setup failed. Please check the error messages above.")
        sys.exit(1)
    
    # Step 4: Download MediaPipe model
    print_step(4, "Downloading MediaPipe model")
    download_mediapipe_model()  # Continue even if this fails
    
    # Step 5: Check Node.js and npm
    print_step(5, "Checking Node.js and npm")
    if check_node_npm():
        # Step 6: Install npm dependencies
        print_step(6, "Installing npm dependencies")
        install_npm_dependencies()
    
    # Final instructions
    print("\n" + "="*60)
    print("🎉 SETUP COMPLETE!")
    print("="*60)
    print("\nNext steps:")
    print("1. Edit .env file and add your OpenAI API key")
    print("2. Generate training data: cd sign-language-detector && python create_dataset.py")
    print("3. Train the model: python train_classifier.py")
    print("4. Start the backend: python api_server.py")
    print("5. Start the frontend: npm start")
    print("\nFor detailed instructions, see README.md")

if __name__ == "__main__":
    main()