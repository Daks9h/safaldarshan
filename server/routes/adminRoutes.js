import express from 'express';
import {
    loginAdmin,
    registerAdmin,
    getDashboardStats,
    getAllOrganizers,
    verifyOrganizer,
    deleteOrganizer,
    getAllUsers,
    deleteUser,
    getAllTemples,
    toggleTempleStatus,
    getAllBookings
} from '../controllers/adminController.js';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// Dashboard — admin only
router.get('/dashboard-stats', verifyAdmin, getDashboardStats);

// Organizers — reads are open, deletes require admin
router.get('/organizers', getAllOrganizers);
router.delete('/organizer/:id', verifyAdmin, deleteOrganizer);

// Users — reads are open, deletes require admin
router.get('/users', getAllUsers);
router.delete('/user/:id', verifyAdmin, deleteUser);

// Temples — reads are open, toggles require admin
router.get('/temples', getAllTemples);
router.put('/temple/toggle/:id', verifyAdmin, toggleTempleStatus);

// Bookings — open read
router.get('/bookings', getAllBookings);

export default router;
