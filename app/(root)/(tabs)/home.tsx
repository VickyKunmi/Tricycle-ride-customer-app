import React, { useState, useEffect, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { AuthContext } from "@/contexts/AuthContext";
import axios from "axios";
import { API_ENDPOINT } from "@/apiConfig";
import RideCard from "@/components/RideCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "@/constants";
import { useLocalSearchParams, useRouter } from "expo-router";
import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import { useLocationStore } from "@/store";
import useRideNotifications from "@/hooks/useRideNotofocation";
import useDriverSocket from "@/hooks/useDriverSocket";
import { io } from "socket.io-client";

const Home: React.FC = () => {
  const { user, signOut, token } = useContext(AuthContext);
  const router = useRouter();

  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const setUserLocation = useLocationStore((state) => state.setUserLocation);

  const { setDestinationLocation } = useLocationStore();
  
    


  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    console.log("Selected location:", location);
    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };
  

 
  const [recentRides, setRecentRides] = useState<any[]>([]);

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const granted = status === "granted";
    setHasPermission(granted);

    if (granted) {
      const loc = await Location.getCurrentPositionAsync({});

      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      const [place] = await Location.reverseGeocodeAsync(coords);
      const address = [
        place.name,
        place.street,
        place.district,
        place.city,
        place.region,
        place.country,
      ]
        .filter(Boolean)
        .join(", ");

      setUserLocation({
        ...coords,
        address,
      });
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);



  


  const fetchRecentRides = async ()  => {

    if (!user?.id) return;
    try {
      const res = await axios.get(`${API_ENDPOINT}/api/ride/recent/${user.id}`);
      setRecentRides(res.data);
    } catch (err: any) {
      console.warn(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
   
  }
  
  useDriverSocket(fetchRecentRides);
  
  useEffect(() => {
   fetchRecentRides()
  }, [user]);




  
  
  if (hasPermission === null) {
    return (
      <View style={styles.msg}>
        <Text>Checking location permissions...</Text>
      </View>
    );
  }
  if (!hasPermission) {
    return (
      <View style={styles.msg}>
        <Text>Please allow location to continue.</Text>
        <TouchableOpacity onPress={requestPermissions} style={styles.btn}>
          <Text style={styles.btnText}>Allow Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={recentRides.slice(0, 5)}
       
        renderItem={({ item }) => <RideCard ride={item} refreshRides={fetchRecentRides} />}
        keyExtractor={(item) => item._id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <Image source={images.noResult} style={styles.noResImg} />
                <Text>No recent rides found</Text>
              </>
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Welcome {user?.fullName} 👋</Text>
              <TouchableOpacity
                onPress={handleSignOut}
                style={styles.signOutBtn}
              >
                <Image source={icons.out} style={styles.signOutIcon} />
              </TouchableOpacity>
            </View>


            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <GoogleTextInput
                icon={icons.search}
                containerStyle="bg-white shadow-md shadow-neutral-300"
                handlePress={handleDestinationPress}
              />
            </View>

            <Text style={styles.sectionTitle}>Your current location</Text>
            <View style={styles.mapContainer}>
              <Map showDestination={false} showRoute={false} />
            </View>

            <Text style={styles.sectionTitle}>Recent Rides</Text>
          </>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  msg: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  btn: { backgroundColor: "blue", padding: 10, borderRadius: 5, marginTop: 10 },
  btnText: { color: "white" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: 16,
  },
  title: { fontSize: 24, fontWeight: "800" },
  signOutBtn: { backgroundColor: "#FFF", padding: 8, borderRadius: 20 },
  signOutIcon: { width: 16, height: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginTop: 16,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  empty: { justifyContent: "center", alignItems: "center", height: 200 },
  noResImg: { width: 120, height: 120, resizeMode: "contain" },
});

export default Home;
