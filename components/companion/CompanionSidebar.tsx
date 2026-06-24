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
    <div className="flex flex-col h-full min-h-0 bg-white">
      <div className="shrink-0 p-3 border-b border-obsidian/10">
        <button
          type="button"
          onClick={onNew}
          className="btn-brand w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em]"
        >
          <Plus size={15} /> New chat
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3">
        <p className="px-1.5 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-obsidian/35">History</p>
        {conversations.length === 0 ? (
          <p className="px-1.5 py-2 text-xs text-obsidian/40 italic leading-relaxed">No chats yet — start one above.</p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => {
              const active = c.id === activeId;
              return (
                <li
                  key={c.id}
                  className={`group relative flex items-center rounded-xl transition-colors ${
                    active ? 'bg-gold/15' : 'hover:bg-obsidian/[0.04]'
                  }`}
                >
                  {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gold-dark" />}
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="flex-1 min-w-0 text-left pl-3 pr-1 py-2.5"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare size={13} className={`shrink-0 ${active ? 'text-gold-dark' : 'text-obsidian/35'}`} />
                      <span className={`block truncate text-sm ${active ? 'text-obsidian font-semibold' : 'text-obsidian/75'}`}>
                        {c.title || 'New chat'}
                      </span>
                    </span>
                    <span className="block pl-[21px] text-[10px] text-obsidian/40 mt-0.5">{relativeDay(c.updated_at)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    aria-label="Delete chat"
                    className="shrink-0 mr-1.5 p-2 rounded-lg text-obsidian/30 hover:text-gold-dark hover:bg-white transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus:opacity-100"
                  >
                    <Trash2 size={14} />
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
