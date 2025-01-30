import React, { useState } from 'react';
import { View, Pressable, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GOOGLE_CONFIG } from '@/lib/config/google';
import { calendarApi } from '@/lib/api/calendar';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuthButton() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CONFIG.webClientId,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    redirectUri: 'http://localhost:8082',
    usePKCE: true,
    responseType: 'token'
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { access_token, refresh_token } = response.params;
      handleTokens(access_token, refresh_token);
    }
  }, [response]);

  const handleTokens = async (accessToken: string, refreshToken?: string) => {
    try {
      setIsAuthenticating(true);
      await calendarApi.connectGoogle({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      });
      setIsConnected(true);
      Alert.alert('Success', 'Calendar connected successfully');
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      Alert.alert('Error', 'Failed to connect calendar');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePress = async () => {
    if (!request || !request.url) {
      Alert.alert('Error', 'Authentication request is not ready');
      return;
    }
  
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        request.url,
        'http://localhost:8082'
      );
  
      if (result.type === 'success') {
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
  
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');
  
        if (access_token) {
          handleTokens(access_token, refresh_token || '');
        } else {
          Alert.alert('Error', 'Failed to retrieve access token');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      Alert.alert('Error', 'Authentication failed');
    }
  };

  return (
    <Pressable 
      onPress={handlePress}
      disabled={!request || isAuthenticating || isConnected}
      style={({ pressed }) => ({
        opacity: (pressed || isAuthenticating || isConnected) ? 0.5 : 1
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons 
          name="calendar" 
          size={24} 
          color="#6366f1" 
        />
        <Text style={{ marginLeft: 8 }}>
          {isConnected ? "Connected" : isAuthenticating ? 'Connecting...' : 'Connect Google Calendar'}
        </Text>
      </View>
    </Pressable>
  );
}