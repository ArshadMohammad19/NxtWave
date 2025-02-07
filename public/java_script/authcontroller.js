const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail", // Use your email service (e.g., Gmail, Yahoo, Outlook)
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Login",
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};

module.exports = { sendOTPEmail };
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("./mailer"); // Import the mailer function
const User = require("../models/User"); // Import your user model

// Generate OTP and send email
const generateOTP = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Sign a token with the OTP that expires in 10 minutes
    const otpToken = jwt.sign({ otp }, process.env.JWT_SECRET, { expiresIn: "10m" });

    // Send OTP email
    await sendOTPEmail(email, otp);

    // Respond with token (store it client-side or in cookies for verification)
    res.status(200).json({ token: otpToken, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Error generating OTP", error });
  }
};
const verifyOTP = async (req, res) => {
    const { token, otp } = req.body;
  
    try {
      // Verify the OTP token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      // Check if the OTP matches
      if (decoded.otp === parseInt(otp)) {
        res.status(200).json({ message: "OTP verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid OTP" });
      }
    } catch (error) {
      res.status(400).json({ message: "OTP expired or invalid", error });
    }
  };
  
  module.exports = { generateOTP, verifyOTP };
  