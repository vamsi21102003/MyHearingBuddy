"""
Flask API Server for Sign Language Detection
Provides REST endpoints for React Native integration
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
import pickle
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import base64
import io
from PIL import Image
import os
import threading
import time
from openai_integration import OpenAIIntegrator

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Global variables
model = None
detector = None
openai_integrator = None

# Labels for all 28 classes (A-Z + SPACE + SEND)
labels_dict = {
    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
    10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S', 19: 'T',
    20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z', 26: 'SPACE', 27: 'SEND'
}

def initialize_models():
    """Initialize ML models and OpenAI integration"""
    global model, detector, openai_integrator
    
    try:
        # Load the trained model
        print("Loading trained model...")
        model_dict = pickle.load(open('./model.p', 'rb'))
        model = model_dict['model']
        print("✅ Model loaded successfully")
        
        # Initialize MediaPipe hand detector
        print("Initializing MediaPipe hand detector...")
        model_path = 'hand_landmarker.task'
        if not os.path.exists(model_path):
            print("❌ hand_landmarker.task not found. Please download it first.")
            return False
            
        base_options = python.BaseOptions(model_asset_path=model_path)
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.3,
            min_hand_presence_confidence=0.3,
            min_tracking_confidence=0.3
        )
        detector = vision.HandLandmarker.create_from_options(options)
        print("✅ MediaPipe detector initialized")
        
        # Initialize OpenAI integration
        print("Initializing OpenAI integration...")
        try:
            openai_integrator = OpenAIIntegrator()
            print("✅ OpenAI integration initialized")
        except Exception as e:
            print(f"⚠️ OpenAI integration failed: {e}")
            openai_integrator = None
        
        return True
        
    except Exception as e:
        print(f"❌ Model initialization failed: {e}")
        return False

def decode_base64_image(base64_string):
    """Decode base64 image string to OpenCV format"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_data))
        
        # Convert to OpenCV format
        opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        return opencv_image
    except Exception as e:
        print(f"Error decoding image: {e}")
        return None

def detect_sign_language(image):
    """Detect sign language from image"""
    global model, detector
    
    if model is None or detector is None:
        return None, "Models not initialized"
    
    try:
        # Convert image to RGB for MediaPipe
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Convert to MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=image_rgb)
        
        # Detect hand landmarks
        results = detector.detect(mp_image)
        
        if not results.hand_landmarks:
            return None, "No hand detected"
        
        # Process first detected hand
        hand_landmarks = results.hand_landmarks[0]
        
        # Extract coordinates
        data_aux = []
        x_ = []
        y_ = []
        
        for landmark in hand_landmarks:
            x_.append(landmark.x)
            y_.append(landmark.y)
        
        # Normalize coordinates
        for landmark in hand_landmarks:
            data_aux.append(landmark.x - min(x_))
            data_aux.append(landmark.y - min(y_))
        
        # Make prediction
        if len(data_aux) == 42:  # 21 landmarks * 2 coordinates
            prediction = model.predict([np.asarray(data_aux)])
            predicted_character = labels_dict[int(prediction[0])]
            
            # Get prediction confidence (probability)
            prediction_proba = model.predict_proba([np.asarray(data_aux)])
            confidence = float(np.max(prediction_proba))
            
            # Calculate bounding box
            h, w = image.shape[:2]
            x1 = int(min(x_) * w)
            y1 = int(min(y_) * h)
            x2 = int(max(x_) * w)
            y2 = int(max(y_) * h)
            
            return {
                'prediction': predicted_character,
                'confidence': confidence,
                'bounding_box': {
                    'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2
                },
                'landmarks': [{'x': lm.x, 'y': lm.y} for lm in hand_landmarks]
            }, None
        else:
            return None, "Invalid landmark data"
            
    except Exception as e:
        return None, f"Detection error: {str(e)}"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'detector_loaded': detector is not None,
        'openai_available': openai_integrator is not None
    })

@app.route('/detect', methods=['POST'])
def detect_endpoint():
    """Main detection endpoint for React Native"""
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image = decode_base64_image(data['image'])
        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400
        
        # Detect sign language
        result, error = detect_sign_language(image)
        
        if error:
            return jsonify({'error': error}), 400
        
        if result is None:
            return jsonify({'error': 'No detection result'}), 400
        
        return jsonify({
            'success': True,
            'prediction': result['prediction'],
            'confidence': result['confidence'],
            'bounding_box': result['bounding_box'],
            'landmarks': result['landmarks']
        })
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/complete_text', methods=['POST'])
def complete_text_endpoint():
    """Text completion endpoint using OpenAI"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text'].strip()
        
        if not text:
            return jsonify({'error': 'Empty text provided'}), 400
        
        if openai_integrator is None:
            return jsonify({'error': 'OpenAI integration not available'}), 503
        
        # Complete the text
        completed_text = openai_integrator.complete_sentence(text)
        
        return jsonify({
            'success': True,
            'original_text': text,
            'completed_text': completed_text
        })
        
    except Exception as e:
        return jsonify({'error': f'Text completion error: {str(e)}'}), 500

@app.route('/speak', methods=['POST'])
def speak_endpoint():
    """Text-to-speech endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        text = data['text'].strip()
        
        if not text:
            return jsonify({'error': 'Empty text provided'}), 400
        
        if openai_integrator is None:
            return jsonify({'error': 'OpenAI integration not available'}), 503
        
        # Note: Speech will be handled on the client side (React Native app)
        # Server just confirms the request was received
        
        return jsonify({
            'success': True,
            'message': f'Text received for speech: {text}'
        })
        
    except Exception as e:
        return jsonify({'error': f'Speech error: {str(e)}'}), 500

@app.route('/labels', methods=['GET'])
def get_labels():
    """Get all available sign language labels"""
    return jsonify({
        'labels': labels_dict,
        'total_classes': len(labels_dict)
    })

@app.route('/model_info', methods=['GET'])
def get_model_info():
    """Get model information and statistics"""
    try:
        # Try to load model info if available
        model_info = {
            'total_classes': len(labels_dict),
            'labels': list(labels_dict.values()),
            'model_type': 'Random Forest Classifier',
            'features': 42,  # 21 landmarks * 2 coordinates
            'status': 'loaded' if model is not None else 'not_loaded'
        }
        
        return jsonify(model_info)
        
    except Exception as e:
        return jsonify({'error': f'Model info error: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Starting Sign Language Detection API Server...")
    
    # Initialize models
    if not initialize_models():
        print("❌ Failed to initialize models. Exiting...")
        exit(1)
    
    print("✅ All models initialized successfully!")
    print("🌐 Server starting on http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  GET  /health - Health check")
    print("  POST /detect - Sign language detection")
    print("  POST /complete_text - Text completion with OpenAI")
    print("  POST /speak - Text-to-speech")
    print("  GET  /labels - Get all available labels")
    print("  GET  /model_info - Get model information")
    
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)