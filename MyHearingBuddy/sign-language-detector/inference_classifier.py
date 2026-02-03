import pickle
import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
import time

# Try to import OpenAI integration
try:
    from openai_integration import process_text
    openai_available = True
    print("✅ OpenAI integration loaded successfully")
except ImportError as e:
    openai_available = False
    print(f"❌ OpenAI integration not available: {e}")
    print("Install requirements: pip install openai pyttsx3")
except Exception as e:
    openai_available = False
    print(f"❌ OpenAI integration error: {e}")

def send_to_openai(text):
    """
    Send text to OpenAI for completion and speech
    """
    print(f"🤖 Sending to OpenAI: '{text}'")
    
    if not openai_available:
        print(f"❌ OpenAI not available. Text was: '{text}'")
        return f"OpenAI not available: {text}"
    
    try:
        result = process_text(text)
        print(f"✅ OpenAI Response: {result}")
        return result
    except Exception as e:
        error_msg = f"OpenAI Error: {str(e)}"
        print(f"❌ {error_msg}")
        return error_msg

def main():
    # Load the trained model
    model_dict = pickle.load(open('./model.p', 'rb'))
    model = model_dict['model']

    # Initialize camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open camera")
        return

    # Create hand landmarker
    model_path = 'hand_landmarker.task'
    base_options = python.BaseOptions(model_asset_path=model_path)
    options = vision.HandLandmarkerOptions(
        base_options=base_options,
        num_hands=1,
        min_hand_detection_confidence=0.3,
        min_hand_presence_confidence=0.3,
        min_tracking_confidence=0.3
    )
    detector = vision.HandLandmarker.create_from_options(options)

    # Labels for all 28 classes (A-Z + SPACE + SEND)
    labels_dict = {
        0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
        10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S', 19: 'T',
        20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z', 26: 'SPACE', 27: 'SEND'
    }

    print("Starting real-time sign language detection...")
    print("Press 'q' to quit")
    print("Press 'c' to clear text")
    print("Press 's' to send text to OpenAI")
    print("Hold SEND gesture for 2 seconds to send text to OpenAI")
    print("Hold any letter for 0.2 seconds to add it to text")

    # Text accumulation variables
    accumulated_text = ""
    last_prediction = ""
    prediction_stability_time = 0.2  # Seconds to wait before adding letter (reduced from 1.0)
    stable_prediction_start = 0

    # SEND gesture specific variables
    send_gesture_hold_time = 2.0  # Seconds to hold SEND gesture (reduced from 3.0)
    send_gesture_start_time = 0
    is_holding_send = False

    while True:
        data_aux = []
        x_ = []
        y_ = []

        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame from camera")
            break

        H, W, _ = frame.shape
        
        # Create a wider frame to accommodate the text display
        display_width = W + 400  # Add 400 pixels for text area
        display_frame = np.zeros((H, display_width, 3), dtype=np.uint8)
        
        # Place the camera frame on the left side
        display_frame[:, :W] = frame
        
        # Create text display area on the right side
        text_area = display_frame[:, W:]
        text_area.fill(50)  # Dark gray background
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Convert to MediaPipe Image
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        
        # Detect hand landmarks
        results = detector.detect(mp_image)
        
        if results.hand_landmarks:
            for hand_landmarks in results.hand_landmarks:
                # Convert landmarks to pixel coordinates
                landmark_points = []
                for landmark in hand_landmarks:
                    x = int(landmark.x * W)
                    y = int(landmark.y * H)
                    landmark_points.append((x, y))
                
                # Draw hand connections (skeleton)
                connections = [
                    # Thumb
                    (0, 1), (1, 2), (2, 3), (3, 4),
                    # Index finger
                    (0, 5), (5, 6), (6, 7), (7, 8),
                    # Middle finger
                    (0, 9), (9, 10), (10, 11), (11, 12),
                    # Ring finger
                    (0, 13), (13, 14), (14, 15), (15, 16),
                    # Pinky
                    (0, 17), (17, 18), (18, 19), (19, 20),
                    # Palm connections
                    (5, 9), (9, 13), (13, 17)
                ]
                
                # Define colors for different parts
                colors = {
                    # Thumb - Red
                    (0, 1): (0, 0, 255), (1, 2): (0, 0, 255), (2, 3): (0, 0, 255), (3, 4): (0, 0, 255),
                    # Index - Green
                    (0, 5): (0, 255, 0), (5, 6): (0, 255, 0), (6, 7): (0, 255, 0), (7, 8): (0, 255, 0),
                    # Middle - Blue
                    (0, 9): (255, 0, 0), (9, 10): (255, 0, 0), (10, 11): (255, 0, 0), (11, 12): (255, 0, 0),
                    # Ring - Yellow
                    (0, 13): (0, 255, 255), (13, 14): (0, 255, 255), (14, 15): (0, 255, 255), (15, 16): (0, 255, 255),
                    # Pinky - Magenta
                    (0, 17): (255, 0, 255), (17, 18): (255, 0, 255), (18, 19): (255, 0, 255), (19, 20): (255, 0, 255),
                    # Palm - Gray
                    (5, 9): (128, 128, 128), (9, 13): (128, 128, 128), (13, 17): (128, 128, 128)
                }
                
                # Draw connections on camera frame
                for connection in connections:
                    start_idx, end_idx = connection
                    if start_idx < len(landmark_points) and end_idx < len(landmark_points):
                        start_point = landmark_points[start_idx]
                        end_point = landmark_points[end_idx]
                        color = colors.get(connection, (255, 255, 255))  # Default white
                        cv2.line(display_frame, start_point, end_point, color, 3)
                
                # Draw landmark points on top of lines on camera frame
                for i, point in enumerate(landmark_points):
                    # Different colors for different landmark types
                    if i == 0:  # Wrist
                        color = (255, 255, 255)  # White
                    elif i in [4, 8, 12, 16, 20]:  # Fingertips
                        color = (0, 255, 255)  # Yellow
                    else:  # Other joints
                        color = (255, 255, 0)  # Cyan
                    cv2.circle(display_frame, point, 6, color, -1)
                    cv2.circle(display_frame, point, 6, (0, 0, 0), 2)  # Black border
                
                # Extract coordinates for prediction
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
                current_time = time.time()

                # Handle prediction stability and text accumulation
                if predicted_character == last_prediction:
                    if stable_prediction_start == 0:
                        stable_prediction_start = current_time
                    elif current_time - stable_prediction_start >= prediction_stability_time:
                        # Special handling for SEND gesture
                        if predicted_character == "SEND":
                            if not is_holding_send:
                                # Start holding SEND gesture
                                is_holding_send = True
                                send_gesture_start_time = current_time
                                print("Hold SEND gesture for 2 seconds to send text...")
                            elif current_time - send_gesture_start_time >= send_gesture_hold_time:
                                # SEND gesture held long enough
                                print(f"SEND gesture held for {send_gesture_hold_time} seconds!")
                                if accumulated_text.strip():
                                    print(f"Sending text to OpenAI: '{accumulated_text}'")
                                    ai_response = send_to_openai(accumulated_text)
                                    print(f"AI Response: {ai_response}")
                                else:
                                    print("No text to send")
                                accumulated_text = ""  # Clear after sending
                                is_holding_send = False
                                send_gesture_start_time = 0
                                stable_prediction_start = 0  # Reset to prevent immediate re-trigger
                        else:
                            # Regular letter or SPACE
                            if predicted_character == "SPACE":
                                accumulated_text += " "
                            else:
                                accumulated_text += predicted_character
                            
                            # Reset stability timer
                            stable_prediction_start = 0
                            # Reset SEND gesture tracking if we're not doing SEND
                            is_holding_send = False
                            send_gesture_start_time = 0
                else:
                    # Different prediction, reset all timers
                    last_prediction = predicted_character
                    stable_prediction_start = 0
                    is_holding_send = False
                    send_gesture_start_time = 0

                # Draw bounding box and prediction on camera frame
                x1 = int(min(x_) * W) - 10
                y1 = int(min(y_) * H) - 10
                x2 = int(max(x_) * W) + 10
                y2 = int(max(y_) * H) + 10

                cv2.rectangle(display_frame, (x1, y1), (x2, y2), (0, 0, 0), 4)
                cv2.putText(display_frame, predicted_character, (x1, y1 - 10), 
                           cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 0), 3, cv2.LINE_AA)

        # Draw text display area
        # Title
        cv2.putText(display_frame, "Detected Text:", (W + 10, 30), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        # Current prediction (if any)
        if 'predicted_character' in locals():
            cv2.putText(display_frame, f"Current: {predicted_character}", (W + 10, 70), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Show SEND gesture progress
            if predicted_character == "SEND" and is_holding_send:
                elapsed_time = current_time - send_gesture_start_time
                progress = min(elapsed_time / send_gesture_hold_time, 1.0)
                remaining_time = max(send_gesture_hold_time - elapsed_time, 0)
                
                # Progress bar
                bar_width = 300
                bar_height = 20
                bar_x = W + 10
                bar_y = 100
                
                # Background bar
                cv2.rectangle(display_frame, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), (100, 100, 100), -1)
                
                # Progress bar
                progress_width = int(bar_width * progress)
                color = (0, 255, 0) if progress >= 1.0 else (0, 165, 255)  # Green when complete, orange otherwise
                cv2.rectangle(display_frame, (bar_x, bar_y), (bar_x + progress_width, bar_y + bar_height), color, -1)
                
                # Progress text
                cv2.putText(display_frame, f"Hold SEND: {remaining_time:.1f}s", (bar_x, bar_y - 5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        # Accumulated text (word wrap for long text)
        y_offset = 150  # Moved down to make room for progress bar
        max_chars_per_line = 25
        
        if accumulated_text:
            # Split text into lines
            words = accumulated_text.split(' ')
            lines = []
            current_line = ""
            
            for word in words:
                if len(current_line + word) <= max_chars_per_line:
                    current_line += word + " "
                else:
                    if current_line:
                        lines.append(current_line.strip())
                    current_line = word + " "
            
            if current_line:
                lines.append(current_line.strip())
            
            # Display lines
            for i, line in enumerate(lines[-10:]):  # Show last 10 lines
                cv2.putText(display_frame, line, (W + 10, y_offset + i * 30), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        # Instructions
        instructions_y = H - 140
        cv2.putText(display_frame, "Controls:", (W + 10, instructions_y), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        cv2.putText(display_frame, "Q - Quit", (W + 10, instructions_y + 25), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        cv2.putText(display_frame, "C - Clear text", (W + 10, instructions_y + 45), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        cv2.putText(display_frame, "S - Send to AI", (W + 10, instructions_y + 65), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        cv2.putText(display_frame, "SEND gesture (2s) - Send", (W + 10, instructions_y + 85), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        cv2.putText(display_frame, "Letters (0.2s) - Add letter", (W + 10, instructions_y + 105), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

        cv2.imshow('Sign Language Detection', display_frame)
        
        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('c'):
            accumulated_text = ""
            print("Text cleared")
        elif key == ord('s'):
            if accumulated_text:
                print(f"Manually sending text to OpenAI: '{accumulated_text}'")
                ai_response = send_to_openai(accumulated_text)
                print(f"AI Response: {ai_response}")
            else:
                print("No text to send")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()