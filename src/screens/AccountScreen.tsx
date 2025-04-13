/**
 * AccountScreen.tsx
 * 
 * This component renders the user's account profile screen.
 * It displays user information and provides sign-out functionality.
 * 
 * Features:
 * - Animated UI elements with fade and translate effects
 * - Gradient header with user avatar
 * - Account information display
 * - Sign out functionality
 * 
 * @author Piyush Sharma
 * @created For HealEasy internship assignment using Windsurf
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ScrollView, Animated, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

/**
 * AccountScreen component
 * 
 * This component is responsible for rendering the user's account profile screen.
 * It displays user information and provides sign-out functionality.
 */
const AccountScreen = () => {
  // Get authentication context for user data and sign out function
  const { user, signOut } = useAuth();
  
  // Animation values for entrance animations
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(20)).current;

  /**
   * Reset and play animations when screen comes into focus
   * 
   * This effect is used to reset and play the entrance animations when the screen comes into focus.
   * It uses the `useFocusEffect` hook from `@react-navigation/native` to achieve this.
   */
  useFocusEffect(
    React.useCallback(() => {
      // Reset animations when screen comes into focus
      fadeAnim.setValue(0);
      translateY.setValue(20);
      
      // Start animations with parallel effects
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true, // Uses native driver for better performance
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();

      // Cleanup function (empty in this case)
      return () => {};
    }, [])
  );

  /**
   * Handles user sign out process
   * 
   * This function is called when the user presses the sign out button.
   * It shows success or error messages based on the result of the sign out process.
   */
  const handleSignOut = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'You have been signed out.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  // Show a different UI if user is not logged in
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are not logged in.</Text>
      </View>
    );
  }

  // Get first letter of email for avatar display
  const avatarLetter = user.email ? user.email[0].toUpperCase() : 'U';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with gradient background and avatar */}
      <Animated.View style={[styles.profileHeader, { opacity: fadeAnim, transform: [{ translateY }] }]}>
        <LinearGradient
          colors={['#4CAF50', '#2E7D32']}
          style={styles.gradientHeader}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.headerTitle}>Built by Piyush Sharma</Text>
          <Text style={styles.headerSubtitle}>For the HealEasy assignment using Windsurf</Text>
        </LinearGradient>
      </Animated.View>

      {/* Account information card */}
      <Animated.View 
        style={[
          styles.infoCard, 
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: Animated.multiply(translateY, 1.2) }] // Staggered animation
          }
        ]}
      >
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        {/* Email information row */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={24} color="#4CAF50" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email || 'Not available'}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        {/* User ID information row */}
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Ionicons name="finger-print-outline" size={24} color="#4CAF50" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{user.id || 'Not available'}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Sign out button */}
      <Animated.View 
        style={[
          { 
            opacity: fadeAnim, 
            transform: [{ translateY: Animated.multiply(translateY, 1.4) }],
            width: '100%',
            paddingHorizontal: 20,
            marginBottom: 30
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFF" style={styles.buttonIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

// Styles for the AccountScreen component
const styles = StyleSheet.create({
  /**
   * Container style for the screen
   */
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Light background color for the screen
  },
  /**
   * Content container style for the screen
   */
  contentContainer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  /**
   * Profile header style
   */
  profileHeader: {
    width: '100%',
    marginBottom: 20,
  },
  /**
   * Gradient header style
   */
  gradientHeader: {
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  /**
   * Avatar container style
   */
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Semi-transparent white
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  /**
   * Avatar text style
   */
  avatarText: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  /**
   * Header title style
   */
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  /**
   * Header subtitle style
   */
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white
  },
  /**
   * Info card style
   */
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    marginBottom: 20,
    // Platform-specific shadow styles
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  /**
   * Section title style
   */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#212121',
  },
  /**
   * Info row style
   */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  /**
   * Icon container style
   */
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green background for icons
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  /**
   * Info content style
   */
  infoContent: {
    flex: 1,
  },
  /**
   * Info label style
   */
  infoLabel: {
    fontSize: 14,
    color: '#757575', // Medium gray for labels
    marginBottom: 4,
  },
  /**
   * Info value style
   */
  infoValue: {
    fontSize: 16,
    color: '#212121', // Dark gray for values
  },
  /**
   * Divider style
   */
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE', // Light gray divider
    marginVertical: 8,
  },
  /**
   * Sign out button style
   */
  signOutButton: {
    backgroundColor: '#FF5252', // Red color for sign out
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // Platform-specific shadow styles
    ...Platform.select({
      ios: {
        shadowColor: '#FF5252',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  /**
   * Sign out text style
   */
  signOutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  /**
   * Button icon style
   */
  buttonIcon: {
    marginRight: 8,
  },
  /**
   * Title style
   */
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default AccountScreen;
