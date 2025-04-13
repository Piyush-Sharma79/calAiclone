import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView, Text, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { analyzeFoodImage } from '../utils/foodRecognition';

type NutritionalData = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
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
  const [foodData, setFoodData] = useState<{ name: string; description: string; nutritionalData?: NutritionalData; isFoodItem?: boolean } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);

  useEffect(() => {
    // Reset isSaved when imageUri changes (new image to analyze)
    setIsSaved(false);
    const fetchFoodData = async () => {
      if (!imageUri) return;

      setLoading(true);
      setError(null);

      try {
        const result = await analyzeFoodImage(imageUri);
        setFoodData(result);
      } catch (err) {
        console.error('Error fetching food data:', err);
        setError('Failed to analyze image. Please try again or enter details manually.');
        // Fallback to a default value
        setFoodData({ name: 'Unknown Food', description: 'Analysis failed.' });
      } finally {
        setLoading(false);
      }
    };

    fetchFoodData();
  }, [imageUri]);

  useEffect(() => {
    const saveMealToSupabase = async () => {
      if (!user || !imageUri || !foodData || isSaved) return;

      try {
        const analysisData = {
          items: [
            {
              name: foodData.name,
              calories: foodData.nutritionalData?.calories || 0,
              protein: foodData.nutritionalData?.protein || 0,
              carbs: foodData.nutritionalData?.carbs || 0,
              fats: foodData.nutritionalData?.fat || 0,
            },
          ],
          total: {
            calories: foodData.nutritionalData?.calories || 0,
            protein: foodData.nutritionalData?.protein || 0,
            carbs: foodData.nutritionalData?.carbs || 0,
            fats: foodData.nutritionalData?.fat || 0,
          },
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
          setIsSaved(true);
        }
      } catch (err) {
        console.error('Unexpected error saving meal:', err);
        Alert.alert('Error', 'Unexpected error occurred');
      }
    };

    // Do not save automatically, wait for user confirmation
    // if (foodData) {
    //   saveMealToSupabase();
    // }
  }, [imageUri, user, foodData, isSaved]);

  useEffect(() => {
    if (error) {
      setSnackbarVisible(true);
      const timer = setTimeout(() => {
        setSnackbarVisible(false);
        setError(null); // Clear error after dismissal
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSaveToHistory = async () => {
    if (!user || !imageUri || !foodData) {
      Alert.alert('Info', 'Data incomplete. Cannot save to history.');
      return;
    }

    if (!foodData.isFoodItem || !foodData.nutritionalData) {
      Alert.alert('Error', 'This does not appear to be a recognizable food item. Cannot save to history.');
      return;
    }

    if (isSaved) {
      Alert.alert('Info', 'Meal already saved to history.');
      navigation.navigate('History');
      return;
    }

    try {
      const analysisData = {
        items: [
          {
            name: foodData.name,
            calories: foodData.nutritionalData?.calories || 0,
            protein: foodData.nutritionalData?.protein || 0,
            carbs: foodData.nutritionalData?.carbs || 0,
            fats: foodData.nutritionalData?.fat || 0,
            fiber: foodData.nutritionalData?.fiber || 0,
            sugar: foodData.nutritionalData?.sugar || 0,
            sodium: foodData.nutritionalData?.sodium || 0,
          },
        ],
        total: {
          calories: foodData.nutritionalData?.calories || 0,
          protein: foodData.nutritionalData?.protein || 0,
          carbs: foodData.nutritionalData?.carbs || 0,
          fats: foodData.nutritionalData?.fat || 0,
          fiber: foodData.nutritionalData?.fiber || 0,
          sugar: foodData.nutritionalData?.sugar || 0,
          sodium: foodData.nutritionalData?.sodium || 0,
        },
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
        setIsSaved(true);
        Alert.alert('Success', 'Meal saved to history!');
        navigation.navigate('History');
      }
    } catch (err) {
      console.error('Unexpected error saving meal:', err);
      Alert.alert('Error', 'Unexpected error occurred');
    }
  };

  if (!imageUri) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>No image selected</Text>
        <Text style={styles.subtitle}>Please capture a meal photo from the Home screen.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Home')} style={styles.button}>
          Go to Home
        </Button>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Analyzing your meal...</Text>
        </View>
      )}
      {error && snackbarVisible && (
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          style={styles.snackbar}
          duration={3000}
        >
          {error}
        </Snackbar>
      )}
      {!loading && foodData && (
        <>
          {(!foodData.isFoodItem || !foodData.nutritionalData) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: This does not appear to be a recognizable food item. Please try a different image.</Text>
              <Button mode="contained" onPress={() => navigation.goBack()} style={styles.retryButton}>
                Back to Scanning
              </Button>
            </View>
          )}
          {foodData.isFoodItem && foodData.nutritionalData && (
            <Card style={styles.card}>
              <Card.Cover source={{ uri: imageUri }} />
              <Card.Content>
                <Title>{foodData.name}</Title>
                <Paragraph style={styles.description}>{foodData.description}</Paragraph>
                {foodData.nutritionalData && (
                  <View style={styles.nutritionContainer}>
                    <NutritionItem label="Calories" value={foodData.nutritionalData.calories} unit="kcal" />
                    <NutritionItem label="Protein" value={foodData.nutritionalData.protein} unit="g" />
                    <NutritionItem label="Carbs" value={foodData.nutritionalData.carbs} unit="g" />
                    <NutritionItem label="Fats" value={foodData.nutritionalData.fat} unit="g" />
                    {foodData.nutritionalData.fiber && <NutritionItem label="Fiber" value={foodData.nutritionalData.fiber} unit="g" />}
                    {foodData.nutritionalData.sugar && <NutritionItem label="Sugar" value={foodData.nutritionalData.sugar} unit="g" />}
                    {foodData.nutritionalData.sodium && <NutritionItem label="Sodium" value={foodData.nutritionalData.sodium} unit="mg" />}
                  </View>
                )}
                {!foodData.nutritionalData && (
                  <Paragraph style={styles.noDataText}>Nutritional data unavailable.</Paragraph>
                )}
              </Card.Content>
            </Card>
          )}
          {foodData.isFoodItem && foodData.nutritionalData && (
            <Button mode="contained" onPress={handleSaveToHistory} style={styles.button}>
              Save to History
            </Button>
          )}
        </>
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
    backgroundColor: '#f5f5f5',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  nutritionContainer: {
    marginTop: 8,
  },
  noDataText: {
    color: '#888',
    fontStyle: 'italic',
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#c62828',
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#c62828',
    paddingHorizontal: 16,
  },
  snackbar: {
    backgroundColor: '#c62828',
    marginBottom: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
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
    color: '#555',
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
});

export default ResultScreen;
