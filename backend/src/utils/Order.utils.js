import crypto from "crypto"
export const orderIdHelper=()=>{
    const orderId="ORD-0"+crypto.randomBytes(4).toString("hex").toUpperCase();
    return orderId;
};
export const calculateDistanceHelper=(lat1,lon1,lat2,lon2)=>{
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return Number(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
export const calculateFareHelper= (distanceKm)=>{
     const BASE_FARE = Number(process.env.BASE_FARE);
     const PER_KM_RATE = Number(process.env.PER_KM_RATE);

      const estimateFare = (BASE_FARE + (distanceKm * PER_KM_RATE)).toFixed(2);
      return Number(estimateFare);
};