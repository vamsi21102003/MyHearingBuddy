import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../utils/theme';
import { signLanguageService } from '../services/signLanguageService';
import { API_CONFIG } from '../utils/constants';

interface ServerConfigProps {
  visible: boolean;
  onClose: () => void;
}

export const ServerConfig: React.FC<ServerConfigProps> = ({ visible, onClose }) => {
  const [serverUrl, setServerUrl] = useState(API_CONFIG.DEFAULT_BACKEND_URL);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'failed'>('unknown');

  const presetUrls = [
    { label: 'Localhost (Emulator)', url: 'http://localhost:5000' },
    { label: 'Network IP (Device)', url: 'http://10.117.64.159:5000' },
    { label: 'Custom', url: '' },
  ];

  const testConnection = async (url: string) => {
    setIsTestingConnection(true);
    setConnectionStatus('unknown');

    try {
      // Update the service URL temporarily for testing
      const originalUrl = API_CONFIG.DEFAULT_BACKEND_URL;
      signLanguageService.updateServerUrl(url);

      // Test the connection
      const health = await signLanguageService.checkHealth();
      
      if (health.status === 'healthy' && health.model_loaded) {
        setConnectionStatus('success');
        Alert.alert(
          'Connection Successful! ✅',
          `Server is healthy:\n• Model: ${health.model_loaded ? 'Loaded' : 'Not loaded'}\n• Detector: ${health.detector_loaded ? 'Loaded' : 'Not loaded'}\n• OpenAI: ${health.openai_available ? 'Available' : 'Not available'}`
        );
      } else {
        setConnectionStatus('failed');
        Alert.alert('Connection Failed ❌', 'Server is not healthy or model is not loaded.');
      }
    } catch (error) {
      setConnectionStatus('failed');
      console.error('Connection test failed:', error);
      Alert.alert(
        'Connection Failed ❌',
        `Unable to connect to server:\n${error instanceof Error ? error.message : 'Unknown error'}\n\nTips:\n• Check if server is running\n• Verify the URL is correct\n• For physical devices, use network IP\n• For emulator, use localhost`
      );
    } finally {
      setIsTestingConnection(false);
    }
  };

  const saveConfiguration = () => {
    if (!serverUrl.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid server URL.');
      return;
    }

    // Update the service with the new URL
    signLanguageService.updateServerUrl(serverUrl);
    
    Alert.alert(
      'Configuration Saved ✅',
      `Server URL updated to:\n${serverUrl}\n\nThe app will now use this URL for sign language detection.`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const selectPresetUrl = (url: string) => {
    if (url) {
      setServerUrl(url);
      setConnectionStatus('unknown');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Server Configuration</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Server URL</Text>
          <Text style={styles.description}>
            Configure the sign language detection server URL. Use localhost for emulator or network IP for physical devices.
          </Text>

          {/* Preset URLs */}
          <View style={styles.presetsContainer}>
            <Text style={styles.presetsTitle}>Quick Setup:</Text>
            {presetUrls.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetButton,
                  serverUrl === preset.url && styles.presetButtonActive
                ]}
                onPress={() => selectPresetUrl(preset.url)}
                disabled={!preset.url}
              >
                <Text style={[
                  styles.presetButtonText,
                  serverUrl === preset.url && styles.presetButtonTextActive
                ]}>
                  {preset.label}
                </Text>
                {preset.url && (
                  <Text style={styles.presetUrl}>{preset.url}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom URL Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Server URL:</Text>
            <TextInput
              style={styles.textInput}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://your-server-ip:5000"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          {/* Connection Status */}
          {connectionStatus !== 'unknown' && (
            <View style={[
              styles.statusContainer,
              connectionStatus === 'success' ? styles.statusSuccess : styles.statusFailed
            ]}>
              <MaterialIcons 
                name={connectionStatus === 'success' ? 'check-circle' : 'error'} 
                size={20} 
                color={connectionStatus === 'success' ? colors.success : colors.error} 
              />
              <Text style={[
                styles.statusText,
                { color: connectionStatus === 'success' ? colors.success : colors.error }
              ]}>
                {connectionStatus === 'success' ? 'Connection Successful' : 'Connection Failed'}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={() => testConnection(serverUrl)}
              disabled={isTestingConnection || !serverUrl.trim()}
            >
              <MaterialIcons 
                name={isTestingConnection ? "hourglass-empty" : "wifi-find"} 
                size={20} 
                color={colors.surface} 
              />
              <Text style={styles.buttonText}>
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={saveConfiguration}
              disabled={!serverUrl.trim()}
            >
              <MaterialIcons name="save" size={20} color={colors.surface} />
              <Text style={styles.buttonText}>Save Configuration</Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpTitle}>Troubleshooting:</Text>
            <Text style={styles.helpText}>
              • <Text style={styles.helpBold}>Emulator:</Text> Use http://localhost:5000{'\n'}
              • <Text style={styles.helpBold}>Physical Device:</Text> Use http://YOUR_COMPUTER_IP:5000{'\n'}
              • <Text style={styles.helpBold}>Server not running:</Text> Start with python start_server.py{'\n'}
              • <Text style={styles.helpBold}>Firewall:</Text> Allow port 5000 in firewall settings
            </Text>
          </View>
        </View>
      </View>
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
  title: {
    fontSize: typography.sizes.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  presetsContainer: {
    marginBottom: spacing.lg,
  },
  presetsTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  presetButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  presetButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.overlay,
  },
  presetButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  presetButtonTextActive: {
    color: colors.primary,
  },
  presetUrl: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  statusSuccess: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  statusFailed: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  statusText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.sm,
  },
  buttonsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  testButton: {
    backgroundColor: colors.secondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.surface,
  },
  helpContainer: {
    backgroundColor: colors.overlay,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  helpTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  helpBold: {
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
  },
});

export default ServerConfig;