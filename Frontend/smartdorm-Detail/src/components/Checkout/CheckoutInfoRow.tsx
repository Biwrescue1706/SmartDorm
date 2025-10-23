interface Props {
  label: string;
  value?: string | number | React.ReactNode;
}

export default function CheckoutInfoRow({ label, value }: Props) {
  return (
    <tr>
      <th>{label}</th>
      <td>{value ?? "-"}</td>
    </tr>
  );
}
