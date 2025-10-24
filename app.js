const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// --- CRITICAL FIX: Load environment variables FIRST ---
dotenv.config(); 

const authRoutes = require('./routes/auth');
const laundryRoutes = require('./routes/laundryRoutes'); 

const app = express();

// --- Configuration Variables ---
// FIX: Using MONGO_URI as per your .env file
const MONGODB_URI = process.env.MONGO_URI; 
const PORT = process.env.PORT || 2000;

// --- Middleware ---
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); 

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Route Mounting ---
app.use('/auth', authRoutes);     
app.use('/laundry', laundryRoutes); 
app.use('/api', laundryRoutes);   

// --- Database Connection ---
// Pass the loaded URI variable
mongoose.connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully."))
    .catch(err => console.error("MongoDB connection error:", err));


// --- Default Route ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// --- Start Server ---
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
