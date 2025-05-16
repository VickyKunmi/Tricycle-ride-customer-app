import React, { useState } from "react";
import { Alert, Image, ScrollView, View, Text } from "react-native";
import axios from "axios";
import { API_ENDPOINT } from "@/apiConfig";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { Link, useRouter } from "expo-router";

const SignUp = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const onSignUpPress = async () => {
    if (form.password !== form.confirmPassword) {
      Alert.alert("Error", "Passwords do not match!");
      return;
    }

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      };

      const response = await axios.post(
        `${API_ENDPOINT}/api/customer/register`,
        payload
      );
      Alert.alert("Success", response.data.message);

      router.push(`/(auth)/otpVerification?phone=${form.phone}`);
    } catch (error) {
      const err = error as any;
      console.error(err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Registration failed."
      );
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
          <Text className="text-2xl text-white font-JakartaSemiBold absolute bottom-20 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Full Name"
            placeholder="Full Name"
            icon={icons.person}
            value={form.fullName}
            onChangeText={(text) => setForm({ ...form, fullName: text })}
          />
          <InputField
            label="Email"
            placeholder="Email"
            icon={icons.email}
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <InputField
            label="Phone Number"
            placeholder="Phone Number"
            icon={icons.phone}
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
          />
          <InputField
            label="Password"
            placeholder="Password"
            icon={icons.lock}
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry
          />
          <InputField
            label="Confirm Password"
            placeholder="Confirm Password"
            icon={icons.lock}
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            secureTextEntry
          />
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="flex-1 ml-2 mt-4"
          />
        </View>
        <Link
          href="/sign-in"
          className="text-lg text-center text-blue-500 mt-10 mb-5"
        >
          Already have an account? Log In
        </Link>
      </View>
    </ScrollView>
  );
};

export default SignUp;
