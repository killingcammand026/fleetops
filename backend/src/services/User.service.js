import User from "../models/User.model.js";
import Customer from "../models/Customer.model.js";
import Driver from "../models/Driver.model.js";
import Order from "../models/Order.model.js";
export const createUserService=async(userData)=>{
    const existingUser=await User.findOne({email:userData.email});
    if(existingUser) {
        throw new Error('Email already exists');
    }
    const user=await User.create(userData);
    if(!user) {
        throw new Error('User not created');
    }
    return user;
};
export const getAllUsersService=async()=>{
    const users=await User.find().select("-password");
    if(!users || users.length === 0) {
        throw new Error('Users not found');
    }
    return users;
};
export const getUSerByIdService=async(id)=>{
    const user=await User.findById(id).select("-password");
    if(!user) {
        throw new Error('User not found');
    }
    return user;
};
export const updateUserService=async(id,userData)=>{
    delete userData._id;
    delete userData.role;
    const user=await User.findByIdAndUpdate(id,userData,{new:true}).select("-password");
    if(!user) {
        throw new Error('User not found');
    }
    return user;
};
export const deleteUserService = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // If deleting a Customer, remove their Customer profile.
  if (user.role === "Customer") {
    await Customer.findOneAndDelete({ userId: id });
  }

  // If deleting a Driver, remove Driver profile AND clean up orders.
  if (user.role === "Driver") {
    const driver = await Driver.findOne({ userId: id });
    if (driver) {
      // Reset any orders that were assigned to this driver back to CREATED with no driver.
      const now = new Date();
      const orders = await Order.find({ driver: driver._id });

      for (const order of orders) {
        order.driver = null;
        order.status = "CREATED";
        order.statusHistory.push({
          status: "CREATED",
          updatedAt: now,
        });
        await order.save();
      }

      await Driver.deleteOne({ _id: driver._id });
    }
  }

  await user.deleteOne();
  return { message: "User and related profile deleted" };
};
export const createFleetManagerService=async(userData)=>{
    const existingUser=await User.findOne({email:userData.email});
    if(existingUser) {
        throw new Error('Email already exists');
    }
   
  // Remove role from incoming data (security)
  const { name, email, password } = userData;

  // Create user with forced role
  const user = await User.create({
    name,
    email,
    password,
    role: "Fleet Manager"   // force role internally
  });

  if (!user) {
    throw new Error("Fleet Manager not created");
  }

  return user;
};
export const updateUserRoleService = async (id, role) => {
  const allowedRoles = ["Admin", "Fleet Manager", "Driver", "Customer"];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // If role is changing away from Driver, remove Driver profile
  if (user.role === "Driver" && role !== "Driver") {
    await Driver.findOneAndDelete({ userId: user._id });
  }

  // If role is changing away from Customer, remove Customer profile
  if (user.role === "Customer" && role !== "Customer") {
    await Customer.findOneAndDelete({ userId: user._id });
  }

  user.role = role;
  await user.save();

  // When promoting to Driver, ensure a basic Driver profile exists
  if (role === "Driver") {
    const existingDriver = await Driver.findOne({ userId: user._id });
    if (!existingDriver) {
      await Driver.create({
        userId: user._id,
        fleetManagerId: user._id, // placeholder; real FM can reassign later
        name: user.name || "Driver",
        phone: user.phone || "0000000000",
        vehicle: {
          type: "Car",
          registrationNumber: `TEMP-${Date.now()}`,
        },
        liveLocation: {
          type: "Point",
          coordinates: [77.209, 28.6139],
        },
      });
    }
  }

  return user;
};