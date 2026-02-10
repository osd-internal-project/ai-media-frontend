// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../config';

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

// Global singleton instance
let socketInstance: Socket | null = null;
let listeners: { [key: string]: Function[] } = {};

export const useWebSocket = (
    options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
    const {
        url = `${config.backendWebHookUrl}`,
        path = '/api/websocket',
        autoConnect = true,
        onConnect,
        onDisconnect,
        onError,
    } = options;

    const [isConnected, setIsConnected] = useState<boolean>(!!socketInstance?.connected);

    const connect = useCallback(() => {
        if (!socketInstance) {
            socketInstance = io(`${url}`, {
                path: '/websockets',
                transports: ['websocket', 'polling'],
                autoConnect: false,
            });

            // Global listeners for the singleton
            socketInstance.on('connect', () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                console.log('WebSocket disconnected');
                setIsConnected(false);
            });

            socketInstance.on('error', (error: Error) => {
                console.error('WebSocket error:', error);
            });

            socketInstance.on('connected', (data) => {
                console.log('Server confirmed connection:', data);
            });

            socketInstance.connect();
        } else {
            if (socketInstance.connected) {
                setIsConnected(true);
            }
        }
    }, [url]);

    const disconnect = useCallback(() => {
        // Singleton pattern: do not disconnect the shared socket
        // socketInstance?.disconnect();
    }, []);

    const sendMessage = useCallback((event: string, data: any) => {
        if (socketInstance?.connected) {
            socketInstance.emit(event, data);
        } else {
            console.warn('Socket not connected');
        }
    }, []);

    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        // Helper to attach/detach local listeners
        const handleConnect = () => { setIsConnected(true); onConnect?.(); };
        const handleDisconnect = () => { setIsConnected(false); onDisconnect?.(); };
        const handleError = (err: Error) => { onError?.(err); };

        if (socketInstance) {
            socketInstance.on('connect', handleConnect);
            socketInstance.on('disconnect', handleDisconnect);
            socketInstance.on('error', handleError);
        }

        return () => {
            if (socketInstance) {
                socketInstance.off('connect', handleConnect);
                socketInstance.off('disconnect', handleDisconnect);
                socketInstance.off('error', handleError);
            }
        };
    }, [connect, onConnect, onDisconnect, onError, autoConnect]);

    return {
        socket: socketInstance,
        isConnected,
        sendMessage,
        connect,
        disconnect,
    };
};