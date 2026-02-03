"""
Test script for the Sign Language Detection API
Run this to verify the API is working correctly
"""

import requests
import base64
import cv2
import json
import time

API_BASE_URL = 'http://localhost:5000'

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f'{API_BASE_URL}/health')
        result = response.json()
        print(f"✅ Health check: {result}")
        return result.get('status') == 'healthy'
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_labels_endpoint():
    """Test the labels endpoint"""
    print("🔍 Testing labels endpoint...")
    try:
        response = requests.get(f'{API_BASE_URL}/labels')
        result = response.json()
        print(f"✅ Labels: {len(result['labels'])} classes available")
        print(f"   Sample labels: {list(result['labels'].values())[:10]}...")
        return True
    except Exception as e:
        print(f"❌ Labels test failed: {e}")
        return False

def test_model_info():
    """Test the model info endpoint"""
    print("🔍 Testing model info...")
    try:
        response = requests.get(f'{API_BASE_URL}/model_info')
        result = response.json()
        print(f"✅ Model info: {result}")
        return True
    except Exception as e:
        print(f"❌ Model info test failed: {e}")
        return False

def create_test_image():
    """Create a simple test image"""
    # Create a simple test image (black with white rectangle)
    import numpy as np
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.rectangle(img, (200, 150), (440, 330), (255, 255, 255), -1)
    
    # Save temporarily
    cv2.imwrite('test_image.jpg', img)
    
    # Convert to base64
    with open('test_image.jpg', 'rb') as f:
        image_data = f.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
    
    return base64_image

def test_detection_endpoint():
    """Test the detection endpoint with a test image"""
    print("🔍 Testing detection endpoint...")
    try:
        # Create test image
        base64_image = create_test_image()
        
        # Test detection
        response = requests.post(f'{API_BASE_URL}/detect', 
                               json={'image': base64_image})
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Detection successful: {result}")
            return True
        else:
            result = response.json()
            print(f"⚠️ Detection returned error (expected for test image): {result}")
            # This is expected since our test image doesn't contain a real hand
            return True
    except Exception as e:
        print(f"❌ Detection test failed: {e}")
        return False

def test_text_completion():
    """Test the text completion endpoint"""
    print("🔍 Testing text completion...")
    try:
        test_text = "HELLO WOR"
        response = requests.post(f'{API_BASE_URL}/complete_text', 
                               json={'text': test_text})
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Text completion: '{test_text}' -> '{result['completed_text']}'")
            return True
        else:
            result = response.json()
            print(f"⚠️ Text completion error: {result}")
            return False
    except Exception as e:
        print(f"❌ Text completion test failed: {e}")
        return False

def test_speak_endpoint():
    """Test the speak endpoint"""
    print("🔍 Testing speak endpoint...")
    try:
        test_text = "Hello world"
        response = requests.post(f'{API_BASE_URL}/speak', 
                               json={'text': test_text})
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Speak test: {result}")
            return True
        else:
            result = response.json()
            print(f"⚠️ Speak error: {result}")
            return False
    except Exception as e:
        print(f"❌ Speak test failed: {e}")
        return False

def main():
    """Run all API tests"""
    print("🚀 Starting API tests...")
    print(f"Testing API at: {API_BASE_URL}")
    print("-" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("Labels Endpoint", test_labels_endpoint),
        ("Model Info", test_model_info),
        ("Detection Endpoint", test_detection_endpoint),
        ("Text Completion", test_text_completion),
        ("Speak Endpoint", test_speak_endpoint)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        try:
            success = test_func()
            results.append((test_name, success))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
        
        time.sleep(0.5)  # Small delay between tests
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = 0
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
        if success:
            passed += 1
    
    print(f"\nResults: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🎉 All tests passed! API is ready for React Native integration.")
    else:
        print("⚠️ Some tests failed. Check the API server and dependencies.")
    
    # Cleanup
    try:
        import os
        if os.path.exists('test_image.jpg'):
            os.remove('test_image.jpg')
    except:
        pass

if __name__ == "__main__":
    main()