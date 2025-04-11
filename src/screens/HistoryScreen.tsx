import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

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

// Hardcoded data for now
const MOCK_HISTORY: MealData[] = [
  {
    id: '1',
    name: 'Grilled Chicken Salad',
    date: '2025-04-11',
    calories: 350,
    protein: 32,
    carbs: 12,
    fats: 18,
  },
  {
    id: '2',
    name: 'Protein Smoothie',
    date: '2025-04-11',
    calories: 280,
    protein: 24,
    carbs: 35,
    fats: 8,
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

export default function HistoryScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container}>
      {MOCK_HISTORY.map((meal) => (
        <Card key={meal.id} style={styles.card}>
          <Card.Content>
            <Title>{meal.name}</Title>
            <Paragraph style={styles.date}>{meal.date}</Paragraph>
            <View style={styles.nutritionContainer}>
              <NutritionItem label="Calories" value={meal.calories} unit="kcal" />
              <NutritionItem label="Protein" value={meal.protein} unit="g" />
              <NutritionItem label="Carbs" value={meal.carbs} unit="g" />
              <NutritionItem label="Fats" value={meal.fats} unit="g" />
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

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
});
