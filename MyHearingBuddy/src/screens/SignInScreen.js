import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function SignInScreen({ navigation }) {
  const [phone, setPhone] = useState('');

  const handleContinue = () => {
    // Assume OTP process succeeds for prototype
    if (phone.length >= 10) {
      navigation.replace('Main');
    } else {
      Alert.alert('Enter valid phone number');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image source={require('../../assets/splash.png')} style={styles.logo} />
        <Text style={styles.title}>My Hearing Buddy</Text>
      </View>
      <Text style={styles.subtitle}>Create your account</Text>
      <Text style={styles.label}>Enter your Phone number</Text>
      <TextInput
        style={styles.input}
        keyboardType="phone-pad"
        placeholder="+91 "
        value={phone}
        onChangeText={setPhone}
        maxLength={13}
      />
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
      <Text style={styles.terms}>
        By clicking continue, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logo: { width: 80, height: 80, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0D1B2A' },
  subtitle: { fontSize: 18, color: '#0D1B2A', marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 8, color: '#444' },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    paddingLeft: 16,
    marginBottom: 16,
    fontSize: 18,
  },
  button: {
    backgroundColor: '#0D1B2A',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 18,
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  terms: { textAlign: 'center', fontSize: 12, color: '#888' },
});
