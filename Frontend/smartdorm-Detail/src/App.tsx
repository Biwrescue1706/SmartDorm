import { Routes, Route } from "react-router-dom";
import BookingDetail from "./pages/BookingDetail";
import CheckoutDetail from "./pages/CheckoutDetail";
import BillDetail from "./pages/BillDetail";

import Home from "./pages/Home";
import BookingViewSearch from "./pages/BookingViewSearch";
import ReturnSearch from "./pages/ReturnSearch";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/booking" element={<BookingViewSearch />} />
      <Route path="/return" element={<ReturnSearch />} />
      {/* <Route path="/payment" element={<PaymentPage />} /> */}
      <Route path="/booking/:bookingId" element={<BookingDetail />} />
      <Route path="/checkout/:bookingId" element={<CheckoutDetail />} />
      <Route path="/bill/:billId" element={<BillDetail />} />
    </Routes>
  );
}
