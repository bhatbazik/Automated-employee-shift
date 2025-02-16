const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { signupSchema } = require("../validation/authValidation");

exports.signup = async (req, res) => {
  try {
    // Validate request body with Zod
    const parsedData = signupSchema.parse(req.body);

    const { name, email, password, role, seniorityLevel, maxHoursPerWeek } =
      req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password, // No manual hashing needed
      role: role || "employee", // Default role
      seniorityLevel: seniorityLevel || "junior", // Default seniority
      maxHoursPerWeek: maxHoursPerWeek || 40, // Default max hours
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        seniorityLevel: newUser.seniorityLevel,
        maxHoursPerWeek: newUser.maxHoursPerWeek,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res.status(400).json({
        message: "Validation failed, incorrect format ",
        errors: error.errors,
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
