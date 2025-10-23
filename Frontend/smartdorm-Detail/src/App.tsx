import { Routes, Route } from "react-router-dom";
import BookingDetail from "./pages/BookingDetail";
import CheckoutDetail from "./pages/CheckoutDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/booking/:bookingId" element={<BookingDetail />} />
     <Route path="/checkout/:bookingId" element={<CheckoutDetail />} />
     </Routes>
  );
}