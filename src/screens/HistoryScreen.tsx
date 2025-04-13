/**
 * HistoryScreen.tsx
 * 
 * This component displays the user's meal history fetched from Supabase.
 * It shows a list of previously logged meals with their nutritional information.
 * 
 * Features:
 * - Animated UI elements with staggered animations
 * - Data fetching from Supabase database
 * - Modal detail view for each meal
 * - Pull-to-refresh functionality
 * 
 * @author Piyush Sharma
 * @created For HealEasy internship assignment using Windsurf
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  Modal, 
  Pressable,
  Animated,
  Dimensions,
  RefreshControl,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

/**
 * Interface for meal data structure
 */
interface MealData {
  id: string;
  name: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

/**
 * Interface for nutrition item props
 */
interface NutritionItemProps {
  label: string;
  value: number;
  unit: string;
  color?: string;
}

// Type definition for the component props
type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

// Get device width for responsive layout
const { width } = Dimensions.get('window');

/**
 * HistoryScreen Component
 * 
 * Displays the user's meal history with nutritional information.
 * Allows viewing detailed information for each meal.
 * 
 * @returns {JSX.Element} - Rendered component
 */
const HistoryScreen = () => {
  // State for meal data and UI
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  
  // Animation values for UI elements
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  // Animation values for modal
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

  /**
   * Reset and play animations when screen comes into focus
   */
  useFocusEffect(
    React.useCallback(() => {
      // Reset animations when screen comes into focus
      fadeAnim.setValue(0);
      translateY.setValue(20);
      
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();

      return () => {};
    }, [])
  );

  /**
   * Fetches meal data from Supabase database
   * Filters meals by the current user's ID
   */
  const fetchMeals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Query Supabase for meals belonging to the current user
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meals from Supabase:', error);
      } else {
        setMeals(data || []);
      }
    } catch (err) {
      console.error('Unexpected error fetching meals:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Fetch meals when component mounts or user changes
   */
  useEffect(() => {
    fetchMeals();
  }, [user]);

  /**
   * Handle pull-to-refresh action
   */
  const onRefresh = () => {
    setRefreshing(true);
    fetchMeals();
  };

  /**
   * Opens the meal detail modal with animations
   * @param {any} meal - The meal data to display in the modal
   */
  const openModal = (meal: any) => {
    setSelectedMeal(meal);
    setModalVisible(true);
    
    // Reset animations
    modalScaleAnim.setValue(0.9);
    modalOpacityAnim.setValue(0);
    
    // Start animations
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  /**
   * Closes the meal detail modal with animations
   */
  const closeModal = () => {
    // Animate out
    Animated.parallel([
      Animated.timing(modalScaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => {
      setModalVisible(false);
      setSelectedMeal(null);
    });
  };

  /**
   * Renders an individual meal item in the list
   * Includes staggered animations based on item index
   * 
   * @param {any} item - The meal data
   * @param {number} index - The index of the item in the list
   * @returns {JSX.Element} - Rendered meal item
   */
  const renderMealItem = ({ item, index }: { item: any, index: number }) => {
    // Calculate fade based on index (earlier items fade in faster)
    const itemFade = Animated.multiply(
      fadeAnim,
      Animated.subtract(
        1,
        Animated.multiply(0.1, index < 5 ? index : 5)
      )
    );
    
    // Calculate translation based on index (earlier items translate faster)
    const itemTranslateY = Animated.add(
      translateY,
      Animated.multiply(10, index < 5 ? index : 5)
    );
    
    return (
      <Animated.View
        style={{
          opacity: itemFade,
          transform: [{ translateY: itemTranslateY }]
        }}
      >
        <TouchableOpacity 
          onPress={() => openModal(item)} 
          style={styles.mealItem}
          activeOpacity={0.7}
        >
          <View style={styles.mealCard}>
            {/* Meal image or placeholder */}
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.mealImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={40} color="#BDBDBD" />
              </View>
            )}
            
            {/* Gradient overlay for text readability */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.mealGradient}
            >
              <View style={styles.mealDetails}>
                {/* Meal date and time */}
                <Text style={styles.mealDate}>
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                
                {/* Nutritional information summary */}
                {item.analysis_data && item.analysis_data.total && (
                  <View style={styles.macroContainer}>
                    <View style={styles.calorieContainer}>
                      <Text style={styles.calorieValue}>
                        {Math.round(item.analysis_data.total.calories)}
                      </Text>
                      <Text style={styles.calorieLabel}>kcal</Text>
                    </View>
                    
                    <View style={styles.macroDetails}>
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>
                          {Math.round(item.analysis_data.total.protein)}g
                        </Text>
                        <Text style={styles.macroLabel}>Protein</Text>
                      </View>
                      
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>
                          {Math.round(item.analysis_data.total.carbs)}g
                        </Text>
                        <Text style={styles.macroLabel}>Carbs</Text>
                      </View>
                      
                      <View style={styles.macroItem}>
                        <Text style={styles.macroValue}>
                          {Math.round(item.analysis_data.total.fats)}g
                        </Text>
                        <Text style={styles.macroLabel}>Fats</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Show loading indicator while fetching meals
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your meals...</Text>
      </View>
    );
  }

  // Show login prompt if user is not logged in
  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={80} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>Not Logged In</Text>
        <Text style={styles.emptySubtitle}>Please log in to view your meal history</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with animation */}
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: Animated.multiply(translateY, 0.5) }]
          }
        ]}
      >
        <Text style={styles.title}>Your Meal History</Text>
        <Text style={styles.subtitle}>
          {meals.length > 0 
            ? `You have logged ${meals.length} meal${meals.length !== 1 ? 's' : ''}`
            : 'Start logging your meals to see them here'}
        </Text>
      </Animated.View>

      {/* Empty state or meal list */}
      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="fast-food-outline" size={80} color="#BDBDBD" />
          <Text style={styles.emptyTitle}>No Meals Yet</Text>
          <Text style={styles.emptySubtitle}>Your meal history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id}
          renderItem={renderMealItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
        />
      )}

      {/* Modal for detailed meal view */}
      <Modal
        animationType="none" // Using custom animations
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: modalOpacityAnim,
                transform: [{ scale: modalScaleAnim }]
              }
            ]}
          >
            {/* Use BlurView for iOS for a more native look */}
            {Platform.OS === 'ios' && (
              <BlurView intensity={90} tint="light" style={styles.modalBlur}>
                {renderModalContent()}
              </BlurView>
            )}
            
            {/* Regular view for Android */}
            {Platform.OS !== 'ios' && renderModalContent()}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
  
  /**
   * Renders the content of the meal detail modal
   * @returns {JSX.Element | null} - Modal content or null if no meal is selected
   */
  function renderModalContent() {
    if (!selectedMeal) return null;
    
    return (
      <View style={styles.modalInner}>
        {/* Modal header with title and close button */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Meal Details</Text>
          <TouchableOpacity 
            onPress={closeModal}
            style={styles.closeButton}
            hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
          >
            <Ionicons name="close" size={24} color="#757575" />
          </TouchableOpacity>
        </View>
        
        {/* Meal image if available */}
        {selectedMeal.image_url && (
          <Image 
            source={{ uri: selectedMeal.image_url }} 
            style={styles.modalImage} 
          />
        )}
        
        {/* Formatted date and time */}
        <Text style={styles.modalDate}>
          {new Date(selectedMeal.created_at).toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        
        {/* Nutritional information if available */}
        {selectedMeal.analysis_data && selectedMeal.analysis_data.total && (
          <View style={styles.nutritionContainer}>
            <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
            
            {/* Calories summary */}
            <View style={styles.calorieRow}>
              <Text style={styles.calorieTitle}>Calories</Text>
              <Text style={styles.calorieTotal}>
                {Math.round(selectedMeal.analysis_data.total.calories)} kcal
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            {/* Macronutrients with color coding */}
            <NutritionItem 
              label="Protein" 
              value={selectedMeal.analysis_data.total.protein} 
              unit="g"
              color="#4CAF50" 
            />
            <NutritionItem 
              label="Carbs" 
              value={selectedMeal.analysis_data.total.carbs} 
              unit="g"
              color="#2196F3" 
            />
            <NutritionItem 
              label="Fats" 
              value={selectedMeal.analysis_data.total.fats} 
              unit="g"
              color="#FF9800" 
            />
            
            <View style={styles.divider} />
            
            {/* Additional nutritional information */}
            <NutritionItem 
              label="Fiber" 
              value={selectedMeal.analysis_data.total.fiber || 0} 
              unit="g" 
            />
            <NutritionItem 
              label="Sugar" 
              value={selectedMeal.analysis_data.total.sugar || 0} 
              unit="g" 
            />
            <NutritionItem 
              label="Sodium" 
              value={selectedMeal.analysis_data.total.sodium || 0} 
              unit="mg" 
            />
          </View>
        )}
        
        {/* Empty state if no nutritional data is available */}
        {(!selectedMeal.analysis_data || !selectedMeal.analysis_data.total) && (
          <View style={styles.noDataContainer}>
            <Ionicons name="analytics-outline" size={60} color="#BDBDBD" />
            <Text style={styles.noDataText}>No nutritional data available</Text>
          </View>
        )}
      </View>
    );
  }
};

/**
 * NutritionItem Component
 * 
 * Displays a single nutrition item with label, value, and unit.
 * Includes optional color coding for visual differentiation.
 * 
 * @param {NutritionItemProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
const NutritionItem = ({ label, value, unit, color = '#757575' }: NutritionItemProps) => (
  <View style={styles.nutritionItem}>
    <View style={styles.nutritionLeft}>
      <View 
        style={[
          styles.nutritionDot, 
          { backgroundColor: color }
        ]} 
      />
      <Text style={styles.nutritionLabel}>{label}</Text>
    </View>
    <Text style={styles.nutritionValue}>
      {Math.round(value)}{unit}
    </Text>
  </View>
);

/**
 * Styles for the HistoryScreen component
 */
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header container
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  // Main title
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  // Subtitle text
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  // List container
  listContainer: {
    padding: 16,
    paddingTop: 5,
  },
  // Individual meal item
  mealItem: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Meal card container
  mealCard: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  // Meal image
  mealImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  // Placeholder for missing image
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Gradient overlay for text readability
  mealGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
  },
  // Container for meal details
  mealDetails: {
    padding: 16,
  },
  // Meal date text
  mealDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  // Container for macronutrient information
  macroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Container for calorie display
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 16,
  },
  // Calorie value text
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  // Calorie unit label
  calorieLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 2,
    marginBottom: 3,
  },
  // Container for macronutrient details
  macroDetails: {
    flexDirection: 'row',
  },
  // Individual macronutrient item
  macroItem: {
    marginRight: 12,
  },
  // Macronutrient value text
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  // Macronutrient label text
  macroLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  // Modal backdrop
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  // Modal content container
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      android: {
        backgroundColor: 'white',
        elevation: 5,
      },
    }),
  },
  // Blur view for iOS modal
  modalBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  // Inner modal content
  modalInner: {
    padding: 20,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'white',
  },
  // Modal header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  // Modal title
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  // Close button
  closeButton: {
    padding: 5,
  },
  // Modal image
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  // Modal date text
  modalDate: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
  },
  // Nutrition container
  nutritionContainer: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.7)' : '#F5F5F5',
    borderRadius: 12,
    padding: 15,
  },
  // Nutrition title
  nutritionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#212121',
  },
  // Calorie row in nutrition facts
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  // Calorie title in nutrition facts
  calorieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  // Total calorie value
  calorieTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  // Divider line
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 10,
  },
  // Nutrition item row
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  // Left side of nutrition item
  nutritionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Colored dot for nutrition item
  nutritionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  // Nutrition label text
  nutritionLabel: {
    fontSize: 16,
    color: '#212121',
  },
  // Nutrition value text
  nutritionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  // Loading text
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  // Empty state container
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  // Empty state title
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 20,
    marginBottom: 8,
  },
  // Empty state subtitle
  emptySubtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  // No data container
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  // No data text
  noDataText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default HistoryScreen;
