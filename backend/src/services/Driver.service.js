import Driver from '../models/Driver.model.js';

export const createDriverService = async (driverData) => {
    const driver=await Driver.create(driverData);
    if(!driver) {
        throw new Error('Driver not created');
    }
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
    const driver=await Driver.findByIdAndUpdate(id,driverData,{new:true});
    if(!driver) {
        throw new Error('Driver not found');
    }
    return driver;
};
export const deleteDriverService = async (id) => {
    const driver=await Driver.findByIdAndDelete(id);
    if(!driver) {
        throw new Error('Driver not found');
    }
    return driver;
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