import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

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

export default function ResultScreen({ route, navigation }: Props) {
  const { imageUri } = route.params;

  const saveMeal = () => {
    // In the future, this will save to storage
    navigation.navigate('History');
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        {imageUri && (
          <Card.Cover source={{ uri: imageUri }} />
        )}
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
      <Button mode="contained" onPress={saveMeal} style={styles.button}>
        Save to History
      </Button>
    </View>
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
});
