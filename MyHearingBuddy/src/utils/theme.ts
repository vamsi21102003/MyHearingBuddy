import { MD3LightTheme } from 'react-native-paper';

export const colors = {
  primary: '#4A90E2',
  secondary: '#50C878',
  background: '#F8FBFF',
  surface: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  success: '#27AE60',
  error: '#E74C3C',
  warning: '#F39C12',
  border: '#E8F4FD',
  overlay: 'rgba(74, 144, 226, 0.1)',
  gradient: {
    start: '#4A90E2',
    end: '#357ABD'
  }
};

export const typography = {
  fontFamily: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    bold: 'Poppins-Bold',
    black: 'Poppins-Black'
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999
};

export const elevation = {
  sm: 3,
  md: 6,
  lg: 8,
  xl: 12
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: colors.text,
    onSurface: colors.text,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    default: {
      fontFamily: typography.fontFamily.regular,
    },
    displayLarge: {
      fontFamily: typography.fontFamily.black,
      fontSize: typography.sizes.display,
      lineHeight: 56,
    },
    displayMedium: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.sizes.xxxl,
      lineHeight: 40,
    },
    headlineLarge: {
      fontFamily: typography.fontFamily.bold,
      fontSize: typography.sizes.xxl,
      lineHeight: 32,
    },
    titleLarge: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.sizes.xl,
      lineHeight: 28,
    },
    bodyLarge: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.sizes.md,
      lineHeight: 24,
    },
    bodyMedium: {
      fontFamily: typography.fontFamily.regular,
      fontSize: typography.sizes.sm,
      lineHeight: 20,
    },
    labelLarge: {
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.sizes.sm,
      lineHeight: 20,
    },
  },
  roundness: borderRadius.md,
};