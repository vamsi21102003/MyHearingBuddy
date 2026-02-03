import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { useAppContext } from '../../context/AppContext';
import { ISL_ALPHABET } from '../../utils/constants';
import GestureCard from '../../components/GestureCard';
import ProgressOverview from '../../components/ProgressOverview';
import QuizMode from '../../components/QuizMode';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.xl * 2 - spacing.md * 2) / 3;

type PracticeMode = 'learning' | 'quiz';

const PracticeScreen: React.FC = () => {
  const { practiceProgress } = useAppContext();
  const [mode, setMode] = useState<PracticeMode>('learning');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const masteredCount = practiceProgress.filter(p => p.mastered).length;
  const totalCount = ISL_ALPHABET.length;
  const progressPercentage = Math.round((masteredCount / totalCount) * 100);

  const handleCardPress = (letter: string) => {
    setExpandedCard(expandedCard === letter ? null : letter);
  };

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          mode === 'learning' && styles.modeButtonActive
        ]}
        onPress={() => setMode('learning')}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="school"
          size={20}
          color={mode === 'learning' ? colors.surface : colors.textSecondary}
        />
        <Text style={[
          styles.modeButtonText,
          mode === 'learning' && styles.modeButtonTextActive
        ]}>
          Learning
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.modeButton,
          mode === 'quiz' && styles.modeButtonActive
        ]}
        onPress={() => setMode('quiz')}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="quiz"
          size={20}
          color={mode === 'quiz' ? colors.surface : colors.textSecondary}
        />
        <Text style={[
          styles.modeButtonText,
          mode === 'quiz' && styles.modeButtonTextActive
        ]}>
          Quiz
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLearningMode = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Progress Overview */}
      <ProgressOverview
        masteredCount={masteredCount}
        totalCount={totalCount}
        progressPercentage={progressPercentage}
      />

      {/* Alphabet Grid */}
      <View style={styles.gridContainer}>
        <Text style={styles.sectionTitle}>ISL Alphabet</Text>
        <Text style={styles.sectionSubtitle}>
          Tap on any letter to learn the gesture
        </Text>

        <View style={styles.grid}>
          {ISL_ALPHABET.map((letter, index) => {
            const progress = practiceProgress.find(p => p.letter === letter);
            return (
              <Animatable.View
                key={letter}
                animation="fadeInUp"
                delay={index * 50}
                duration={300}
              >
                <GestureCard
                  letter={letter}
                  isExpanded={expandedCard === letter}
                  onPress={() => handleCardPress(letter)}
                  progress={progress || {
                    letter,
                    mastered: false,
                    attempts: 0,
                    accuracy: 0
                  }}
                  cardWidth={CARD_WIDTH}
                />
              </Animatable.View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  const renderQuizMode = () => (
    <QuizMode />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Practice ISL</Text>
        <Text style={styles.headerSubtitle}>
          Master Indian Sign Language alphabet
        </Text>
      </View>

      {/* Mode Selector */}
      {renderModeSelector()}

      {/* Content */}
      {mode === 'learning' ? renderLearningMode() : renderQuizMode()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  modeSelector: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  modeButtonTextActive: {
    color: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  gridContainer: {
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default PracticeScreen;