// src/utils/toast.ts
import Swal from "sweetalert2";

export const toast = (
  icon: "success" | "error" | "warning" | "info",
  title: string,
  text?: string
) => {
  return Swal.fire({
    icon,
    title,
    text: text ?? "",
    timer: 1500,
    showConfirmButton: false,
  });
};