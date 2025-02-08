import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex h-full w-full items-center justify-center">
      <Text className="m-2 text-2xl font-bold">Page Not Found</Text>
      <Pressable onPress={() => router.back()}>
          <Text className="border rounded px-6 py-2 mt-6 bg-pop-primary hover:bg-pop-secondary/80">
          Go Back</Text>
      </Pressable>
    </View>
  );
}