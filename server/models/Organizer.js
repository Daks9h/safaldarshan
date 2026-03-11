import mongoose from 'mongoose';

const organizerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Organizer', organizerSchema);
