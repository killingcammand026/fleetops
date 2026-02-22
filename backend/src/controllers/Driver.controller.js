import {
  createDriverService,
  getAllDriversService,
  getDriverByIdService,
  updateDriverService,
  deleteDriverService,
  updateDriverLocationService,
  getDriverByUserIdService,
} from "../services/Driver.service.js";

 export const createDriverController = async (req, res) => {
    try {
         const driverData={
                    ...req.body,
                    fleetManagerId:req.user._id
                }
        const driver = await createDriverService(driverData,req.user);
        res.status(201).json(driver);
    }
    catch (error) {       
         res.status(400).json({ error: error.message });
    }
 };
 export const getAllDriversController = async (req, res) => {
    try{
        const drivers = await getAllDriversService();
        res.status(200).json(drivers);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
 };
    export const getDriverByIdController = async (req, res) => {
    try {
        const driver = await getDriverByIdService(req.params.id);
        res.status(200).json(driver);

    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
    };
    export const updateDriverController = async (req, res) => {
    try {
        const driver = await updateDriverService(req.params.id, req.body);
        res.status(200).json(driver);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
    };
    export const getMyDriverController = async (req, res) => {
      try {
        const driver = await getDriverByUserIdService(req.user._id);
        res.status(200).json(driver);
      } catch (error) {
        res.status(404).json({ error: error.message });
      }
    };
    export const deleteDriverController = async (req, res) => {
    try {
        const driver = await deleteDriverService(req.params.id,req.user);
        res.status(200).json({ message: "Driver deleted successfully" });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
    };
    export const updateDriverLocationController = async (req, res) => {
        try{
            const {longitude, latitude} = req.body;
            const driver=await updateDriverLocationService(req.params.id, longitude, latitude);
            console.log("Incoming:", longitude, latitude);
            console.log("Updated Driver:", driver.liveLocation);
            res.status(200).json(driver);
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    };