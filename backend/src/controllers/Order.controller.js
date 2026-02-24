import {
    createOrderService,
    getAllOrdersService,
    getOrderByIdService,
    updateOrderService,
    deleteOrderService,
    updateOrderStatusService,
    assignDriverService,
    cancelOrderService,
    driverAcceptOrderService,
    driverRejectOrderService


} from '../services/Order.service.js';


export const createOrderController = async (req, res) => {
  try {
    const order = await createOrderService(req.body, req.user);

    // Immediately attempt to assign nearest available driver.
    // If this fails (no drivers, geo error, etc.), we still return the order as CREATED.
    try {
      await assignDriverService(order._id.toString());
    } catch (assignErr) {
      console.error("Auto-assign driver failed:", assignErr.message || assignErr);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
export const getAllOrdersController = async (req, res) => {
  try {
    const orders = await getAllOrdersService(req.user);
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
    export const getOrderByIdController = async (req, res) => {
    try {
        const order = await getOrderByIdService(req.params.id);
        res.status(200).json(order);

    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
    };
    export const updateOrderController = async (req, res) => {
    try {
        const order = await updateOrderService(req.params.id, req.body,req.user);
        res.status(200).json(order);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
    };
    export const deleteOrderController = async (req, res) => {
    try {
        const order = await deleteOrderService(req.params.id);
        res.status(200).json({ message: "Order deleted successfully" });
    }
    catch (error) {
        res.status(404).json({ error: error.message });
    }
    };
    export const updateOrderStatusController=async(req,res)=>{
        try{
            const {status}=req.body;
            const order=await updateOrderStatusService(req.params.id,status,req.user);
            res.status(200).json({
                success:true,
                message:"Order Status Updated",
                data:order 
            });
        }
        catch(error){
            res.status(400).json({message:error.message});
        }
    };
    export const assignDriverController=async(req,res)=>{
        try{
            
            const order=await assignDriverService(req.params.id);
            res.status(200).json({
                success:true,
                message:"Driver Assigned",
                data:order 
            });
        }
        catch(error){
            res.status(400).json({message:error.message});
        }
    };
    export const cancelOrderController=async(req,res)=>{
        try{
            
            const order=await cancelOrderService(req.params.id,req.user);
            res.status(200).json({
                success:true,
                message:"Order Cancelled successfully",
                data:order 
            });
        }
        catch(error){
            res.status(400).json({message:error.message});
        }
    };
    export const driverAcceptOrderController=async(req,res)=>{
        try{
            const order=await driverAcceptOrderService(req.params.id,req.user);
            res.status(200).json({
                message:"Driver Accepted the order",
                data:order
            })
        }
        catch(error){
            res.status(400).json({message:error.message});
        }
    };
    export const driverRejectOrderController=async(req,res)=>{
        try{
            const order=await driverRejectOrderService(req.params.id,req.user);
            res.status(200).json({
                message:"Driver Rejected the order",
                data:order
            })
        }
        catch(error){
            res.status(400).json({message:error.message});
        }
    };