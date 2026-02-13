import express from 'express';

import {
    createCustomerController,
    getAllCustomersController,
    getCustomerByIdController,
    updateCustomerController,
    deleteCustomerController,
    updateCustomerLocationController,
} from '../controllers/Customer.controller.js';

const router=express.Router();

router.post("/",createCustomerController);
router.get("/",getAllCustomersController);
router.get("/:id",getCustomerByIdController);
router.put("/:id",updateCustomerController);
router.delete("/:id",deleteCustomerController);
router.patch("/:id",updateCustomerLocationController);

export default router;