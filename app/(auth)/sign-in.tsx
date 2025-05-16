import React, { useContext, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_ENDPOINT } from "@/apiConfig";
import { images } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { Link, useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";

const SignIn = () => {
  const { signIn } = useContext(AuthContext);
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    password: "",
  });

  const onLoginPress = async () => {
    try {
      await signIn(form.phone, form.password);
      router.push(`/(root)/(tabs)/home`);
    } catch (err: any) {
      if (err.message.includes("Session expired")) {
        Alert.alert(
          "Session Expired",
          "Your session has expired. Please log in again."
        );

        await AsyncStorage.removeItem("jwtToken");

        router.push("/sign-in");
      } else {
        Alert.alert("Error", err.message);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image
            source={images.signUpTricycle}
            className="z-0 w-full h-[250px]"
          />
          <Text className="text-2xl text-white font-JakartaSemiBold absolute bottom-5 left-5">
            Welcome 👋
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Phone number"
            placeholder="Phone Number"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
          />
          <InputField
            label="Password"
            placeholder="Password"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry
          />
          <CustomButton title="Login" onPress={onLoginPress} className="mt-6" />
          <Link
            href="/sign-up"
            className="text-lg text-center text-blue-500 mt-10"
          >
            Don't have an account?{" "}
            <Text className="text-primary-500">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
