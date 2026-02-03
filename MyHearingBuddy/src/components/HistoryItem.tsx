import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { DetectionResult } from '../types';
import { colors, typography, spacing, borderRadius, elevation } from '../utils/theme';
import { DETECTION_CONFIDENCE_THRESHOLD } from '../utils/constants';

interface HistoryItemProps {
  item: DetectionResult;
  isSelected: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  item,
  isSelected,
  isSelectionMode,
  onPress,
  onLongPress,
}) => {
  const isHighConfidence = item.confidence >= DETECTION_CONFIDENCE_THRESHOLD;
  const confidencePercentage = Math.round(item.confidence * 100);
  const formattedTime = new Date(item.timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const formattedDate = new Date(item.timestamp).toLocaleDateString();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        !isHighConfidence && styles.containerLowConfidence,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Selection Indicator */}
      {isSelectionMode && (
        <View style={styles.selectionIndicator}>
          <MaterialIcons
            name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
            size={24}
            color={isSelected ? colors.primary : colors.textSecondary}
          />
        </View>
      )}

      {/* Gesture Display */}
      <View style={styles.gestureContainer}>
        <View style={[
          styles.gestureBadge,
          isHighConfidence ? styles.gestureBadgeSuccess : styles.gestureBadgeWarning
        ]}>
          <Text style={styles.gestureText}>{item.letter}</Text>
        </View>
        
        {/* Confidence Indicator */}
        <View style={styles.confidenceIndicator}>
          <MaterialIcons
            name={isHighConfidence ? 'check-circle' : 'warning'}
            size={16}
            color={isHighConfidence ? colors.success : colors.warning}
          />
          <Text style={[
            styles.confidenceText,
            isHighConfidence ? styles.confidenceTextSuccess : styles.confidenceTextWarning
          ]}>
            {confidencePercentage}%
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formattedTime}</Text>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        
        <Text style={styles.gestureLabel}>
          Letter: {item.letter}
        </Text>
        
        <Text style={styles.confidenceLabel}>
          Confidence: {confidencePercentage}%
        </Text>
      </View>

      {/* Thumbnail */}
      {item.image && (
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.image}` }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Action Indicator */}
      <View style={styles.actionIndicator}>
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={colors.textSecondary}
        />
      </View>

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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: elevation.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  containerSelected: {
    backgroundColor: colors.overlay,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  containerLowConfidence: {
    borderLeftColor: colors.warning,
  },
  selectionIndicator: {
    marginRight: spacing.sm,
  },
  gestureContainer: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  gestureBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  gestureBadgeSuccess: {
    backgroundColor: colors.success,
  },
  gestureBadgeWarning: {
    backgroundColor: colors.warning,
  },
  gestureText: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.surface,
  },
  confidenceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.medium,
    marginLeft: 2,
  },
  confidenceTextSuccess: {
    color: colors.success,
  },
  confidenceTextWarning: {
    color: colors.warning,
  },
  content: {
    flex: 1,
    marginRight: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginRight: spacing.sm,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  gestureLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: 2,
  },
  confidenceLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  thumbnailContainer: {
    marginRight: spacing.sm,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
  actionIndicator: {
    marginLeft: spacing.xs,
  },
  confidenceBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.border,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  confidenceBarFill: {
    height: '100%',
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
});

export default HistoryItem;