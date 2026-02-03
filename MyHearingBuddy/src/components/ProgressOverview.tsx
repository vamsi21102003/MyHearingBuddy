import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { colors, typography, spacing, borderRadius, elevation } from '../utils/theme';

interface ProgressOverviewProps {
  masteredCount: number;
  totalCount: number;
  progressPercentage: number;
}

const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  masteredCount,
  totalCount,
  progressPercentage,
}) => {
  const getProgressColor = () => {
    if (progressPercentage >= 80) return colors.success;
    if (progressPercentage >= 50) return colors.warning;
    return colors.primary;
  };

  const getProgressIcon = () => {
    if (progressPercentage >= 100) return 'emoji-events';
    if (progressPercentage >= 80) return 'star';
    if (progressPercentage >= 50) return 'trending-up';
    return 'school';
  };

  const progressColor = getProgressColor();
  const progressIcon = getProgressIcon();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialIcons name={progressIcon} size={24} color={progressColor} />
        <Text style={styles.title}>Your Progress</Text>
      </View>

      {/* Progress Circle */}
      <View style={styles.progressSection}>
        <Animatable.View
          animation="bounceIn"
          duration={1000}
          style={styles.progressCircle}
        >
          <View style={[styles.progressCircleInner, { borderColor: progressColor }]}>
            <Text style={[styles.progressPercentage, { color: progressColor }]}>
              {progressPercentage}%
            </Text>
            <Text style={styles.progressLabel}>Complete</Text>
          </View>
        </Animatable.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{masteredCount}</Text>
            <Text style={styles.statLabel}>Mastered</Text>
            <MaterialIcons name="check-circle" size={16} color={colors.success} />
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCount - masteredCount}</Text>
            <Text style={styles.statLabel}>Remaining</Text>
            <MaterialIcons name="schedule" size={16} color={colors.warning} />
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalCount}</Text>
            <Text style={styles.statLabel}>Total</Text>
            <MaterialIcons name="grid-view" size={16} color={colors.primary} />
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <Animatable.View
            animation="slideInLeft"
            duration={1500}
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: progressColor,
              }
            ]}
          />
        </View>
        <Text style={styles.progressBarText}>
          {masteredCount} of {totalCount} letters mastered
        </Text>
      </View>

      {/* Motivational Message */}
      <View style={styles.messageContainer}>
        {progressPercentage === 100 ? (
          <View style={styles.completionMessage}>
            <MaterialIcons name="emoji-events" size={20} color={colors.success} />
            <Text style={styles.completionText}>
              Congratulations! You've mastered all ISL letters! 🎉
            </Text>
          </View>
        ) : progressPercentage >= 80 ? (
          <View style={styles.encouragementMessage}>
            <MaterialIcons name="star" size={20} color={colors.warning} />
            <Text style={styles.encouragementText}>
              Almost there! Just {totalCount - masteredCount} more to go! ⭐
            </Text>
          </View>
        ) : progressPercentage >= 50 ? (
          <View style={styles.encouragementMessage}>
            <MaterialIcons name="trending-up" size={20} color={colors.primary} />
            <Text style={styles.encouragementText}>
              Great progress! Keep practicing to improve! 📈
            </Text>
          </View>
        ) : (
          <View style={styles.encouragementMessage}>
            <MaterialIcons name="school" size={20} color={colors.primary} />
            <Text style={styles.encouragementText}>
              Start your ISL journey! Practice makes perfect! 📚
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    elevation: elevation.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressCircle: {
    marginRight: spacing.lg,
  },
  progressCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  progressPercentage: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.black,
  },
  progressLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messageContainer: {
    alignItems: 'center',
  },
  completionMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  completionText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.success,
    marginLeft: spacing.xs,
    textAlign: 'center',
  },
  encouragementMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  encouragementText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
    textAlign: 'center',
  },
});

export default ProgressOverview;