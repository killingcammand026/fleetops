import {
    verifyTokenService
} from "../services/AuthMiddleware.service.js"
import {
    getDriverByIdService
} from "../services/Driver.service.js"
import {getOrderByIdService }from "../services/Order.service.js"


export const protect=async(req,res,next)=>{
    try{
    let token;

    // 1️⃣ Extract token
    if (req.headers.authorization &&req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if(!token){
        return res.status(401).json({message:"Not authorized,no token"});
    }
    const user=await verifyTokenService(token);

    req.user=user;
    next();
    }
    catch(error){
       return res.status(401).json({
           message:error.message,
       });
    }
};
export const authorizeRoles=(allowedRoles)=>{
    return (req,res,next)=>{
        const userRole=req.user.role;

        if(!allowedRoles.includes(userRole)){
            return res.status(403).json({
                message:"Access denied.Insufficient permission."
            });
        }
        next();
    };
};

export const allowCustomerSelfOrManagement=(req,res,next)=>{
    //management -> means admin,fleet manager
    if(req.user.role==="Admin"||
        req.user.role==="Fleet Manager"||
        req.user._id.toString()===req.params.id
    ){
        return next();
    }
    return res.status(403).json({
        message:"Access denied"
    });
};
export const allowOrderCustomerSelfOrManagement= async (req,res,next)=>{
    try{
    //management -> means admin,fleet manager
    if(req.user.role==="Admin"||
        req.user.role==="Fleet Manager"){
        return next();
    }

    if(req.user.role==="Customer"){
        const order=await getOrderByIdService(req.params.id);
        // console.log(order.customer.userId.toString());
        // console.log(req.user._id.toString());
        if(order.customer.userId.toString()!==req.user._id.toString()){
            return res.status(403).json({message:"Access Denied1"});
        }
        return next();
    }


    return res.status(403).json({
        message:"Access denied"
    });

   }
    catch(error){
     return res.status(400).json({mess:error.message});
    }
};
export const allowUserSelfOrManagement=(req,res,next)=>{
    //management -> means admin,fleet manager
    if(req.user.role==="Admin"||
        req.user._id.toString()===req.params.id
    ){
        return next();
    }
    return res.status(403).json({
        message:"Access denied"
    });
};
export const allowDriverSelfOrManagement=async(req,res,next)=>{
    try{
    if(["Admin","Fleet Manager"].includes(req.user.role)) {
        return next();
    }
    const driver=await getDriverByIdService(req.params.id);

    if(driver.userId.toString()!==req.user._id.toString()){
        return res.status(403).json({
            message:"Access denied"
        });
      }
      next();
    }
    catch(error){
        return res.status(404).json({
            message:error.message
        });
    }
    
};




























