// Order Creation Form for Customers with Interactive Map and Geocoding

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createOrderAPI } from "../../services/orderService";
import { createCustomerAPI } from "../../services/customerService";
import { addOrder } from "../../redux/slices/orderSlice";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for pickup and drop
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const dropIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Geocoding function using Nominatim (OpenStreetMap)
const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display_name: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Map click handler component
const MapClickHandler = ({ onPickupClick, onDropClick, selectingMode }) => {
  useMapEvents({
    click(e) {
      if (selectingMode === 'pickup') {
        onPickupClick(e.latlng);
      } else if (selectingMode === 'drop') {
        onDropClick(e.latlng);
      }
    },
  });
  return null;
};

const orderSchema = z.object({
  pickupLatitude: z.coerce.number(),
  pickupLongitude: z.coerce.number(),
  dropLatitude: z.coerce.number(),
  dropLongitude: z.coerce.number(),
  paymentMethod: z.string().min(1, "Payment method is required"),
});

const CreateOrderForm = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [selectingMode, setSelectingMode] = useState(null); // 'pickup' | 'drop' | null
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropAddress, setDropAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(orderSchema),
  });

  // Update form values when locations change
  useEffect(() => {
    if (pickupLocation) {
      setValue("pickupLatitude", pickupLocation.lat);
      setValue("pickupLongitude", pickupLocation.lng);
    }
    if (dropLocation) {
      setValue("dropLatitude", dropLocation.lat);
      setValue("dropLongitude", dropLocation.lng);
    }
  }, [pickupLocation, dropLocation, setValue]);

  const handlePickupClick = (latlng) => {
    setPickupLocation(latlng);
    setSelectingMode(null);
    toast.success("Pickup location selected on map");
    
    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          setPickupAddress(data.display_name);
        }
      })
      .catch(err => console.error("Reverse geocoding error:", err));
  };

  const handleDropClick = (latlng) => {
    setDropLocation(latlng);
    setSelectingMode(null);
    toast.success("Drop location selected on map");
    
    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          setDropAddress(data.display_name);
        }
      })
      .catch(err => console.error("Reverse geocoding error:", err));
  };

  const handlePickupGeocode = async () => {
    if (!pickupAddress.trim()) return;
    setGeocoding(true);
    const result = await geocodeAddress(pickupAddress);
    setGeocoding(false);
    
    if (result) {
      setPickupLocation({ lat: result.lat, lng: result.lng });
      setValue("pickupLatitude", result.lat);
      setValue("pickupLongitude", result.lng);
      toast.success("Pickup address found");
    } else {
      toast.error("Address not found. Please try a different address or use the map.");
    }
  };

  const handleDropGeocode = async () => {
    if (!dropAddress.trim()) return;
    setGeocoding(true);
    const result = await geocodeAddress(dropAddress);
    setGeocoding(false);
    
    if (result) {
      setDropLocation({ lat: result.lat, lng: result.lng });
      setValue("dropLatitude", result.lat);
      setValue("dropLongitude", result.lng);
      toast.success("Drop address found");
    } else {
      toast.error("Address not found. Please try a different address or use the map.");
    }
  };

  const onSubmit = async (data) => {
    if (!pickupLocation || !dropLocation) {
      toast.error("Please select both pickup and drop locations");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        ...data,
        pickupLatitude: pickupLocation.lat,
        pickupLongitude: pickupLocation.lng,
        dropLatitude: dropLocation.lat,
        dropLongitude: dropLocation.lng,
        pickupAddress: pickupAddress || `Lat: ${pickupLocation.lat.toFixed(4)}, Lng: ${pickupLocation.lng.toFixed(4)}`,
        dropAddress: dropAddress || `Lat: ${dropLocation.lat.toFixed(4)}, Lng: ${dropLocation.lng.toFixed(4)}`,
      };

      let newOrder = await createOrderAPI(orderData);
      const paymentMethod = (data.paymentMethod || "").trim();

      dispatch(addOrder(newOrder));

      if (paymentMethod === "COD") {
        toast.success("Order placed successfully! Driver assignment in progress...");
      } else {
        toast.success("Order created! Driver assignment in progress...");
      }
      
      reset();
      setPickupLocation(null);
      setDropLocation(null);
      setPickupAddress("");
      setDropAddress("");
    } catch (err) {
      console.error("Create Order Error:", err.response?.data || err);
      const backendError = err.response?.data?.error || err.response?.data?.message;

      if (backendError === "Customer profile Not found" && user) {
        try {
          await createCustomerAPI({
            userId: user.id || user._id,
            name: user.name || "Customer",
          });
          
          const orderData = {
            ...data,
            pickupLatitude: pickupLocation.lat,
            pickupLongitude: pickupLocation.lng,
            dropLatitude: dropLocation.lat,
            dropLongitude: dropLocation.lng,
          };
          
          const retryOrder = await createOrderAPI(orderData);
          const paymentMethod = (data.paymentMethod || "").trim();

          dispatch(addOrder(retryOrder));

          if (paymentMethod === "COD") {
            toast.success("Order placed successfully! Driver assignment in progress...");
          } else {
            toast.success("Order created! Driver assignment in progress...");
          }
          
          reset();
          setPickupLocation(null);
          setDropLocation(null);
          setPickupAddress("");
          setDropAddress("");
        } catch (innerErr) {
          console.error("Auto-create customer or retry order failed:", innerErr.response?.data || innerErr);
          toast.error(
            innerErr.response?.data?.error ||
              innerErr.response?.data?.message ||
              innerErr.message ||
              "Failed to create order."
          );
        }
      } else {
        toast.error(
          backendError || err.message || "Failed to create order."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Default center (can be changed to user's location)
  const defaultCenter = [28.6139, 77.2090]; // Delhi

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Location Selection Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Select Locations</h3>
            
            {/* Location Selection Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                type="button"
                variant={selectingMode === 'pickup' ? 'default' : 'outline'}
                onClick={() => setSelectingMode('pickup')}
                disabled={loading}
              >
                {selectingMode === 'pickup' ? '📍 Click map for Pickup' : '📍 Set Pickup on Map'}
              </Button>
              <Button
                type="button"
                variant={selectingMode === 'drop' ? 'default' : 'outline'}
                onClick={() => setSelectingMode('drop')}
                disabled={loading}
              >
                {selectingMode === 'drop' ? '📍 Click map for Drop' : '📍 Set Drop on Map'}
              </Button>
              {selectingMode && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectingMode(null)}
                >
                  Cancel Selection
                </Button>
              )}
            </div>

            {/* Pickup Address Input */}
            <div className="space-y-2">
              <Label>Pickup Address (or enter manually)</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Enter pickup address or click on map"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePickupGeocode}
                  disabled={geocoding || !pickupAddress.trim()}
                >
                  {geocoding ? '🔍...' : '🔍 Find'}
                </Button>
              </div>
            </div>

            {/* Drop Address Input */}
            <div className="space-y-2">
              <Label>Drop Address (or enter manually)</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={dropAddress}
                  onChange={(e) => setDropAddress(e.target.value)}
                  placeholder="Enter drop address or click on map"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDropGeocode}
                  disabled={geocoding || !dropAddress.trim()}
                >
                  {geocoding ? '🔍...' : '🔍 Find'}
                </Button>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <MapContainer
                center={pickupLocation || dropLocation || defaultCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapClickHandler
                  onPickupClick={handlePickupClick}
                  onDropClick={handleDropClick}
                  selectingMode={selectingMode}
                />
                
                {pickupLocation && (
                  <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
                    <Popup>Pickup Location</Popup>
                  </Marker>
                )}
                
                {dropLocation && (
                  <Marker position={[dropLocation.lat, dropLocation.lng]} icon={dropIcon}>
                    <Popup>Drop Location</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {/* Hidden coordinates inputs */}
            <input type="hidden" {...register("pickupLatitude")} />
            <input type="hidden" {...register("pickupLongitude")} />
            <input type="hidden" {...register("dropLatitude")} />
            <input type="hidden" {...register("dropLongitude")} />

            {/* Location Status */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className={`p-3 rounded-lg ${pickupLocation ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <p className="font-medium">Pickup Status:</p>
                <p className={pickupLocation ? 'text-green-600' : 'text-gray-500'}>
                  {pickupLocation ? '✓ Selected' : 'Not selected'}
                </p>
                {pickupLocation && (
                  <p className="text-xs text-gray-600 mt-1">
                    {pickupLocation.lat.toFixed(4)}, {pickupLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-lg ${dropLocation ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
                <p className="font-medium">Drop Status:</p>
                <p className={dropLocation ? 'text-red-600' : 'text-gray-500'}>
                  {dropLocation ? '✓ Selected' : 'Not selected'}
                </p>
                {dropLocation && (
                  <p className="text-xs text-gray-600 mt-1">
                    {dropLocation.lat.toFixed(4)}, {dropLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label>Payment Method</Label>
            <Select
              onValueChange={(value) =>
                setValue("paymentMethod", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                <SelectItem value="Credit Card">Credit Card</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="Wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={loading || !pickupLocation || !dropLocation} 
            className="w-full"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateOrderForm;
