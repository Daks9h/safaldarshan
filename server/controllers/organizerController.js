import Organizer from '../models/Organizer.js';
import Temple from '../models/Temple.js';
import Booking from '../models/Booking.js';
import Darshan from '../models/Darshan.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerOrganizer = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        const existing = await Organizer.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Organizer already exists' });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const organizer = await Organizer.create({ 
            name, 
            email, 
            phone, 
            password: hashedPassword, 
            isVerified: true // Auto-verify for now
        });
        
        const token = jwt.sign({ id: organizer._id, role: 'organizer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ 
            token, 
            organizerData: { id: organizer._id, name: organizer.name, email: organizer.email, phone: organizer.phone } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginOrganizer = async (req, res) => {
    try {
        const { email, password } = req.body;
        const organizer = await Organizer.findOne({ email });
        if (!organizer) return res.status(404).json({ message: 'Organizer not found' });
        
        const isMatch = await bcrypt.compare(password, organizer.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: organizer._id, role: 'organizer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({ 
            token, 
            organizerData: { id: organizer._id, name: organizer.name, email: organizer.email, phone: organizer.phone } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTemple = async (req, res) => {
    try {
        const { name, city, state, price, description, address, timeSlots, poojaTypes } = req.body;
        const imagePath = req.file ? req.file.filename : null;
        
        const temple = await Temple.create({
            organizerId: req.organizer._id,
            name, city, state, price, description, address,
            timeSlots: timeSlots ? JSON.parse(timeSlots) : [],
            poojaTypes: poojaTypes ? JSON.parse(poojaTypes) : [],
            images: imagePath ? [imagePath] : []
        });
        
        res.status(201).json({ message: 'Temple created successfully', temple });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyTemples = async (req, res) => {
    try {
        const temples = await Temple.find({ organizerId: req.organizer._id }).sort({ createdAt: -1 });
        res.status(200).json(temples);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTempleById = async (req, res) => {
    try {
        const temple = await Temple.findOne({ _id: req.params.id, organizerId: req.organizer._id });
        if (!temple) return res.status(404).json({ message: 'Temple not found' });
        res.status(200).json(temple);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTemple = async (req, res) => {
    try {
        const { name, city, state, price, description, address, timeSlots, poojaTypes, existingImage } = req.body;
        let images = existingImage ? [existingImage] : [];
        if (req.file) {
            images = [req.file.filename];
        }
        
        let parsedSlots = [];
        let parsedPoojas = [];
        
        try {
            parsedSlots = typeof timeSlots === 'string' ? JSON.parse(timeSlots) : timeSlots;
        } catch (e) { console.error('Error parsing timeSlots:', e); }
        
        try {
            parsedPoojas = typeof poojaTypes === 'string' ? JSON.parse(poojaTypes) : poojaTypes;
        } catch (e) { console.error('Error parsing poojaTypes:', e); }

        const updateObj = { 
            name, city, state, price, description, address, images,
            timeSlots: Array.isArray(parsedSlots) ? parsedSlots : [],
            poojaTypes: Array.isArray(parsedPoojas) ? parsedPoojas : []
        };
        
        const temple = await Temple.findOneAndUpdate(
            { _id: req.params.id, organizerId: req.organizer._id },
            updateObj,
            { new: true }
        );
        if (!temple) return res.status(404).json({ message: 'Temple not found' });
        res.status(200).json({ message: 'Temple updated successfully', temple });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const temples = await Temple.find({ organizerId: req.organizer._id }).select('_id');
        const templeIds = temples.map(t => t._id);
        const bookings = await Booking.find({ templeId: { $in: templeIds } })
            .populate('userId', 'name email phone')
            .populate('templeId', 'name')
            .sort({ createdAt: -1 });
            
        // Map to match frontend expected fields
        const formatted = bookings.map(b => ({
            _id: b._id,
            userName: b.userId?.name || 'Devotee',
            userPhone: b.userId?.phone || 'N/A',
            templeName: b.templeId?.name || 'N/A',
            poojaType: b.pooja || 'General Darshan',
            timeSlot: b.slot || 'N/A',
            tickets: b.tickets || 0,
            totalAmount: b.totalAmount || 0,
            bookingDate: b.bookingDate || b.createdAt,
            status: b.status || 'Confirmed'
        }));
        
        res.status(200).json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyDarshans = async (req, res) => {
    try {
        const temples = await Temple.find({ organizerId: req.organizer._id }).select('_id');
        const templeIds = temples.map(t => t._id);
        const darshans = await Darshan.find({ templeId: { $in: templeIds } })
            .populate('templeId', 'name')
            .sort({ date: 1 });
        res.status(200).json(darshans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTempleDarshans = async (req, res) => {
    try {
        const temple = await Temple.findById(req.params.id);
        if (!temple) return res.status(404).json({ message: 'Temple not found' });
        
        const darshans = await Darshan.find({ templeId: req.params.id }).sort({ date: 1 });
        
        // Return object with temple details and slots to match frontend
        const responseData = {
            ...temple.toObject(),
            darshanSlots: darshans.map(d => ({
                _id: d._id,
                timeSlot: d.timeSlot || 'N/A',
                poojaType: d.poojaType || 'N/A',
                price: d.price || 0,
                capacity: d.capacity || 0,
                booked: d.booked || 0,
                date: d.date
            }))
        };
        
        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createDarshan = async (req, res) => {
    try {
        const { templeId, date, timeSlot, poojaType, price, capacity } = req.body;
        const darshan = await Darshan.create({
            templeId, date, timeSlot, poojaType, price, capacity
        });
        res.status(201).json({ message: 'Darshan slot created successfully', darshan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteDarshan = async (req, res) => {
    try {
        const darshan = await Darshan.findByIdAndDelete(req.params.id);
        if (!darshan) return res.status(404).json({ message: 'Slot not found' });
        res.status(200).json({ message: 'Darshan slot deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const temples = await Temple.find({ organizerId: req.organizer._id });
        const templeIds = temples.map(t => t._id);
        
        const totalTemples = temples.length;
        
        const bookings = await Booking.find({ templeId: { $in: templeIds } });
        const totalBookings = bookings.length;
        
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        
        res.status(200).json({ totalTemples, totalBookings, totalRevenue });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
