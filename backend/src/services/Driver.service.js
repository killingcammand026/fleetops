import Driver from '../models/Driver.model.js';
import User from "../models/User.model.js";
import Customer from "../models/Customer.model.js";
export const createDriverService = async (driverData, loggedInUser) => {

  const user = await User.findById(driverData.userId);

  if (!user) {
    throw new Error("User not found");
  }

  //If driver profile already exists
  const existingDriver = await Driver.findOne({ userId: user._id });
  if (existingDriver) {
    throw new Error("Driver profile already exists for this user");
  }

  //Admin → full control
  if (loggedInUser.role === "Admin") {
    user.role = "Driver";
  }

  //Fleet Manager → can promote only Customers to Driver
  else if (loggedInUser.role==="Fleet Manager") {
    // Align with frontend: Fleet Manager works with Customer profiles.
    // Treat any user who has a Customer document as promotable,
    // regardless of the current user.role value.
    const customerProfile = await Customer.findOne({ userId: user._id });
    if (!customerProfile) {
      throw new Error("Customer profile not found for this user");
    }
    user.role = "Driver";
  }

  //Others cannot create drivers
  else {
    throw new Error("You are not allowed to create driver profiles");
  }

  const driver = await Driver.create(driverData);
  await user.save();

  return driver;
};
export const getAllDriversService = async () => {
    const driver=await Driver.find();
    if(!driver || driver.length === 0) {
        throw new Error('Drivers not found');
    }
    return driver;
};
export const getDriverByIdService = async (id) => {
    const driver=await Driver.findById(id);
    if(!driver) {
        throw new Error('Driver not found');
    }
    return driver;
};
export const updateDriverService = async (id, driverData) => {
    delete driverData.fleetManagerId;
    delete driverData.userId;
    delete driverData._id;

    const driver=await Driver.findByIdAndUpdate(id,driverData,{new:true});
    if(!driver) {
        throw new Error('Driver not found');
    }
    return driver;
};
export const getDriverByUserIdService = async (userId) => {
  const driver = await Driver.findOne({ userId });
  if (!driver) {
    throw new Error("Driver not found");
  }
  return driver;
};
export const deleteDriverService = async (driverId,loggedInUser) => {
    const driver=await Driver.findById(driverId);
    if(!driver) {
        throw new Error('Driver not found');
    }
    if(
        loggedInUser.role!=="Admin"&&
        loggedInUser.role!=="Fleet Manager"
    ) {
        throw Error ("You are not allowed to delete Drivers");
    }
    await Driver.findByIdAndDelete(driverId);
    await User.findByIdAndUpdate(driver.userId,{
        role:"Customer"
    });
    
     return { message: "Driver deleted and user role reverted to Customer" };
};
export const updateDriverLocationService = async (id, longitude, latitude) => {
    if (longitude === undefined || latitude === undefined) {
  throw new Error("Longitude and Latitude are required");
}
    const driver=await Driver.findByIdAndUpdate(id,{
        liveLocation:{
            type:"Point",
            coordinates:[Number(longitude), Number(latitude)], // [longitude, latitude]
        }
    },{new:true});
    if(!driver) {
        throw new Error('Driver not found');
    }
  
    return driver;
};