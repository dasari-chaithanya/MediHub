/**
 * MongoDB Connection (config/database.js)
 * Connects to the real MongoDB instance specified in .env
 */
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medihub_db';

        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log(`[DB] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

        mongoose.connection.on('error', (err) => {
            console.error('[DB] MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[DB] MongoDB disconnected.');
        });

        return conn;
    } catch (error) {
        console.error('[DB] MongoDB connection failed:', error.message);
        console.error('[DB] Make sure MongoDB is running: Get-Service MongoDB');
        process.exit(1);
    }
};

const disconnectDB = async () => {
    await mongoose.disconnect();
};

module.exports = { connectDB, disconnectDB };
