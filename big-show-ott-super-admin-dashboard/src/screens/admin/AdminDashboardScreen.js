import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AdminDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      {/* Placeholder for dashboard content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1e1e1e', // Dark theme background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff', // Light text for dark theme
    marginBottom: 20,
  },
});

export default AdminDashboardScreen; 