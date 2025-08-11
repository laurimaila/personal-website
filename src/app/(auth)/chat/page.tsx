'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthForm } from '@/components/AuthForm';
import { chatApi } from '@/lib/api/chatApi';
import type { ChatMessage, WebSocketPayload, WebSocketError } from '@/lib/api/chatApi.ts';
import type { User } from '@/lib/api/authApi';

const ChatPage = () => {
    const { user, isLoading: authLoading, logout } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) return;

        const fetchChatHistory = async () => {
            try {
                setIsLoading(true);
                const history = await chatApi.getMessages();
                setMessages(history);
                setError(null);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to load chat history';
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
    }, [messages]);

    // WebSocket functionality
    useEffect(() => {
        if (!user) return;

        const websocket = chatApi.createWebSocket();

        if (!websocket) {
            setError('Failed to create WebSocket connection');
            return;
        }

        websocket.onopen = () => {
            setConnected(true);
            setError(null);
        };

        websocket.onmessage = (event) => {
            try {
                const data: WebSocketPayload<ChatMessage | WebSocketError> = JSON.parse(event.data);
                //console.log('Received from WebSocket:', data);

                switch (data.type) {
                    case 'message':
                        setMessages((prev) => [...prev, data.payload as ChatMessage]);
                        break;
                    case 'error':
                        const errorPayload = data.payload as WebSocketError;
                        setError(errorPayload.message);
                        //console.error('Message error:', errorPayload.message);
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
            const message: Omit<ChatMessage, 'id' | 'createdAt' | 'creator'> = {
                content: inputMessage,
            };
            ws.send(JSON.stringify(message));
            //console.log('Sent to WebSocket:', message);
            setInputMessage('');
        }
    }, [ws, inputMessage, connected, user]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
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
        if (currentUser.username == 'Visitor') {
            return false;
        }
        return message.creator === currentUser.username;
    };

    // Show loading spinner while checking auth
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
        <div className="container mx-auto h-[70vh] max-w-2xl px-1 md:px-5">
            <Card className="flex h-full w-full flex-col rounded-lg shadow-md">
                <div className="border-b px-6 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">Chat</CardTitle>
                        <Button variant="outline" size="sm" onClick={logout}>
                            Logout
                        </Button>
                    </div>
                    <div className="mt-2 flex justify-between">
                        <span className="text-sm">Chatting as: {user.username}</span>
                        <span
                            className={`text-sm ${connected ? 'text-primary' : 'text-destructive'}`}>
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
                            <button
                                onClick={() => window.location.reload()}
                                className="ml-2 underline">
                                Retry
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((message, index) => (
                                <Card
                                    key={index}
                                    className={`p-3 ${
                                        isOwnMessage(message, user)
                                            ? 'bg-primary text-primary-foreground ml-auto'
                                            : 'bg-secondary text-secondary-foreground'
                                    } max-w-[95%] break-words md:max-w-[80%]`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="max-w-[60%] break-all text-sm font-semibold">
                                            {isOwnMessage(message, user) ? 'You' : message.creator}
                                        </span>
                                        {message.createdAt && (
                                            <span className={`text-xs`}>
                                                {formatTimestamp(message.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1">{message.content}</p>
                                </Card>
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
                            className="focus:ring-ring flex-1 rounded-lg border p-3 focus:outline-none focus:ring-2"
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
