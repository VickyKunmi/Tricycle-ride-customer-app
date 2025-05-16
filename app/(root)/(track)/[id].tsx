import { useEffect, useState, useContext, useRef } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Text,
  View,
} from "react-native";
import MapView, {
  PROVIDER_DEFAULT,
  Marker,
  Region,
  Polyline,
} from "react-native-maps";
import { io } from "socket.io-client";
import { API_ENDPOINT } from "@/apiConfig";
import { AuthContext } from "@/contexts/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";

type RouteParams = {
  id: string;
  destinationLat: string;
  destinationLng: string;
  originLat: string;
  originLng: string;
};

const TrackRide = () => {
  const { token } = useContext(AuthContext);
  const {
    id: rideId,
    destinationLat,
    destinationLng,
    originLat,
    originLng,
  } = useLocalSearchParams<RouteParams>();

  const origin = {
    latitude: parseFloat(originLat),
    longitude: parseFloat(originLng),
  };

  const destination = {
    latitude: parseFloat(destinationLat),
    longitude: parseFloat(destinationLng),
  };

  const [riderLocation, setRiderLocation] = useState(origin);
  const [loading, setLoading] = useState(true);
  const [fare, setFare] = useState<number | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (riderLocation.latitude !== 0 && riderLocation.longitude !== 0) {
      setMapRegion({
        latitude: riderLocation.latitude,
        longitude: riderLocation.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [riderLocation]);

  console.log("destination: ", destination);
  console.log("riderLocation: ", riderLocation);
  useEffect(() => {
    if (!rideId) {
      console.error("No ride ID found");
      return;
    }

    const socket = io(API_ENDPOINT, {
      query: { token },
    });

    socket.on("driver:location", (data) => {
      if (data.rideId === rideId) {
        const newLoc = {
          latitude: data.latitude,
          longitude: data.longitude,
        };
        setRiderLocation(newLoc);

        // Animate map to new region
        mapRef.current?.animateToRegion(
          {
            ...newLoc,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000 // duration
        );
      }
    });

    socket.on("ride:arrived", (data) => {
      if (data.rideId === rideId) {
        setFare(data.fare);
        Alert.alert(
          "Arrived",
          `Your rider has arrived at your destination.\nFare: ₵${data.fare.toFixed(
            2
          )}`,
          [
            {
              text: "OK",
              onPress: () => {
                router.replace({
                  pathname: "/(root)/(tabs)/home",
                  params: { tab: "completed" },
                });
              },
            },
          ]
        );
      }
    });

    socket.on("connect", () => {
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [rideId, token]);

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  console.log("Polyline Coordinates", [riderLocation, destination]);

  return (
    <SafeAreaView style={styles.container}>
      <RideLayout
        title="Track Ride"
        hideMap={true}
        topChildren={
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={{ flex: 1 }}
            initialRegion={{
              ...riderLocation,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={riderLocation}
              image={icons.marker}
              title="Rider's Location"
            />
            <Marker
              coordinate={destination}
              title="Destination"
              image={icons.selectedMarker}
            />
            {riderLocation.latitude && destination.latitude && (
              <Polyline
                coordinates={[riderLocation, destination]}
                strokeWidth={4}
                strokeColor="#0A84FF"
              />
            )}
          </MapView>
        }
      >
        <View style={{ padding: 20 }}>
          <Text>Ride is in progress...</Text>
          {fare && (
            <Text style={{ marginTop: 10, fontSize: 18 }}>
              Fare: ₵{fare.toFixed(2)}
            </Text>
          )}
        </View>
      </RideLayout>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default TrackRide;
