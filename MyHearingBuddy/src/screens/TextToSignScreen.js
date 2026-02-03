import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, ScrollView } from 'react-native';
import Header from '../components/Header';

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function getLetterImages(text) {
  return text.toUpperCase().split('').filter(c => ALPHABET.includes(c)).map((char, i) => (
    <Image
      key={`${char}-${i}`}
      source={{ uri: Image.resolveAssetSource(require(`../../assets/asl_letters/${char}.png`)).uri }}
      style={styles.letterImg}
    />
  ));
}

export default function TextToSignScreen() {
  const [input, setInput] = useState('');
  return (
    <View style={styles.container}>
      <Header onNotificationPress={() => {}} />
      <Text style={styles.title}>Hey Buddy,</Text>
      <View style={styles.avatarContainer}>
        <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Enter the text for sign!!"
        value={input}
        onChangeText={setInput}
      />
      <ScrollView horizontal style={styles.lettersRow}>
        {getLetterImages(input)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF', alignItems: 'center', paddingTop: 32 },
  title: { fontSize: 24, color: '#0D1B2A', fontWeight: '500', marginBottom: 8 },
  avatarContainer: {
    width: 180, height: 180, backgroundColor: '#FAF4E6', borderRadius: 90,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatar: { width: 90, height: 160, resizeMode: 'contain' },
  input: {
    width: '80%',
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 10,
    fontSize: 18,
  },
  lettersRow: { flexDirection: 'row', marginVertical: 10, minHeight: 80 },
  letterImg: { width: 54, height: 72, marginRight: 10, resizeMode: 'contain' },
});
