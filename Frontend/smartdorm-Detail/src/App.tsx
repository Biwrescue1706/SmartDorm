import { Routes, Route } from "react-router-dom";
import BookingDetail from "./pages/Detail/BookingDetail";
import CheckoutDetail from "./pages/Detail/CheckoutDetail";
import BillDetail from "./pages/Detail/BillDetail";

import Home from "./pages/Home";
import BookingViewSearch from "./pages/Search/BookingSearch";
import ReturnSearch from "./pages/Search/ReturnSearch";
import PaymentSearch  from "./pages/Search/PaymentSearch";


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
