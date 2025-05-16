import { TextInputProps, TouchableOpacityProps } from "react-native";

declare interface ButtonProps extends TouchableOpacityProps {
    title: string;
    bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
    textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
    className?: string;
  }



  declare interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: any;
    secureTextEntry?: boolean;
    labelStyle?: string;
    containerStyle?: string;
    inputStyle?: string;
    iconStyle?: string;
    className?: string;
  }



declare interface Ride {
  _id: string;
  customer: string;
  driver?: {
    _id: string;
    fullName: string;
    tricycleNumberPlate: string;
    tricycleColor: string
    phone: string
    image: string
  };
  origin_address: string;
  origin_latitude: number;
  origin_longitude: number;
  destination_address: string;
  destination_latitude: number;
  destination_longitude: number;
  ride_time: number;      
  fare_price: number;
  payment_status: "paid" | "pending";
  status: "pending" | "assigned" | "in_transit" | "completed";
  created_at: string;     // ISO date string
}



declare interface GoogleInputProps {
  icon?: string;
  initialLocation?: string;
  containerStyle?: string;
  textInputBackgroundColor?: string;
  handlePress: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}



declare interface Driver {
  _id: string;
  fullName: string;
  phone: string;
  image: string;
  tricycleColor: string;
  rating: number;
}


declare interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  image: string;
  tricycleColor: string;
  rating: number;
  fullName: string;
  time?: number;
  price?: string;
}



declare interface LocationStore {
  userLatitude: number | null;
  userLongitude: number | null;
  userAddress: string | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  destinationAddress: string | null;
  estimatedFare: number;
  estimatedTime: number;
  setEstimatedFare: (fare: number) => void;
  setEstimatedTime: (time: number) => void;
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}




declare interface DriverStore {
  drivers: MarkerData[];
  selectedDriver: number | null;
  setSelectedDriver: (driverId: number) => void;
  setDrivers: (drivers: MarkerData[]) => void;
  clearSelectedDriver: () => void;
}


declare interface DriverCardProps {
  item: MarkerData;
  selected: number;
  setSelected: () => void;
}
