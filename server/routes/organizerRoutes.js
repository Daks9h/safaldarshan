import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    registerOrganizer,
    loginOrganizer,
    createTemple,
    getMyTemples,
    getTempleById,
    updateTemple,
    getMyBookings,
    getMyDarshans,
    getTempleDarshans,
    getStats,
    createDarshan,
    deleteDarshan
} from '../controllers/organizerController.js';
import { verifyOrganizer } from '../middleware/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post('/register', registerOrganizer);
router.post('/login', loginOrganizer);

// Temple management — only the logged-in organizer can create/edit/view their temples
router.post('/create-temple', verifyOrganizer, upload.single('image'), createTemple);
router.get('/my-temples', verifyOrganizer, getMyTemples);
router.get('/temple/:id', verifyOrganizer, getTempleById);
router.put('/temple/:id', verifyOrganizer, upload.single('image'), updateTemple);

// Bookings and darshans tied to the organizer
router.get('/bookings', verifyOrganizer, getMyBookings);
router.get('/darshans', verifyOrganizer, getMyDarshans);

// Public darshan slots for a temple
router.get('/temple/:id/darshan', getTempleDarshans);

// Manage darshan slots
router.post('/create-darshan', verifyOrganizer, createDarshan);
router.delete('/darshan/:id', verifyOrganizer, deleteDarshan);

router.get('/stats', verifyOrganizer, getStats);

export default router;
