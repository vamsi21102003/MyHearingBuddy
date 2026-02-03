# MyHearingBuddy - Sign Language Detection App

A React Native Expo mobile application for real-time Indian Sign Language (ISL) detection and translation using AI-powered gesture recognition.

## Features

- **Real-time ISL Detection**: Live camera-based gesture recognition
- **AI-Powered Translation**: Converts ISL gestures to text/speech using OpenAI
- **Word Building**: Combines detected letters into words
- **Text-to-Speech**: Speaks detected words aloud
- **Practice Mode**: Interactive learning with ISL alphabet
- **Quiz System**: Test knowledge with randomized questions
- **Detection History**: Track and review past detections
- **Text to Sign**: Convert text to sign language images

## Tech Stack

### Frontend
- React Native (Expo SDK 54+)
- TypeScript
- React Navigation
- AsyncStorage
- expo-camera
- expo-speech

### Backend
- Flask (REST API server)
- MediaPipe (Hand landmark detection)
- scikit-learn (Machine learning classification)
- OpenCV (Image processing)
- OpenAI API (Text completion)

## Quick Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ with pip
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on mobile device
- OpenAI API Key

### Automated Setup
```bash
git clone <repository-url>
cd myhearingbuddy
python setup.py
```

### Manual Setup

1. **Install Dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd sign-language-detector
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   ```bash
   # Copy template and add your API key
   cp .env.example .env
   # Edit .env: OPENAI_API_KEY=your_key_here
   ```

3. **Download Required Files**
   - MediaPipe model: Download `hand_landmarker.task` from [MediaPipe](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)
   - Place in `sign-language-detector/` directory

4. **Generate ML Models**
   ```bash
   cd sign-language-detector
   python create_dataset.py
   python train_classifier.py
   ```

5. **Start Backend**
   ```bash
   python api_server.py
   # Server runs on http://localhost:5000
   ```

6. **Start Frontend**
   ```bash
   cd ..
   npm start
   # Scan QR code with Expo Go app
   ```

## Project Structure

```
MyHearingBuddy/
├── .env.example              # Environment variables template
├── setup.py                  # Automated setup script
├── check_setup.py           # Environment verification
├── App.tsx                  # Main app entry point
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # Screen components
│   │   ├── Home/           # Main dashboard
│   │   ├── LiveDetect/     # Real-time detection
│   │   ├── History/        # Detection history
│   │   ├── Practice/       # Learning mode
│   │   └── Settings/       # App configuration
│   ├── services/           # API and external services
│   ├── hooks/              # Custom React hooks
│   ├── navigation/         # Navigation setup
│   └── utils/              # Utility functions
├── sign-language-detector/
│   ├── api_server.py       # Flask API server
│   ├── inference_classifier.py # Real-time detection
│   ├── openai_integration.py # OpenAI text completion
│   ├── collect_imgs.py     # Data collection
│   ├── create_dataset.py   # Dataset generation
│   ├── train_classifier.py # Model training
│   └── requirements.txt    # Python dependencies
└── assets/                 # App assets and images
```

## Usage

### Live Detection
1. Open app → "Live Detect" tab
2. Grant camera permissions
3. Show hand gestures to camera
4. Hold SEND gesture for 2 seconds to complete text

### Practice Mode
1. Navigate to "Practice" tab
2. Learn ISL alphabet with interactive cards
3. Take quizzes to test knowledge

### Configuration
- **Backend URL**: Configure in Settings (use your computer's IP:5000)
- **Detection Speed**: Adjustable 100-500ms intervals
- **OpenAI Features**: Requires API key in .env file

## API Endpoints

- `POST /detect` - Sign language detection from image
- `POST /complete_text` - AI text completion
- `GET /health` - Server health check
- `GET /labels` - Available sign classes

## Sign Classes

28 total classes: A-Z alphabet + SPACE + SEND commands

## Environment Variables

Create `.env` file from `.env.example`:
```bash
OPENAI_API_KEY=your_openai_api_key_here
API_SERVER_HOST=localhost
API_SERVER_PORT=5000
DEBUG=true
```

## Troubleshooting

### Common Issues

**"OpenAI API key not found"**
- Add `OPENAI_API_KEY` to `.env` file
- Verify `.env` is in project root

**"Backend connection failed"**
- Start backend: `python api_server.py`
- Update backend URL in app settings
- Ensure device and computer on same network

**"Camera not working"**
- Grant camera permissions in device settings
- Restart Expo Go app

**"Model files missing"**
- Run `python create_dataset.py`
- Run `python train_classifier.py`
- Download MediaPipe model manually

### Verification
```bash
# Check environment setup
python check_setup.py

# Test backend API
cd sign-language-detector
python test_api.py
```

## Development

### Adding New Gestures
1. Collect data: `python collect_imgs.py`
2. Process dataset: `python create_dataset.py`
3. Train model: `python train_classifier.py`
4. Test: `python inference_classifier.py`

### File Generation
Some files are generated/downloaded and not in repository:
- `sign-language-detector/model.p` - ML model
- `sign-language-detector/data.pickle` - Training dataset
- `sign-language-detector/hand_landmarker.task` - MediaPipe model

## Security

- API keys stored in environment variables
- Camera access only for gesture detection
- All data stored locally on device
- No personal data collection

## License

MIT License - see LICENSE file for details.

## Support

- Create GitHub issue with error details
- Run `python check_setup.py` for diagnostics
- Check console output for error messages

---

**Built for the deaf and hard-of-hearing community**
