// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
    url?: string;
    path?: string;
    autoConnect?: boolean;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}

interface UseWebSocketReturn {
    socket: Socket | null;
    isConnected: boolean;
    sendMessage: (event: string, data: any) => void;
    connect: () => void;
    disconnect: () => void;
}

export const useWebSocket = (
    options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
    const {
        url = 'http://localhost:4002',
        path = '/api/websocket',
        autoConnect = true,
        onConnect,
        onDisconnect,
        onError,
    } = options;

    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    const connect = useCallback(() => {
        if (socketRef.current?.connected) {
            console.log('Already connected');
            return;
        }

        const socket = io(`${url}`, {
            path: '/websockets',
            transports: ['websocket', 'polling'],
            autoConnect: false,
        });

        socket.on('connect', () => {
            console.log('WebSocket connected');
            setIsConnected(true);
            onConnect?.();
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
            onDisconnect?.();
        });

        socket.on('error', (error: Error) => {
            console.error('WebSocket error:', error);
            onError?.(error);
        });

        socket.on('connected', (data) => {
            console.log('Server confirmed connection:', data);
        });

        socket.connect();
        socketRef.current = socket;
    }, [url, onConnect, onDisconnect, onError]);

    const disconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    const sendMessage = useCallback((event: string, data: any) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn('Socket not connected');
        }
    }, []);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        sendMessage,
        connect,
        disconnect,
    };
};