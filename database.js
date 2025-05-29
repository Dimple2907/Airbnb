const express = require('express');
const app = express();
const mongoose = require('mongoose');

// Simple in-memory database for testing
const mongoUrl = 'mongodb://localhost:27017/wanderlust';

async function connectDB() {
    try {
        await mongoose.connect(mongoUrl);
        console.log('✅ Connected to MongoDB successfully');
        return true;
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        console.log('💡 Starting without database - some features may not work');
        return false;
    }
}

module.exports = { connectDB };
