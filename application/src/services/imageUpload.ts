import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/constants";

interface UploadResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
    urls?: string[];
  };
}

class ImageUploadService {
  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem("authToken");
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera roll permissions to upload images"
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
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
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
        return result.assets.slice(0, maxImages).map((asset) => asset.uri);
      }
      return [];
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images");
      return [];
    }
  }

  private async createFormData(
    imageUri: string,
    fieldName: string
  ): Promise<FormData> {
    const formData = new FormData();

    if (imageUri.startsWith("blob:") || imageUri.startsWith("http")) {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const filename = `${fieldName}_${Date.now()}.jpg`;
      const file = new File([blob], filename, {
        type: blob.type || "image/jpeg",
      });
      formData.append(fieldName, file);
    } else {
      const filename = imageUri.split("/").pop() || `${fieldName}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const file: any = {
        uri: imageUri,
        name: filename,
        type: type,
      };

      formData.append(fieldName, file);
    }

    return formData;
  }

  private async createMultipleFormData(
    imageUris: string[],
    fieldName: string
  ): Promise<FormData> {
    const formData = new FormData();

    for (let index = 0; index < imageUris.length; index++) {
      const uri = imageUris[index];

      if (uri.startsWith("blob:") || uri.startsWith("http")) {
        const response = await fetch(uri);
        const blob = await response.blob();
        const filename = `photo_${Date.now()}_${index}.jpg`;
        const file = new File([blob], filename, {
          type: blob.type || "image/jpeg",
        });
        formData.append(fieldName, file);
      } else {
        const filename = uri.split("/").pop() || `photo-${index}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        const file: any = {
          uri: uri,
          name: filename,
          type: type,
        };

        formData.append(fieldName, file);
      }
    }

    return formData;
  }

  async uploadAvatar(imageUri: string): Promise<string | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const formData = await this.createFormData(imageUri, "avatar");

      const response = await fetch(`${API_URL}/upload/avatar`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseText = await response.text();

      if (!response.ok) {
        let error;
        try {
          error = JSON.parse(responseText);
        } catch (e) {
          throw new Error(responseText || "Upload failed");
        }
        throw new Error(error.error || "Upload failed");
      }

      const data: UploadResponse = JSON.parse(responseText);
      return data.data.url;
    } catch (error: any) {
      console.error("Upload avatar error:", error);
      Alert.alert("Upload Failed", error.message || "Failed to upload avatar");
      return null;
    }
  }

  async uploadPhotos(imageUris: string[]): Promise<string[]> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const formData = await this.createMultipleFormData(imageUris, "photos");

      const response = await fetch(`${API_URL}/upload/photos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data: UploadResponse = await response.json();
      return data.data.urls || [];
    } catch (error: any) {
      console.error("Upload photos error:", error);
      Alert.alert("Upload Failed", error.message || "Failed to upload photos");
      return [];
    }
  }

  async uploadEventImage(
    imageUri: string,
    eventId?: string
  ): Promise<string | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const formData = await this.createFormData(imageUri, "image");
      if (eventId) {
        formData.append("eventId", eventId);
      }

      const response = await fetch(`${API_URL}/upload/event-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data: UploadResponse = await response.json();
      return data.data.url;
    } catch (error: any) {
      console.error("Upload event image error:", error);
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to upload event image"
      );
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
        throw new Error("No authentication token");
      }

      return new Promise(async (resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.data.url);
            } catch (error) {
              reject(new Error("Failed to parse response"));
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText);
              reject(new Error(error.error || "Upload failed"));
            } catch (e) {
              reject(new Error("Upload failed"));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Network error"));
        });

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload cancelled"));
        });

        xhr.open("POST", `${API_URL}${endpoint}`);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);

        const formData = await this.createFormData(imageUri, fieldName);
        xhr.send(formData);
      });
    } catch (error: any) {
      console.error("Upload with progress error:", error);
      Alert.alert("Upload Failed", error.message || "Failed to upload image");
      return null;
    }
  }

  async pickAndUploadAvatar(): Promise<string | null> {
    const imageUri = await this.pickImage();
    if (!imageUri) return null;
    return await this.uploadAvatar(imageUri);
  }

  async pickAndUploadPhotos(maxImages: number = 4): Promise<string[]> {
    const imageUris = await this.pickMultipleImages(maxImages);
    if (imageUris.length === 0) return [];
    return await this.uploadPhotos(imageUris);
  }

  async pickAndUploadEventImage(eventId?: string): Promise<string | null> {
    const imageUri = await this.pickImage();
    if (!imageUri) return null;
    return await this.uploadEventImage(imageUri, eventId);
  }
}

export default new ImageUploadService();
