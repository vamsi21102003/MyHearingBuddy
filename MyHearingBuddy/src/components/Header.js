import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

export default function Header({ onNotificationPress }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.notifyButton}
        onPress={onNotificationPress}
      >
        <Image
          source={require('../../assets/icons/notification.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#FFFBEF',
    zIndex: 10,
  },
  notifyButton: {
    padding: 5,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: '#0D1B2A',
  },
});
