// seedUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // Adjust the path as needed

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Remove all existing users
    await User.deleteMany({});
    console.log("Existing users deleted.");

    let users = [];
    // Create 2 Admins
    users.push({
      name: "Admin One",
      email: "admin1@example.com",
      password: "adminPassword",
      role: "admin",
      seniorityLevel: "senior",
      maxHoursPerWeek: 40
    });
    users.push({
      name: "Admin Two",
      email: "admin2@example.com",
      password: "adminPassword",
      role: "admin",
      seniorityLevel: "senior",
      maxHoursPerWeek: 40
    });
    // Create 98 Employees
    for (let i = 1; i <= 98; i++) {
      let seniority;
      if (i % 3 === 1) {
        seniority = "junior";
      } else if (i % 3 === 2) {
        seniority = "mid";
      } else {
        seniority = "senior";
      }
      users.push({
        name: `Employee ${i}`,
        email: `employee${i}@example.com`,
        password: "employeePassword",
        role: "employee",
        seniorityLevel: seniority,
        maxHoursPerWeek: 40
      });
    }

    // Save each user individually to trigger the pre-save hook (hashing the password)
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`Saved ${user.email}`);
    }
    console.log("Database seeded with 100 users (2 admins and 98 employees) with hashed passwords.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

connectDB().then(seedUsers);
