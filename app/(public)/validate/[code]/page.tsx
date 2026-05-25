import { ValidatorApp } from '@/components/validator/ValidatorApp';

export default function ValidatorPage({ params }: { params: { code: string } }) {
  return <ValidatorApp initialCode={params.code} />;
}
