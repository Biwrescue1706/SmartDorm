import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home"));
const BookingViewSearch = lazy(() => import("./pages/Search/BookingSearch"));
const ReturnSearch = lazy(() => import("./pages/Search/ReturnSearch"));
const PaymentSearch = lazy(() => import("./pages/Search/PaymentSearch"));

const BookingDetail = lazy(() => import("./pages/Detail/BookingDetail"));
const CheckoutDetail = lazy(() => import("./pages/Detail/CheckoutDetail"));
const BillDetail = lazy(() => import("./pages/Detail/BillDetail"));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<BookingViewSearch />} />
        <Route path="/checkout" element={<ReturnSearch />} />
        <Route path="/bill" element={<PaymentSearch />} />
        <Route path="/booking/:bookingId" element={<BookingDetail />} />
        <Route path="/checkout/:checkoutId" element={<CheckoutDetail />} />
        <Route path="/bill/:billId" element={<BillDetail />} />
      </Routes>
    </Suspense>
  );
}
