import express from "express";
import {
    createUserController,
    getAllUsersController,
    getUserByIdController,
    updateUserController,
    deleteUserController,
    createFleetManagerController,
    updateUserRoleController
} from "../controllers/User.controller.js";
import {
    protect,
    authorizeRoles,
    allowUserSelfOrManagement
} from "../middlewares/Auth.middleware.js"


const router=express.Router();

router.post("/",protect,authorizeRoles(["Admin"]),createUserController);
router.get("/",protect,authorizeRoles(["Admin"]),getAllUsersController);
router.get("/:id",protect,allowUserSelfOrManagement,getUserByIdController);
router.put("/:id",protect,allowUserSelfOrManagement,updateUserController);
router.delete("/:id",protect,authorizeRoles(["Admin"]),deleteUserController);
router.post(
    "/create-fleet-manager",
    protect,
    authorizeRoles(["Admin"]),
    createFleetManagerController
);
router.patch(
  "/:id/role",
  protect,
  authorizeRoles("Admin"),
  updateUserRoleController
);
export default router;