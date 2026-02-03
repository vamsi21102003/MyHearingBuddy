import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, typography, spacing, borderRadius } from '../utils/theme';

interface DetectionModeInfoProps {
  visible: boolean;
  onClose: () => void;
}

const DetectionModeInfo: React.FC<DetectionModeInfoProps> = ({ visible, onClose }) => {
  const modes = [
    {
      id: 'manual',
      title: 'Manual Capture',
      icon: 'camera-alt' as const,
      color: colors.primary,
      pros: [
        'No camera flash or sounds',
        'Complete user control',
        'Battery friendly',
        'Works on all devices'
      ],
      cons: [
        'Requires manual button press',
        'Slower detection process'
      ],
      description: 'Tap the capture button to take a photo and detect gestures. This mode eliminates all camera sounds and flash issues.',
      recommended: 'Best for quiet environments and battery conservation.'
    },
    {
      id: 'optimized',
      title: 'Optimized Auto',
      icon: 'timer' as const,
      color: colors.secondary,
      pros: [
        'Automatic detection every 3s',
        'Minimal camera usage',
        'Good balance of speed and battery',
        'Reduced flash/sound issues'
      ],
      cons: [
        'Some camera sounds may occur',
        'Fixed 3-second intervals'
      ],
      description: 'Automatically captures and detects gestures every 3 seconds with optimized settings to minimize camera issues.',
      recommended: 'Good balance between automation and performance.'
    },
    {
      id: 'frame',
      title: 'Frame Processing',
      icon: 'videocam' as const,
      color: colors.warning,
      pros: [
        'Real-time processing',
        'No photo capture needed',
        'Completely silent operation',
        'Fastest detection'
      ],
      cons: [
        'Higher battery usage',
        'Requires more processing power',
        'May not work on older devices'
      ],
      description: 'Processes camera frames directly without taking photos. Uses advanced frame processing for real-time detection.',
      recommended: 'Best for modern devices and real-time applications.'
    }
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Detection Modes</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Choose the detection mode that works best for your device and use case:
          </Text>

          {modes.map((mode) => (
            <View key={mode.id} style={styles.modeCard}>
              <View style={styles.modeHeader}>
                <View style={[styles.modeIcon, { backgroundColor: mode.color }]}>
                  <MaterialIcons name={mode.icon} size={24} color={colors.surface} />
                </View>
                <Text style={styles.modeTitle}>{mode.title}</Text>
              </View>

              <Text style={styles.modeDescription}>{mode.description}</Text>

              <View style={styles.prosConsContainer}>
                <View style={styles.prosContainer}>
                  <Text style={styles.prosConsTitle}>✅ Pros:</Text>
                  {mode.pros.map((pro, index) => (
                    <Text key={index} style={styles.prosConsItem}>• {pro}</Text>
                  ))}
                </View>

                <View style={styles.consContainer}>
                  <Text style={styles.prosConsTitle}>⚠️ Considerations:</Text>
                  {mode.cons.map((con, index) => (
                    <Text key={index} style={styles.prosConsItem}>• {con}</Text>
                  ))}
                </View>
              </View>

              <View style={styles.recommendedContainer}>
                <Text style={styles.recommendedLabel}>Recommended for:</Text>
                <Text style={styles.recommendedText}>{mode.recommended}</Text>
              </View>
            </View>
          ))}

          <View style={styles.tipContainer}>
            <MaterialIcons name="lightbulb" size={20} color={colors.warning} />
            <Text style={styles.tipText}>
              Tip: You can change the detection mode anytime in Settings → Detection Settings → Detection Mode
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginVertical: spacing.lg,
    lineHeight: 22,
  },
  modeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  modeTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  modeDescription: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  prosConsContainer: {
    marginBottom: spacing.md,
  },
  prosContainer: {
    marginBottom: spacing.sm,
  },
  consContainer: {
    marginBottom: spacing.sm,
  },
  prosConsTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  prosConsItem: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
    marginBottom: 2,
  },
  recommendedContainer: {
    backgroundColor: colors.overlay,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  recommendedLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recommendedText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  tipText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
});

export default DetectionModeInfo;