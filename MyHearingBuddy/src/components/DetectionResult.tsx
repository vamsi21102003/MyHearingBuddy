import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { MaterialIcons } from '@expo/vector-icons';

import { DetectionResult as DetectionResultType } from '../types';
import { colors, typography, spacing, borderRadius, elevation } from '../utils/theme';
import { DETECTION_CONFIDENCE_THRESHOLD } from '../utils/constants';

interface DetectionResultProps {
  result: DetectionResultType | null;
  isLoading: boolean;
  error?: string | null;
}

const DetectionResult: React.FC<DetectionResultProps> = ({
  result,
  isLoading,
  error,
}) => {
  if (error) {
    return (
      <Animatable.View animation="shake" style={[styles.container, styles.errorContainer]}>
        <MaterialIcons name="error" size={20} color={colors.error} />
        <Text style={styles.errorText}>Error</Text>
      </Animatable.View>
    );
  }

  if (isLoading) {
    return (
      <Animatable.View 
        animation="pulse" 
        iterationCount="infinite"
        style={[styles.container, styles.loadingContainer]}
      >
        <Animatable.View
          animation="rotate"
          iterationCount="infinite"
          duration={1000}
        >
          <MaterialIcons name="refresh" size={20} color={colors.primary} />
        </Animatable.View>
        <Text style={styles.loadingText}>Detecting...</Text>
      </Animatable.View>
    );
  }

  if (!result) {
    return (
      <View style={[styles.container, styles.idleContainer]}>
        <MaterialIcons name="pan-tool" size={20} color={colors.textSecondary} />
        <Text style={styles.idleText}>Ready</Text>
      </View>
    );
  }

  const isHighConfidence = result.confidence >= DETECTION_CONFIDENCE_THRESHOLD;
  const confidencePercentage = Math.round(result.confidence * 100);

  return (
    <Animatable.View 
      animation="bounceIn" 
      style={[
        styles.container, 
        isHighConfidence ? styles.successContainer : styles.lowConfidenceContainer
      ]}
    >
      {/* Gesture Letter */}
      <View style={styles.gestureContainer}>
        <Text style={[
          styles.gestureText,
          isHighConfidence ? styles.gestureTextSuccess : styles.gestureTextWarning
        ]}>
          {result.gesture}
        </Text>
        
        {/* Glow effect for high confidence */}
        {isHighConfidence && (
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
            style={styles.glowEffect}
          />
        )}
      </View>

      {/* Confidence */}
      <View style={styles.confidenceContainer}>
        <Text style={[
          styles.confidenceText,
          isHighConfidence ? styles.confidenceTextSuccess : styles.confidenceTextWarning
        ]}>
          {confidencePercentage}%
        </Text>
        
        {/* Confidence Bar */}
        <View style={styles.confidenceBar}>
          <View 
            style={[
              styles.confidenceBarFill,
              {
                width: `${confidencePercentage}%`,
                backgroundColor: isHighConfidence ? colors.success : colors.warning,
              }
            ]} 
          />
        </View>
      </View>

      {/* Status Icon */}
      <View style={styles.statusIcon}>
        {isHighConfidence ? (
          <MaterialIcons name="check-circle" size={16} color={colors.success} />
        ) : (
          <MaterialIcons name="warning" size={16} color={colors.warning} />
        )}
      </View>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minWidth: 120,
    alignItems: 'center',
    elevation: elevation.md,
  },
  errorContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.9)',
  },
  loadingContainer: {
    backgroundColor: 'rgba(74, 144, 226, 0.9)',
  },
  idleContainer: {
    backgroundColor: 'rgba(127, 140, 141, 0.8)',
  },
  successContainer: {
    backgroundColor: 'rgba(39, 174, 96, 0.9)',
  },
  lowConfidenceContainer: {
    backgroundColor: 'rgba(243, 156, 18, 0.9)',
  },
  gestureContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  gestureText: {
    fontSize: 48,
    fontFamily: typography.fontFamily.black,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  gestureTextSuccess: {
    color: colors.surface,
  },
  gestureTextWarning: {
    color: colors.surface,
  },
  glowEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: -1,
  },
  confidenceContainer: {
    alignItems: 'center',
    width: '100%',
  },
  confidenceText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  confidenceTextSuccess: {
    color: colors.surface,
  },
  confidenceTextWarning: {
    color: colors.surface,
  },
  confidenceBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusIcon: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  errorText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.xs,
  },
  loadingText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.xs,
  },
  idleText: {
    color: colors.surface,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.xs,
  },
});

export default DetectionResult;