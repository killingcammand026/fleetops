import {
    registerService,
    loginService
} from '../services/Auth.service.js';

export const registerController=async(req,res)=>{
    const {name,email,password}=req.body;
    try{
        const user=await registerService(name,email,password);
        res.status(201).json(user);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};
export const loginController=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const {user,token}=await loginService(email,password);
        res.status(201).json({
             message: "Login successful:",
             user,
             token
            });
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};