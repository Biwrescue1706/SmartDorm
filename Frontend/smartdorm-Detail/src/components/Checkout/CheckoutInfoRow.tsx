interface Props {
  label: string;
  value?: string | number | React.ReactNode;
}

export default function CheckoutInfoRow({ label, value }: Props) {
  return (
    <tr>
      <td
        className="fw-semibold text-dark"
        style={{
          width: "40%",
          backgroundColor: "#f8f9fa",
        }}
      >
        {label}
      </td>
      <td>{value ?? "-"}</td>
    </tr>
  );
}
