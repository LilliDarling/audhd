import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Page Not Found</Text>
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: '#6366f1' }}>Go Back</Text>
      </Pressable>
    </View>
  );
}