import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, FlatList, Image } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

interface MealData {
  id: string;
  name: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface NutritionItemProps {
  label: string;
  value: number;
  unit: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

const HistoryScreen = () => {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const fetchMeals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meals from Supabase:', error);
        Alert.alert('Error', 'Failed to load meal history');
      } else {
        setMeals(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching meals:', err);
      Alert.alert('Error', 'Unexpected error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeals();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Please log in to view your meal history.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal History</Text>
      {meals.length === 0 ? (
        <Text style={styles.noMealsText}>No meals logged yet.</Text>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.mealItem}>
              {item.image_url && (
                <Image source={{ uri: item.image_url }} style={styles.mealImage} />
              )}
              <View style={styles.mealDetails}>
                <Text style={styles.mealDate}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
                {item.analysis_data && item.analysis_data.total && (
                  <Text style={styles.mealTotal}>
                    Total Calories: {item.analysis_data.total.calories}
                  </Text>
                )}
              </View>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

const NutritionItem = ({ label, value, unit }: NutritionItemProps) => (
  <View style={styles.nutritionItem}>
    <Paragraph style={styles.label}>{label}</Paragraph>
    <Paragraph style={styles.value}>{value}{unit}</Paragraph>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  date: {
    color: '#666',
    marginBottom: 8,
  },
  nutritionContainer: {
    marginTop: 8,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    color: '#666',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  noMealsText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    padding: 16,
  },
  mealItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  mealDetails: {
    padding: 16,
  },
  mealDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  mealTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;
