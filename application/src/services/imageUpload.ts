
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/constants';

interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    urls?: string[];
  };
}

class ImageUploadService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload images'
      );
      return false;
    }
    return true;
  }

  async pickImage(): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      return null;
    }
  }

  async pickMultipleImages(maxImages: number = 4): Promise<string[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return [];

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        return result.assets.slice(0, maxImages).map((asset:any) => asset.uri);
      }
      return [];
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
      return [];
    }
  }

  async uploadAvatar(imageUri: string): Promise<string | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await fetch(`${API_URL}/upload/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Upload avatar error:', error);
      Alert.alert('Upload Failed', 'Failed to upload avatar');
      return null;
    }
  }

  async uploadPhotos(imageUris: string[]): Promise<string[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const formData = new FormData();

      imageUris.forEach((uri, index) => {
        const filename = uri.split('/').pop() || `photo-${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('photos', {
          uri: uri,
          name: filename,
          type: type,
        } as any);
      });

      const response = await fetch(`${API_URL}/upload/photos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      return data.data.urls || [];
    } catch (error) {
      console.error('Upload photos error:', error);
      Alert.alert('Upload Failed', 'Failed to upload photos');
      return [];
    }
  }

  async uploadEventImage(imageUri: string, eventId?: string): Promise<string | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'event.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      if (eventId) {
        formData.append('eventId', eventId);
      }

      const response = await fetch(`${API_URL}/upload/event-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data: UploadResponse = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Upload event image error:', error);
      Alert.alert('Upload Failed', 'Failed to upload event image');
      return null;
    }
  }

  async uploadWithProgress(
    imageUri: string,
    endpoint: string,
    fieldName: string,
    onProgress?: (progress: number) => void
  ): Promise<string | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.data.url);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.open('POST', `${API_URL}${endpoint}`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        const formData = new FormData();
        const filename = imageUri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append(fieldName, {
          uri: imageUri,
          name: filename,
          type: type,
        } as any);

        xhr.send(formData);
      });
    } catch (error) {
      console.error('Upload with progress error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image');
      return null;
    }
  }

  async compressImage(uri: string, quality: number = 0.8): Promise<string> {
    return uri;
  }
}

export default new ImageUploadService();