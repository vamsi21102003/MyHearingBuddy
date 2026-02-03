import React from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import Header from '../components/Header';

const messages = [
  { id: '1', text: "Hello, how are you?", fromMe: false },
  { id: '2', text: "I'm great! Using My Hearing Buddy.", fromMe: true },
];

export default function ChatScreen() {
  const [input, setInput] = React.useState('');
  const renderItem = ({ item }) => (
    <View style={[styles.message, item.fromMe ? styles.fromMe : styles.fromOther]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );
  return (
    <View style={styles.container}>
      <Header onNotificationPress={() => {}} />
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'flex-end' }}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Type a message..."
          style={styles.input}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEF' },
  message: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '75%' },
  fromMe: { backgroundColor: '#D4E5F7', alignSelf: 'flex-end' },
  fromOther: { backgroundColor: '#ffffff', alignSelf: 'flex-start' },
  messageText: { fontSize: 15, color: '#333' },
  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  input: { flex: 1, fontSize: 16, paddingRight: 10 },
  sendButton: {
    backgroundColor: '#0D1B2A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 6,
  },
});
