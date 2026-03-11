import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    city: String,
    password: { type: String, required: true },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
