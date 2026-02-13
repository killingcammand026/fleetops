import express from "express";

import {
    createDriverController,
    getAllDriversController,
    getDriverByIdController,
    updateDriverController,
    deleteDriverController,
    updateDriverLocationController,
} from "../controllers/Driver.controller.js";

const router=express.Router();

router.post("/",createDriverController);
router.get("/",getAllDriversController);
router.get("/:id",getDriverByIdController);
router.put("/:id",updateDriverController);
router.delete("/:id",deleteDriverController);
router.patch("/:id",updateDriverLocationController);

export default router;

