import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../utils/theme';
import { signLanguageService } from '../services/signLanguageService';
import { API_CONFIG } from '../utils/constants';

interface DebugPanelProps {
  visible: boolean;
  onClose: () => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({ visible, onClose }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshDebugInfo = async () => {
    setIsRefreshing(true);
    
    const info: any = {
      timestamp: new Date().toLocaleString(),
      configuredUrl: API_CONFIG.DEFAULT_BACKEND_URL,
      platform: 'React Native',
    };

    try {
      // Test server connection
      const health = await signLanguageService.checkHealth();
      info.serverHealth = health;
      info.connectionStatus = 'Connected ✅';
    } catch (error) {
      info.connectionError = error instanceof Error ? error.message : 'Unknown error';
      info.connectionStatus = 'Failed ❌';
    }

    try {
      // Test labels endpoint
      const labels = await signLanguageService.getLabels();
      info.labelsCount = Object.keys(labels).length;
      info.sampleLabels = Object.values(labels).slice(0, 5);
    } catch (error) {
      info.labelsError = error instanceof Error ? error.message : 'Unknown error';
    }

    setDebugInfo(info);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (visible) {
      refreshDebugInfo();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Information</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={refreshDebugInfo} 
              style={styles.refreshButton}
              disabled={isRefreshing}
            >
              <MaterialIcons 
                name="refresh" 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Connection Status</Text>
            <Text style={styles.statusText}>{debugInfo.connectionStatus || 'Unknown'}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuration</Text>
            <Text style={styles.infoText}>Server URL: {debugInfo.configuredUrl}</Text>
            <Text style={styles.infoText}>Platform: {debugInfo.platform}</Text>
            <Text style={styles.infoText}>Last Check: {debugInfo.timestamp}</Text>
          </View>

          {debugInfo.serverHealth && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Server Health</Text>
              <Text style={styles.infoText}>Status: {debugInfo.serverHealth.status}</Text>
              <Text style={styles.infoText}>Model Loaded: {debugInfo.serverHealth.model_loaded ? 'Yes' : 'No'}</Text>
              <Text style={styles.infoText}>Detector Loaded: {debugInfo.serverHealth.detector_loaded ? 'Yes' : 'No'}</Text>
              <Text style={styles.infoText}>OpenAI Available: {debugInfo.serverHealth.openai_available ? 'Yes' : 'No'}</Text>
            </View>
          )}

          {debugInfo.labelsCount && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sign Language Labels</Text>
              <Text style={styles.infoText}>Total Classes: {debugInfo.labelsCount}</Text>
              <Text style={styles.infoText}>Sample: {debugInfo.sampleLabels?.join(', ')}</Text>
            </View>
          )}

          {debugInfo.connectionError && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Connection Error</Text>
              <Text style={styles.errorText}>{debugInfo.connectionError}</Text>
            </View>
          )}

          {debugInfo.labelsError && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Labels Error</Text>
              <Text style={styles.errorText}>{debugInfo.labelsError}</Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Troubleshooting Tips</Text>
            <Text style={styles.helpText}>
              • Make sure Flask server is running{'\n'}
              • Check if using correct IP address{'\n'}
              • For emulator: use localhost{'\n'}
              • For device: use network IP{'\n'}
              • Verify firewall allows port 5000
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
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
  title: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  refreshButton: {
    padding: spacing.xs,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    maxHeight: 400,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  helpText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default DebugPanel;