import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';

const icons = {
  SignToText: require('../../assets/icons/sign-to-text.png'),
  TextToSign: require('../../assets/icons/text-to-sign.png'),
  Chat: require('../../assets/icons/chat.png'),
  Profile: require('../../assets/icons/profile.png'),
};

export default function BottomNavigation({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            style={styles.tab}
            onPress={() => navigation.navigate(route.name)}
          >
            <Image
              source={icons[route.name]}
              style={[
                styles.icon,
                isFocused ? { tintColor: '#0D1B2A' } : { tintColor: '#888' },
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEF',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: { flex: 1, alignItems: 'center' },
  icon: { width: 28, height: 28, marginTop: 10 },
});
