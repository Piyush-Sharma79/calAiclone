import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Text, 
  Alert, 
  TouchableOpacity, 
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { analyzeFoodImage } from '../utils/foodRecognition';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
  color?: string;
}

const ResultScreen = ({ route, navigation }: Props) => {
  const imageUri = route.params?.imageUri;
  const { user } = useAuth();
  const [foodData, setFoodData] = useState<{ name: string; description: string; nutritionalData?: NutritionalData; isFoodItem?: boolean } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
        
        // Start animation when data is loaded
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start();
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
        <StatusBar style="dark" />
        <View style={styles.emptyStateContainer}>
          <Ionicons name="image-outline" size={80} color="#CCCCCC" />
          <Text style={styles.title}>No image selected</Text>
          <Text style={styles.subtitle}>Please capture a meal photo from the Home screen.</Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.primaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Analyzing your meal...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={40} color="#E53935" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Back to Scanning</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!loading && foodData && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {(!foodData.isFoodItem || !foodData.nutritionalData) && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={40} color="#E53935" />
              <Text style={styles.errorText}>
                This does not appear to be a recognizable food item. Please try a different image.
              </Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.retryButtonText}>Back to Scanning</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {foodData.isFoodItem && foodData.nutritionalData && (
            <Animated.View
              style={[
                styles.resultContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.foodImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.imageGradient}
                />
                <View style={styles.foodNameContainer}>
                  <Text style={styles.foodName}>{foodData.name}</Text>
                </View>
              </View>
              
              <View style={styles.nutritionSummary}>
                <View style={styles.calorieContainer}>
                  <Text style={styles.calorieValue}>
                    {foodData.nutritionalData.calories}
                  </Text>
                  <Text style={styles.calorieLabel}>calories</Text>
                </View>
                
                <View style={styles.macroSummary}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{foodData.nutritionalData.protein}g</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{foodData.nutritionalData.carbs}g</Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{foodData.nutritionalData.fat}g</Text>
                    <Text style={styles.macroLabel}>Fats</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>About this food</Text>
                <Text style={styles.descriptionText}>{foodData.description}</Text>
              </View>
              
              <View style={styles.nutritionDetailContainer}>
                <Text style={styles.nutritionDetailTitle}>Nutrition Facts</Text>
                
                <View style={styles.nutritionList}>
                  <NutritionItem 
                    label="Calories" 
                    value={foodData.nutritionalData.calories} 
                    unit="kcal" 
                    color="#4CAF50"
                  />
                  <NutritionItem 
                    label="Protein" 
                    value={foodData.nutritionalData.protein} 
                    unit="g" 
                    color="#5C6BC0"
                  />
                  <NutritionItem 
                    label="Carbohydrates" 
                    value={foodData.nutritionalData.carbs} 
                    unit="g" 
                    color="#FFA726"
                  />
                  <NutritionItem 
                    label="Fats" 
                    value={foodData.nutritionalData.fat} 
                    unit="g" 
                    color="#EF5350"
                  />
                  {foodData.nutritionalData.fiber && (
                    <NutritionItem 
                      label="Fiber" 
                      value={foodData.nutritionalData.fiber} 
                      unit="g" 
                      color="#8D6E63"
                    />
                  )}
                  {foodData.nutritionalData.sugar && (
                    <NutritionItem 
                      label="Sugar" 
                      value={foodData.nutritionalData.sugar} 
                      unit="g" 
                      color="#EC407A"
                    />
                  )}
                  {foodData.nutritionalData.sodium && (
                    <NutritionItem 
                      label="Sodium" 
                      value={foodData.nutritionalData.sodium} 
                      unit="mg" 
                      color="#78909C"
                    />
                  )}
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveToHistory}
                disabled={isSaved}
              >
                <Text style={styles.saveButtonText}>
                  {isSaved ? 'Saved to History' : 'Save to History'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const NutritionItem = ({ label, value, unit, color = '#4CAF50' }: NutritionItemProps) => (
  <View style={styles.nutritionItem}>
    <View style={styles.nutritionItemHeader}>
      <Text style={styles.nutritionItemLabel}>{label}</Text>
      <Text style={[styles.nutritionItemValue, { color }]}>
        {value}{unit}
      </Text>
    </View>
    <View style={styles.nutritionItemBar}>
      <View 
        style={[
          styles.nutritionItemBarFill, 
          { 
            width: `${Math.min(value * 2, 100)}%`,
            backgroundColor: color,
          }
        ]} 
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
  },
  errorContainer: {
    margin: 24,
    padding: 24,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#C62828',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  resultContainer: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  foodNameContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  foodName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  nutritionSummary: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calorieContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
  },
  calorieLabel: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  macroSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  macroLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  descriptionContainer: {
    padding: 16,
    marginHorizontal: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  nutritionDetailContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  nutritionDetailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  nutritionList: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  nutritionItem: {
    marginBottom: 16,
  },
  nutritionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionItemLabel: {
    fontSize: 16,
    color: '#333333',
  },
  nutritionItemValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  nutritionItemBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  nutritionItemBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResultScreen;
