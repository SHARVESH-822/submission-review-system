const mongoose = require('mongoose');
const dns = require('dns');

// Prefer IPv4 over IPv6 for DNS resolution
dns.setDefaultResultOrder('ipv4first');

const connectDB = async (retries = 15, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const options = {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4, // Force IPv4
      };
      
      await mongoose.connect(process.env.MONGO_URI, options);
      console.log("MongoDB Connected Successfully");
      return;
    } catch (error) {
      console.error(`Database Connection Error (Attempt ${attempt}/${retries}):`, error.message);
      
      if (attempt === retries) {
        console.error("Failed to connect after", retries, "attempts. Exiting...");
        process.exit(1);
      }
      
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;