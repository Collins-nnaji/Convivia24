'use client';

import { Plus, MessageSquare, Trash2 } from 'lucide-react';

export interface Conversation { id: string; title: string | null; updated_at: string }

function relativeDay(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function CompanionSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-3 border-b border-obsidian/10">
        <button
          type="button"
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gold hover:bg-gold-light text-obsidian text-[11px] font-black uppercase tracking-[0.15em] transition-colors"
        >
          <Plus size={14} /> New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className="px-3 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-obsidian/35">History</p>
        {conversations.length === 0 ? (
          <p className="px-3 py-2 text-xs text-obsidian/35 italic">No chats yet.</p>
        ) : (
          <ul className="px-2 pb-3 space-y-0.5">
            {conversations.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={`w-full text-left pl-2.5 pr-8 py-2 transition-colors ${
                      active ? 'bg-gold/10 ring-1 ring-inset ring-gold/40' : 'hover:bg-obsidian/[0.04]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <MessageSquare size={12} className={active ? 'text-gold-dark shrink-0' : 'text-obsidian/30 shrink-0'} />
                      <span className={`block truncate text-[13px] ${active ? 'text-obsidian font-medium' : 'text-obsidian/70'}`}>
                        {c.title || 'New chat'}
                      </span>
                    </span>
                    <span className="block pl-[18px] text-[10px] text-obsidian/35 mt-0.5">{relativeDay(c.updated_at)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    aria-label="Delete chat"
                    className="absolute right-1.5 top-2 p-1 text-obsidian/25 hover:text-gold opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
