// hooks/useRideNotifications.ts
import { useEffect, useContext, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "@/contexts/AuthContext";
import { Alert } from "react-native";
import { API_ENDPOINT } from "@/apiConfig";

export default function useRideNotifications(refreshRides: () => void) {
  const { user, token } = useContext(AuthContext);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.id || !token) return;

    const socket = io(API_ENDPOINT, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", { userId: user.id });
    });

    // assignment
    socket.on("ride:assigned", ({ message }) => {
      Alert.alert("Ride Assigned!", message, [
        {
          text: "OK",
          onPress: () => {
            // only refresh after user dismisses the alert
            refreshRides();
          },
        },
      ]);
    });

    // cancellation
    socket.on("ride:cancelled", ({ message }) => {
      Alert.alert("Ride Cancelled", message, [
        {
          text: "OK",
          onPress: () => {
            refreshRides();
          },
        },
      ]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, token, refreshRides]);
}
