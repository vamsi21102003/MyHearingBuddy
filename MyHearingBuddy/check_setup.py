#!/usr/bin/env python3
"""
Environment check script for MyHearingBuddy
This script verifies that all required components are properly set up.
"""

import os
import sys
from pathlib import Path

def check_file(file_path, description):
    """Check if a file exists"""
    if Path(file_path).exists():
        print(f"✅ {description}: {file_path}")
        return True
    else:
        print(f"❌ {description}: {file_path} (MISSING)")
        return False

def check_env_var(var_name, description):
    """Check if an environment variable is set"""
    if os.getenv(var_name):
        print(f"✅ {description}: Set")
        return True
    else:
        print(f"❌ {description}: Not set")
        return False

def check_python_import(module_name, description):
    """Check if a Python module can be imported"""
    try:
        __import__(module_name)
        print(f"✅ {description}: Available")
        return True
    except ImportError:
        print(f"❌ {description}: Not available")
        return False

def main():
    """Main check function"""
    print("🔍 MyHearingBuddy Environment Check")
    print("=" * 50)
    
    all_good = True
    
    # Check core files
    print("\n📁 Core Files:")
    all_good &= check_file(".env", "Environment variables file")
    all_good &= check_file("package.json", "React Native package.json")
    all_good &= check_file("sign-language-detector/requirements.txt", "Python requirements")
    
    # Check generated/downloaded files
    print("\n📦 Generated/Downloaded Files:")
    all_good &= check_file("sign-language-detector/hand_landmarker.task", "MediaPipe model")
    check_file("sign-language-detector/data.pickle", "Training dataset (run create_dataset.py)")
    check_file("sign-language-detector/model.p", "ML model (run train_classifier.py)")
    
    # Check environment variables
    print("\n🔐 Environment Variables:")
    if Path(".env").exists():
        # Load .env file
        with open(".env", "r") as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ[key] = value
    
    all_good &= check_env_var("OPENAI_API_KEY", "OpenAI API Key")
    
    # Check Python dependencies
    print("\n🐍 Python Dependencies:")
    deps = [
        ("cv2", "OpenCV"),
        ("mediapipe", "MediaPipe"),
        ("sklearn", "scikit-learn"),
        ("openai", "OpenAI"),
        ("flask", "Flask"),
        ("numpy", "NumPy"),
        ("PIL", "Pillow")
    ]
    
    for module, desc in deps:
        check_python_import(module, desc)
    
    # Check Node.js dependencies
    print("\n📦 Node.js Dependencies:")
    node_modules_exists = check_file("node_modules", "Node modules directory")
    if not node_modules_exists:
        print("   Run 'npm install' to install dependencies")
    
    # Summary
    print("\n" + "=" * 50)
    if all_good:
        print("🎉 Environment check passed! You're ready to run the app.")
        print("\nNext steps:")
        print("1. Start backend: cd sign-language-detector && python api_server.py")
        print("2. Start frontend: npm start")
    else:
        print("⚠️  Some issues found. Please fix the missing components.")
        print("\nFor help, see SETUP.md or run 'python setup.py'")

if __name__ == "__main__":
    main()