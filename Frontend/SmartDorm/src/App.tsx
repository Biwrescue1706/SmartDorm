import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rooms from "./pages/Rooms";
import Bills from "./pages/Bills";
import Booking from "./pages/Booking"; //  เพิ่ม
import NotFound from "./pages/NotFound"; //  หน้า 404
import Checkout from "./pages/Checkout";
import AllBills from "./pages/AllBills";
import AdminManagement from "./pages/AdminManagement";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import ForgotUsername from "./pages/ForgotUsername";
import ResetPassword from "./pages/ResetPassword";
import BookingDetail from "./pagesDetail/BookingDetail";
import CheckoutDetail from "./pagesDetail/CheckoutDetail";
import BillDetail from "./pagesDetail/BillDetail";

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
        path="/bookings"
        element={
          <ProtectedRoute>
            <Booking />
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

      <Route path="/detail/booking/:bookingId" element={<BookingDetail />} />
      <Route path="/detail/checkout/:bookingId" element={<CheckoutDetail />} />
      <Route path="/detail/bill/:billId" element={<BillDetail />} />

      {/*  ไม่เจอ route → ไปหน้า 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
