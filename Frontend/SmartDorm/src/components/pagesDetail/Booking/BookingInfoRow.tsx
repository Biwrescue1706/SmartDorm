// src/components/pagesDetail/Booking/BookingInfoRow.tsx
interface Props {
  label: string;
  value?: string | number | React.ReactNode;
}

export default function BookingInfoRow({ label, value }: Props) {
  return (
    <tr>
      <th>{label}</th>
      <td>{value ?? "-"}</td>
    </tr>
  );
}
