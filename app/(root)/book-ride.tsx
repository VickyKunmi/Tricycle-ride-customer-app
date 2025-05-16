import React, { useContext, useEffect, useState, useCallback } from "react";
import { View, Text, Alert, Button } from "react-native";
import { Linking } from "react-native";
import axios from "axios";
import { AuthContext } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/apiConfig";
import { useLocationStore } from "@/store";
import RideLayout from "@/components/RideLayout";
import CustomButton from "@/components/CustomButton";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";

const BookRide: React.FC = () => {
  const { user } = useContext(AuthContext);
  const {
    userAddress,
    destinationAddress,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    estimatedFare,
    estimatedTime,
  } = useLocationStore();

  const amount = Math.round(estimatedFare * 100);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const router = useRouter();

  const requestRide = useCallback(async () => {
    try {
      const rideDetails = {
        customer: user!.id,
        origin_address: userAddress,
        origin_latitude: userLatitude,
        origin_longitude: userLongitude,
        destination_address: destinationAddress,
        destination_latitude: destinationLatitude,
        destination_longitude: destinationLongitude,
        fare_price: estimatedFare,
        ride_time: estimatedTime,
      };

      const { data } = await axios.post(
        `${API_ENDPOINT}/api/ride/create`,
        rideDetails
      );

      if (data.ride) {
        Alert.alert("Ride Requested", "Your ride has been booked!");
        router.push("/(root)/(tabs)/rides");
      } else {
        throw new Error("Could not create ride");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not request ride.");
    }
  }, [
    user,
    userAddress,
    userLatitude,
    userLongitude,
    destinationAddress,
    destinationLatitude,
    destinationLongitude,
    estimatedFare,
  ]);

  if (!user) {
    return <Text>You must be signed in to book a ride.</Text>;
  }

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <RideLayout title="Book Ride">
        <Text className="text-xl font-JakartaSemiBold mb-3">
          Ride Information
        </Text>
        <View className="flex flex-col w-full items-center justify-center mt-10">
          <Text className="text-lg font-JakartaRegular">
            From: {userAddress}
          </Text>
        </View>
        <View className="flex flex-col w-full items-center justify-center mt-10">
          <Text className="text-lg font-JakartaRegular">
            To: {destinationAddress}
          </Text>
        </View>
        <View className="flex flex-col w-full  mt-10">
          <Text className="text-lg font-JakartaRegular">
            Fare: ₵{estimatedFare ? estimatedFare.toFixed(2) : "N/A"}
          </Text>
        </View>
        <View className="flex flex-col w-full  mt-10">
          <Text className="text-lg font-JakartaRegular">
            Total Time: {Math.round(estimatedTime)} min
          </Text>
        </View>
        <View className="flex flex-col w-full  mt-10">
          <CustomButton title="Request a ride" onPress={requestRide} />
        </View>
      </RideLayout>
    </View>
  );
};

export default BookRide;
