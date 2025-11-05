interface Props {
  label: string;
  value?: string | number | React.ReactNode;
}

export default function BookingInfoRow({ label, value }: Props) {
  return (
    <tr>
      <td className="fw-semibold text-dark" style={{ width: "40%" }}>
        {label}
      </td>
      <td>{value ?? "-"}</td>
    </tr>
  );
}