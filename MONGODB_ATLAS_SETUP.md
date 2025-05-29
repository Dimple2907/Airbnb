# MongoDB Atlas Setup Instructions

## Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster (choose free tier)

## Step 2: Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string

## Step 3: Update .env file
Replace the ATLASDB_URL in your .env file with your Atlas connection string:

```
ATLASDB_URL=mongodb+srv://username:password@cluster.mongodb.net/wanderlust?retryWrites=true&w=majority
```

## Step 4: Add IP Address
1. In Atlas dashboard, go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (0.0.0.0/0) for development

## Step 5: Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Create a user with read/write access
4. Use these credentials in your connection string
