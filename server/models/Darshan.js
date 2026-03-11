import mongoose from 'mongoose';

const darshanSchema = new mongoose.Schema({
    templeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Temple', required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    poojaType: { type: String },
    price: { type: Number, default: 0 },
    capacity: { type: Number, default: 0 },
    booked: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Darshan', darshanSchema);
