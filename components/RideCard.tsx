import { API_ENDPOINT } from "@/apiConfig";
import { icons } from "@/constants";
import { AuthContext } from "@/contexts/AuthContext";
import { formatDate, formatDuration, formatTime } from "@/lib/utils";
import { Ride } from "@/types/types";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useContext, useState } from "react";
import { Share } from "react-native";
import { Alert, Button, Image, Modal, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";

async function handleShareRide(ride: Ride) {
  
  if (!ride.driver) {
    Alert.alert(
      "No driver assigned",
      "Can't share ride details until a driver is assigned."
    );
    return;
  }

  const { fullName, phone, tricycleNumberPlate, tricycleColor } = ride.driver;

 
  const lat = ride.origin_latitude; 
  const lng = ride.origin_longitude; 

  const trackingLink = `${API_ENDPOINT}/track/${ride._id}`;

  const message = `
Ride Details:
Driver: ${fullName}
Phone: ${phone}
Plate No: ${tricycleNumberPlate}
Tricycle Color: ${tricycleColor}
Status: ${ride.status}
Current Location: Lat: ${lat}, Lng: ${lng}
Destination: ${ride.destination_address}

Track the ride and stay updated on the progress here: ${trackingLink}
`;

  try {
    await Share.share({ message });
  } catch {
    Alert.alert("Error", "Unable to share ride details.");
  }
}

const RideCard = ({
  ride,
  refreshRides,
}: {
  ride: Ride;
  refreshRides: () => void;
}) => {
  const router = useRouter();

  const { token } = useContext(AuthContext);

  const [showDriverModal, setShowDriverModal] = useState(false);

  const handleCancelRide = async (rideId: string) => {
    try {
      const res = await axios.delete(
        `${API_ENDPOINT}/api/ride/${rideId}/cancel`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      Alert.alert("Success", "Ride cancelled successfully");
      refreshRides();
    } catch (error: any) {
      console.error("Cancel error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to cancel ride"
      );
    }
  };

  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[80px] h-[90px] rounded-lg"
          />

          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {ride.origin_address}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {ride.destination_address}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Date & Time
            </Text>
            <Text className="text-md font-JakartaBold" numberOfLines={1}>
              {formatDate(ride.created_at)},{" "}
              {ride.ride_time ? formatDuration(Number(ride.ride_time)) : "N/A"}
            </Text>
          </View>
          <View className="flex flex-row items-center w-full justify-between mb-5">
            {ride.driver ? (
              <>
                {/* 2) “View Driver” button */}
                {(ride.status === "assigned" ||
                  ride.status === "in_transit") && (
                  <TouchableOpacity
                    onPress={() => setShowDriverModal(true)}
                    className="bg-blue-600 rounded-md px-4 py-2 mb-5"
                  >
                    <Text className="text-white text-center">View Driver</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
             
              <>
                <Text className="text-yellow-500 mb-3">
                  Waiting for a driver to accept...
                </Text>
                <TouchableOpacity
                  onPress={() => handleCancelRide(ride._id)}
                  className="bg-red-500 rounded-md px-4 py-2"
                >
                  <Text className="text-white">Cancel Ride</Text>
                </TouchableOpacity>
              </>
            )}

            {ride.status === "in_transit" && (
              <TouchableOpacity
                onPress={() => handleShareRide(ride)}
                className="bg-blue-600 rounded-md px-4 py-2 mb-5"
              >
                <Text className="text-white text-center">
                  Share Ride Details
                </Text>
              </TouchableOpacity>
            )}
          </View>



          {ride.status === "completed" && (
            <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Fare price
            </Text>
            <Text className="text-md font-JakartaMedium">
              {ride.fare_price}
            </Text>
          </View>
            )}
          

          {ride.driver && (
            <Modal
              visible={showDriverModal}
              animationType="slide"
              transparent
              onRequestClose={() => setShowDriverModal(false)}
            >
              <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="w-11/12 bg-white rounded-lg p-5">
                  <Text className="text-xl font-bold mb-3">
                    Driver Information
                  </Text>
                  <Image
                    source={{ uri: ride.driver.image }}
                    className="w-24 h-24 rounded-full self-center mb-4"
                  />
                  <Text className="mb-2">
                    <Text className="font-semibold">Name:</Text>{" "}
                    {ride.driver.fullName}
                  </Text>
                  <Text className="mb-2">
                    <Text className="font-semibold">Phone:</Text>{" "}
                    {ride.driver.phone}
                  </Text>
                  <Text className="mb-2">
                    <Text className="font-semibold">Plate No:</Text>{" "}
                    {ride.driver.tricycleNumberPlate}
                  </Text>
                  <Text className="mb-2">
                    <Text className="font-semibold">Color:</Text>{" "}
                    {ride.driver.tricycleColor}
                  </Text>
                 
                  <Button
                    title="Close"
                    onPress={() => setShowDriverModal(false)}
                  />
                </View>
              </View>
            </Modal>
          )}

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Payment Status
            </Text>
            <Text
              className={`text-md capitalize font-JakartaBold ${
                ride.payment_status === "paid"
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {ride.payment_status}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Ride Status
            </Text>
            <Text
              className={`text-md capitalize font-JakartaBold ${
                ride.status === "pending"
                  ? "text-red-500"
                  : ride.status === "assigned"
                  ? "text-yellow-500"
                  : ride.status === "in_transit"
                  ? "text-orange-800"
                  : "text-green-500"
              }`}
            >
              {ride.status}
            </Text>
          </View>

          {ride.status === "in_transit" && (
            <Button
              title="Track Ride"
              onPress={() =>
                router.push({
                  pathname: "/(root)/(track)/[id]",
                  params: {
                    id: ride._id,
                    originLat: ride.origin_latitude.toString(),
                    originLng: ride.origin_longitude.toString(),
                    destinationLat: ride.destination_latitude.toString(),
                    destinationLng: ride.destination_longitude.toString(),
                  },
                })
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default RideCard;
