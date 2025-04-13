/**
 * HomeScreen.tsx
 * 
 * This is the main screen of the application where users can take photos of food
 * or select images from their gallery for nutritional analysis.
 * 
 * Features:
 * - Camera integration for taking photos
 * - Gallery access for selecting existing images
 * - Animated UI elements for better user experience
 * - Nutrition tips section
 * 
 * @author Piyush Sharma
 * @created For HealEasy internship assignment using Windsurf
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  Image, 
  Dimensions, 
  Platform,
  Animated,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

// Get device dimensions for responsive layout
const { width, height } = Dimensions.get('window');

// Type definition for the component props
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

/**
 * HomeScreen Component
 * 
 * Main screen of the application that provides options to capture or select food images
 * for nutritional analysis.
 * 
 * @param {Props} navigation - Navigation prop for screen navigation
 * @returns {JSX.Element} - Rendered component
 */
export default function HomeScreen({ navigation }: Props) {
  // State for camera functionality
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  // Animation values for UI elements
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(-20)).current;
  const subtitleAnim = useRef(new Animated.Value(-15)).current;
  const card1Anim = useRef(new Animated.Value(30)).current;
  const card2Anim = useRef(new Animated.Value(30)).current;
  const recentAnim = useRef(new Animated.Value(20)).current;

  /**
   * Reset and play animations when screen comes into focus
   * Creates a staggered animation sequence for a polished look
   */
  useFocusEffect(
    React.useCallback(() => {
      // Reset animations
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
      titleAnim.setValue(-20);
      subtitleAnim.setValue(-15);
      card1Anim.setValue(30);
      card2Anim.setValue(30);
      recentAnim.setValue(20);
      
      // Run entrance animations in sequence
      Animated.sequence([
        // First animate the overall container
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        // Then stagger the animations of individual elements
        Animated.stagger(100, [
          Animated.timing(titleAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(subtitleAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(card1Anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(card2Anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(recentAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ]).start();

      return () => {};
    }, [])
  );

  /**
   * Request camera permissions when component mounts
   */
  useEffect(() => {
    (async () => {
      if (permission) {
        if (permission.granted) {
          // Don't automatically open camera
        }
      } else {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  /**
   * Opens the device image picker to select an image from gallery
   * Navigates to the Result screen with the selected image URI
   */
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      navigation.navigate('Result', {
        imageUri: result.assets[0].uri,
      });
    }
  };

  /**
   * Takes a picture using the camera and navigates to the Result screen
   * with the captured image URI
   */
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        // @ts-ignore - Temporarily ignore TypeScript error for takePictureAsync
        const photo = await cameraRef.current.takePictureAsync();
        if (photo && photo.uri) {
          setIsCameraOpen(false);
          navigation.navigate('Result', {
            imageUri: photo.uri,
          });
        } else {
          console.error('Photo capture failed or returned no URI');
        }
      } catch (error) {
        console.error('Error taking picture:', error);
      }
    }
  };

  /**
   * Toggles between front and back camera
   */
  const toggleCameraFacing = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  /**
   * Opens the camera view after checking for permissions
   */
  const openCamera = () => {
    if (!permission || !permission.granted) {
      requestPermission();
      return;
    }
    setIsCameraOpen(true);
  };

  /**
   * Camera view rendering
   * Shown when the camera is open
   */
  if (isCameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <StatusBar style="light" />
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
        >
          <SafeAreaView style={styles.cameraControlsContainer}>
            {/* Camera header with close and flip buttons */}
            <View style={styles.cameraHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsCameraOpen(false)}
              >
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            {/* Camera capture button */}
            <View style={styles.captureButtonContainer}>
              <TouchableOpacity 
                style={styles.captureButton}
                onPress={takePicture}
                activeOpacity={0.8}
              >
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  /**
   * Main screen rendering
   * Shown when the camera is not open
   */
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      
      {/* Main content container with fade and scale animations */}
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Welcome text with slide-up animation */}
        <Animated.Text 
          style={[
            styles.welcomeText,
            { transform: [{ translateY: titleAnim }], opacity: opacityAnim }
          ]}
        >
          What are you eating today?
        </Animated.Text>
        
        {/* Subtitle text with slide-up animation */}
        <Animated.Text 
          style={[
            styles.subtitleText,
            { transform: [{ translateY: subtitleAnim }], opacity: opacityAnim }
          ]}
        >
          Take a photo of your meal to get instant nutritional information
        </Animated.Text>
        
        {/* Card container for camera and gallery options */}
        <View style={styles.cardContainer}>
          {/* Camera card with slide-up animation */}
          <Animated.View 
            style={{ 
              transform: [{ translateY: card1Anim }],
              opacity: opacityAnim,
              width: '48%',
            }}
          >
            <TouchableOpacity 
              style={styles.card}
              onPress={openCamera}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#4CAF50', '#2E7D32']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera" size={32} color="#FFFFFF" />
                <Text style={styles.cardTitle}>Take a Photo</Text>
                <Text style={styles.cardDescription}>
                  Snap a picture of your meal for instant analysis
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          
          {/* Gallery card with slide-up animation */}
          <Animated.View 
            style={{ 
              transform: [{ translateY: card2Anim }],
              opacity: opacityAnim,
              width: '48%',
            }}
          >
            <TouchableOpacity 
              style={styles.card}
              onPress={pickImage}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#5C6BC0', '#3949AB']}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="images" size={32} color="#FFFFFF" />
                <Text style={styles.cardTitle}>Gallery</Text>
                <Text style={styles.cardDescription}>
                  Upload an existing photo from your gallery
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Nutrition tips section with slide-up animation */}
        <Animated.View 
          style={[
            styles.recentSection,
            { 
              transform: [{ translateY: recentAnim }],
              opacity: opacityAnim 
            }
          ]}
        >
          <Text style={styles.recentTitle}>Nutrition Tips</Text>
          
          {/* Balanced diet tip card */}
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="nutrition-outline" size={24} color="#4CAF50" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Balanced Diet</Text>
              <Text style={styles.tipDescription}>
                Aim for a mix of proteins, carbs, and healthy fats in each meal
              </Text>
            </View>
          </View>
          
          {/* Hydration tip card */}
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="water-outline" size={24} color="#2196F3" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay Hydrated</Text>
              <Text style={styles.tipDescription}>
                Drink at least 8 glasses of water daily for optimal health
              </Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

/**
 * Styles for the HomeScreen component
 */
const styles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Scroll content container
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  // Content container
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  // Welcome text
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
    marginTop: 10,
  },
  // Subtitle text
  subtitleText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 30,
    lineHeight: 22,
  },
  // Container for camera and gallery cards
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  // Individual card
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  // Gradient background for cards
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Card title text
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 10,
  },
  // Card description text
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Camera container
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  // Camera view
  camera: {
    flex: 1,
  },
  // Container for camera controls
  cameraControlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  // Camera header with buttons
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  // Close button in camera view
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Flip camera button
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Container for capture button
  captureButtonContainer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  // Capture button
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Inner circle of capture button
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  // Section for nutrition tips
  recentSection: {
    marginTop: 10,
  },
  // Title for nutrition tips section
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  // Individual tip card
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  // Container for tip icon
  tipIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  // Container for tip content
  tipContent: {
    flex: 1,
  },
  // Title for individual tip
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  // Description for individual tip
  tipDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});
