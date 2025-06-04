import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('http://localhost:3000/subscriptions/all');
        const result = await response.json();
        setUsers(result.users);
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading subscriptions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription Management</Text>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.tableHeader}>
          <Text style={[styles.headerCell, { flex: 2 }]}>User ID</Text>
          <Text style={[styles.headerCell, { flex: 3 }]}>Email</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>Subscription End</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Days Left</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>Last Payment</Text>
        </View>
        {users.map((user) => (
          <View key={user.uid} style={styles.tableRow}>
            <Text style={[styles.cell, { flex: 2 }]}>{user.name || user.uid}</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{user.email}</Text>
            <Text style={[styles.cell, { flex: 2 }]}>{user.subscriptionEnd || '-'}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{user.daysRemaining}</Text>
            <Text style={[styles.cell, { flex: 1 }]}>{user.lastPayment ? `$${user.lastPayment}` : '-'}</Text>
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