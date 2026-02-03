import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { NetworkStatus as NetworkStatusType } from '../types';
import { colors, typography, spacing, borderRadius } from '../utils/theme';
import { signLanguageService } from '../services/signLanguageService';

interface NetworkStatusProps {
  status?: NetworkStatusType;
  onRetry?: () => void;
  showDetails?: boolean;
  autoCheck?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  status: propStatus, 
  onRetry,
  showDetails = false,
  autoCheck = false
}) => {
  const [status, setStatus] = useState<NetworkStatusType>(propStatus || 'connecting');
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkStatus = async () => {
    if (!autoCheck && propStatus) return;
    
    try {
      setStatus('connecting');
      const health = await signLanguageService.checkHealth();
      setServerHealth(health);
      setLastCheck(new Date());
      
      if (health.status === 'healthy' && health.model_loaded) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      setStatus('offline');
      setServerHealth(null);
      console.error('Network status check failed:', error);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      checkStatus();
      
      // Check status every 30 seconds when auto-checking
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [autoCheck]);

  useEffect(() => {
    if (propStatus) {
      setStatus(propStatus);
    }
  }, [propStatus]);

  const handleRetry = () => {
    checkStatus();
    onRetry?.();
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          icon: 'wifi',
          text: 'Online',
          color: colors.success,
          backgroundColor: 'rgba(39, 174, 96, 0.9)',
        };
      case 'offline':
        return {
          icon: 'wifi-off',
          text: 'Offline',
          color: colors.error,
          backgroundColor: 'rgba(231, 76, 60, 0.9)',
        };
      case 'connecting':
        return {
          icon: 'wifi',
          text: 'Connecting',
          color: colors.warning,
          backgroundColor: 'rgba(243, 156, 18, 0.9)',
        };
      default:
        return {
          icon: 'wifi',
          text: 'Unknown',
          color: colors.textSecondary,
          backgroundColor: 'rgba(127, 140, 141, 0.8)',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
        {status === 'connecting' ? (
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={1000}
          >
            <MaterialIcons name={config.icon} size={16} color={colors.surface} />
          </Animatable.View>
        ) : (
          <MaterialIcons name={config.icon} size={16} color={colors.surface} />
        )}
        
        <Text style={[styles.text, { color: colors.surface }]}>
          {config.text}
        </Text>

        {status === 'offline' && onRetry && (
          <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
            <MaterialIcons name="refresh" size={14} color={colors.surface} />
          </TouchableOpacity>
        )}
      </View>
      
      {showDetails && serverHealth && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Server Status:</Text>
          <Text style={styles.detailItem}>
            Model: {serverHealth.model_loaded ? '✅' : '❌'}
          </Text>
          <Text style={styles.detailItem}>
            Detector: {serverHealth.detector_loaded ? '✅' : '❌'}
          </Text>
          <Text style={styles.detailItem}>
            OpenAI: {serverHealth.openai_available ? '✅' : '❌'}
          </Text>
          {lastCheck && (
            <Text style={styles.lastCheck}>
              Last check: {lastCheck.toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'flex-start',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.xs,
  },
  retryButton: {
    marginLeft: spacing.xs,
    padding: 2,
  },
  detailsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailsTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  detailItem: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  lastCheck: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});

export default NetworkStatus;