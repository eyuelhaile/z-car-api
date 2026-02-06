'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Send,
  Phone,
  MoreVertical,
  ImageIcon,
  Paperclip,
  Check,
  CheckCheck,
  Loader2,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  useConversations,
  useMessages,
  useSendMessage,
  useMarkConversationRead,
} from '@/hooks/use-dashboard';
import { useAuthStore } from '@/lib/store';
import { Conversation, Message, UserSummary } from '@/types';
import { formatDistanceToNow } from 'date-fns';

// Helper to determine the other user in a conversation
function getOtherUser(conversation: Conversation, currentUserId: string): UserSummary | null {
  if (conversation.buyerId === currentUserId) {
    return conversation.seller;
  }
  return conversation.buyer;
}

// Helper to get the last message from conversation
function getLastMessage(conversation: Conversation): Message | null {
  if (conversation.messages && conversation.messages.length > 0) {
    return conversation.messages[conversation.messages.length - 1];
  }
  return null;
}

// Helper to get listing thumbnail
function getListingThumbnail(conversation: Conversation): string | null {
  const listing = conversation.listing;
  if (!listing) return null;
  
  if (typeof listing.thumbnail === 'string' && listing.thumbnail) {
    return listing.thumbnail;
  }
  
  const images = (listing as any).images;
  if (images && Array.isArray(images) && images.length > 0) {
    return images[0].thumbnail || images[0].url;
  }
  
  return null;
}

// Helper to format price
function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    maximumFractionDigits: 0,
  }).format(numPrice);
}

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const currentUserId = user?.id || '';

  // Fetch conversations
  const { data: conversations, isLoading: isLoadingConversations } = useConversations();
  
  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useMessages(
    selectedConversationId || ''
  );
  
  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkConversationRead();

  const [lastMarkedReadId, setLastMarkedReadId] = useState<string | null>(null);

  // Get selected conversation from the list
  const selectedConversation = useMemo(() => {
    if (!selectedConversationId || !conversations) return null;
    return conversations.find((c: Conversation) => c.id === selectedConversationId) || null;
  }, [selectedConversationId, conversations]);

  // Get messages - from API or fallback to conversation
  const messages = useMemo(() => {
    if (messagesData?.messages && messagesData.messages.length > 0) {
      // Sort by createdAt
      return [...messagesData.messages].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    if (selectedConversation?.messages) {
      return [...selectedConversation.messages].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    return [];
  }, [messagesData, selectedConversation]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark conversation as read when selected or when messages are fetched.
  // Use lastMarkedReadId to avoid duplicate calls.
  useEffect(() => {
    const convId = selectedConversationId || messagesData?.conversation?.id;
    const unreadCount = messagesData?.conversation?.unreadCount ?? selectedConversation?.unreadCount ?? 0;

    if (!convId) return;
    if (unreadCount <= 0) return;
    if (lastMarkedReadId === convId) return;

    markReadMutation.mutate(convId, {
      onSuccess: () => {
        setLastMarkedReadId(convId);
      },
      onError: () => {
        // don't set lastMarkedReadId so we can retry on next fetch/selection
      },
    });
  }, [selectedConversationId, messagesData?.conversation?.id, messagesData?.conversation?.unreadCount, selectedConversation?.unreadCount, lastMarkedReadId, markReadMutation]);

  // Handle send message
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId || sendMessageMutation.isPending) return;
    
    const content = newMessage.trim();
    setNewMessage('');
    
    sendMessageMutation.mutate(
      { conversationId: selectedConversationId, content },
      {
        onError: () => {
          // Restore message on error
          setNewMessage(content);
        },
      }
    );
  };

  // Handle conversation selection
  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversationId(conv.id);
    setShowMobileChat(true);
  };
  
  // Also mark read immediately when a conversation is selected (ensure POST is sent)
  const markReadImmediately = (convId: string) => {
    if (!convId) return;
    if (lastMarkedReadId === convId) return;
    markReadMutation.mutate(convId, {
      onSuccess: () => setLastMarkedReadId(convId),
      onError: () => {
        // allow retry later
      },
    });
  };

  // Wrap selection handler to also mark read immediately
  const handleSelectConversationWithMark = (conv: Conversation) => {
    handleSelectConversation(conv);
    markReadImmediately(conv.id);
  };

  // Handle back to list (mobile)
  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  // Filter conversations by search
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    if (!searchQuery) return conversations;
    
    return conversations.filter((conv: Conversation) => {
      const otherUser = getOtherUser(conv, currentUserId);
      return (
        otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [conversations, searchQuery, currentUserId]);

  // Get other user for selected conversation
  const selectedOtherUser = selectedConversation 
    ? getOtherUser(selectedConversation, currentUserId) 
    : null;

  // Loading state
  if (isLoadingConversations) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        <div className="w-full md:w-96 border-r p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-full" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Conversations List */}
      <div className={cn(
        "w-full md:w-96 border-r flex flex-col",
        showMobileChat && "hidden md:flex"
      )}>
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConversations.length > 0 ? (
            <div className="divide-y">
              {filteredConversations.map((conv: Conversation) => {
                const otherUser = getOtherUser(conv, currentUserId);
                const lastMessage = getLastMessage(conv);
                const thumbnail = getListingThumbnail(conv);
                const isSelected = selectedConversationId === conv.id;
                
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversationWithMark(conv)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                      isSelected && 'bg-muted'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={otherUser?.avatar || undefined} />
                          <AvatarFallback className="bg-amber-100 text-amber-700">
                            {otherUser?.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {otherUser?.isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium truncate">{otherUser?.name || 'Unknown User'}</p>
                          <span className="text-xs text-muted-foreground">
                            {lastMessage?.createdAt
                              ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })
                              : conv.updatedAt
                              ? formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })
                              : ''}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mb-1">
                          {lastMessage?.content || 'No messages yet'}
                        </p>
                        <div className="flex items-center gap-2">
                          {thumbnail && (
                            <div className="w-6 h-6 rounded overflow-hidden bg-muted relative shrink-0">
                              <Image
                                src={thumbnail}
                                alt=""
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <p className="text-xs text-amber-600 truncate">
                            {conv.listing?.title}
                          </p>
                        </div>
                      </div>
                      {conv.unreadCount > 0 && (
                        <Badge className="bg-amber-500 shrink-0">{conv.unreadCount}</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No conversations</h3>
              <p className="text-muted-foreground text-center text-sm">
                Start a conversation by contacting a seller on a listing
              </p>
              <Link href="/vehicles" className="mt-4">
                <Button variant="outline">Browse Listings</Button>
              </Link>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col min-h-0",
        showMobileChat ? "flex" : "hidden md:flex"
      )}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedOtherUser?.avatar || undefined} />
                    <AvatarFallback className="bg-amber-100 text-amber-700">
                      {selectedOtherUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {selectedOtherUser?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedOtherUser?.name || 'Unknown User'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedOtherUser?.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedOtherUser?.phone && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={`tel:${selectedOtherUser.phone}`}>
                      <Phone className="h-5 w-5" />
                    </a>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {selectedOtherUser?.id && (
                      <DropdownMenuItem asChild>
                        <Link href={`/sellers/${selectedOtherUser.id}`}>View Profile</Link>
                      </DropdownMenuItem>
                    )}
                    {selectedConversation.listing && (
                      <DropdownMenuItem asChild>
                        <Link href={`/vehicles/${selectedConversation.listing.slug || selectedConversation.listingId}`}>
                          View Listing
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600">Block User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Listing Info */}
            {selectedConversation.listing && (
              <div className="p-4 bg-muted/30 border-b shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted relative shrink-0">
                    {getListingThumbnail(selectedConversation) ? (
                      <Image
                        src={getListingThumbnail(selectedConversation)!}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {selectedConversation.listing.title}
                    </p>
                    <p className="text-amber-600 font-semibold">
                      {formatPrice(selectedConversation.listing.price)}
                    </p>
                  </div>
                  <Link href={`/vehicles/${selectedConversation.listing.slug || selectedConversation.listingId}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-4">
              {isLoadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg: Message) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex',
                          isMe ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {!isMe && (
                          <Avatar className="h-8 w-8 mr-2 shrink-0">
                            <AvatarImage src={selectedOtherUser?.avatar || undefined} />
                            <AvatarFallback className="text-xs bg-muted">
                              {selectedOtherUser?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2',
                            isMe
                              ? 'bg-amber-500 text-white rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div
                            className={cn(
                              'flex items-center gap-1 mt-1',
                              isMe ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <span
                              className={cn(
                                'text-[10px]',
                                isMe ? 'text-white/70' : 'text-muted-foreground'
                              )}
                            >
                              {msg.createdAt
                                ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })
                                : ''}
                            </span>
                            {isMe && (
                              <span className="text-white/70">
                                {msg.isRead ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              )}
              </div>
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="p-4 border-t shrink-0 bg-background">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  className="shrink-0 bg-amber-500 hover:bg-amber-600"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
