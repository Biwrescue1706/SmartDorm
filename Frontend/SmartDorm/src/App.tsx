// src/App.tsx
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/ManageRooms/Rooms";
import Bills from "./pages/Bills/Bills";
import Booking from "./pages/ManageRooms/Booking"; //  เพิ่ม
import NotFound from "./pages/NotFound"; //  หน้า 404
import Checkout from "./pages/ManageRooms/Checkout";
import AllBills from "./pages/Bills/AllBills";
import AdminManagement from "./pages/AdminManagement";
import Users from "./pages/Users";
import Profile from "./pages/Profile/Profile";
import ChangePassword from "./pages/Profile/ChangePassword";
import ForgotUsername from "./pages/ForgotPassword/ForgotUsername";
import ResetPassword from "./pages/ForgotPassword/ResetPassword";
import BookingHistory from "./pages/BookingHistory";
import BillOverviewPage from "./pages/BillOverviewPage";
import BillDetailPage from "./pages/BillDetailPage";
import DormProfile from "./pages/DormProfile";

function App() {
  return (
    <Routes>
      {/*  Guest only */}
      <Route
        path="/"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/forgot-username"
        element={
          <GuestRoute>
            <ForgotUsername />
          </GuestRoute>
        }
      />

      <Route
        path="/reset-password"
        element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        }
      />

      {/* ProtectedRoute ป้องกันไปหน้า login  */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rooms"
        element={
          <ProtectedRoute>
            <Rooms />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bills"
        element={
          <ProtectedRoute>
            <Bills />
          </ProtectedRoute>
        }
      />

      <Route
        path="/allbills"
        element={
          <ProtectedRoute>
            <AllBills />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bill-overview"
        element={
          <ProtectedRoute>
            <BillOverviewPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bills/:billId"
        element={
          <ProtectedRoute>
            <BillDetailPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <Booking />
          </ProtectedRoute>
        }
      />

      <Route
        path="/booking-history"
        element={
          <ProtectedRoute>
            <BookingHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/manage"
        element={
          <ProtectedRoute>
            <AdminManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

<Route
  path="/dorm-profile"
  element={
    <ProtectedRoute>
      <DormProfile />
    </ProtectedRoute>
  }
/>

      {/*  ไม่เจอ route → ไปหน้า 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
