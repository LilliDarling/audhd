import React from 'react';
import { View, Pressable, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useCalendar } from '@/lib/hooks/useCalendar';
import { GOOGLE_CONFIG } from '@/lib/config/google';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleAuthButton() {
  const { connectCalendar, isConnecting, isConnected } = useCalendar();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CONFIG.clientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
    webClientId: GOOGLE_CONFIG.webClientId,
    scopes: ['https://www.googleapis.com/auth/calendar'],
    redirectUri: makeRedirectUri({
      scheme: 'myapp'
    }),
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleToken(authentication);
    }
  }, [response]);

  const handleGoogleToken = async (authentication: any) => {
    try {
      const success = await connectCalendar({
        access_token: authentication.accessToken,
        refresh_token: authentication.refreshToken
      });
      
      if (success) {
        Alert.alert('Success', 'Calendar connected successfully');
      } else {
        Alert.alert('Error', 'Failed to connect calendar');
      }
    } catch (error) {
      console.error('Failed to connect calendar:', error);
      Alert.alert('Error', 'Failed to connect calendar');
    }
  };

  if (isConnected) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="logo-google" size={24} color="#22c55e" />
        <Text style={{ marginLeft: 8 }}>Calendar Connected</Text>
      </View>
    );
  }

  return (
    <Pressable 
      onPress={() => promptAsync()}
      disabled={!request || isConnecting}
      style={({ pressed }) => ({
        opacity: (pressed || isConnecting) ? 0.5 : 1
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="calendar" size={24} color="#6366f1" />
        <Text style={{ marginLeft: 8 }}>
          {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
        </Text>
      </View>
    </Pressable>
  );
}