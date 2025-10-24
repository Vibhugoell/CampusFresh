const mongoose = require('mongoose');
const ItemSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    quantity: { 
        type: Number, 
        required: true,
        min: 1 
    }
}, { _id: false }); 
const LaundryOrderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    userEmail: { 
        type: String, 
        required: true 
    },
    items: {
        type: [ItemSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'An order must contain at least one item.'
        }
    },
    status: { 
        type: String, 
        enum: ['Submitted', 'In Process', 'Ready for Pickup', 'Delivered', 'Cancelled'],
        default: 'Submitted',
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    lastUpdate: { 
        type: Date, 
        default: Date.now 
    }
});
module.exports = mongoose.model('LaundryOrder', LaundryOrderSchema);