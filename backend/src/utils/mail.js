import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // Use true for port 465, false for other port 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});


export const sendOtpMail=async (to, otp) => {
    try {
        console.log("Sending OTP to:", to);
        console.log("EMAIL env var exists:", !!process.env.EMAIL);
        console.log("PASS env var exists:", !!process.env.PASS);
        
        await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject: "OTP Validation for Fleetops",
            html:`<p>Your OTP for FleetOps: <b>${otp}</b>. It is valid for 5 minutes.</p>`,
        });
        
        console.log("OTP sent successfully to:", to);
    } catch (error) {
        console.error("Error sending OTP mail:", error);
        throw error;
    }
}
