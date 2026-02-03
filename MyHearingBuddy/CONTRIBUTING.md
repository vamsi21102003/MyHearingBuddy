# Contributing to MyHearingBuddy

Thank you for your interest in contributing to MyHearingBuddy! This project aims to bridge communication gaps for the deaf and hard-of-hearing community.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/yourusername/myhearingbuddy.git
   cd myhearingbuddy
   ```
3. **Set up the development environment**
   ```bash
   python setup.py
   ```

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.8+
- Expo CLI
- OpenAI API Key

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add your OpenAI API key
3. Follow README setup instructions

## How to Contribute

### Reporting Bugs
- Use GitHub Issues
- Include steps to reproduce
- Provide system information
- Include error messages/logs

### Suggesting Features
- Open a GitHub Issue
- Describe the feature clearly
- Explain the use case
- Consider accessibility implications

### Code Contributions

#### Areas We Need Help With
- **Accessibility improvements**
- **New sign language gestures**
- **UI/UX enhancements**
- **Performance optimizations**
- **Documentation**
- **Testing**

#### Pull Request Process
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation
5. Submit a pull request

#### Code Style
- Use TypeScript for React Native code
- Follow existing code patterns
- Add comments for complex logic
- Ensure accessibility compliance

#### Testing
- Test on both iOS and Android
- Verify camera functionality
- Test with different lighting conditions
- Ensure gesture detection accuracy

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/       # Screen components
├── services/      # API and external services
├── hooks/         # Custom React hooks
└── utils/         # Utility functions

sign-language-detector/
├── api_server.py           # Flask API
├── inference_classifier.py # ML detection
└── openai_integration.py   # AI completion
```

## Adding New Sign Language Gestures

1. **Collect training data**
   ```bash
   cd sign-language-detector
   python collect_imgs.py
   ```

2. **Process dataset**
   ```bash
   python create_dataset.py
   ```

3. **Retrain model**
   ```bash
   python train_classifier.py
   ```

4. **Update UI** to include new gesture

## Accessibility Guidelines

- High contrast colors
- Large touch targets
- Screen reader compatibility
- Haptic feedback
- Clear visual indicators
- Simple navigation

## Community Guidelines

- Be respectful and inclusive
- Focus on accessibility
- Consider diverse user needs
- Provide constructive feedback
- Help others learn

## Questions?

- Open a GitHub Issue
- Check existing documentation
- Review closed issues for solutions

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for helping make communication more accessible!