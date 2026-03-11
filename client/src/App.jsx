import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './organizer.css';
import './user.css';

// Auth Component
import AuthPage from './components/AuthPage';

// Organizer Components
import Ohome from './Organizer/Ohome';
import CreateTemple from './Organizer/CreateTemple';
import Mytemple from './Organizer/Mytemple';
import EditTemple from './Organizer/EditTemple';
import Bookings from './Organizer/Bookings';
import Odarshans from './Organizer/Odarshans';
import CreatedDarshan from './Organizer/CreatedDarshan';

// User Components
import Uhome from './Users/Uhome';
import Temples from './Users/Temples';
import Utemple from './Users/Utemple';
import BookDarshan from './Users/BookDarshan';
import Mybookings from './Users/Mybookings';

// Utils
import ProtectedRoute from './components/ProtectedRoute';

// New Components
import BookingSuccess from './Users/BookingSuccess';
import Uprofile from './Users/Uprofile';

// Admin Components
import Anavbar from './Admin/Anavbar';
import Ahome from './Admin/Ahome';
import AllOrganizers from './Admin/AllOrganizers';

import AllUsers from './Admin/AllUsers';
import AllTemples from './Admin/AllTemples';
import AllBookings from './Admin/AllBookings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* Organizer Routes */}
        <Route element={<ProtectedRoute role="organizer" />}>
          <Route path="/organizer/home" element={<Ohome />} />
          <Route path="/organizer/create-temple" element={<CreateTemple />} />
          <Route path="/organizer/my-temples" element={<Mytemple />} />
          <Route path="/organizer/edit-temple/:templeId" element={<EditTemple />} />
          <Route path="/organizer/bookings" element={<Bookings />} />
          <Route path="/organizer/darshans" element={<Odarshans />} />
          <Route path="/organizer/temple/:templeId/darshan" element={<CreatedDarshan />} />
        </Route>

        {/* User Routes */}
        <Route path="/user/home" element={<Uhome />} />
        <Route path="/user/temples" element={<Temples />} />
        <Route path="/user/temple/:templeId" element={<Utemple />} />
        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/user/book/:templeId" element={<BookDarshan />} />
          <Route path="/user/my-bookings" element={<Mybookings />} />
          <Route path="/user/booking-success" element={<BookingSuccess />} />
          <Route path="/user/profile" element={<Uprofile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/home" element={<Ahome />} />
          <Route path="/admin/organizers" element={<AllOrganizers />} />

          <Route path="/admin/users" element={<AllUsers />} />
          <Route path="/admin/temples" element={<AllTemples />} />
          <Route path="/admin/bookings" element={<AllBookings />} />
        </Route>

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/user/home" replace />} />
        <Route path="/admin" element={<Navigate to="/login?role=admin" replace />} />
        <Route path="*" element={<Navigate to="/user/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
