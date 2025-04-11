import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import HomeScreen from '../screens/HomeScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'CalAI' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Food Analysis' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Meal History' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
