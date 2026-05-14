import type {
  ChatMessage,
  DeletePayload,
  ReactionPayload,
  WebSocketError,
  WebSocketPayload,
} from '@/lib/api/chatApi';
import type { Dispatch, SetStateAction } from 'react';
import { onReactionEvent } from './reactions';

export const handleWebSocketMessage = (
  event: MessageEvent,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  setError: Dispatch<SetStateAction<string | null>>,
) => {
  try {
    const data: WebSocketPayload<ChatMessage | WebSocketError | DeletePayload | ReactionPayload> =
      JSON.parse(event.data);

    switch (data.type) {
      case 'message':
        setMessages((prev) => [...prev, data.payload as ChatMessage]);
        break;
      case 'delete': {
        const { id } = data.payload as DeletePayload;
        setMessages((prev) => prev.filter((m) => m.id !== id));
        break;
      }
      case 'reaction':
        onReactionEvent(setMessages, data.payload as ReactionPayload);
        break;
      case 'error':
        setError((data.payload as WebSocketError).message);
        break;
      case 'status':
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
};
