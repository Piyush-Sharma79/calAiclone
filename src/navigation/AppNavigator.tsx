import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import type { RootStackParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AuthScreen from '../screens/AuthScreen';
import AccountScreen from '../screens/AccountScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName={session ? "Home" : "Auth"}
        screenOptions={{
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { backgroundColor: '#fff' },
        }}
      >
        {session ? (
          <>
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                  <Ionicons name="home" color={color} size={size} />
                ),
                headerShown: true,
                headerTitle: 'CalAI - Home',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                tabBarLabel: 'History',
                tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                  <Ionicons name="time" color={color} size={size} />
                ),
                headerShown: true,
                headerTitle: 'CalAI - Meal History',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
              }}
            />
            <Tab.Screen
              name="Result"
              component={ResultScreen}
              options={{
                tabBarLabel: 'Result',
                tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                  <Ionicons name="list" color={color} size={size} />
                ),
                headerShown: true,
                headerTitle: 'CalAI - Food Analysis',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
              }}
            />
            <Tab.Screen
              name="Account"
              component={AccountScreen}
              options={{
                tabBarLabel: 'Account',
                tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                  <Ionicons name="person" color={color} size={size} />
                ),
                headerShown: true,
                headerTitle: 'CalAI - Account',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : (
          <Tab.Screen
            name="Auth"
            component={AuthScreen}
            options={{
              tabBarLabel: 'Auth',
              tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                <Ionicons name="person" color={color} size={size} />
              ),
              headerShown: true,
              headerTitle: 'CalAI - Login',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
            }}
          />
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
