import { useState } from "react";
import { Text, TextInput, View, Pressable } from "react-native";
import { router, Link } from "expo-router";
import { Image } from 'expo-image';
import { useSession } from "@/lib/context/SessionProvider";
import { authApi } from "@/lib/api/auth";
import { SignUpRequest } from "@/lib/types/auth";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { signUp } = useSession();

  const handleSignUpPress = async () => {
    try {
      const resp = await signUp(email, password, name);
      // console.log(resp)
      if (resp) {
        const user: SignUpRequest = {
          username: name.toLowerCase(),
          password,
          name,
          email
        }
        console.log({ user })
        const mongoUser = await authApi.signUp(user);
        console.log({ mongoUser })
        router.replace("/(auth)/signin");
      }
    } catch (err) {
      console.log("[handleRegister] ==>", err);
      return null;
    }



  };

  return (
    <View className="flex-1 justify-center items-center">
      {/* Welcome Section */}
      <View className="items-center mb-8">
        <Image
          source={require('@/assets/images/adeptexec-logo/wide.png')}
          className="w-full h-36 m-6"
          contentFit="scale-down"
        />
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Create Account
        </Text>
        <Text className="text-sm text-gray-500">
          Sign up to get started
        </Text>
      </View>

      {/* Form Section */}
      <View className="w-full max-w-[300px] space-y-4 mb-8">
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
            Name
          </Text>
          <TextInput
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            textContentType="name"
            autoCapitalize="words"
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
            Email
          </Text>
          <TextInput
            placeholder="name@mail.com"
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">
            Password
          </Text>
          <TextInput
            placeholder="Create a password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
          />
        </View>
      </View>

      {/* Sign Up Button */}
      <Pressable
        onPress={handleSignUpPress}
        className="w-full max-w-[300px] p-3 border rounded bg-pop-secondary/80 hover:bg-pop-primary/80"
      >
        <Text className="text-center font-semibold">Sign Up</Text>
      </Pressable>

      {/* Sign In Link */}
      <View className="flex-row items-center mt-6">
        <Text className="text-gray-600">Already have an account?</Text>
        <Link href="/signin" asChild>
          <Pressable className="ml-2">
            <Text className="text-blue-600 font-semibold">Sign In</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
