import express from "express";
import {
    createOrderController,
    getAllOrdersController,
    getOrderByIdController,
    updateOrderController,
    deleteOrderController
} from "../controllers/Order.controller.js";

const router=express.Router();

router.post("/",createOrderController);
router.get("/",getAllOrdersController);
router.get("/:id",getOrderByIdController);
router.put("/:id",updateOrderController);
router.delete("/:id",deleteOrderController);

export default router;