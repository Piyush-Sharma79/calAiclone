import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, FAB, IconButton } from 'react-native-paper';
import { CameraView } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    (async () => {
      if (permission) {
        if (permission.granted) {
          setIsCameraOpen(true);
        }
      } else {
        const { granted } = await requestPermission();
        if (granted) {
          setIsCameraOpen(true);
        }
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

  if (isCameraOpen) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
        >
          <View style={styles.cameraControls}>
            <IconButton
              icon="camera-flip"
              mode="contained"
              containerColor="rgba(255, 255, 255, 0.8)"
              size={30}
              onPress={toggleCameraFacing}
              style={styles.flipButton}
            />
            <FAB
              icon="camera"
              style={styles.captureButton}
              onPress={takePicture}
              size="large"
            />
            <IconButton
              icon="close"
              mode="contained"
              containerColor="rgba(255, 255, 255, 0.8)"
              size={30}
              onPress={() => setIsCameraOpen(false)}
              style={styles.closeButton}
            />
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button 
        mode="contained" 
        onPress={requestPermission} 
        style={styles.button}
        icon="camera"
        disabled={!permission || !permission.granted}
      >
        Take Photo
      </Button>
      <Button 
        mode="outlined" 
        onPress={pickImage} 
        style={styles.button}
        icon="image"
      >
        Choose from Gallery
      </Button>
      <Button 
        mode="text" 
        onPress={() => navigation.navigate('History')} 
        style={styles.button}
        icon="history"
      >
        View History
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  button: {
    marginVertical: 10,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  captureButton: {
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  flipButton: {
    alignSelf: 'flex-end',
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
});
