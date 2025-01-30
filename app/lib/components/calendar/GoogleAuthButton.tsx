import React from 'react';
import { View, Pressable, Text, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_CONFIG } from '@/lib/config/google';
import { calendarApi } from '@/lib/api/calendar';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuthButton() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CONFIG.webClientId,
    clientId: GOOGLE_CONFIG.clientId,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleToken(authentication);
    }
  }, [response]);

  const handleGoogleToken = async (authentication: any) => {
    try {
      await calendarApi.connectGoogle({
        access_token: authentication.accessToken,
        refresh_token: authentication.refreshToken
      });
      Alert.alert('Success', 'Calendar connected successfully');
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      Alert.alert('Error', 'Failed to connect calendar');
    }
  };

  return (
    <Pressable 
      onPress={() => promptAsync()}
      disabled={!request}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="calendar" size={24} color="#6366f1" />
        <Text style={{ marginLeft: 8 }}>Connect Google Calendar</Text>
      </View>
    </Pressable>
  );
}