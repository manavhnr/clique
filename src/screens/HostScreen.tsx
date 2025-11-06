import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HostScreen() {
  return (
    <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Host Event</Text>
        <Text style={styles.subtitle}>Coming Soon...</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },
});