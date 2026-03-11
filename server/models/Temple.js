import mongoose from 'mongoose';

const templeSchema = new mongoose.Schema({
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organizer' },
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: String,
    city: String,
    state: String,
    price: { type: Number, default: 0 },
    images: [String],
    timeSlots: [String],
    poojaTypes: [String],
    isActive: { type: Boolean, default: true },
    totalBookings: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Temple', templeSchema);
