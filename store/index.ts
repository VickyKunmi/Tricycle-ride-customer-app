import {create} from "zustand"
import {LocationStore, DriverStore, MarkerData} from "@/types/types"
import { getDistanceKm } from "@/lib/distance";

// export const useLocationStore = create<LocationStore>((set) => ({
//     userLatitude: null,
//     userLongitude: null,
//     userAddress: null,
//     destinationLatitude: null,
//     destinationLongitude: null,
//     destinationAddress: null,
//     setUserLocation: ({
//       latitude,
//       longitude,
//       address,
//     }: {
//       latitude: number;
//       longitude: number;
//       address: string;
//     }) => {
//       set(() => ({
//         userLatitude: latitude,
//         userLongitude: longitude,
//         userAddress: address,
//       }));
  
//       // if driver is selected and now new location is set, clear the selected driver
//       const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
//       if (selectedDriver) clearSelectedDriver();
//     },
  
//     setDestinationLocation: ({
//       latitude,
//       longitude,
//       address,
//     }: {
//       latitude: number;
//       longitude: number;
//       address: string;
//     }) => {
//       set(() => ({
//         destinationLatitude: latitude,
//         destinationLongitude: longitude,
//         destinationAddress: address,
//       }));
  
//       // if driver is selected and now new location is set, clear the selected driver
//       const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
//       if (selectedDriver) clearSelectedDriver();
//     },
//   }));



export const useLocationStore = create<LocationStore>((set, get) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  estimatedFare: 0,
  estimatedTime: 0,

  setUserLocation: ({ latitude, longitude, address }) =>
    set({ userLatitude: latitude, userLongitude: longitude, userAddress: address }),

  setDestinationLocation: ({ latitude, longitude, address }) => {
    const { userLatitude, userLongitude } = get();
    if (userLatitude == null || userLongitude == null) {
      return set({ destinationLatitude: latitude, destinationLongitude: longitude, destinationAddress: address });
    }

    const distanceKm = getDistanceKm(userLatitude, userLongitude, latitude, longitude);
    const baseFare = 2.0;
    const perKmRate = 1.5;
    const fare = baseFare + perKmRate * distanceKm;
    const avgSpeedKmh = 25;
    const timeMin = (distanceKm / avgSpeedKmh) * 60;
    console.log("Distance (km):", distanceKm.toFixed(2));

    set({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
      estimatedFare: parseFloat(fare.toFixed(2)),
      estimatedTime: Math.ceil(timeMin),
    });
  },

  setEstimatedFare: (fare) => set({ estimatedFare: fare }),
  setEstimatedTime: (time) => set({ estimatedTime: time }),
}));



  export const useDriverStore = create<DriverStore>((set) => ({
    drivers: [] as MarkerData[],
    selectedDriver: null,
    setSelectedDriver: (driverId: number) =>
      set(() => ({ selectedDriver: driverId })),
    setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
    clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
  }));
  