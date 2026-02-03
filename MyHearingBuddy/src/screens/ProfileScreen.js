import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../components/Header';

export default function ProfileScreen() {
  const [name, setName] = useState('User Name');
  const [bio, setBio] = useState('This is my bio.');

  return (
    <View style={styles.container}>
      <Header onNotificationPress={() => {}} />
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../assets/avatar.png')}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editBtn}><Text style={{ color: '#0D1B2A', fontWeight: 'bold' }}>Edit</Text></TouchableOpacity>
      </View>
      <Text style={styles.label}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />
      <Text style={styles.label}>Bio</Text>
      <TextInput value={bio} onChangeText={setBio} style={[styles.input, { height: 60 }]} multiline={true} />
      <TouchableOpacity style={styles.saveButton}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF', alignItems: 'center', paddingTop: 32, paddingHorizontal: 30 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 160, resizeMode: 'contain' },
  editBtn: { marginTop: 6, padding: 4 },
  label: { alignSelf: 'flex-start', fontSize: 14, color: '#444', marginTop: 12, marginBottom: 4 },
  input: { backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', width: '100%', padding: 12, fontSize: 16 },
  saveButton: { marginTop: 22, backgroundColor: '#0D1B2A', padding: 12, borderRadius: 10, width: '100%', alignItems: 'center' },
});
