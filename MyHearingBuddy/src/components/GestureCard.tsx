import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { PracticeProgress } from '../types';
import { colors, typography, spacing, borderRadius, elevation } from '../utils/theme';

interface GestureCardProps {
  letter: string;
  isExpanded: boolean;
  onPress: () => void;
  progress: PracticeProgress;
  cardWidth: number;
}

const GestureCard: React.FC<GestureCardProps> = ({
  letter,
  isExpanded,
  onPress,
  progress,
  cardWidth,
}) => {
  const getCardStyle = () => {
    if (progress.mastered) {
      return {
        backgroundColor: colors.success,
        borderColor: colors.success,
      };
    } else if (progress.attempts > 0) {
      return {
        backgroundColor: colors.warning,
        borderColor: colors.warning,
      };
    } else {
      return {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      };
    }
  };

  const getTextColor = () => {
    return progress.mastered || progress.attempts > 0 ? colors.surface : colors.text;
  };

  const cardStyle = getCardStyle();
  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: cardWidth },
        cardStyle,
        isExpanded && styles.containerExpanded,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Letter Display */}
      <View style={styles.letterContainer}>
        <Text style={[styles.letterText, { color: textColor }]}>
          {letter}
        </Text>
        
        {/* Status Icon */}
        <View style={styles.statusIcon}>
          {progress.mastered ? (
            <MaterialIcons name="check-circle" size={16} color={colors.surface} />
          ) : progress.attempts > 0 ? (
            <MaterialIcons name="schedule" size={16} color={colors.surface} />
          ) : (
            <MaterialIcons name="radio-button-unchecked" size={16} color={colors.textSecondary} />
          )}
        </View>
      </View>

      {/* Progress Indicator */}
      {progress.attempts > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${progress.accuracy}%`,
                  backgroundColor: progress.mastered ? colors.surface : colors.background,
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: textColor }]}>
            {Math.round(progress.accuracy)}%
          </Text>
        </View>
      )}

      {/* Expanded Content */}
      {isExpanded && (
        <Animatable.View
          animation="fadeInDown"
          duration={300}
          style={styles.expandedContent}
        >
          {/* Gesture Image Placeholder */}
          <View style={styles.gestureImageContainer}>
            <MaterialIcons name="pan-tool" size={48} color={colors.textSecondary} />
            <Text style={styles.gestureImageText}>
              ISL Gesture for "{letter}"
            </Text>
          </View>

          {/* Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Attempts</Text>
              <Text style={styles.statValue}>{progress.attempts}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{Math.round(progress.accuracy)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Status</Text>
              <Text style={[
                styles.statValue,
                { color: progress.mastered ? colors.success : colors.warning }
              ]}>
                {progress.mastered ? 'Mastered' : 'Learning'}
              </Text>
            </View>
          </View>

          {/* Practice Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Practice Tips:</Text>
            <Text style={styles.tipsText}>
              • Ensure good lighting for detection{'\n'}
              • Keep hand steady and centered{'\n'}
              • Practice the gesture slowly{'\n'}
              • Use the live detection to verify
            </Text>
          </View>
        </Animatable.View>
      )}

      {/* Expand Indicator */}
      <View style={styles.expandIndicator}>
        <MaterialIcons
          name={isExpanded ? 'expand-less' : 'expand-more'}
          size={20}
          color={textColor}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
    elevation: elevation.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerExpanded: {
    elevation: elevation.md,
    shadowOpacity: 0.2,
  },
  letterContainer: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  letterText: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fontFamily.black,
    textAlign: 'center',
  },
  statusIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  progressContainer: {
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginBottom: 2,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  expandedContent: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  gestureImageContainer: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  gestureImageText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  tipsContainer: {
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
  },
  tipsTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipsText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});

export default GestureCard;