import User from "../models/User.model.js";

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
    const user=await User.findByIdAndUpdate(id,userData,{new:true}).select("-password");
    if(!user) {
        throw new Error('User not found');
    }
    return user;
};
export const deleteUserService=async(id)=>{
    const user=await User.findByIdAndDelete(id);
    if(!user) {
        throw new Error('User not found');
    }
    return user;
};
