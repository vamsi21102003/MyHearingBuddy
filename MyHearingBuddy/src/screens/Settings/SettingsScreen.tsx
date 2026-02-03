import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { colors, typography, spacing, borderRadius, elevation } from '../../utils/theme';
import { useAppContext } from '../../context/AppContext';
import { testApiConnection, updateApiBaseURL } from '../../services/api';
import { storageService } from '../../services/storage';
import DetectionModeInfo from '../../components/DetectionModeInfo';

// Simple Slider Component
const SimpleSlider: React.FC<{
  value: number;
  minimumValue: number;
  maximumValue: number;
  step: number;
  onValueChange: (value: number) => void;
}> = ({ value, minimumValue, maximumValue, step, onValueChange }) => {
  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
  
  const handlePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const width = 200; // Approximate slider width
    const newPercentage = (locationX / width) * 100;
    const newValue = minimumValue + ((maximumValue - minimumValue) * newPercentage / 100);
    const steppedValue = Math.round(newValue / step) * step;
    onValueChange(Math.max(minimumValue, Math.min(maximumValue, steppedValue)));
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.sliderTrack}>
      <View style={[styles.sliderFill, { width: `${percentage}%` }]} />
      <View style={[styles.sliderThumb, { left: `${percentage}%` }]} />
    </TouchableOpacity>
  );
};

const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, clearHistory, setAuthenticated } = useAppContext();
  const [backendUrl, setBackendUrl] = useState(settings.backendUrl);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showModeInfo, setShowModeInfo] = useState(false);

  const handleDetectionSpeedChange = (value: number) => {
    updateSettings({ detectionSpeed: Math.round(value) });
  };

  const handleDarkModeToggle = (value: boolean) => {
    updateSettings({ darkMode: value });
  };

  const handleLanguageToggle = (value: boolean) => {
    updateSettings({ language: value ? 'hi' : 'en' });
  };

  const handleHapticsToggle = (value: boolean) => {
    updateSettings({ hapticsEnabled: value });
  };

  const handleBackendUrlSave = async () => {
    if (!backendUrl.trim()) {
      Alert.alert('Error', 'Backend URL cannot be empty');
      return;
    }

    try {
      // Validate URL format
      new URL(backendUrl);
      
      updateApiBaseURL(backendUrl);
      await updateSettings({ backendUrl });
      
      Alert.alert('Success', 'Backend URL updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Invalid URL format');
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      const isConnected = await testApiConnection();
      
      Alert.alert(
        isConnected ? 'Connection Successful' : 'Connection Failed',
        isConnected 
          ? 'Successfully connected to the backend server'
          : 'Unable to connect to the backend server. Please check the URL and try again.'
      );
    } catch (error) {
      Alert.alert('Connection Error', 'Failed to test connection');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all your detection history, practice progress, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAppData();
              Alert.alert('Success', 'All data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => setAuthenticated(false)
        }
      ]
    );
  };

  const renderSettingItem = (
    icon: keyof typeof MaterialIcons.glyphMap,
    title: string,
    subtitle?: string,
    children?: React.ReactNode
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <MaterialIcons name={icon} size={24} color={colors.primary} />
        <View style={styles.settingTitleContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {children && <View style={styles.settingContent}>{children}</View>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Detection Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detection Settings</Text>
          
          {renderSettingItem(
            'camera',
            'Detection Mode',
            'Choose how gesture detection works',
            <View style={styles.detectionModeContainer}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  settings.detectionMode === 'manual' && styles.modeButtonActive
                ]}
                onPress={() => updateSettings({ detectionMode: 'manual' })}
              >
                <MaterialIcons 
                  name="camera-alt" 
                  size={20} 
                  color={settings.detectionMode === 'manual' ? colors.surface : colors.primary} 
                />
                <Text style={[
                  styles.modeButtonText,
                  settings.detectionMode === 'manual' && styles.modeButtonTextActive
                ]}>
                  Manual
                </Text>
                <Text style={[
                  styles.modeButtonSubtext,
                  settings.detectionMode === 'manual' && styles.modeButtonSubtextActive
                ]}>
                  No flash/sound
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  settings.detectionMode === 'optimized' && styles.modeButtonActive
                ]}
                onPress={() => updateSettings({ detectionMode: 'optimized' })}
              >
                <MaterialIcons 
                  name="timer" 
                  size={20} 
                  color={settings.detectionMode === 'optimized' ? colors.surface : colors.secondary} 
                />
                <Text style={[
                  styles.modeButtonText,
                  settings.detectionMode === 'optimized' && styles.modeButtonTextActive
                ]}>
                  Optimized
                </Text>
                <Text style={[
                  styles.modeButtonSubtext,
                  settings.detectionMode === 'optimized' && styles.modeButtonSubtextActive
                ]}>
                  3s intervals
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  settings.detectionMode === 'frame' && styles.modeButtonActive
                ]}
                onPress={() => updateSettings({ detectionMode: 'frame' })}
              >
                <MaterialIcons 
                  name="videocam" 
                  size={20} 
                  color={settings.detectionMode === 'frame' ? colors.surface : colors.warning} 
                />
                <Text style={[
                  styles.modeButtonText,
                  settings.detectionMode === 'frame' && styles.modeButtonTextActive
                ]}>
                  Frame
                </Text>
                <Text style={[
                  styles.modeButtonSubtext,
                  settings.detectionMode === 'frame' && styles.modeButtonSubtextActive
                ]}>
                  Real-time
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {renderSettingItem(
            'help-outline',
            'Detection Mode Help',
            'Learn about different detection modes',
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => setShowModeInfo(true)}
            >
              <MaterialIcons name="info" size={20} color={colors.primary} />
              <Text style={styles.helpButtonText}>View Mode Comparison</Text>
            </TouchableOpacity>
          )}
          
          {renderSettingItem(
            'speed',
            'Detection Speed',
            `${settings.detectionSpeed}ms - Controls how often gestures are detected`,
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Fast (100ms)</Text>
              <SimpleSlider
                minimumValue={100}
                maximumValue={500}
                value={settings.detectionSpeed}
                onValueChange={handleDetectionSpeedChange}
                step={50}
              />
              <Text style={styles.sliderLabel}>Slow (500ms)</Text>
            </View>
          )}

          {renderSettingItem(
            'vibration',
            'Haptic Feedback',
            'Enable vibration for detection events',
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          )}
        </View>

        {/* Backend Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Configuration</Text>
          
          {renderSettingItem(
            'cloud',
            'Backend URL',
            'API endpoint for gesture detection',
            <View style={styles.urlContainer}>
              <TextInput
                style={styles.urlInput}
                value={backendUrl}
                onChangeText={setBackendUrl}
                placeholder="https://your-backend-url.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleBackendUrlSave}
                activeOpacity={0.8}
              >
                <MaterialIcons name="save" size={20} color={colors.surface} />
              </TouchableOpacity>
            </View>
          )}

          {renderSettingItem(
            'wifi',
            'Test Connection',
            'Verify connection to the backend server',
            <TouchableOpacity
              style={[styles.testButton, isTestingConnection && styles.testButtonDisabled]}
              onPress={handleTestConnection}
              disabled={isTestingConnection}
              activeOpacity={0.8}
            >
              {isTestingConnection ? (
                <MaterialIcons name="refresh" size={20} color={colors.surface} />
              ) : (
                <MaterialIcons name="wifi" size={20} color={colors.surface} />
              )}
              <Text style={styles.testButtonText}>
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          {renderSettingItem(
            'dark-mode',
            'Dark Mode',
            'Switch between light and dark themes',
            <Switch
              value={settings.darkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          )}

          {renderSettingItem(
            'language',
            'Language',
            settings.language === 'hi' ? 'Hindi (हिंदी)' : 'English',
            <Switch
              value={settings.language === 'hi'}
              onValueChange={handleLanguageToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.surface}
            />
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          {renderSettingItem(
            'history',
            'Clear History',
            'Remove all detection history',
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={clearHistory}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete-sweep" size={20} color={colors.surface} />
              <Text style={styles.dangerButtonText}>Clear History</Text>
            </TouchableOpacity>
          )}

          {renderSettingItem(
            'delete-forever',
            'Clear All Data',
            'Reset app to initial state',
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleClearAllData}
              activeOpacity={0.8}
            >
              <MaterialIcons name="delete-forever" size={20} color={colors.surface} />
              <Text style={styles.dangerButtonText}>Clear All Data</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          {renderSettingItem(
            'info',
            'App Version',
            'MyHearingBuddy v1.0.0'
          )}

          {renderSettingItem(
            'help',
            'Support',
            'Get help and report issues',
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => Alert.alert('Support', 'Contact support at support@myhearingbuddy.com')}
              activeOpacity={0.8}
            >
              <MaterialIcons name="email" size={20} color={colors.primary} />
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <MaterialIcons name="logout" size={24} color={colors.error} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Detection Mode Info Modal */}
      <DetectionModeInfo 
        visible={showModeInfo}
        onClose={() => setShowModeInfo(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  settingItem: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    elevation: elevation.sm,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitleContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  settingTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settingContent: {
    marginTop: spacing.md,
    marginLeft: 48, // Align with title
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 40,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.border,
    borderRadius: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginLeft: -10,
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  detectionModeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginTop: spacing.xs,
  },
  modeButtonTextActive: {
    color: colors.surface,
  },
  modeButtonSubtext: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modeButtonSubtextActive: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  helpButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
    marginRight: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  testButtonDisabled: {
    opacity: 0.6,
  },
  testButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.surface,
    marginLeft: spacing.xs,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  dangerButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.surface,
    marginLeft: spacing.xs,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  supportButtonText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.error,
  },
  logoutButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.error,
    marginLeft: spacing.sm,
  },
});

export default SettingsScreen;