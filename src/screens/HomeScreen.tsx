import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, FAB } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [permission, requestPermission] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      setIsCameraOpen(true);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // For now, we'll use hardcoded data
      navigation.navigate('Result', {
        imageUri: result.assets[0].uri,
      });
    }
  };

  const takePicture = async () => {
    setIsCameraOpen(false);
    // For now, we'll use hardcoded data
    navigation.navigate('Result', {
      imageUri: 'dummy-uri',
    });
  };

  if (isCameraOpen) {
    return (
      <View style={styles.camera}>
        <View style={styles.buttonContainer}>
          <FAB
            icon="camera"
            style={styles.fab}
            onPress={takePicture}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={openCamera} style={styles.button}>
        Take Photo
      </Button>
      <Button mode="outlined" onPress={pickImage} style={styles.button}>
        Choose from Gallery
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('History')} style={styles.button}>
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
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  fab: {
    margin: 16,
  },
});
