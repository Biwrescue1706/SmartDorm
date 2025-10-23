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
// import LineConfigPage from "./pages/linesetting";

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

      {/* <Route
        path="/line"
        element={
          <ProtectedRoute>
            <LineConfigPage />
          </ProtectedRoute>
        }
      /> */}

      {/*  ไม่เจอ route → ไปหน้า 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
