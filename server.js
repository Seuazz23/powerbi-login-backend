require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://apbdashborad.netlify.app/',  // Update with your actual frontend URL
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed", err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: String, // Store OTP for password reset
  otpExpires: Date, // OTP expiration time
});

const User = mongoose.model("User", userSchema);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔹 Register
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "❌ User already exists!" });

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "✅ Registration successful!" });
  } catch (error) {
    res.status(500).json({ message: "❌ Server error!", error: error.message });
  }
});

// 🔹 Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "❌ User not found!" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "❌ Incorrect password!" });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "✅ Login successful!", token, user });
});

// 🔹 Forgot Password - Send OTP
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "❌ Email not registered!" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 min
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: `"Power BI Login" <${process.env.EMAIL_USER}>`, // Makes emails more authentic
      to: email,
      subject: "Your OTP for Password Reset",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Email Sending Failed:", error);
        return res.status(500).json({ message: "❌ Failed to send OTP!", error: error.toString() });
      }
      console.log("✅ OTP Email Sent to:", email, "Response:", info.response);
      res.json({ message: "✅ OTP sent to your email!" });
    });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);
    res.status(500).json({ message: "❌ Server error!", error: error.message });
  }
});


// 🔹 Reset Password
app.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || new Date() > user.otpExpires)
    return res.status(400).json({ message: "❌ Invalid or expired OTP!" });

  // Update password
  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null; // Clear OTP after successful reset
  user.otpExpires = null;
  await user.save();

  res.json({ message: "✅ Password reset successful! You can now login." });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
