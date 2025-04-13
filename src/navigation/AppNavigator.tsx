/**
 * AppNavigator.tsx
 * 
 * This component serves as the main navigation container for the application.
 * It handles the routing between different screens and implements a custom tab bar.
 * 
 * Features:
 * - Custom tab bar with blur effect and animations
 * - Conditional navigation based on authentication state
 * - Stack and Tab navigation integration
 * 
 * @author Piyush Sharma
 * @created For HealEasy internship assignment using Windsurf
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import type { RootStackParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AuthScreen from '../screens/AuthScreen';
import AccountScreen from '../screens/AccountScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import { useAuth } from '../context/AuthContext';
import { BlurView } from 'expo-blur';

// Create navigation stacks with TypeScript type safety
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

/**
 * CustomTabBar component
 * 
 * A custom implementation of the bottom tab bar with blur effect and custom styling.
 * Handles tab navigation and visual feedback for the active tab.
 * 
 * @param {BottomTabBarProps} props - Props passed from the Tab.Navigator
 * @returns {JSX.Element} - Rendered custom tab bar
 */
const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  return (
    <BlurView intensity={80} tint="light" style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || options.title || route.name;
        const isFocused = state.index === index;

        // Handle tab press events
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Define icons based on route name and focus state
        let iconName;
        if (route.name === 'Home') {
          iconName = isFocused ? 'home' : 'home-outline';
        } else if (route.name === 'History') {
          iconName = isFocused ? 'time' : 'time-outline';
        } else if (route.name === 'Result') {
          iconName = isFocused ? 'list' : 'list-outline';
        } else if (route.name === 'Account') {
          iconName = isFocused ? 'person' : 'person-outline';
        }

        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={`${label} tab`}
          >
            <View style={styles.tabItemContent}>
              <Ionicons
                name={iconName as any}
                size={24}
                color={isFocused ? '#4CAF50' : '#9E9E9E'}
              />
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? '#4CAF50' : '#9E9E9E' }
              ]}>
                {label as string}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
};

/**
 * MainTabNavigator component
 * 
 * Sets up the bottom tab navigation for the main app screens.
 * Uses the custom tab bar component for styling and interaction.
 * 
 * @returns {JSX.Element} - Tab navigator with configured screens
 */
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: '#212121',
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: { 
          display: 'none', // Hide default tab bar since we're using custom
        },
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          headerTitle: 'CalAI',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <View style={{ marginLeft: 15 }}>
              <Ionicons name="leaf" size={24} color="#4CAF50" />
            </View>
          ),
          headerRight: () => (
            <View style={{ marginRight: 15 }}>
              <Ionicons name="notifications-outline" size={24} color="#757575" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          headerTitle: 'Meal History',
          headerTitleAlign: 'center',
        }}
      />
      <Tab.Screen
        name="Result"
        component={ResultScreen}
        options={{
          tabBarLabel: 'Analysis',
          headerTitle: 'Food Analysis',
          headerTitleAlign: 'center',
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'Your Profile',
          headerTitleAlign: 'center',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * AppNavigator component
 * 
 * The main navigation component that handles authentication state
 * and renders either the auth flow or the main app flow.
 * 
 * @returns {JSX.Element} - Navigation container with appropriate screens
 */
const AppNavigator = () => {
  // Get authentication state from context
  const { session, loading } = useAuth();

  // Show loading indicator while authentication state is being determined
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        {/* Conditional rendering based on authentication state */}
        {!session ? (
          // Auth flow - shown when user is not logged in
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : (
          // Main app flow - shown when user is logged in
          <Stack.Screen name="Home" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Styles for the navigation components
 */
const styles = StyleSheet.create({
  // Loading container shown while auth state is being determined
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  // Container for the custom tab bar
  tabBarContainer: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  // Individual tab item
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  // Content container for tab item
  tabItemContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    paddingTop: 5,
  },
  // Label text for tab items
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  // Indicator for active tab
  activeIndicator: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 8,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4CAF50',
  },
});

export default AppNavigator;
