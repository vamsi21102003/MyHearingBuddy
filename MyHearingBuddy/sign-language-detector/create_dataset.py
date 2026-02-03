import os
import pickle
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

DATA_DIR = './data'

# Create alphabet mapping including SPACE and SEND
alphabet_labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                   'SPACE', 'SEND']

# Download the hand landmarker model if it doesn't exist
model_path = 'hand_landmarker.task'
if not os.path.exists(model_path):
    import urllib.request
    print("Downloading hand landmarker model...")
    url = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
    urllib.request.urlretrieve(url, model_path)
    print("Model downloaded successfully!")

# Create hand landmarker
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=1,
    min_hand_detection_confidence=0.3,
    min_hand_presence_confidence=0.3,
    min_tracking_confidence=0.3
)
detector = vision.HandLandmarker.create_from_options(options)

data = []
labels = []

for dir_ in os.listdir(DATA_DIR):
    if not os.path.isdir(os.path.join(DATA_DIR, dir_)):
        continue
        
    class_index = int(dir_)
    letter = alphabet_labels[class_index]
    print(f"Processing class {dir_} - Letter '{letter}'...")
    
    for img_path in os.listdir(os.path.join(DATA_DIR, dir_)):
        if not img_path.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
            
        data_aux = []
        x_ = []
        y_ = []

        img = cv2.imread(os.path.join(DATA_DIR, dir_, img_path))
        if img is None:
            continue
            
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Convert to MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
        
        # Detect hand landmarks
        results = detector.detect(mp_image)
        
        if results.hand_landmarks:
            for hand_landmarks in results.hand_landmarks:
                # Extract x, y coordinates
                for landmark in hand_landmarks:
                    x_.append(landmark.x)
                    y_.append(landmark.y)

                # Normalize coordinates relative to bounding box
                for landmark in hand_landmarks:
                    data_aux.append(landmark.x - min(x_))
                    data_aux.append(landmark.y - min(y_))

            data.append(data_aux)
            labels.append(dir_)  # Keep numeric labels for consistency

print(f"Processed {len(data)} samples across {len(set(labels))} classes")

# Save the dataset
with open('data.pickle', 'wb') as f:
    pickle.dump({'data': data, 'labels': labels}, f)

print("Dataset saved as data.pickle")
print("Alphabet mapping:")
for i, letter in enumerate(alphabet_labels):
    print(f"Class {i}: {letter}")