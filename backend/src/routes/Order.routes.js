import express from "express";
import {
    createOrderController,
    getAllOrdersController,
    getOrderByIdController,
    updateOrderController,
    deleteOrderController,
    cancelOrderController,
    updateOrderStatusController,
    assignDriverController,
    driverAcceptOrderController,
    driverRejectOrderController
} from "../controllers/Order.controller.js";
import {
    protect,
    authorizeRoles,
    allowOrderCustomerSelfOrManagement
} from "../middlewares/Auth.middleware.js"


const router=express.Router();

router.post("/",protect,authorizeRoles(["Customer"]),createOrderController);
router.get("/",protect,authorizeRoles(["Admin","Fleet Manager","Driver","Customer"]),getAllOrdersController);
router.get("/:id",protect,allowOrderCustomerSelfOrManagement,getOrderByIdController);
router.put("/:id",protect,allowOrderCustomerSelfOrManagement,updateOrderController);
router.delete("/:id",protect,authorizeRoles(["Admin"]),deleteOrderController);
router.patch(
  "/:id/assign-driver",
  protect,
  authorizeRoles(["Admin", "Fleet Manager"]),
  assignDriverController
);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles(["Driver","Admin","Fleet Manager"]),
  updateOrderStatusController
);
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles(["Customer"]),
  cancelOrderController
);
router.patch("/:id/driver-accept",protect,authorizeRoles(["Driver"]),driverAcceptOrderController);
router.patch("/:id/driver-reject",protect,authorizeRoles(["Driver"]),driverRejectOrderController);
export default router;