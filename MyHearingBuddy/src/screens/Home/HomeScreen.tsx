import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ImageStyle,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as Speech from 'expo-speech';

import { MainTabParamList } from '../../types';
import { colors, typography, spacing, borderRadius, elevation } from '../../utils/theme';
import { useAppContext } from '../../context/AppContext';
import NetworkStatus from '../../components/NetworkStatus';
import ServerConfig from '../../components/ServerConfig';
import DebugPanel from '../../components/DebugPanel';
import { signLanguageService } from '../../services/signLanguageService';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { currentWord, detectionHistory, addOpenAICompletion } = useAppContext();
  const [showTextToSign, setShowTextToSign] = useState(false);
  const [inputText, setInputText] = useState('');
  const [currentSignIndex, setCurrentSignIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompletingText, setIsCompletingText] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Parallax scroll animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Banner parallax animations
  const bannerScale = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1.0, 0.8],
    extrapolate: 'clamp',
  });
  
  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1.0, 0.3],
    extrapolate: 'clamp',
  });

  const navigateToLiveDetect = () => {
    navigation.navigate('LiveDetect');
  };

  const navigateToPractice = () => {
    navigation.navigate('Practice');
  };

  const navigateToHistory = () => {
    navigation.navigate('History');
  };

  const openTextToSign = () => {
    setShowTextToSign(true);
  };

  const closeTextToSign = () => {
    setShowTextToSign(false);
    setInputText('');
    setCurrentSignIndex(-1);
    setIsPlaying(false);
    setIsCompletingText(false);
  };

  const handleTextInput = (text: string) => {
    const filteredText = text.replace(/[^A-Za-z\s]/g, '');
    setInputText(filteredText);
    setCurrentSignIndex(-1);
    setIsPlaying(false);
    setIsCompletingText(false);
  };

  const playSignSequence = async () => {
    if (!inputText.trim()) {
      Alert.alert('No Text', 'Please enter some text to convert to signs.');
      return;
    }

    Keyboard.dismiss();
    setIsPlaying(true);
    
    try {
      Speech.speak(inputText, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
    
    const letters = inputText.toUpperCase().split('');
    
    for (let i = 0; i < letters.length; i++) {
      setCurrentSignIndex(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsPlaying(false);
    setCurrentSignIndex(-1);
  };

  const speakText = async () => {
    if (!inputText.trim()) {
      Alert.alert('No Text', 'Please enter some text to speak.');
      return;
    }

    try {
      Speech.speak(inputText, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error) {
      console.error('Speech error:', error);
      Alert.alert('Speech Error', 'Unable to speak the text. Please try again.');
    }
  };

  const completeTextWithAI = async () => {
    if (!inputText.trim()) {
      Alert.alert('No Text', 'Please enter some text to complete.');
      return;
    }

    setIsCompletingText(true);
    
    try {
      const completedText = await signLanguageService.completeText(
        inputText, 
        addOpenAICompletion
      );
      setInputText(completedText);
      
      try {
        Speech.speak(completedText, {
          language: 'en-US',
          pitch: 1.0,
          rate: 0.8,
        });
      } catch (speechError) {
        console.error('Speech error:', speechError);
      }
      
      Alert.alert('Text Completed', `Original: "${inputText}"\n\nCompleted: "${completedText}"`);
    } catch (error) {
      console.error('Text completion error:', error);
      Alert.alert('Completion Error', 'Unable to complete the text. Please check your connection and try again.');
    } finally {
      setIsCompletingText(false);
    }
  };

  const getCurrentLetter = () => {
    if (!inputText.trim() || !isPlaying || currentSignIndex < 0) return null;
    const letters = inputText.toUpperCase().split('');
    const currentLetter = letters[currentSignIndex] || null;
    return currentLetter ? currentLetter.toUpperCase() : null;
  };

  const getSignImage = (character: string) => {
    if (!character) {
      return require('../../../assets/imgs/Space.png');
    }
    
    if (character === ' ') {
      return require('../../../assets/imgs/Space.png');
    }
    
    const letter = character.toUpperCase();
    if (letter >= 'A' && letter <= 'Z') {
      try {
        switch (letter) {
          case 'A': return require('../../../assets/imgs/A.png');
          case 'B': return require('../../../assets/imgs/B.png');
          case 'C': return require('../../../assets/imgs/C.png');
          case 'D': return require('../../../assets/imgs/D.png');
          case 'E': return require('../../../assets/imgs/E.png');
          case 'F': return require('../../../assets/imgs/F.png');
          case 'G': return require('../../../assets/imgs/G.png');
          case 'H': return require('../../../assets/imgs/H.png');
          case 'I': return require('../../../assets/imgs/I.png');
          case 'J': return require('../../../assets/imgs/J.jpg');
          case 'K': return require('../../../assets/imgs/K.png');
          case 'L': return require('../../../assets/imgs/L.png');
          case 'M': return require('../../../assets/imgs/M.png');
          case 'N': return require('../../../assets/imgs/N.png');
          case 'O': return require('../../../assets/imgs/O.png');
          case 'P': return require('../../../assets/imgs/P.png');
          case 'Q': return require('../../../assets/imgs/Q.png');
          case 'R': return require('../../../assets/imgs/R.png');
          case 'S': return require('../../../assets/imgs/S.png');
          case 'T': return require('../../../assets/imgs/T.png');
          case 'U': return require('../../../assets/imgs/U.png');
          case 'V': return require('../../../assets/imgs/V.png');
          case 'W': return require('../../../assets/imgs/W.png');
          case 'X': return require('../../../assets/imgs/X.png');
          case 'Y': return require('../../../assets/imgs/Y.png');
          case 'Z': return require('../../../assets/imgs/Z.jpg');
          default: return require('../../../assets/imgs/Space.png');
        }
      } catch (error) {
        console.warn(`Image not found for letter: ${letter}`);
        return require('../../../assets/imgs/Space.png');
      }
    }
    
    return require('../../../assets/imgs/Space.png');
  };

  const hasSignImage = (character: string) => {
    if (!character) return true;
    if (character === ' ') return true;
    
    const letter = character.toUpperCase();
    if (letter >= 'A' && letter <= 'Z') {
      return true;
    }
    
    return true;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F4F8" />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        >
          {/* Header with Settings */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <NetworkStatus autoCheck={true} showDetails={false} />
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.configButton}
                onPress={() => setShowDebugPanel(true)}
              >
                <MaterialIcons name="bug-report" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.configButton}
                onPress={() => setShowServerConfig(true)}
              >
                <MaterialIcons name="settings" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Custom PNG Banner - Full Width Hero with Parallax */}
          <Animatable.View 
            animation="fadeInUp" 
            delay={300}
          >
            <Animated.View style={[
              styles.bannerContainer,
              {
                transform: [{ scale: bannerScale }],
                opacity: bannerOpacity,
              }
            ]}>
              <Image 
                source={require('../../../assets/imgs/Banner.png')} 
                style={styles.bannerImage}
                resizeMode="cover"
                onError={(error) => console.log('Banner loading error:', error)}
              />
            </Animated.View>
          </Animatable.View>

          {/* Character Section - Full Width */}
          <View style={styles.characterSectionContainer}>
            <View style={styles.characterSection}>
              <Animatable.View
                animation="bounce"
                iterationCount="infinite"
                duration={3000}
                style={styles.floatingHand}
              >
                <Text style={styles.floatingHandEmoji}>👋</Text>
              </Animatable.View>
              
              <View style={styles.characterContainer}>
                <Image 
                  source={require('../../../assets/imgs/Namaste.png')} 
                  style={styles.characterImage}
                  resizeMode="contain"
                />
              </View>
              
              <View style={styles.characterMessage}>
                <Text style={styles.characterMessageText}>Let's break barriers with sign language!</Text>
              </View>
            </View>
          </View>

          {/* Main Content Container */}
          
          {/* Quick Text to Sign Section - Matching the Image */}
          <Animatable.View animation="fadeInUp" delay={600}>
            <View style={styles.contentContainer}>
              <View style={styles.quickTextSection}>
                <Text style={styles.sectionTitle}>Quick Text to Sign</Text>
                
                <TouchableOpacity 
                  style={styles.textToSignCard}
                  onPress={openTextToSign}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.iconText}>T</Text>
                      <Text style={styles.iconArrow}>→</Text>
                      <Text style={styles.iconHand}>👋</Text>
                    </View>
                    
                    <View style={styles.textContainer}>
                      <Text style={styles.cardTitle}>Convert Text to Signs</Text>
                      <Text style={styles.cardSubtitle}>Type or speak</Text>
                    </View>
                    
                    <View style={styles.arrowContainer}>
                      <MaterialIcons name="arrow-forward" size={24} color="#50C878" />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>

          {/* Additional Navigation Options */}
          <Animatable.View animation="fadeInUp" delay={800}>
            <View style={styles.contentContainer}>
              <View style={styles.navigationSection}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={navigateToLiveDetect}
                >
                  <MaterialIcons name="videocam" size={24} color={colors.primary} />
                  <Text style={styles.navButtonText}>Live Detection</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={navigateToPractice}
                >
                  <MaterialIcons name="school" size={24} color={colors.secondary} />
                  <Text style={styles.navButtonText}>Practice</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={navigateToHistory}
                >
                  <MaterialIcons name="history" size={24} color={colors.success} />
                  <Text style={styles.navButtonText}>History</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        </ScrollView>
      </SafeAreaView>

      {/* Text to Sign Modal - New Modern Design */}
      <Modal
        visible={showTextToSign}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeTextToSign}
      >
        <KeyboardAvoidingView 
          style={styles.newModalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          
          {/* Clean Header */}
          <SafeAreaView style={styles.newModalHeader}>
            <View style={styles.newHeaderContent}>
              <TouchableOpacity 
                style={styles.newCloseButton}
                onPress={closeTextToSign}
              >
                <MaterialIcons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <Text style={styles.newModalTitle}>Text to Sign</Text>
              
              <TouchableOpacity 
                style={styles.newSpeakButton}
                onPress={speakText}
                disabled={!inputText.trim()}
              >
                <MaterialIcons 
                  name="volume-up" 
                  size={24} 
                  color={inputText.trim() ? colors.primary : colors.textSecondary} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.newSpeakButton, { marginLeft: spacing.sm }]}
                onPress={completeTextWithAI}
                disabled={!inputText.trim() || isCompletingText}
              >
                <MaterialIcons 
                  name={isCompletingText ? "hourglass-empty" : "auto-fix-high"} 
                  size={24} 
                  color={inputText.trim() && !isCompletingText ? colors.secondary : colors.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {/* Main Content Area - Sign Preview */}
          <View style={styles.newMainContent}>
            {inputText.trim() && isPlaying ? (
              <View style={styles.newSignPreviewContainer}>
                {/* Current Sign Display - Full Size Image Only */}
                <View style={styles.newSignCard}>
                  {getCurrentLetter() ? (
                    <View style={styles.newSignImageContainer}>
                      {hasSignImage(getCurrentLetter()!) ? (
                        <Image 
                          source={getSignImage(getCurrentLetter()!)} 
                          style={styles.newSignImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.newSignPlaceholder}>
                          <MaterialIcons name="pan-tool" size={120} color={colors.primary} />
                          <Text style={styles.newSignPlaceholderText}>
                            {getCurrentLetter()}.png
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.newEmptyState}>
                      <MaterialIcons name="waving-hand" size={80} color={colors.secondary} />
                      <Text style={styles.newEmptyStateText}>Ready to show signs</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.newEmptyMainState}>
                <MaterialIcons name="text-fields" size={80} color={colors.textSecondary} />
                <Text style={styles.newEmptyMainText}>Ready to Show Signs</Text>
                <Text style={styles.newEmptyMainSubtext}>
                  Type your message and tap "Play Signs" to see the sign language
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Input Area - Chat Style */}
          <View style={styles.newBottomContainer}>
            <View style={styles.newInputContainer}>
              <TextInput
                style={styles.newTextInput}
                value={inputText}
                onChangeText={handleTextInput}
                placeholder="Type your message here..."
                placeholderTextColor={colors.textSecondary}
                maxLength={50}
                autoCapitalize="none"
                multiline={false}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <Text style={styles.newCharacterCount}>{inputText.length}/50</Text>
            </View>
            
            <View style={styles.newControlsRow}>
              <TouchableOpacity 
                style={styles.newSecondaryButton}
                onPress={() => {
                  setInputText('');
                  setCurrentSignIndex(-1);
                  setIsPlaying(false);
                }}
              >
                <MaterialIcons name="clear" size={20} color={colors.textSecondary} />
                <Text style={styles.newSecondaryButtonText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.newPrimaryButton,
                  !inputText.trim() && styles.newPrimaryButtonDisabled
                ]}
                onPress={playSignSequence}
                disabled={!inputText.trim() || isPlaying}
              >
                <MaterialIcons 
                  name={isPlaying ? "pause" : "play-arrow"} 
                  size={24} 
                  color={colors.surface} 
                />
                <Text style={styles.newPrimaryButtonText}>
                  {isPlaying ? 'Playing...' : 'Play Signs'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Server Configuration Modal */}
      <ServerConfig 
        visible={showServerConfig}
        onClose={() => setShowServerConfig(false)}
      />

      {/* Debug Panel */}
      <DebugPanel 
        visible={showDebugPanel}
        onClose={() => setShowDebugPanel(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Match the character section background
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  configButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Custom PNG Banner Styles - Full Screen Width
  bannerContainer: {
    width: '100%',
    height: 100, // Increased to 200px
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  
  // Main Content Container
  contentContainer: {
    paddingHorizontal: 16,
  },
  
  // Character Section Container - True Full Width
  characterSectionContainer: {
    width: width, // Use full device width
    marginBottom: spacing.lg,
    marginTop: 0, // Remove any top margin to eliminate gap
  },
  
  // Character Section - Main Character Display (Bigger & Screen Fit)
  characterSection: {
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 0, // No border radius for edge-to-edge
    paddingTop: 0, // Remove top padding to eliminate gap
    paddingBottom: spacing.xl,
    paddingHorizontal: 0, // No side padding at all
    position: 'relative',
    minHeight: 380, // Increased height for bigger section
    marginTop: 0, // Ensure no top margin
    width: '100%', // Ensure full width
  },
  floatingHand: {
    position: 'absolute',
    top: 25, // Adjusted for bigger container
    right: 25, // Better positioning for bigger section
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 8,
    elevation: elevation.sm,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingHandEmoji: {
    fontSize: 36,
    textShadowColor: 'rgba(74, 144, 226, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  characterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  characterImage: {
    width: 500, // Increased from 220 to make it bigger
    height: 550, // Increased height for bigger character
  } as ImageStyle,
  characterMessage: {
    position: 'absolute',
    bottom: 10, // Moved down from 20 to 10
    left: 16, // Standard app padding
    right: 16, // Standard app padding
    padding: spacing.lg, // More padding for elegant look
  },
  characterMessageText: {
    fontSize: 22,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '800', // Strong but not too heavy
    color: '#6B4423', // Rich warm brown
    textAlign: 'center',
    lineHeight: 30,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(74, 144, 226, 0.6)', // Blue glow
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  
  // Quick Text to Sign Section
  quickTextSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
    color: '#6B4423',
    marginBottom: spacing.md,
    textAlign: 'left',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(255, 215, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textToSignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: elevation.md,
    shadowColor: 'rgba(107, 68, 35, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.15)',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  iconText: {
    fontSize: 20,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '700',
    color: '#6B4423',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  iconArrow: {
    fontSize: 16,
    color: '#D4AF37',
    marginHorizontal: spacing.xs,
    fontWeight: 'bold',
  },
  iconHand: {
    fontSize: 20,
    textShadowColor: 'rgba(255, 215, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    fontWeight: '600',
    color: '#6B4423',
    marginBottom: spacing.xs,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
    color: '#8B7355',
    letterSpacing: 0.1,
  },
  arrowContainer: {
    padding: spacing.xs,
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    borderRadius: 8,
  },
  
  // Navigation Section
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
  },
  navButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: spacing.lg,
    minWidth: 80,
    elevation: elevation.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navButtonText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    color: '#2C3E50',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  
  // Text to Sign Modal Styles
  newModalContainer: {
    flex: 1,
    backgroundColor: '#F4EFE7',
  },
  newModalHeader: {
    backgroundColor: '#F4EFE7',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  newHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  newCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newModalTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  newSpeakButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newMainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
    position: 'relative',
  },
  newSignPreviewContainer: {
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
  newSignCard: {
    backgroundColor: '#F4EFE7',
    borderRadius: 0,
    padding: 0,
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    elevation: 0,
    shadowOpacity: 0,
    position: 'relative',
  },
  newSignImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  newSignImage: {
    width: '100%',
    height: '100%',
  } as ImageStyle,
  newSignPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  newSignPlaceholderText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  newEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  newEmptyStateText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  newEmptyMainState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F4EFE7',
  },
  newEmptyMainText: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  newEmptyMainSubtext: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  newBottomContainer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    elevation: elevation.md,
  },
  newInputContainer: {
    marginBottom: spacing.md,
  },
  newTextInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    borderWidth: 2,
    borderColor: '#E6DDD2',
    minHeight: 56,
  },
  newCharacterCount: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  newControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newSecondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.overlay,
  },
  newSecondaryButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  newPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    elevation: elevation.sm,
  },
  newPrimaryButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  newPrimaryButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.surface,
    marginLeft: spacing.sm,
  },
});

export default HomeScreen;