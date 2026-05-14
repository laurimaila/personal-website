'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { chatApi } from '@/lib/api/chatApi';
import { Trash2 } from 'lucide-react';
import { MessageReactions } from './MessageReactions';
import { handleWebSocketMessage } from './chatWebSocket';

import type { User } from '@/lib/api/authApi';
import type { ChatMessage } from '@/lib/api/chatApi';

const ChatPage = () => {
  const { user, isLoading: authLoading, logout, updateColor } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [previewColor, setPreviewColor] = useState<string | undefined>(undefined);
  const [reactionPickerFor, setReactionPickerFor] = useState<number | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const history = await chatApi.getMessages();
        setMessages(history);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load chat history';
        setError(errorMessage);
        console.error('Error fetching chat history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesContainerRef.current) {
        const { scrollHeight, clientHeight } = messagesContainerRef.current;
        messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
      }
    };

    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
    // scroll only on new messages, not when e.g. reactions update
  }, [messages.length]);

  // WebSocket functionality
  useEffect(() => {
    if (!user) return;

    const websocket = chatApi.createWebSocket();

    if (!websocket) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('Failed to create WebSocket connection');
      return;
    }

    websocket.onopen = () => {
      setConnected(true);
      setError(null);
    };

    websocket.onmessage = (event) => handleWebSocketMessage(event, setMessages, setError);

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error occurred');
    };

    websocket.onclose = () => {
      setConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [user]);

  const sendMessage = useCallback(() => {
    if (ws && inputMessage.trim() && connected && user) {
      const message: Pick<ChatMessage, 'content'> = {
        content: inputMessage,
      };
      ws.send(JSON.stringify(message));
      setInputMessage('');
    }
  }, [ws, inputMessage, connected, user]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!confirm('Delete this message?')) return;
    try {
      await chatApi.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const colorDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setPreviewColor(color);
    clearTimeout(colorDebounceRef.current ?? undefined);
    colorDebounceRef.current = setTimeout(async () => {
      try {
        await updateColor(color);
      } catch (err) {
        console.error('Failed to update color:', err);
      } finally {
        setPreviewColor(undefined);
      }
    }, 600);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('fi', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    })} ${date.toLocaleTimeString('fi', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`;
  };

  const isOwnMessage = (message: ChatMessage, currentUser: User) => {
    if (currentUser.username === 'Visitor') return false;
    return message.creator.id === currentUser.id;
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSuccess={() => {}} />;
  }

  return (
    <div
      className="container mx-auto h-[70vh] max-w-2xl px-1 md:px-5"
      onClick={() => setReactionPickerFor(null)}>
      <Card className="flex h-full w-full flex-col rounded-lg shadow-md">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Chat</CardTitle>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
          <div className="mt-1 flex justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">Chatting as: {user.username}</span>
              <button
                title="Change your color"
                onClick={(e) => {
                  e.stopPropagation();
                  colorInputRef.current?.click();
                }}
                className="h-4 w-4 rounded border border-current"
                style={{ backgroundColor: previewColor ?? user.nameColor ?? '#6366f1' }}
              />
              <input
                ref={colorInputRef}
                type="color"
                className="sr-only"
                defaultValue={user.nameColor ?? '#6366f1'}
                onChange={handleColorChange}
              />
            </div>
            <span className={`text-sm ${connected ? 'text-primary' : 'text-destructive'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-destructive py-4 text-center">
              {error}
              <button onClick={() => window.location.reload()} className="ml-2 underline">
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  <Card
                    className={`bg-secondary text-secondary-foreground max-w-[95%] p-3 wrap-break-word md:max-w-[80%] ${isOwnMessage(message, user) ? 'ml-auto' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className="max-w-[60%] text-sm font-semibold break-all"
                        style={
                          message.creator.nameColor
                            ? { color: message.creator.nameColor }
                            : undefined
                        }>
                        {message.creator.username}
                      </span>
                      <div className="flex items-center gap-1">
                        {message.createdAt && (
                          <span className="text-xs">{formatTimestamp(message.createdAt)}</span>
                        )}
                        {isOwnMessage(message, user) && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-muted-foreground hover:text-foreground ml-1 opacity-60 hover:opacity-100"
                            title="Delete message">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1">{message.content}</p>
                  </Card>

                  <MessageReactions
                    messageId={message.id}
                    reactions={message.reactions}
                    currentUserId={user.id}
                    align={isOwnMessage(message, user) ? 'right' : 'left'}
                    pickerOpen={reactionPickerFor === message.id}
                    onPickerChange={(open) => setReactionPickerFor(open ? message.id : null)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.repeat) {
                  e.preventDefault();
                  handleKeyPress(e);
                }
              }}
              placeholder="Type a message..."
              className="focus:ring-ring flex-1 rounded-lg border p-3 focus:ring-2 focus:outline-hidden"
              disabled={!connected}
            />
            <Button
              variant="default"
              onClick={sendMessage}
              disabled={!connected || !inputMessage.trim()}
              className="rounded-lg px-6 py-3">
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatPage;
