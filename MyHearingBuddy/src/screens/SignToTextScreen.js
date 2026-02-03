import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function SignToTextScreen() {
  const handleCamera = () => {
    // Camera integration goes here
  };

  return (
    <View style={styles.container}>
      <Header onNotificationPress={() => {}} />
      <Text style={styles.title}>Hey!!{"\n"}Buddy <Text style={{fontSize: 22}}>👋</Text></Text>
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../assets/avatar.png')}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.subtitle}>let's do some real time task...!!</Text>
      <TouchableOpacity style={styles.cameraButton} onPress={handleCamera}>
        <Image
          source={require('../../assets/icons/camera.png')}
          style={styles.cameraIcon}
        />
        <Text style={styles.cameraText}>Open Camera</Text>
      </TouchableOpacity>
      <View style={styles.output}>
        <Text style={styles.outputLabel}>ASL Output:</Text>
        <Text style={styles.outputResult}>[Detected text here]</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEF',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  title: { fontSize: 28, color: '#0D1B2A', textAlign: 'center', fontWeight: '500' },
  avatarContainer: {
    marginVertical: 26,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: '#FAF4E6',
  },
  avatar: { width: 120, height: 190, resizeMode: 'contain' },
  subtitle: { fontSize: 16, color: '#444', marginBottom: 15 },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1B2A',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  cameraIcon: { width: 26, height: 26, marginRight: 10, tintColor: 'white' },
  cameraText: { color: 'white', fontSize: 17, fontWeight: '600' },
  output: { width: '100%', marginTop: 20, padding: 18, backgroundColor: '#fff', borderRadius: 12 },
  outputLabel: { fontSize: 15, color: '#aaa' },
  outputResult: { fontSize: 18, fontWeight: 'bold', marginTop: 5, color: '#222' },
});
