// Pure-TypeScript Code 128 (Code Set B) barcode → SVG. No runtime dependencies.

// Bar/space module-width patterns for Code 128 values 0..106.
const PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112',
];

const START_B = 104;
const STOP = 106;

/**
 * Render an ASCII string as a Code 128B barcode SVG.
 * @param value The data to encode (uppercase ticket codes work well).
 */
export function code128Svg(
  value: string,
  opts: { height?: number; moduleWidth?: number; color?: string; background?: string; quietZone?: number } = {}
): string {
  const { height = 70, moduleWidth = 2, color = '#0a0a0a', background = '#ffffff', quietZone = 10 } = opts;

  const codes: number[] = [START_B];
  let checksum = START_B;
  for (let i = 0; i < value.length; i++) {
    const v = value.charCodeAt(i) - 32; // Code Set B maps ASCII 32..126 → 0..94
    const val = v >= 0 && v <= 94 ? v : 0;
    codes.push(val);
    checksum += val * (i + 1);
  }
  codes.push(checksum % 103);
  codes.push(STOP);

  let x = quietZone;
  let bars = '';
  for (const c of codes) {
    const pattern = PATTERNS[c];
    let bar = true;
    for (const ch of pattern) {
      const w = parseInt(ch, 10) * moduleWidth;
      if (bar) bars += `<rect x="${x}" y="0" width="${w}" height="${height}" fill="${color}"/>`;
      x += w;
      bar = !bar;
    }
  }

  const width = x + quietZone;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" shape-rendering="crispEdges"><rect width="${width}" height="${height}" fill="${background}"/>${bars}</svg>`;
}
