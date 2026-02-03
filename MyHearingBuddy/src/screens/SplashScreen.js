import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => navigation.replace('SignIn'), 1500);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/splash.png')} style={styles.logo} />
      <Text style={styles.text}>My Hearing Buddy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D1B2A',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { width: 120, height: 120, marginBottom: 30 },
  text: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
});
