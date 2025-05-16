import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import MapView, {
  Marker,
  UrlTile,
  PROVIDER_DEFAULT,
  Region,
  LatLng,
  Polyline,
} from "react-native-maps";

import { icons } from "@/constants";
import { calculateDriverTimes, generateMarkersFromData } from "@/lib/map";
import { useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/types";
import { API_ENDPOINT } from "@/apiConfig";
import axios from "axios";

type MapProps = {
  showDestination?: boolean;
  showRoute?: boolean;
};

const Map: React.FC<MapProps> = ({
  showDestination = true,
  showRoute = true,
}) => {
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);

  const [region, setRegion] = useState<Region>({
    latitude: userLatitude ?? 0,
    longitude: userLongitude ?? 0,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  // Debug logging
  useEffect(() => {
    if (userLatitude && userLongitude) {
      console.log("User Location:", userLatitude, userLongitude);
    }
  }, [userLatitude, userLongitude]);

  // 1. fetch drivers
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<Driver[]>(
          `${API_ENDPOINT}/api/rider/approved`
        );
        setDrivers(res.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (userLatitude && userLongitude && drivers.length) {
      setMarkers(
        generateMarkersFromData({
          data: drivers,
          userLatitude,
          userLongitude,
        })
      );
      setRegion((r) => ({
        ...r,
        latitude: userLatitude,
        longitude: userLongitude,
      }));
    }
  }, [drivers, userLatitude, userLongitude]);

  useEffect(() => {
    if (
      userLatitude != null &&
      userLongitude != null &&
      destinationLatitude != null &&
      destinationLongitude != null
    ) {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${userLongitude},${userLatitude};` +
        `${destinationLongitude},${destinationLatitude}` +
        `?overview=full&geometries=geojson`;

      fetch(url)
        .then((r) => r.json())
        .then((json) => {
          const coords: LatLng[] = json.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => ({
              latitude: lat,
              longitude: lng,
            })
          );
          setRouteCoords(coords);
        })
        .catch((err) => console.warn("OSRM route error:", err));
    }
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  if (loading || userLatitude == null || userLongitude == null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loader}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={styles.map}
      initialRegion={region}
      onRegionChangeComplete={setRegion}
      showsUserLocation
      userInterfaceStyle="light"
      mapType="standard"
    >
      <UrlTile
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />

      <Marker
        coordinate={{
          latitude: userLatitude,
          longitude: userLongitude,
        }}
        title="You"
        image={icons.pin}
      />

      {/* Destination marker */}
      {showDestination &&
        destinationLatitude != null &&
        destinationLongitude != null && (
          <Marker
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.marker}
          />
        )}
      {/* Route polyline */}
      {showRoute && routeCoords.length > 0 && (
        <Polyline coordinates={routeCoords} strokeWidth={3} />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: { flex: 1, borderRadius: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default Map;
