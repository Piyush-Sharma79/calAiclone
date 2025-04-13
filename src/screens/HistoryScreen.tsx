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
  color?: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

const { width } = Dimensions.get('window');

const HistoryScreen = () => {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  const modalScaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalOpacityAnim = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    fetchMeals();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMeals();
  };

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
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.mealImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={40} color="#BDBDBD" />
              </View>
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.mealGradient}
            >
              <View style={styles.mealDetails}>
                <Text style={styles.mealDate}>
                  {new Date(item.created_at).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading your meals...</Text>
      </View>
    );
  }

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

      <Modal
        animationType="none"
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
            {Platform.OS === 'ios' && (
              <BlurView intensity={90} tint="light" style={styles.modalBlur}>
                {renderModalContent()}
              </BlurView>
            )}
            
            {Platform.OS !== 'ios' && renderModalContent()}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
  
  function renderModalContent() {
    if (!selectedMeal) return null;
    
    return (
      <View style={styles.modalInner}>
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
        
        {selectedMeal.image_url && (
          <Image 
            source={{ uri: selectedMeal.image_url }} 
            style={styles.modalImage} 
          />
        )}
        
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
        
        {selectedMeal.analysis_data && selectedMeal.analysis_data.total && (
          <View style={styles.nutritionContainer}>
            <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
            
            <View style={styles.calorieRow}>
              <Text style={styles.calorieTitle}>Calories</Text>
              <Text style={styles.calorieTotal}>
                {Math.round(selectedMeal.analysis_data.total.calories)} kcal
              </Text>
            </View>
            
            <View style={styles.divider} />
            
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  listContainer: {
    padding: 16,
    paddingTop: 5,
  },
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
  mealCard: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  mealImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
  },
  mealDetails: {
    padding: 16,
  },
  mealDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  macroContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 16,
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  calorieLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 2,
    marginBottom: 3,
  },
  macroDetails: {
    flexDirection: 'row',
  },
  macroItem: {
    marginRight: 12,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  macroLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
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
  modalBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalInner: {
    padding: 20,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  closeButton: {
    padding: 5,
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
  },
  modalDate: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
  },
  nutritionContainer: {
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.7)' : '#F5F5F5',
    borderRadius: 12,
    padding: 15,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#212121',
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  calorieTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  calorieTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 10,
  },
  nutritionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  nutritionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  nutritionLabel: {
    fontSize: 16,
    color: '#212121',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default HistoryScreen;
