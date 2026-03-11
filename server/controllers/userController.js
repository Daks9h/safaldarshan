import User from '../models/User.js';
import Temple from '../models/Temple.js';
import Booking from '../models/Booking.js';
import Darshan from '../models/Darshan.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try {
        const { name, email, phone, city, password } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'User already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await User.create({ name, email, phone, city, password: hashedPassword });
        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: 'user' } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: 'user' } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllTemples = async (req, res) => {
    try {
        const temples = await Temple.find({ isActive: true });
        const formatted = temples.map(t => ({
            ...t._doc,
            image: t.images && t.images.length > 0 ? `http://localhost:5001/uploads/${t.images[0]}` : null
        }));
        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getFeaturedTemples = async (req, res) => {
    try {
        // Just return top 6 active temples for featured
        const temples = await Temple.find({ isActive: true }).limit(6);
        const formatted = temples.map(t => ({
            ...t._doc,
            image: t.images && t.images.length > 0 ? `http://localhost:5001/uploads/${t.images[0]}` : null
        }));
        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTempleById = async (req, res) => {
    try {
        const temple = await Temple.findOne({ _id: req.params.id, isActive: true });
        if (!temple) return res.status(404).json({ message: 'Temple not found' });
        
        // Formatted image for main display
        const mainImage = temple.images && temple.images.length > 0 ? `http://localhost:5001/uploads/${temple.images[0]}` : null;

        // Also fetch darshan slots for this temple
        const darshanSlots = await Darshan.find({ 
            templeId: req.params.id,
            date: { $gte: new Date().setHours(0,0,0,0) } // Only future or today's slots
        }).sort({ date: 1 });

        const responseData = {
            ...temple._doc,
            image: mainImage,
            darshanSlots: darshanSlots.map(d => ({
                _id: d._id,
                time: d.timeSlot,
                poojaType: d.poojaType,
                capacity: d.capacity,
                booked: d.booked,
                date: d.date,
                price: d.price || temple.price
            }))
        };

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const bookDarshan = async (req, res) => {
    try {
        const { templeId, slot, pooja, tickets, totalAmount, darshanId, date } = req.body;
        
        // If darshanId is provided, we can fetch the exact date from it
        let darshanDate = date ? new Date(date) : new Date();
        if (darshanId) {
            const d = await Darshan.findById(darshanId);
            if (d) darshanDate = d.date;
        }

        // Create the booking
        const booking = await Booking.create({
            userId: req.user._id,
            templeId, 
            slot, 
            pooja, 
            tickets, 
            totalAmount,
            status: 'Confirmed',
            bookingDate: darshanDate
        });
        
        // Update User and Temple stats
        await User.findByIdAndUpdate(req.user._id, { $push: { bookings: booking._id } });
        await Temple.findByIdAndUpdate(templeId, { $inc: { totalBookings: 1 } });
        
        // CRITICAL: Update the specific Darshan slot capacity
        if (darshanId) {
            await Darshan.findByIdAndUpdate(darshanId, { $inc: { booked: tickets } });
        } else {
            // Fallback: find by temple, slot and pooja
            await Darshan.findOneAndUpdate(
                { templeId, timeSlot: slot, poojaType: pooja },
                { $inc: { booked: tickets } }
            );
        }
        
        res.status(201).json({ message: 'Booking successful', booking, bookingId: booking._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user._id })
            .populate('templeId', 'name city state images price')
            .sort({ createdAt: -1 });

        const formattedBookings = bookings.map(b => ({
            _id: b._id,
            templeName: b.templeId?.name || 'Deleted Temple',
            city: b.templeId?.city,
            state: b.templeId?.state,
            templeImage: b.templeId?.images?.[0] ? `http://localhost:5001/uploads/${b.templeId.images[0]}` : '', 
            timeSlot: b.slot,
            poojaType: b.pooja,
            tickets: b.tickets,
            totalAmount: b.totalAmount,
            bookingDate: b.bookingDate,
            status: b.status
        }));

        res.status(200).json(formattedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { status: 'Cancelled' },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        
        await Temple.findByIdAndUpdate(booking.templeId, { $inc: { totalBookings: -1 } });
        res.status(200).json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
