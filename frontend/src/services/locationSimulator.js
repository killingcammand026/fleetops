// Real-time Location Simulator for Fleet Management
// Simulates GPS movement for drivers (e.g. when geolocation unavailable on desktop)

import {
  getDriverByIdAPI,
  updateDriverLocationAPI,
} from "./driverService";

class LocationSimulator {
  constructor() {
    this.intervals = new Map();
    this.isRunning = false;
  }

  async getCurrentLocation(driverId, initialLocation = null) {
    try {
      const res = await getDriverByIdAPI(driverId);
      const driver = res?.data ?? res;
      return driver?.location || initialLocation || { lat: 28.6139, lng: 77.2090 };
    } catch {
      return initialLocation || { lat: 28.6139, lng: 77.2090 };
    }
  }

  async updateLocation(driverId, lat, lng) {
    try {
      const res = await updateDriverLocationAPI(driverId, lng, lat);
      return res?.data ?? res;
    } catch (err) {
      console.error("Failed to update driver location:", err);
      return null;
    }
  }

  startSimulation(driverId, initialLocation = null) {
    if (this.intervals.has(driverId)) return;

    const simulateMovement = async () => {
      const current = await this.getCurrentLocation(driverId, initialLocation);
      const speed = 0.001;
      const angle = Math.random() * Math.PI * 2;

      const newLat = current.lat + Math.cos(angle) * speed * (Math.random() - 0.5);
      const newLng = current.lng + Math.sin(angle) * speed * (Math.random() - 0.5);

      const boundedLat = Math.max(28.4, Math.min(28.9, newLat));
      const boundedLng = Math.max(77.0, Math.min(77.3, newLng));

      await this.updateLocation(driverId, boundedLat, boundedLng);
    };

    const intervalId = setInterval(simulateMovement, 3000 + Math.random() * 2000);
    this.intervals.set(driverId, intervalId);
    this.isRunning = true;
  }

  stopSimulation(driverId) {
    const intervalId = this.intervals.get(driverId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(driverId);
    }
  }

  stopAll() {
    this.intervals.forEach((id) => clearInterval(id));
    this.intervals.clear();
    this.isRunning = false;
  }

  calculateDistance(point1, point2) {
    const R = 6371;
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export const locationSimulator = new LocationSimulator();
export default locationSimulator;
