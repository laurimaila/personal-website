export interface ChatMessage {
    id: number;
    content: string;
    creator?: string;
    createdAt: string;
}

export interface WSError {
    code: string;
    message: string;
}

export interface WSPayload<T> {
    type: 'message' | 'error' | 'status';
    payload: T;
}
