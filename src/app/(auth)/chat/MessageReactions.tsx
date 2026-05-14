import type { ChatMessage } from '@/lib/api/chatApi';
import { REACTION_EMOJIS, handleReaction, reactionGroups } from './reactions';

interface Props {
  messageId: number;
  reactions: ChatMessage['reactions'];
  currentUserId: number;
  align: 'left' | 'right';
  pickerOpen: boolean;
  onPickerChange: (open: boolean) => void;
}

export const MessageReactions = ({
  messageId,
  reactions,
  currentUserId,
  align,
  pickerOpen,
  onPickerChange,
}: Props) => (
  <div
    className={`relative mt-1 flex flex-wrap items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}
    onClick={(e) => e.stopPropagation()}>
    {reactionGroups(reactions, currentUserId).map(({ emoji, count, userReacted }) => (
      <button
        key={emoji}
        onClick={() => handleReaction(messageId, emoji, userReacted)}
        className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${
          userReacted
            ? 'bg-primary/20 border-primary'
            : 'bg-secondary border-border hover:bg-secondary/80'
        }`}>
        {emoji} {count}
      </button>
    ))}
    <button
      onClick={() => onPickerChange(!pickerOpen)}
      className="hover:text-foreground rounded-full border px-2 py-0.5 text-xs font-bold">
      +
    </button>
    {pickerOpen && (
      <div
        className={`bg-popover border-border absolute bottom-full mb-1 flex gap-1 rounded-lg border p-1 shadow-md ${align === 'right' ? 'right-0' : 'left-0'}`}>
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              handleReaction(messageId, emoji, false);
              onPickerChange(false);
            }}
            className="hover:bg-accent rounded p-1 text-sm">
            {emoji}
          </button>
        ))}
      </div>
    )}
  </div>
);
