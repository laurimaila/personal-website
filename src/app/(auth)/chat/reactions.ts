import { chatApi } from '@/lib/api/chatApi';
import type { ChatMessage, Reaction, ReactionPayload } from '@/lib/api/chatApi';

export const REACTION_EMOJIS = ['👍', '👎', '😁', '😢', '🥴', '❤️', '✅'] as const;

export const reactionGroups = (reactions: ChatMessage['reactions'], currentUserId: number) => {
  // Groups array of reactions by emoji, shows count and if current user reacted with that emoji
  const groups: Record<string, { count: number; userReacted: boolean }> = {};

  for (const { emoji, user } of reactions ?? []) {
    groups[emoji] ??= { count: 0, userReacted: false };
    groups[emoji].count++;
    if (user?.id === currentUserId) groups[emoji].userReacted = true;
  }

  return Object.entries(groups).map(([emoji, data]) => ({ emoji, ...data }));
};

const updateReactions = (
  reactions: Reaction[],
  emoji: string,
  creator: Reaction['user'],
  removed: boolean,
): Reaction[] => {
  // Always drop an old reaction of user on the same message
  const withoutExisting = reactions.filter((r) => r.user?.id !== creator.id);
  return removed ? withoutExisting : [...withoutExisting, { emoji, user: creator }];
};

export const handleReaction = async (messageId: number, emoji: string, alreadyReacted: boolean) => {
  try {
    if (alreadyReacted) {
      await chatApi.removeReaction(messageId);
    } else {
      await chatApi.addReaction(messageId, emoji);
    }
  } catch (err) {
    console.error('Failed to update reaction:', err);
    throw err;
  }
};

export const onReactionEvent = (
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  { messageId, emoji, isRemoved, user }: ReactionPayload,
) => {
  if (!user) return;
  setMessages((prev) =>
    prev.map((m) =>
      // Change only the message the reaction targets
      m.id !== messageId
        ? m
        : { ...m, reactions: updateReactions(m.reactions ?? [], emoji, user, isRemoved) },
    ),
  );
};
