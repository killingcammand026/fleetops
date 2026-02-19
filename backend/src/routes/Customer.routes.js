import express from 'express';
import {
    protect,
    authorizeRoles,
    allowCustomerSelfOrManagement
} from "../middlewares/Auth.middleware.js"
import {
    createCustomerController,
    getAllCustomersController,
    getCustomerByIdController,
    updateCustomerController,
    deleteCustomerController,
    updateCustomerLocationController,
} from '../controllers/Customer.controller.js';

const router=express.Router();

router.post("/",
    protect,
    authorizeRoles(["Admin","Fleet Manager"]),
    createCustomerController);
router.get("/",protect,authorizeRoles(["Admin","Fleet Manager"]),getAllCustomersController);
router.get("/:id",protect,allowCustomerSelfOrManagement,getCustomerByIdController);
router.put("/:id",protect,allowCustomerSelfOrManagement,updateCustomerController);
router.delete("/:id",protect,authorizeRoles(["Admin"]),deleteCustomerController);
router.put("/:id/location",protect,allowCustomerSelfOrManagement,updateCustomerLocationController);

export default router;