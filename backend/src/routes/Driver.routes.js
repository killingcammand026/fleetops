import express from "express";
import {
    protect,
    authorizeRoles,
    allowDriverSelfOrManagement
    
} from "../middlewares/Auth.middleware.js"
import {
  createDriverController,
  getAllDriversController,
  getDriverByIdController,
  updateDriverController,
  deleteDriverController,
  updateDriverLocationController,
  getMyDriverController,
} from "../controllers/Driver.controller.js";

const router=express.Router();

router.get(
  "/me",
  protect,
  authorizeRoles(["Driver"]),
  getMyDriverController
);

router.post("/",protect,authorizeRoles(["Admin","Fleet Manager"]),createDriverController);
router.get("/",protect,authorizeRoles(["Admin","Fleet Manager"]),getAllDriversController);
router.get("/:id",protect,allowDriverSelfOrManagement,getDriverByIdController);
router.put("/:id",protect,allowDriverSelfOrManagement,updateDriverController);
router.delete("/:id",protect,authorizeRoles(["Admin"]),deleteDriverController);
router.put("/:id/location",protect,authorizeRoles(["Driver"]),allowDriverSelfOrManagement,updateDriverLocationController);

export default router;