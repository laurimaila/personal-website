'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ChatMessage, WSPayload, WSError } from '@/lib/types/message.ts';

const ChatPage = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [username, setUsername] = useState('');
    const [isUsernameSet, setIsUsernameSet] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [connected, setConnected] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Fetch chat history
    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_REST}/api/messages`,
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch chat history');
                }
                const history = await response.json();
                setMessages(history);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load chat history');
                console.error('Error fetching chat history:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchChatHistory();
    }, []);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const { scrollHeight, clientHeight } = messagesContainerRef.current;
            messagesContainerRef.current.scrollTop = scrollHeight - clientHeight;
        }
    };

    useEffect(() => {
        if (messages.length > 0 && isUsernameSet) {
            setTimeout(scrollToBottom, 100);
        }
    }, [messages, isUsernameSet, scrollToBottom]);

    // WebSocket functionality
    useEffect(() => {
        const websocket = new WebSocket(process.env.NEXT_PUBLIC_BACKEND_WS ?? '');

        websocket.onopen = () => {
            //console.log('Connected to WebSocket');
            setConnected(true);
            setError(null);
        };

        websocket.onmessage = (event) => {
            try {
                const data: WSPayload<ChatMessage | WSError> = JSON.parse(event.data);
                //console.log('Received from WebSocket:', data);

                switch (data.type) {
                    case 'message':
                        setMessages((prev) => [...prev, data.payload as ChatMessage]);
                        break;
                    case 'error':
                        const errorPayload = data.payload as WSError;
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
    }, []);

    const sendMessage = useCallback(() => {
        if (ws && inputMessage.trim() && connected && isUsernameSet) {
            const message: Omit<ChatMessage, 'id' | 'createdAt'> = {
                content: inputMessage,
                creator: username,
            };
            ws.send(JSON.stringify(message));
            //console.log('Sent to WebSocket:', message);
            setInputMessage('');
        }
    }, [ws, inputMessage, connected, isUsernameSet, username]);

    const handleUsernameSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (username.trim()) {
            setIsUsernameSet(true);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (!isUsernameSet) {
                handleUsernameSubmit();
            } else {
                sendMessage();
            }
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

    if (!isUsernameSet) {
        return (
            <div className="flex-column container mx-auto flex max-w-2xl items-start justify-center px-1 pt-12 md:px-5">
                <Card className="w-full max-w-md rounded-lg p-5 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">Join chat</CardTitle>
                    </CardHeader>
                    <CardContent className="flex w-full flex-col items-center gap-5 px-4 sm:flex-row">
                        <form
                            onSubmit={handleUsernameSubmit}
                            className="flex w-full flex-col items-center gap-5 px-4 sm:flex-row">
                            <Input
                                type="text"
                                minLength={2}
                                maxLength={30}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.repeat) {
                                        e.preventDefault();
                                        handleKeyPress(e);
                                    }
                                }}
                                placeholder="Enter name here..."
                                required
                            />
                            <Button
                                variant="default"
                                type="submit"
                                disabled={!username.trim()}
                                className="rounded-lg px-8 py-3">
                                Join
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto h-[70vh] max-w-2xl px-1 md:px-5">
            <Card className="flex h-full w-full flex-col rounded-lg shadow-md">
                <div className="border-b px-6 py-4">
                    <CardTitle className="text-2xl font-bold">Chat</CardTitle>
                    <div className="mt-2 flex justify-between">
                        <span className="text-sm">Chatting as: {username}</span>
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
                                        message.creator === username
                                            ? 'bg-primary text-primary-foreground ml-auto'
                                            : 'bg-secondary text-secondary-foreground'
                                    } max-w-[95%] break-words md:max-w-[80%]`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="max-w-[60%] break-all text-sm font-semibold">
                                            {message.creator == username ? 'You' : message.creator}
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
