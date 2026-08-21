'use client';

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="mt-4 px-5 py-2.5 btn-brand text-[11px] font-wordmark-sm print:hidden"
    >
      Print label
    </button>
  );
}
