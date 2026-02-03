import os
import cv2

DATA_DIR = './data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# 28 classes for A-Z alphabets + SPACE + SEND
number_of_classes = 28
dataset_size = 100

# Create alphabet mapping including SPACE and SEND
alphabet_labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
                   'SPACE', 'SEND']

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open camera")
    exit()

for j in range(number_of_classes):
    if not os.path.exists(os.path.join(DATA_DIR, str(j))):
        os.makedirs(os.path.join(DATA_DIR, str(j)))

    print(f'Collecting data for class {j} - Letter "{alphabet_labels[j]}"')
    print(f'Make the sign for letter "{alphabet_labels[j]}" with your hand')

    done = False
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame from camera")
            break
        
        # Display current letter being collected
        cv2.putText(frame, f'Letter: {alphabet_labels[j]}', (50, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3, cv2.LINE_AA)
        cv2.putText(frame, 'Ready? Press "Q" to start!', (50, 120), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 255, 0), 3, cv2.LINE_AA)
        cv2.putText(frame, f'Class {j+1}/26', (50, 180), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2, cv2.LINE_AA)
        
        cv2.imshow('Data Collection', frame)
        if cv2.waitKey(25) == ord('q'):
            break

    counter = 0
    print(f'Collecting {dataset_size} images for letter "{alphabet_labels[j]}"...')
    
    while counter < dataset_size:
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame from camera")
            break
        
        # Show progress
        cv2.putText(frame, f'Letter: {alphabet_labels[j]}', (50, 50), 
                   cv2.FONT_HERSHEY_SIMPLEX, 2, (0, 255, 0), 3, cv2.LINE_AA)
        cv2.putText(frame, f'Collecting: {counter+1}/{dataset_size}', (50, 120), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1.3, (0, 0, 255), 3, cv2.LINE_AA)
        cv2.putText(frame, f'Class {j+1}/26', (50, 180), 
                   cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 0), 2, cv2.LINE_AA)
        
        cv2.imshow('Data Collection', frame)
        cv2.waitKey(25)
        cv2.imwrite(os.path.join(DATA_DIR, str(j), '{}.jpg'.format(counter)), frame)

        counter += 1
    
    print(f'Completed collecting data for letter "{alphabet_labels[j]}"')
    print('Press any key to continue to next letter...')
    cv2.waitKey(0)

cap.release()
cv2.destroyAllWindows()
print("Data collection completed for all 26 letters!")
