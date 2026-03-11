import Admin from '../models/Admin.js';
import Organizer from '../models/Organizer.js';
import User from '../models/User.js';
import Temple from '../models/Temple.js';
import Booking from '../models/Booking.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Admin already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const admin = await Admin.create({ name, email, password: hashedPassword });
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(404).json({ message: 'Admin not found' });
        
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const totalOrganizers = await Organizer.countDocuments();
        const verifiedOrganizers = await Organizer.countDocuments({ isVerified: true });
        const totalUsers = await User.countDocuments();
        const totalTemples = await Temple.countDocuments();
        const activeTemples = await Temple.countDocuments({ isActive: true });
        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ status: 'Confirmed' });
        const cancelledBookings = await Booking.countDocuments({ status: 'Cancelled' });
        
        res.status(200).json({
            totalOrganizers, verifiedOrganizers, totalUsers, totalTemples, 
            activeTemples, totalBookings, confirmedBookings, cancelledBookings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllOrganizers = async (req, res) => {
    try {
        const organizers = await Organizer.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(organizers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyOrganizer = async (req, res) => {
    try {
        await Organizer.findByIdAndUpdate(req.params.id, { isVerified: true });
        res.status(200).json({ message: 'Organizer verified successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteOrganizer = async (req, res) => {
    try {
        await Organizer.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Organizer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        await Booking.deleteMany({ userId: req.params.id });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllTemples = async (req, res) => {
    try {
        const temples = await Temple.find().populate('organizerId', 'name email').sort({ createdAt: -1 });
        const formatted = temples.map(t => ({
            ...t._doc,
            image: t.images && t.images.length > 0 ? `http://localhost:5001/uploads/${t.images[0]}` : null
        }));
        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleTempleStatus = async (req, res) => {
    try {
        const temple = await Temple.findById(req.params.id);
        temple.isActive = !temple.isActive;
        await temple.save();
        res.status(200).json({ message: 'Temple status updated', isActive: temple.isActive });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate({
                path: 'templeId',
                select: 'name city state organizerId',
                populate: { path: 'organizerId', select: 'name' }
            })
            .sort({ createdAt: -1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
