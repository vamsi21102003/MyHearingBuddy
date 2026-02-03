import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Animatable from 'react-native-animatable';

import { colors, typography, spacing, borderRadius } from '../../utils/theme';
import { useAppContext } from '../../context/AppContext';

const LoginScreen: React.FC = () => {
  const { setAuthenticated } = useAppContext();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const otpRefs = useRef<TextInput[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const validatePhoneNumber = (number: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(number);
  };

  const handleSendOtp = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      shakeInput();
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Simulate API call
    setTimeout(() => {
      setShowOtpInput(true);
      setIsLoading(false);
      setOtpTimer(30);
      startOtpTimer();
      
      // Focus first OTP input
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 300);
    }, 1500);
  };

  const startOtpTimer = () => {
    const timer = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp.join('');
    
    if (otpToVerify.length !== 6) {
      shakeInput();
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate OTP verification
    setTimeout(async () => {
      setIsLoading(false);
      
      // For demo, accept any 6-digit OTP
      if (otpToVerify.length === 6) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setAuthenticated(true);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        shakeInput();
        Alert.alert('Invalid OTP', 'Please check the OTP and try again');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    }, 1000);
  };

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const isOtpComplete = otp.every(digit => digit !== '');
  const isPhoneValid = validatePhoneNumber(phoneNumber);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animatable.View animation="fadeInDown" style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="security" size={48} color={colors.primary} />
            </View>
            <Text style={styles.title}>Welcome to MyHearingBuddy</Text>
            <Text style={styles.subtitle}>
              {showOtpInput 
                ? 'Enter the OTP sent to your phone' 
                : 'Enter your mobile number to continue'
              }
            </Text>
          </Animatable.View>

          {/* Phone Input */}
          {!showOtpInput && (
            <Animatable.View animation="fadeInUp" style={styles.inputSection}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <Animated.View
                style={[
                  styles.phoneInputContainer,
                  { transform: [{ translateX: shakeAnimation }] }
                ]}
              >
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={[
                    styles.phoneInput,
                    isPhoneValid && styles.phoneInputValid
                  ]}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor={colors.textSecondary}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="numeric"
                  maxLength={10}
                  autoFocus
                />
              </Animated.View>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isPhoneValid && styles.sendButtonActive,
                  isLoading && styles.sendButtonLoading
                ]}
                onPress={handleSendOtp}
                disabled={!isPhoneValid || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Animatable.View animation="rotate" iterationCount="infinite" duration={1000}>
                    <MaterialIcons name="refresh" size={20} color={colors.surface} />
                  </Animatable.View>
                ) : (
                  <Text style={styles.sendButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </Animatable.View>
          )}

          {/* OTP Input */}
          {showOtpInput && (
            <Animatable.View animation="slideInUp" style={styles.otpSection}>
              <Text style={styles.inputLabel}>Enter OTP</Text>
              <Text style={styles.otpSentText}>
                OTP sent to +91 {phoneNumber}
              </Text>

              <Animated.View
                style={[
                  styles.otpContainer,
                  { transform: [{ translateX: shakeAnimation }] }
                ]}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => otpRefs.current[index] = ref!}
                    style={[
                      styles.otpInput,
                      digit && styles.otpInputFilled,
                      index === otp.findIndex(d => d === '') && styles.otpInputActive
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </Animated.View>

              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  isOtpComplete && styles.verifyButtonActive,
                  isLoading && styles.verifyButtonLoading
                ]}
                onPress={() => handleVerifyOtp()}
                disabled={!isOtpComplete || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <Animatable.View animation="rotate" iterationCount="infinite" duration={1000}>
                    <MaterialIcons name="refresh" size={20} color={colors.surface} />
                  </Animatable.View>
                ) : (
                  <Text style={styles.verifyButtonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP */}
              <View style={styles.resendContainer}>
                {otpTimer > 0 ? (
                  <Text style={styles.timerText}>
                    Resend OTP in {otpTimer}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Animatable.View>
          )}

          {/* Demo Notice */}
          <Animatable.View animation="fadeIn" delay={1000} style={styles.demoNotice}>
            <MaterialIcons name="info" size={16} color={colors.textSecondary} />
            <Text style={styles.demoText}>
              For demo purposes only. Any 6-digit OTP will work.
            </Text>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  countryCode: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRightWidth: 0,
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryCodeText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text,
  },
  phoneInputValid: {
    borderColor: colors.success,
  },
  sendButton: {
    backgroundColor: colors.textSecondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
  sendButtonLoading: {
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.surface,
  },
  otpSection: {
    marginBottom: spacing.xl,
  },
  otpSentText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  otpInput: {
    width: 45,
    height: 50,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    textAlign: 'center',
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text,
  },
  otpInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.overlay,
  },
  otpInputActive: {
    borderColor: colors.primary,
  },
  verifyButton: {
    backgroundColor: colors.textSecondary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginBottom: spacing.md,
  },
  verifyButtonActive: {
    backgroundColor: colors.primary,
  },
  verifyButtonLoading: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.surface,
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
  },
  resendText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xl,
  },
  demoText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
});

export default LoginScreen;