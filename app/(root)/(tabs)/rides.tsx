import { API_ENDPOINT } from "@/apiConfig";
import RideCard from "@/components/RideCard";
import { images } from "@/constants";
import { AuthContext } from "@/contexts/AuthContext";
import useDriverSocket from "@/hooks/useDriverSocket";
import useRideNotifications from "@/hooks/useRideNotofocation";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const rides = () => {
  const { user } = useContext(AuthContext);
  const [recentRides, setRecentRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentRides = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${API_ENDPOINT}/api/ride/recent/${user.id}`);
      setRecentRides(res.data);
    } catch (err: any) {
      console.warn(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useDriverSocket(fetchRecentRides);

  useEffect(() => {
    fetchRecentRides();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={recentRides}
        renderItem={({ item }) => (
          <RideCard ride={item} refreshRides={fetchRecentRides} />
        )}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-JakartaBold my-5">All Rides</Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default rides;
