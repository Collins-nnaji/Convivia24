import QRCode from 'qrcode';

export default async function AuthenticityQr({
  value,
  size = 120,
  className = '',
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const dataUrl = await QRCode.toDataURL(value, {
    width: size,
    margin: 1,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="Scan to verify this order on Convivia24" width={size} height={size} className={className} />;
}
