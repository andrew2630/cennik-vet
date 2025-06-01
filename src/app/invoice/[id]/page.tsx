import InvoiceView from '@/components/InvoiceView';

export default function InvoicePage(props: any) {
  const { id } = (props.params || {}) as { id: string };
  return <InvoiceView id={id} />;
}
