import axios, { AxiosInstance, AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/constants";
import {
  AuthResponse,
  User,
  Contact,
  Group,
  Event,
  Notification,
  ApiResponse,
} from "../types";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          AsyncStorage.removeItem("authToken");
        }
        return Promise.reject(error);
      }
    );
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    await AsyncStorage.setItem("authToken", data.token);
    return data;
  }

  async register(
    userData: Partial<User> & { password: string }
  ): Promise<AuthResponse> {
    const { data } = await this.api.post<AuthResponse>(
      "/auth/register",
      userData
    );
    await AsyncStorage.setItem("authToken", data.token);
    return data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const { data } = await this.api.post<ApiResponse>("/auth/forgot-password", {
      email,
    });
    return data;
  }

  async resetPassword(token: string, password: string): Promise<any> {
    const { data } = await this.api.post<ApiResponse>(
      `/auth/reset-password/${token}`,
      { password }
    );
    return data;
  }

  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    const { data } = await this.api.post<ApiResponse>("/auth/change-password", {
      oldPassword,
      newPassword,
    });
    return data;
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem("authToken");
  }

  async verifyOTP(email: string, otp: string): Promise<any> {
    const { data } = await this.api.post("/auth/verify-otp", { email, otp });
    return data;
  }

  async resetPasswordWithToken(resetToken: string, password: string) {
    const { data } = await this.api.post("/auth/reset-password", {
      resetToken,
      password,
    });
    return data;
  }
  async getProfile(): Promise<User> {
    const { data } = await this.api.get<User>("/users/profile");
    return data;
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const { data } = await this.api.put<User>("/users/profile", userData);
    return data;
  }

  async getContacts(search?: string): Promise<Contact[]> {
    const { data } = await this.api.get<Contact[]>("/contacts", {
      params: { search },
    });
    return data;
  }

  async getContact(id: string): Promise<Contact> {
    const { data } = await this.api.get<Contact>(`/contacts/${id}`);
    return data;
  }

  async createContact(contactData: Partial<Contact>): Promise<Contact> {
    const { data } = await this.api.post<Contact>("/contacts", contactData);
    return data;
  }

  async updateContact(
    id: string,
    contactData: Partial<Contact>
  ): Promise<Contact> {
    const { data } = await this.api.put<Contact>(
      `/contacts/${id}`,
      contactData
    );
    return data;
  }

  async deleteContact(id: string): Promise<ApiResponse> {
    const { data } = await this.api.delete<ApiResponse>(`/contacts/${id}`);
    return data;
  }

  async getGroups(search?: string): Promise<Group[]> {
    const { data } = await this.api.get<Group[]>("/groups", {
      params: { search },
    });
    return data;
  }

  async getGroup(id: string): Promise<Group> {
    const { data } = await this.api.get<Group>(`/groups/${id}`);
    return data;
  }

  async getGroupMembers(groupId: string): Promise<any[]> {
    const { data } = await this.api.get<any[]>(`/groups/${groupId}/members`);
    return data;
  }

  async createGroup(groupData: Partial<Group>): Promise<Group> {
    const { data } = await this.api.post<Group>("/groups", groupData);
    return data;
  }

  async updateGroup(id: string, groupData: Partial<Group>): Promise<Group> {
    const { data } = await this.api.put<Group>(`/groups/${id}`, groupData);
    return data;
  }

  async deleteGroup(id: string): Promise<ApiResponse> {
    const { data } = await this.api.delete<ApiResponse>(`/groups/${id}`);
    return data;
  }

  async getEvents(type: "upcoming" | "past" = "upcoming"): Promise<Event[]> {
    const { data } = await this.api.get<Event[]>("/events", {
      params: { type },
    });
    return data;
  }

  async getEvent(id: string): Promise<Event> {
    const { data } = await this.api.get<Event>(`/events/${id}`);
    return data;
  }

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    const { data } = await this.api.post<Event>("/events", eventData);
    return data;
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const { data } = await this.api.put<Event>(`/events/${id}`, eventData);
    return data;
  }

  async deleteEvent(id: string): Promise<ApiResponse> {
    const { data } = await this.api.delete<ApiResponse>(`/events/${id}`);
    return data;
  }

  async getNotifications(): Promise<Notification[]> {
    const { data } = await this.api.get<Notification[]>("/notifications");
    return data;
  }

  async getNotificationDetail(id: string): Promise<Notification> {
    const { data } = await this.api.get<Notification>(`/notifications/${id}`);
    return data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    const { data } = await this.api.put<ApiResponse>(
      `/notifications/${id}/read`
    );
    return data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const { data } = await this.api.put<ApiResponse>("/notifications/read-all");
    return data;
  }

  async registerPushToken(
    token: string,
    deviceId: string
  ): Promise<ApiResponse> {
    const { data } = await this.api.post<ApiResponse>(
      "/notifications/register-token",
      {
        token,
        deviceId,
      }
    );
    return data;
  }

  async sendBulkNotifications(payload: {
    title: string;
    message: string;
    type?: "meeting" | "message" | "reminder" | "update" | "general";
    recipients: string[];
    data?: any;
  }): Promise<ApiResponse> {
    const { data } = await this.api.post<ApiResponse>(
      "/notifications/send-bulk",
      payload
    );
    return data;
  }

  async sendNotification(payload: {
    title: string;
    message: string;
    userId: string;
    type?: "meeting" | "message" | "reminder" | "update" | "general";
    data?: any;
  }): Promise<ApiResponse> {
    const { data } = await this.api.post<ApiResponse>(
      "/notifications/send-single",
      payload
    );
    return data;
  }

  async uploadAvatar(userId: string, formData: FormData) {
    const { data } = await this.api.post<ApiResponse>(
      `/users/${userId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  }
}

export default new ApiService();
