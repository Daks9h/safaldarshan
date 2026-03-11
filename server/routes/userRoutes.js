import express from 'express';
import {
    registerUser,
    loginUser,
    getAllTemples,
    getFeaturedTemples,
    getTempleById,
    bookDarshan,
    getMyBookings,
    cancelBooking,
    getUserProfile
} from '../controllers/userController.js';
import { verifyUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Temple browsing — no auth needed, anyone can view
router.get('/temples', getAllTemples);
router.get('/featured-temples', getFeaturedTemples);
router.get('/temple/:id', getTempleById);

// Actions that require a logged-in user
router.post('/book-darshan', verifyUser, bookDarshan);
router.get('/my-bookings', verifyUser, getMyBookings);
router.put('/cancel-booking/:id', verifyUser, cancelBooking);

router.get('/profile', verifyUser, getUserProfile);

export default router;
