import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../../types';
import { colors, typography, spacing } from '../../utils/theme';
import { ANIMATIONS } from '../../utils/constants';

// Simple gradient background component
const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={[styles.container, { backgroundColor: colors.background }]}>
    {children}
  </View>
);

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showFallback, setShowFallback] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    startAnimations();
    
    // No automatic timer - navigation only happens when video/fallback completes
    return () => {
      // Cleanup if needed
    };
  }, [navigation]);

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: ANIMATIONS.FADE_DURATION,
      useNativeDriver: true,
    }).start();
  };

  const handleVideoLoad = () => {
    // Video loaded successfully
    console.log('Video loaded successfully');
    setVideoLoaded(true);
    setShowFallback(false);
  };

  const handleVideoError = (error: any) => {
    // Video failed to load, show fallback
    console.log('Video failed to load:', error);
    setShowFallback(true);
    setVideoLoaded(false);
  };

  const handleVideoEnd = () => {
    // Video finished playing, navigate to next screen
    console.log('Video/Fallback completed, navigating to Login');
    navigation.replace('Login');
  };

  return (
    <GradientBackground>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.videoContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {!showFallback ? (
            <Video
              ref={videoRef}
              style={styles.video}
              source={require('../../../assets/MyHearingBuddy_Splash_Screen_Animation.mp4')}
              useNativeControls={false}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              shouldPlay={true}
              onLoad={handleVideoLoad}
              onError={handleVideoError}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  if (status.didJustFinish) {
                    console.log('Video playback finished');
                    handleVideoEnd();
                  }
                  // Optional: Log playback progress
                  // console.log('Video progress:', status.positionMillis, '/', status.durationMillis);
                }
              }}
            />
          ) : (
            // Fallback content if video fails to load
            <FallbackSplashContent onComplete={handleVideoEnd} />
          )}
          
          {/* Show loading indicator while video is loading */}
          {!videoLoaded && !showFallback && (
            <View style={styles.loadingOverlay}>
              <Animatable.View
                animation="pulse"
                iterationCount="infinite"
                duration={1000}
                style={styles.loadingContainer}
              >
                <View style={styles.loadingDot} />
                <View style={[styles.loadingDot, { marginLeft: 8 }]} />
                <View style={[styles.loadingDot, { marginLeft: 8 }]} />
              </Animatable.View>
            </View>
          )}
        </Animated.View>
      </View>
    </GradientBackground>
  );
};

// Fallback component with original animation
const FallbackSplashContent: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: ANIMATIONS.SLIDE_DURATION,
      useNativeDriver: true,
    }).start();

    // Set timer for fallback completion
    const fallbackTimer = setTimeout(() => {
      onComplete();
    }, ANIMATIONS.SPLASH_DURATION);

    return () => clearTimeout(fallbackTimer);
  }, [onComplete]);

  return (
    <>
      {/* Animated Logo/Icon Area */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Hand Sign Animation */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={2000}
          style={styles.handContainer}
        >
          <Text style={styles.handEmoji}>🤟</Text>
        </Animatable.View>

        {/* Speech Bubble Animation */}
        <Animatable.View
          animation="bounceIn"
          delay={500}
          style={styles.speechBubble}
        >
          <Text style={styles.speechText}>MHB</Text>
        </Animatable.View>
      </Animated.View>

      {/* App Name */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.titleGradient}>
          <Text style={styles.title}>MyHearingBuddy</Text>
        </View>
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.tagline}>
          Your Digital Communication Companion
        </Text>
      </Animated.View>

      {/* Animated Figures */}
      <Animated.View style={styles.figuresContainer}>
        <Animatable.View
          animation="slideInLeft"
          delay={1000}
          style={styles.figure}
        >
          <Text style={styles.figureEmoji}>🧏‍♂️</Text>
          <Text style={styles.figureLabel}>Signing</Text>
        </Animatable.View>

        <Animatable.View
          animation="fadeIn"
          delay={1500}
          style={styles.arrow}
        >
          <Text style={styles.arrowText}>→</Text>
        </Animatable.View>

        <Animatable.View
          animation="slideInRight"
          delay={2000}
          style={styles.figure}
        >
          <Text style={styles.figureEmoji}>👂</Text>
          <Text style={styles.figureLabel}>Listening</Text>
        </Animatable.View>
      </Animated.View>

      {/* Loading Indicator */}
      <Animatable.View
        animation="fadeIn"
        delay={2500}
        style={styles.loadingContainer}
      >
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={1000}
          style={styles.loadingDot}
        />
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={1000}
          delay={200}
          style={styles.loadingDot}
        />
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={1000}
          delay={400}
          style={styles.loadingDot}
        />
      </Animatable.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  video: {
    width: width,
    height: height,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  handContainer: {
    marginBottom: spacing.md,
  },
  handEmoji: {
    fontSize: 80,
    textAlign: 'center',
  },
  speechBubble: {
    backgroundColor: colors.primary,
    borderRadius: 25,
    width: 60,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -10,
    right: -20,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  speechText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
  },
  titleContainer: {
    marginBottom: spacing.md,
  },
  titleGradient: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontFamily: typography.fontFamily.black,
    color: colors.surface,
    textAlign: 'center',
    letterSpacing: 1,
  },
  taglineContainer: {
    marginBottom: spacing.xxl,
  },
  tagline: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  figuresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: width * 0.7,
    marginBottom: spacing.xxl,
  },
  figure: {
    alignItems: 'center',
  },
  figureEmoji: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  figureLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  arrow: {
    marginHorizontal: spacing.md,
  },
  arrowText: {
    fontSize: typography.sizes.xl,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: spacing.xxl * 2,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 4,
  },
});

export default SplashScreen;