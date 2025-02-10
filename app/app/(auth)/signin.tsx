import { useState } from "react";
import { Text, TextInput, View, Pressable } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Image } from 'expo-image';
import { getAuth, } from "firebase/auth";
//@ts-ignore
// import { signInWithRedirect } from '@firebase/auth/dist/rn/index.js';
import { useSession } from "@/lib/context/SessionProvider";

/**
 * SignIn component handles user authentication through email and password
 * @returns {JSX.Element} Sign-in form component
 */
export default function Signin() {
  // ============================================================================
  // Hooks & State
  // ============================================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useSession();

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handles the sign-in process
   * @returns {Promise<Models.User<Models.Preferences> | null>}
   */
  const handleLogin = async () => {
    try {
      return await signIn(email, password);
    } catch (err) {
      console.log("[handleLogin] ==>", err);
      return null;
    }
  };

  /**
   * Handles the sign-in button press
   */
  const handleSignInPress = async () => {
    const resp = await handleLogin();
    router.replace("/(tabs)");
  };

  const handleSocialSignin = async (provider: 'google' | 'facebook' | 'linkedin') => {
    console.log('handleSocialSignin', { provider })

    const auth = getAuth();
    // signInWithRedirect(auth, googleProvider);
    // router.replace("/(app)/(drawer)/(tabs)/");
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <SafeAreaView className="flex h-full w-full justify-center items-center bg-dull-primary">
      {/* Welcome Section */}
      <View className="items-center">
        <Image
          source={require('@/assets/images/adeptexec-logo/wide.png')}
          className="w-full h-36 m-6"
          contentFit="scale-down"
        />
        <Text className="text-2xl font-bold text-gray-800 mb-2">
          Welcome Back!
        </Text>
        <Text className="text-sm text-gray-500">
          Sign in to continue
        </Text>
      </View>


      <View className="flex flex-row justify-center items-center gap-4 m-6">
        <Pressable
          onPress={() => handleSocialSignin('google')} className="w-full">
          <Image
            source={require('@/assets/images/signin/google.png')}
            className="w-full h-12"
            contentFit="scale-down"
          />
        </Pressable>

        <Pressable
          onPress={() => handleSocialSignin('facebook')} className="w-full">
          <Image
            source={require('@/assets/images/signin/fb-black.png')}
            className="w-full h-12"
            contentFit="scale-down"
          />
        </Pressable>

        <Pressable
          onPress={() => handleSocialSignin('linkedin')} className="w-full">
          <Image
            source={require('@/assets/images/signin/linkedin.png')}
            className="w-full h-12"
            contentFit="scale-down"
          />

        </Pressable>
      </View>

      {/* Social Login */}
      {/* <View className="w-full max-w-[300px] space-y-4 mb-8" >

        <View>
          <Pressable
            onPress={() => handleSocialSignin('google')}
            className="bg-red-400 w-full max-w-[300px] py-3 rounded-lg active:bg-blue-700"
          >
            <Text className="text-white font-semibold text-base text-center">
              Sign In With Google
            </Text>
          </Pressable>
        </View>

        <View>
          <Pressable
            onPress={() => handleSocialSignin('facebook')}
            className="bg-blue-500 w-full max-w-[300px] py-3 rounded-lg active:bg-blue-700"
          >
            <Text className="text-white font-semibold text-base text-center">
              Sign In With Facebook
            </Text>
          </Pressable>
        </View>
      </View> */}


      {/* Form Section */}
      <View className="w-full max-w-[300px] space-y-4 mb-8">
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
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            className="w-full p-3 border border-gray-300 rounded-lg text-base bg-white"
          />
        </View>
      </View>

      {/* Sign In Button */}
      <Pressable
        onPress={handleSignInPress}
        className="w-full max-w-[300px] p-3 border rounded bg-pop-primary hover:bg-pop-secondary/80"
      >
        <Text className="text-center font-semibold">Sign In</Text>
      </Pressable>

      {/* Sign Up Link */}
      <View className="flex-row items-center mt-6">
        <Text className="text-gray-600">Don't have an account?</Text>
        <Link href="/signup" asChild>
          <Pressable className="ml-2">
            <Text className="text-blue-600 font-semibold">Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}
