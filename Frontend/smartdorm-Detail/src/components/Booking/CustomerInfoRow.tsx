interface Props {
  label: string;
  value?: string | number | React.ReactNode;
}

export default function CustomerInfoRow({ label, value }: Props) {
  return (
    <tr>
      <td>{label}</td>
      <td>{value ?? "-"}</td>
    </tr>
  );
}