import { createCustomerService,
    getAllCustomersService,
    getCustomerByIdService,
    updateCustomerService,
    deleteCustomerService,
    updateCustomerLocationService,
 } from "../services/Customer.service.js";

export const createCustomerController=async(req,res)=>{
    try{
        const customer=await createCustomerService(req.body);
        res.status(201).json(customer);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};
export const getAllCustomersController=async(req,res)=>{
    try{
        const customers=await getAllCustomersService();
        res.status(200).json(customers);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
};
export const getCustomerByIdController=async(req,res)=>{
    try{
        const customer=await getCustomerByIdService(req.params.id);
        res.status(200).json(customer);
    }
    catch(error){
        res.status(404).json({error:error.message});
    }
};
 export const updateCustomerController = async (req, res) => {
    try {
        const customer = await updateCustomerService(req.params.id, req.body);
        res.status(200).json(customer);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
 };
 export const deleteCustomerController=async(req,res)=>{
    try {
        const customer=await deleteCustomerService(req.params.id);
        res.status(200).json({message:"Customer deleted successfully"});
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
 };
 export const updateCustomerLocationController=async(req,res)=>{
    try{
        const {longitude,latitude}=req.body;
        const customer=await updateCustomerLocationService(req.params.id,longitude,latitude);
        res.status(200).json(customer);
    }
    catch(error){
        res.status(400).json({error:error.message});
    }
 };

