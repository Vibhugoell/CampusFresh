const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/, 'Only Chitkara email allowed'],
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
         match: [
            /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{6,}$/,
            'Password must be at least 6 characters long, contain one uppercase letter, and one special character.'
        ]
    }
});

module.exports = mongoose.model('User', userSchema);