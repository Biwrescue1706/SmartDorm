import { Routes, Route } from "react-router-dom";
import BookingDetail from "./pages/BookingDetail";
import CheckoutDetail from "./pages/CheckoutDetail";
import BillDetail from "./pages/BillDetail";

import Home from "./pages/Home";
import BookingViewSearch from "./pages/BookingSearch";
import ReturnSearch from "./pages/ReturnSearch";
import PaymentSearch  from "./pages/PaymentSearch";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/booking" element={<BookingViewSearch />} />
      <Route path="/return" element={<ReturnSearch />} />
      <Route path="/bill" element={<PaymentSearch />} />
      <Route path="/booking/:bookingId" element={<BookingDetail />} />
      <Route path="/checkout/:checkoutId" element={<CheckoutDetail />} />
      <Route path="/bill/:billId" element={<BillDetail />} />
    </Routes>
  );
}
