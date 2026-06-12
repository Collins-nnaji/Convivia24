import QRCode from 'qrcode';
import { ticketPayload } from './codes';

/** Generate an SVG QR code string for a ticket code's signed payload. */
export async function ticketQrSvg(code: string): Promise<string> {
  return QRCode.toString(ticketPayload(code), {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#0a0a0a', light: '#ffffff' },
  });
}

/** Generate a QR for an arbitrary string (used for share/wallet links). */
export async function qrSvg(data: string): Promise<string> {
  return QRCode.toString(data, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { dark: '#0a0a0a', light: '#ffffff' },
  });
}
