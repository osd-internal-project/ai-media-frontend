'use client';

import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from './hook';
import ChatServices from '@/app/services/chat.service';
import { axiosCore } from '@/app/lib/axios/axios';
import Image from "next/image";
import { TAIModel } from "@/app/common/ai-model.type";
import { Button, Card, Tooltip } from 'antd';
import { Download, Settings, ChevronDown, RectangleHorizontal, Monitor, Image as ImageIcon, Sparkles, Zap, Share2 } from 'lucide-react';

interface Message {
    id: string,
    taskId: string,
    projectId: string,
    userId: string,
    prompt: string,
    typeGenerate: string,
    createdAt: string,
    status: boolean,
    genneratedStatus: string,
    generateConfig: {
        ratio: string,
        width: number,
        height: number,
        content: string,
        duration: string,
        modelName: string,
        imageCount: number,
        resolution: string
    },
    users: {
        id: number,
        userId: string,
        username: string,
        fullname: string,
        email: string,
        tier: string,
        description: string,
        phoneNumber: string,
        status: string,
        lastOn: string,
        maxToken: number,
        maxImages: number,
        apiKeys: string,
        token: string,
        createdAt: string,
        updatedAt: string,
        agreement: boolean,
        recentOrganizationId: string
    },
    referenceImages: [],
    resolution: string,
    ratio: string,
    imageUrls: { imageUrl: string, thumbnailUrl: string, id: string, status: boolean }[]
}


interface Conversation {
    id: string;
    title: string;
    lastMessageAt: string;
    messages: Message[];
}

export default function ChatHistory() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const previousScrollHeightRef = useRef(0);

    // Pagination State
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);
    const LIMIT = 3;

    const { socket, isConnected } = useWebSocket();

    const userId = '8fc7e357-2bb9-47bc-b9a1-403485a1bea0';
    const projectId = '9d5fc34d-ae59-4d68-9b05-b5f1861865fb';

    // Load conversations
    useEffect(() => {
        loadConversations();
    }, []);

    // Listen to WebSocket events
    useEffect(() => {
        if (!socket) return;

        socket.on('chat:history', (data) => {
            console.log(data, `data chat:history`)
            if (data.success) {
                // Determine if we should scroll to bottom (initial load)
                // or maintain position (pagination)
                const newMessages = data.data.messages || [];
                const isInitialLoad = page === 0;

                setIsFetchingHistory(false);

                if (newMessages.length < LIMIT) {
                    setHasMore(false);
                }

                setCurrentConversation(prev => {
                    if (!prev) return data.data;

                    // If it's a new conversation load (different ID), replace entirely
                    if (prev.id !== data.data.id) {
                        const sorted = [...data.data.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        return { ...data.data, messages: sorted };
                    }

                    // Pagination: Merge and Sort
                    const existingIds = new Set(prev.messages.map(m => m.id));
                    const uniqueNewMessages = newMessages.filter((m: Message) => !existingIds.has(m.id));

                    if (isInitialLoad) {
                        const sorted = [...data.data.messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                        return { ...data.data, messages: sorted };
                    }

                    // Merge and Sort by Date Ascending
                    const allMessages = [...uniqueNewMessages, ...prev.messages].sort((a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );

                    return {
                        ...prev,
                        messages: allMessages
                    };
                });
            } else {
                setIsFetchingHistory(false);
            }
        });

        socket.on('chat:message-saved', (data) => {
            if (data.success && currentConversation) {
                setCurrentConversation(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        messages: [...prev.messages, data.data]
                    };
                });

                // Scroll to bottom when new message is sent/received
                setTimeout(() => scrollToBottom(), 100);
            }
        });

        socket.on('chat:new-message', (data) => {
            if (currentConversation && data.data.conversationId === currentConversation.id) {
                setCurrentConversation(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        messages: [...prev.messages, data.data]
                    };
                });
                // Scroll to bottom when new message received
                setTimeout(() => scrollToBottom(), 100);
            }
        });

        // Listen to generation complete
        socket.on('generate:complete', async (data) => {
            // บันทึก assistant message
            await saveAssistantMessage(data);
        });

        return () => {
            socket.off('chat:history');
            socket.off('chat:message-saved');
            socket.off('chat:new-message');
            socket.off('generate:complete');
        };
    }, [socket, currentConversation, page]);

    useEffect(() => {
        if (page === 0 && currentConversation?.messages.length) {
            scrollToBottom();
        }
    }, [currentConversation?.id]); // Scroll when conversation ID changes

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

        // Check if scrolled to top
        if (scrollTop === 0 && hasMore && !isFetchingHistory) {
            loadMoreMessages();
        }
    };

    const loadMoreMessages = () => {
        if (!currentConversation || !socket) return;

        setIsFetchingHistory(true);
        const nextPage = page + 1;
        setPage(nextPage);

        // Capture current scroll height
        if (chatContainerRef.current) {
            previousScrollHeightRef.current = chatContainerRef.current.scrollHeight;
        }

        socket.emit('chat:get-history', {
            projectId: projectId,
            page: nextPage,
            limit: LIMIT
        });
    };

    // Restore scroll position logic
    useEffect(() => {
        if (page > 0 && chatContainerRef.current && !isFetchingHistory) {
            const newScrollHeight = chatContainerRef.current.scrollHeight;
            const heightDifference = newScrollHeight - previousScrollHeightRef.current;

            if (heightDifference > 0) {
                chatContainerRef.current.scrollTop = heightDifference;
            }
        }
    }, [currentConversation?.messages, isFetchingHistory]);

    const loadConversations = async () => {
        try {
            // const result = await ChatServices(axiosCore).message(
            //     projectId,
            //     0,
            //     10
            // )
            // console.log(result)
            // if (result.success) {
            setConversations([{
                id: "1",
                title: "test",
                lastMessageAt: "2026-01-23T11:30:36.000Z",
                messages: []
            }]);
            // }
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    const createNewConversation = async () => {
        try {
            const response = await fetch('http://localhost:4002/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    projectId,
                    title: 'New Conversation',
                }),
            });
            const result = await response.json();
            if (result.success) {
                setCurrentConversation(result.data);
                setConversations([result.data, ...conversations]);
                setPage(0);
                setHasMore(true);
            }
        } catch (error) {
            console.error('Failed to create conversation:', error);
        }
    };

    const loadConversation = (conversationId: string) => {
        if (socket) {
            setPage(0);
            setHasMore(true);
            setIsFetchingHistory(true);
            // Slightly differ logic: we might want to clear current convo first to show loading?
            // setCurrentConversation(null); // Optional
            socket.emit('chat:get-history', { projectId: projectId, page: 0, limit: LIMIT });
        }
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !currentConversation) return;

        setIsLoading(true);

        // ส่งผ่าน WebSocket
        if (socket) {
            socket.emit('chat:send-message', {
                conversationId: currentConversation.id,
                userId,
                content: inputText,
            });
        }

        setInputText('');
        setIsLoading(false);
    };

    const saveAssistantMessage = async (data: any) => {
        if (!currentConversation) return;

        try {
            const response = await fetch('http://localhost:4002/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId: currentConversation.id,
                    userId,
                    role: 'assistant',
                    content: `Generated ${data.imageCount} images`,
                    taskId: data.taskId,
                    modelName: 'seedream-4-5-251128',
                    generationConfig: {},
                    images: data.images.map((url: string, index: number) => ({
                        url,
                        size: '2048x2048',
                        index: index + 1,
                    })),
                }),
            });

            const result = await response.json();
            if (result.success) {
                // Reload conversation
                loadConversation(currentConversation.id);
            }
        } catch (error) {
            console.error('Failed to save assistant message:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar - Conversations List */}
            <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700">
                    <button
                        onClick={createNewConversation}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                    >
                        + New Conversation
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => loadConversation(conv.id)}
                            className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-700 ${currentConversation?.id === conv.id ? 'bg-gray-700' : ''
                                }`}
                        >
                            <h3 className="font-semibold truncate">{conv.title}</h3>
                            <p className="text-sm text-gray-400">
                                {formatDate(conv.lastMessageAt)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {currentConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">{currentConversation.title}</h2>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="text-sm text-gray-400">
                                    {isConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            className="flex-1 overflow-y-auto p-6 space-y-6"
                            ref={chatContainerRef}
                            onScroll={handleScroll}
                        >
                            {isFetchingHistory && (
                                <div className="flex justify-center p-2">
                                    <span className="text-sm text-gray-400">Loading history...</span>
                                </div>
                            )}
                            {currentConversation.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                    // className={`max-w-2xl ${message.userId === userId
                                    //     ? 'bg-blue-600 rounded-2xl rounded-tr-sm'
                                    //     : 'bg-gray-800 rounded-2xl rounded-tl-sm'
                                    //     } p-4`}
                                    >
                                        {/* Timestamp Header */}
                                        <div className="mb-1">
                                            <span className="text-[11px] text-gray-500 font-medium tracking-wide">
                                                {formatDate(message.createdAt).split('/')[0]}-{formatDate(message.createdAt).split('/')[1]} {formatTime(message.createdAt)}
                                            </span>
                                        </div>

                                        {/* Content - Prompt */}
                                        <div className="mb-1">
                                            <p className="text-[15px] text-gray-200 leading-7 font-light tracking-wide whitespace-pre-wrap">
                                                {message.prompt}
                                            </p>
                                        </div>

                                        {/* Metadata Chips Row */}
                                        {message.typeGenerate === 'image' && (
                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5 text-[10px] text-gray-300">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    {/* Model Chip */}
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5 text-[10px] text-gray-300">
                                                        <span className="font-medium">{message.generateConfig?.modelName || 'Phoenix 1.0'}</span>
                                                    </div>

                                                    {/* Resolution Chip */}
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5 text-[10px] text-gray-300">
                                                        <Monitor size={10} className="text-gray-400" />
                                                        <span className="font-medium">{message.resolution || message.generateConfig?.resolution || '2k'}</span>
                                                    </div>

                                                    {/* Ratio Chip */}
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5 text-[10px] text-gray-300">

                                                        <span className="font-medium">{message.ratio || message.generateConfig?.ratio || '16:9'}</span>
                                                    </div>

                                                    {/* Count Chip */}
                                                    {(message.generateConfig?.imageCount || 1) > 1 && (
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5 text-[10px] text-gray-300">
                                                            <ImageIcon size={10} className="text-gray-400" />
                                                            <span className="font-medium">{message.generateConfig?.imageCount} images</span>
                                                        </div>
                                                    )}

                                                    {/* Reference Images Count Display if any (optional) */}
                                                    {/* {message.referenceImages && message.referenceImages.length > 0 && (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-md border border-white/5 text-[10px] text-gray-300">
                                                        <span className="font-medium">Smart Reference {message.referenceImages.length}</span>
                                                    </div>
                                                )} */}
                                                    <div className="flex-shrink-0 flex items-center gap-1">
                                                        {message.referenceImages && message.referenceImages.length > 0 ? (
                                                            message.referenceImages.slice(0, 3).map((imageUrl, index) => (
                                                                <Tooltip
                                                                    key={index}
                                                                    title={
                                                                        <div className="p-2">
                                                                            <Image
                                                                                src={imageUrl}
                                                                                alt={`Reference ${index + 1}`}
                                                                                width={200}
                                                                                height={200}
                                                                                className="max-w-[200px] max-h-[200px] object-contain rounded"
                                                                                unoptimized
                                                                            />
                                                                        </div>
                                                                    }
                                                                    placement="bottom"
                                                                    mouseEnterDelay={0.3}
                                                                    mouseLeaveDelay={0.1}
                                                                    arrow={false}
                                                                >
                                                                    <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 cursor-pointer hover:border-white/40 transition-colors">
                                                                        <Image
                                                                            src={imageUrl}
                                                                            alt={`Reference ${index + 1}`}
                                                                            width={32}
                                                                            height={32}
                                                                            className="w-full h-full object-cover"
                                                                            unoptimized
                                                                            onError={(e) => {
                                                                                console.error(
                                                                                    `Reference image ${index + 1} failed to load:`,
                                                                                    imageUrl,
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </Tooltip>
                                                            ))
                                                        ) : (
                                                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 bg-gray-700 flex items-center justify-center">
                                                                <svg
                                                                    width="16"
                                                                    height="16"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                >
                                                                    <path
                                                                        d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z"
                                                                        stroke="#9CA3AF"
                                                                        strokeWidth="1.5"
                                                                        fill="none"
                                                                    />
                                                                    <path
                                                                        d="M4 15L8 11L12 15L16 11L20 15"
                                                                        stroke="#9CA3AF"
                                                                        strokeWidth="1.5"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        fill="none"
                                                                    />
                                                                    <circle
                                                                        cx="8.5"
                                                                        cy="8.5"
                                                                        r="1.5"
                                                                        stroke="#9CA3AF"
                                                                        strokeWidth="1.5"
                                                                        fill="none"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        {message.referenceImages && message.referenceImages.length > 3 && (
                                                            <div className="relative w-8 h-8 rounded-md overflow-hidden border border-white/20 bg-gray-700 flex items-center justify-center">
                                                                <span className="text-xs text-gray-400">
                                                                    +{message.referenceImages.length - 3}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Generated Images */}
                                        {message.imageUrls && message.imageUrls.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2 overflow-hidden">
                                                {message.imageUrls.map((img: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="relative group aspect-[9/16] bg-black/40 cursor-pointer overflow-hidden"
                                                    >
                                                        <Image
                                                            src={img.imageUrl}
                                                            alt={`Generated ${index + 1}`}
                                                            width={400}
                                                            height={700}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                            unoptimized
                                                        />

                                                        {/* Minimal Overlay */}
                                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <button className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md backdrop-blur-md transition-colors">
                                                                <Share2 size={12} />
                                                            </button>
                                                            <button className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md backdrop-blur-md transition-colors">
                                                                <Download size={12} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Status (Subtle) */}
                                        {message.genneratedStatus && message.genneratedStatus !== 'SUCCESS' && (
                                            <div className="mt-2 text-[10px] text-yellow-500/70 font-mono tracking-wider flex justify-end">
                                                RUNNING PROCESS...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-20 pointer-events-none">
                            <div className="w-full max-w-4xl pointer-events-auto">
                                <div className="bg-[#1a1b1e]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2">

                                    {/* Top: Image & Input */}
                                    <div className="flex gap-3 p-2">
                                        {/* Image Upload Placeholder */}
                                        <div className="flex-shrink-0 w-16 h-16 bg-white/5 rounded-xl border border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors group">
                                            <ImageIcon size={20} className="text-gray-500 group-hover:text-gray-300" />
                                            {/* Plus badge */}
                                            <div className="absolute mb-4 mr-4 bg-gray-700 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                            </div>
                                        </div>

                                        {/* Text Input */}
                                        <div className="flex-1 min-h-[64px]">
                                            <textarea
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSendMessage();
                                                    }
                                                }}
                                                placeholder="Enter your prompt according to the uploaded image."
                                                className="w-full h-full bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-500 text-sm resize-none p-2 rounded-lg"
                                                disabled={isLoading || !isConnected}
                                                style={{ fieldSizing: "content" } as any} // New CSS property for auto-growing textarea, or removing if not supported and using simple h-full
                                            />
                                        </div>

                                        {/* Expand/Collapse (Optional placeholder from image "Tpl") */}
                                        <div className="flex-shrink-0 pt-2">
                                            <button className="text-gray-500 hover:text-gray-300">
                                                <RectangleHorizontal size={14} className="rotate-90" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom: Settings & Actions */}
                                    <div className="flex items-center justify-between px-2 pt-1 pb-1">
                                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                                            {/* Group Image */}
                                            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-xs text-gray-300 whitespace-nowrap">
                                                <ImageIcon size={12} />
                                                <span>Group image</span>
                                                <ChevronDown size={10} className="text-gray-500" />
                                            </button>

                                            {/* Resolution */}
                                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-xs text-gray-300 min-w-[3rem]">
                                                2K
                                            </button>

                                            {/* Ratio */}
                                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-xs text-gray-300">
                                                <RectangleHorizontal size={12} />
                                                <span>1:1</span>
                                            </button>

                                            {/* Count */}
                                            <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-xs text-gray-300 min-w-[3rem]">
                                                1pcs
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
                                            <span className="text-[10px] text-gray-500 whitespace-nowrap hidden sm:block">
                                                estimated cost 0.040 USD
                                            </span>

                                            <button
                                                onClick={handleSendMessage}
                                                disabled={isLoading || !isConnected || !inputText.trim()}
                                                className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
                                            >
                                                {isLoading ? (
                                                    <span className="animate-spin text-lg">⟳</span>
                                                ) : (
                                                    <Zap size={18} fill="currentColor" />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">No conversation selected</h2>
                            <p className="text-gray-400 mb-4">
                                Select a conversation or create a new one
                            </p>
                            <button
                                onClick={createNewConversation}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                            >
                                Start New Conversation
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}