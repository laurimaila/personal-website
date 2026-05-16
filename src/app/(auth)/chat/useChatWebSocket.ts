import { useCallback, useEffect, useRef, useState } from 'react';
import { chatApi } from '@/lib/api/chatApi';
import { handleWebSocketMessage } from './chatWebSocket';
import type { ChatMessage } from '@/lib/api/chatApi';
import type { Dispatch, SetStateAction } from 'react';
import type { User } from '@/lib/api/authApi';

const INIT_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

export function useChatWebSocket(
  user: User | null,
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  setError: Dispatch<SetStateAction<string | null>>,
): { connected: boolean; send: (content: string) => void } {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const shouldReconnectRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const connectRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!user) return;

    const connect = () => {
      const websocket = chatApi.createWebSocket();
      if (!websocket) {
        setError('Failed to create WebSocket connection');
        return;
      }

      wsRef.current = websocket;

      websocket.onopen = () => {
        reconnectAttemptRef.current = 0;
        setConnected(true);
        setError(null);
      };

      websocket.onmessage = (event) => handleWebSocketMessage(event, setMessages, setError);

      websocket.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred');
      };

      websocket.onclose = () => {
        setConnected(false);

        if (!shouldReconnectRef.current) return;
        const delay = Math.min(
          INIT_RECONNECT_DELAY_MS * 2 ** reconnectAttemptRef.current,
          MAX_RECONNECT_DELAY_MS,
        );
        reconnectAttemptRef.current++;
        reconnectTimerRef.current = setTimeout(connectRef.current, delay);
      };
    };

    connectRef.current = connect;
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      clearTimeout(reconnectTimerRef.current ?? undefined);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [user, setMessages, setError]);

  const send = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && content.trim()) {
      wsRef.current.send(JSON.stringify({ content }));
    }
  }, []);

  return { connected, send };
}
