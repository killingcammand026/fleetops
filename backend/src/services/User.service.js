import User from "../models/User.model.js";
import Customer from "../models/Customer.model.js"
import Driver from "../models/Driver.model.js"
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
export const deleteUserService=async(id)=>{
    const user=await User.findById(id);
    if(!user) {
        throw new Error('User not found');
    }
     if (user.role === "Customer") {
         await Customer.findOneAndDelete({ userId: id });
     }

     if (user.role === "Driver") {
        await Driver.findOneAndDelete({ userId: id });
    }
    await user.deleteOne();
    return {message:"User and related profile deleted"};
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

  return await User.findByIdAndUpdate(
    id,
    { role },
    { new: true }
  );
};
