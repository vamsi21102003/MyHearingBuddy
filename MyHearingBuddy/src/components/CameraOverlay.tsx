import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

import { colors, spacing, borderRadius, elevation } from '../utils/theme';
import { DetectionStatus } from '../types';

interface CameraOverlayProps {
  isDetecting: boolean;
  onToggleDetection: () => void;
  onSwitchCamera: () => void;
  onSpeak: () => void;
  onClearWord: () => void;
  hasWord: boolean;
  detectionStatus: DetectionStatus;
}

const CameraOverlay: React.FC<CameraOverlayProps> = ({
  isDetecting,
  onToggleDetection,
  onSwitchCamera,
  onSpeak,
  onClearWord,
  hasWord,
  detectionStatus,
}) => {
  const handleToggleDetection = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleDetection();
  };

  const handleSwitchCamera = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwitchCamera();
  };

  const handleSpeak = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSpeak();
  };

  const handleClearWord = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClearWord();
  };

  const getRecordButtonColor = () => {
    switch (detectionStatus) {
      case 'detecting':
        return colors.success;
      case 'processing':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.surface;
    }
  };

  const getRecordButtonIcon = () => {
    switch (detectionStatus) {
      case 'detecting':
        return 'stop';
      case 'processing':
        return 'hourglass-empty';
      case 'error':
        return 'error';
      default:
        return 'radio-button-unchecked';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleSwitchCamera}
          activeOpacity={0.8}
        >
          <MaterialIcons name="flip-camera-ios" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Clear Word Button */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            !hasWord && styles.secondaryButtonDisabled
          ]}
          onPress={handleClearWord}
          disabled={!hasWord}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name="clear" 
            size={24} 
            color={hasWord ? colors.surface : colors.textSecondary} 
          />
        </TouchableOpacity>

        {/* Record Button */}
        <Animatable.View
          animation={isDetecting ? 'pulse' : undefined}
          iterationCount="infinite"
          duration={1000}
        >
          <TouchableOpacity
            style={[
              styles.recordButton,
              { backgroundColor: getRecordButtonColor() }
            ]}
            onPress={handleToggleDetection}
            activeOpacity={0.8}
          >
            <MaterialIcons 
              name={getRecordButtonIcon()} 
              size={32} 
              color={detectionStatus === 'idle' ? colors.primary : colors.surface} 
            />
          </TouchableOpacity>
        </Animatable.View>

        {/* Speak Button */}
        <TouchableOpacity
          style={[
            styles.secondaryButton,
            !hasWord && styles.secondaryButtonDisabled
          ]}
          onPress={handleSpeak}
          disabled={!hasWord}
          activeOpacity={0.8}
        >
          <MaterialIcons 
            name="volume-up" 
            size={24} 
            color={hasWord ? colors.surface : colors.textSecondary} 
          />
        </TouchableOpacity>
      </View>

      {/* Status Indicator */}
      {detectionStatus === 'processing' && (
        <Animatable.View
          animation="fadeIn"
          style={styles.statusIndicator}
        >
          <Animatable.View
            animation="rotate"
            iterationCount="infinite"
            duration={1000}
          >
            <MaterialIcons name="refresh" size={20} color={colors.surface} />
          </Animatable.View>
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xxl,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: elevation.sm,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: elevation.lg,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: elevation.sm,
  },
  secondaryButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  statusIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraOverlay;