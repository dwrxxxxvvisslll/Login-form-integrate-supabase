import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) setUsername(data.username);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  }

  async function updateProfile() {
    try {
      setLoading(true);
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          updated_at: new Date(),
          created_at: new Date(),
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Error', error.message);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.username}>@{username || 'username'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={updateProfile}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={signOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  profileImageContainer: {
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  editContainer: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#0284c7',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editProfileButton: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    margin: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 