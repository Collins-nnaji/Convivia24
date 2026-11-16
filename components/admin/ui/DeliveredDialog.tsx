'use client';

import { useState } from 'react';
import Modal from './Modal';
import { AdminInput } from './Fields';

/** The handover evidence the law (and c24_transition_order) needs before an alcohol order closes. */
export default function DeliveredDialog({
  customerName,
  initialProof,
  initialAgeChecked,
  busy,
  onClose,
  onConfirm,
}: {
  customerName: string;
  initialProof?: string | null;
  initialAgeChecked?: boolean | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: (proof: { deliveryProof: string; recipientAgeChecked: boolean }) => void;
}) {
  const [deliveryProof, setDeliveryProof] = useState(initialProof || '');
  const [ageChecked, setAgeChecked] = useState(Boolean(initialAgeChecked));
  const ready = deliveryProof.trim().length > 0 && ageChecked;
  return (
    <Modal
      open
      size="sm"
      title={`Mark ${customerName.split(' ')[0]}'s order delivered`}
      description="Record who received the drinks and confirm their age was checked. Stock is consumed and the customer is notified."
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className="rounded-md border border-obsidian/20 px-4 py-2 text-sm font-semibold text-obsidian/80">
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || busy}
            onClick={() => onConfirm({ deliveryProof: deliveryProof.trim(), recipientAgeChecked: true })}
            className="btn-brand rounded-md px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            {busy ? 'Saving…' : 'Mark delivered'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <AdminInput
          label="Delivery receipt"
          hint="required"
          value={deliveryProof}
          onChange={(e) => setDeliveryProof(e.target.value)}
          placeholder="e.g. Received by Tunde Ade, 7:40pm · courier POD #4471"
          autoFocus
        />
        <label className="flex items-start gap-2 rounded-md border border-obsidian/20 bg-shell px-3 py-2.5 text-sm text-obsidian">
          <input type="checkbox" checked={ageChecked} onChange={(e) => setAgeChecked(e.target.checked)} className="mt-0.5" />
          <span>
            <strong>Recipient&apos;s age checked (18+)</strong> — ID seen at handover.
          </span>
        </label>
      </div>
    </Modal>
  );
}

