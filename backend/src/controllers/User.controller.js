import {
    createUserService,
    getAllUsersService,
    getUSerByIdService,
    updateUserService,
    deleteUserService,
    updateUserRoleService,
    createFleetManagerService
} from "../services/User.service.js";

export const createUserController=async(req,res)=>{
    try{
        const user=await createUserService(req.body);
        res.status(201).json(user);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};
export const getAllUsersController=async(req,res)=>{
    try{
        const users=await getAllUsersService();
        res.status(200).json(users);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};
export const getUserByIdController=async(req,res)=>{
    try{
        const user=await getUSerByIdService(req.params.id);
        res.status(200).json(user);
    }
    catch(error){
        res.status(404).json({error:error.message});
    }
};
export const updateUserController=async(req,res)=>{
    try{
        const user=await updateUserService(req.params.id,req.body);
        res.status(200).json(user);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};
export const deleteUserController=async(req,res)=>{
    try{
        const message=await deleteUserService(req.params.id);
        res.status(200).json({
            message:message
        });
    }
    catch(error){
        res.status(404).json({error:error.message});
    }
};
export const createFleetManagerController=async(req,res)=>{
    try{
        const user=await createFleetManagerService(req.body);
        res.status(201).json(user);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};
export const updateUserRoleController=async(req,res)=>{
     try{
        const {role}=req.body;
        const user=await updateUserRoleService(req.params.id,role);
        res.status(200).json(user);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};

