'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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

    // Scroll to bottom when new message is received
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // WebSocket handling
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

    // Send WebSocket message
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

    const handleUsernameSubmit = () => {
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
            <div className="container mx-auto px-5 max-w-2xl min-h-screen flex items-start justify-center">
                <div className="w-full max-w-md p-8 bg-gray-700 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-6 text-center">Join chat</h1>
                    <div className="flex flex-col items-center gap-5 w-full px-4">
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.repeat) {
                                    e.preventDefault();
                                    handleKeyPress(e);
                                }
                            }}
                            placeholder="Enter your name..."
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleUsernameSubmit}
                            disabled={!username.trim()}
                            className="inline-flex px-8 py-3 bg-blue-500 text-white disabled:text-gray-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                            Join
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-5 max-w-2xl h-screen py-8">
            <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-md">
                <div className="py-4 px-6 border-b">
                    <h1 className="text-2xl font-bold">Chat</h1>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm">Chatting as: {username}</span>
                        <span
                            className={`text-sm ${connected ? 'text-green-500' : 'text-red-500'}`}>
                            {connected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto" ref={messagesContainerRef}>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-4">
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
                                <div
                                    key={index}
                                    className={`p-3 rounded-lg ${
                                        message.creator == username
                                            ? 'bg-blue-600 ml-auto'
                                            : 'bg-gray-600'
                                    } max-w-[80%] break-words`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="font-semibold text-sm">
                                            {message.creator == username ? 'You' : message.creator}
                                        </span>
                                        {message.createdAt && (
                                            <span className={`text-xs`}>
                                                {formatTimestamp(message.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1">{message.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t">
                    <div className="flex gap-2">
                        <input
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
                            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={!connected}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!connected || !inputMessage.trim()}
                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:text-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
