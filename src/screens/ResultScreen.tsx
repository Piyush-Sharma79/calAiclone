import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, Alert } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';

// Hardcoded data for now
const MOCK_FOOD_DATA = {
  name: 'Grilled Chicken Salad',
  calories: 350,
  protein: 32,
  carbs: 12,
  fats: 18,
};

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

interface NutritionItemProps {
  label: string;
  value: number;
  unit: string;
}

const ResultScreen = ({ route, navigation }: Props) => {
  const imageUri = route.params?.imageUri;
  const { user } = useAuth();

  useEffect(() => {
    const saveMealToSupabase = async () => {
      if (!user || !imageUri) return;

      try {
        // Hardcoded data for now, replace with actual AI analysis in future
        const analysisData = {
          items: [
            { name: 'Pizza', calories: 285, protein: 12, carbs: 35, fats: 10 },
            { name: 'Salad', calories: 120, protein: 3, carbs: 15, fats: 5 },
          ],
          total: { calories: 405, protein: 15, carbs: 50, fats: 15 },
        };

        const { data, error } = await supabase
          .from('meals')
          .insert([
            {
              user_id: user.id,
              image_url: imageUri,
              analysis_data: analysisData,
            },
          ]);

        if (error) {
          console.error('Error saving meal to Supabase:', error);
          Alert.alert('Error', 'Failed to save meal data');
        } else {
          console.log('Meal saved to Supabase:', data);
        }
      } catch (err) {
        console.error('Unexpected error saving meal:', err);
        Alert.alert('Error', 'Unexpected error occurred');
      }
    };

    saveMealToSupabase();
  }, [imageUri, user]);

  if (!imageUri) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>No image selected</Text>
        <Text style={styles.subtitle}>Please capture a meal photo from the Home screen.</Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: imageUri }} />
        <Card.Content>
          <Title>{MOCK_FOOD_DATA.name}</Title>
          <View style={styles.nutritionContainer}>
            <NutritionItem label="Calories" value={MOCK_FOOD_DATA.calories} unit="kcal" />
            <NutritionItem label="Protein" value={MOCK_FOOD_DATA.protein} unit="g" />
            <NutritionItem label="Carbs" value={MOCK_FOOD_DATA.carbs} unit="g" />
            <NutritionItem label="Fats" value={MOCK_FOOD_DATA.fats} unit="g" />
          </View>
        </Card.Content>
      </Card>
      <Button mode="contained" onPress={() => navigation.navigate('History')} style={styles.button}>
        Save to History
      </Button>
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
  nutritionContainer: {
    marginTop: 16,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    color: '#666',
  },
  button: {
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  itemContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDetails: {
    fontSize: 16,
    color: '#666',
  },
  totalContainer: {
    paddingVertical: 16,
  },
  totalText: {
    fontSize: 18,
    marginBottom: 8,
  },
});

export default ResultScreen;
