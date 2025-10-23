import { Routes, Route } from "react-router-dom";
import BookingDetail from "./pages/BookingDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/booking/:bookingId" element={<BookingDetail />} />
    </Routes>
  );
}