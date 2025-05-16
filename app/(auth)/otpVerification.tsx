import React, { useState } from "react";
import {
  Alert,
  Button,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import axios from "axios";
import { API_ENDPOINT } from "@/apiConfig";
import { useLocalSearchParams, useRouter } from "expo-router";
import InputField from "@/components/InputField";
import { images } from "@/constants";
import CustomButton from "@/components/CustomButton";

const OTPVerification = () => {
 
  const { phone } = useLocalSearchParams();
  const router = useRouter();
  const [otp, setOTP] = useState("");

  const onVerifyPress = async () => {
    try {
      const response = await axios.post(
        `${API_ENDPOINT}/api/customer/verify-otp`,
        { phone, otp }
      );
      Alert.alert("Success", response.data.message);
      
      router.push("/(auth)/sign-in");
    } catch (error) {
      const err = error as any;
      console.error(err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "OTP Verification failed."
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
            Please enter the OTP sent to {phone}
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="OTP"
            placeholder="Enter OTP"
            value={otp}
            onChangeText={(text) => setOTP(text)}
            style={{ padding: 10, borderWidth: 1, marginBottom: 10 }}
            keyboardType="numeric"
          />
        </View>
        <CustomButton
          title="Verify"
          onPress={onVerifyPress}
          className="flex-1 ml-2"
        />
      </View>
    </ScrollView>
  );
};

export default OTPVerification;
