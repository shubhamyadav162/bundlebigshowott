import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const UsersScreen = () => {
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', status: 'Active' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Editor', status: 'Inactive' },
    { id: '3', name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'Viewer', status: 'Active' },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>Name</Text>
          <Text style={[styles.headerCell, { flex: 3 }]}>Email</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Role</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Status</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Actions</Text>
        </View>
        {users.map((user) => (
          <View key={user.id} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2 }]}>{user.name}</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{user.email}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{user.role}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{user.status}</Text>
            <View style={[styles.cell, { flex: 1, flexDirection: 'row', justifyContent: 'space-around' }]}>  
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1e1e1e',
  },
  scrollContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingBottom: 10,
    marginBottom: 10,
  },
  headerCell: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cell: {
    color: '#ccc',
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#e60000',
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#aa0000',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});

// For debugging import/export issues
export const BigShowUsersScreen = UsersScreen;

export default UsersScreen; 