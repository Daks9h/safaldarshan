import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organizer from '../models/Organizer.js';
import Admin from '../models/Admin.js';

export const verifyUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided!' });

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id).select('-password');
        
        if (!user) return res.status(401).json({ message: 'User not found' });
        if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });

        req.user = user;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

export const verifyOrganizer = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided!' });

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const organizer = await Organizer.findById(verified.id).select('-password');
        
        if (!organizer) return res.status(401).json({ message: 'Organizer not found' });
        // isVerified check removed — all organizers are auto-verified on signup

        req.organizer = organizer;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided!' });

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        if (verified.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied: Requires Admin Role!' });
        }

        const admin = await Admin.findById(verified.id).select('-password');
        if (!admin) return res.status(401).json({ message: 'Admin not found' });

        req.admin = admin;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Admin Token' });
    }
};
