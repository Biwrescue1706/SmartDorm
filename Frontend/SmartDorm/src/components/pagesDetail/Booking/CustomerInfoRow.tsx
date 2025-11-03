// src/components/pagesDetail/Booking/CustomerInfoRow.tsx
interface Props {
  label: string;
  value?: string | number | React.ReactNode;
}

export default function CustomerInfoRow({ label, value }: Props) {
  return (
    <tr>
      <th>{label}</th>
      <td>{value ?? "-"}</td>
    </tr>
  );
}
