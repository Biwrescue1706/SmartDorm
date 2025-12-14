import { useEffect, useState } from "react";
import { useCheckouts } from "../hooks/useCheckouts";
import CheckoutTable from "../components/Checkout/CheckoutTable";
import CheckoutApproveDialog from "../components/Checkout/CheckoutApproveDialog";
import CheckoutEditDialog from "../components/Checkout/CheckoutEditDialog";
import type { Checkout } from "../types/Checkout";

export default function Checkout() {
  const {
    checkouts,
    loading,
    fetchCheckouts,
    approveCheckout,
    rejectCheckout,
    checkoutConfirm,
    updateCheckoutDate,
    deleteCheckout,
  } = useCheckouts();

  const [viewing, setViewing] = useState<Checkout | null>(null);
  const [editing, setEditing] = useState<Checkout | null>(null);

  useEffect(() => {
    fetchCheckouts();
  }, []);

  return (
    <>
      <CheckoutTable
        checkouts={checkouts}
        loading={loading}
        role={0}
        onView={setViewing}
        onCheckout={(c) => checkoutConfirm(c.checkoutId)}
        onEdit={setEditing}
        onDelete={deleteCheckout}
      />

      {viewing && (
        <CheckoutApproveDialog
          checkout={viewing}
          onApprove={() => approveCheckout(viewing.checkoutId)}
          onReject={() => rejectCheckout(viewing.checkoutId)}
          onClose={() => setViewing(null)}
        />
      )}

      {editing && (
        <CheckoutEditDialog
          checkout={editing}
          onSave={(id, v) => updateCheckoutDate(id, v)}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}