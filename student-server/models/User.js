const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastname: { 
        type: String, 
        trim: true,
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/,
            'Only Chitkara email addresses are allowed'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        match: [
            /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{6,}$/,
            'Password must contain at least one uppercase letter and one special character.'
        ]
    },
    hostel: {
        type: String,
        required: [true, 'Hostel selection is required'],
        enum: [
            'PI-A', 'IBN-A', 'NGH-A',
            'PI-B', 'IBN-B', 'NGH-B',
            'PI-C', 'IBN-C', 'VASCO'
        ],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
