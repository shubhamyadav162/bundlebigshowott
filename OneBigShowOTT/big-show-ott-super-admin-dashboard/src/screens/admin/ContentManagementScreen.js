import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ContentManagementScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Content Management</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1e1e1e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
});

export default ContentManagementScreen; 