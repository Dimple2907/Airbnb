# Quick Start Guide

## 🚀 Three Ways to Start Your Application

### Option 1: Quick Start (Recommended)
```cmd
start.bat
```
This will guide you through the setup process.

### Option 2: Manual Setup

1. **Install Dependencies**:
   ```cmd
   npm install
   ```

2. **Choose Database Option**:

   **A. MongoDB Atlas (Cloud - Free)**
   - See `MONGODB_ATLAS_SETUP.md` for detailed instructions
   - Update `.env` file with your connection string

   **B. Local MongoDB**
   - Download from: https://www.mongodb.com/try/download/community
   - Install and ensure service is running

3. **Start Application**:
   ```cmd
   npm start
   ```

### Option 3: Development Mode
```cmd
npm run dev
```
Uses nodemon for auto-restart on file changes.

## 🌐 Access Your Application

Once started, open your browser to:
**http://localhost:8080**

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (local) or connection string is correct (Atlas)
- Check firewall settings
- Verify network connectivity

### Port Already in Use
- Change port in `app.js` or kill the process using port 8080

### Missing Dependencies
```cmd
npm install
```

## 📁 Project Structure
- `app.js` - Main application file
- `models/` - Database models
- `views/` - EJS templates (now with responsive design!)
- `public/` - Static assets (CSS, JS, images)
- `routes/` - Express routes
- `.env` - Environment variables

## ✨ Features
- ✅ Responsive design for all devices
- ✅ User authentication
- ✅ CRUD operations for listings
- ✅ Review system
- ✅ Image upload
- ✅ Modern UI/UX
