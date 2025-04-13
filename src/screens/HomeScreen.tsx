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

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(-20)).current;
  const subtitleAnim = useRef(new Animated.Value(-15)).current;
  const card1Anim = useRef(new Animated.Value(30)).current;
  const card2Anim = useRef(new Animated.Value(30)).current;
  const recentAnim = useRef(new Animated.Value(20)).current;

  // Reset and play animations when screen comes into focus
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

  const toggleCameraFacing = () => {
    setFacing(current => current === 'back' ? 'front' : 'back');
  };

  const openCamera = () => {
    if (!permission || !permission.granted) {
      requestPermission();
      return;
    }
    setIsCameraOpen(true);
  };

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      
      <Animated.View 
        style={[
          styles.contentContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Animated.Text 
          style={[
            styles.welcomeText,
            { transform: [{ translateY: titleAnim }], opacity: opacityAnim }
          ]}
        >
          What are you eating today?
        </Animated.Text>
        
        <Animated.Text 
          style={[
            styles.subtitleText,
            { transform: [{ translateY: subtitleAnim }], opacity: opacityAnim }
          ]}
        >
          Take a photo of your meal to get instant nutritional information
        </Animated.Text>
        
        <View style={styles.cardContainer}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
    marginTop: 10,
  },
  subtitleText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 30,
    lineHeight: 22,
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
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
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraControlsContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonContainer: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  recentSection: {
    marginTop: 10,
  },
  recentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
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
  tipIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
});
