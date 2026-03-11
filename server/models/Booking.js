import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    templeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Temple' },
    slot: String,
    pooja: String,
    tickets: Number,
    totalAmount: Number,
    bookingDate: Date,
    status: { type: String, default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
