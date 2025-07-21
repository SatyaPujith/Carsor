'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Bot, 
  User, 
  Send, 
  MessageSquare, 
  Plus, 
  History, 
  X, 
  Minimize2,
  Maximize2,
  Sparkles,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Conversation {
  _id: string;
  conversationId: string;
  messages: Message[];
  lastUpdated: string;
  title?: string;
}

export default function FloatingAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !conversationId) {
      startNewChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const startNewChat = () => {
    const newConversationId = new Date().getTime().toString();
    setConversationId(newConversationId);
    setMessages([{
      id: '1',
      text: 'Hello! I\'m your intelligent Tata Motors AI assistant powered by Gemini AI. I can help you with vehicle maintenance, troubleshooting, service schedules, and analyze your reported issues. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date(),
    }]);
    setShowHistory(false);
  };

  const loadConversation = async (convId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chat?conversationId=${convId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setConversationId(convId);
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          conversationId: conversationId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I\'m experiencing technical difficulties. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getConversationTitle = (conv: Conversation) => {
    if (conv.title) return conv.title;
    const firstUserMessage = conv.messages.find(m => m.sender === 'user');
    return firstUserMessage ? 
      firstUserMessage.text.substring(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '') :
      'New Conversation';
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-2xl border-2 border-white/20 backdrop-blur-sm"
          size="icon"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isMinimized ? 'w-72 sm:w-80 h-14 sm:h-16' : 'w-[calc(100vw-1rem)] sm:w-96 h-[calc(100vh-2rem)] sm:h-[600px]'
      } max-w-[calc(100vw-0.5rem)] max-h-[calc(100vh-1rem)]`}>
        <Card className="h-full flex flex-col bg-white/95 backdrop-blur-md border-2 border-purple-200 shadow-2xl overflow-hidden">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-bold truncate">Tata AI Assistant</span>
                    <Sparkles className="w-3 h-3 text-yellow-300 flex-shrink-0 hidden sm:inline" />
                  </div>
                  <p className="text-xs text-purple-100 font-normal hidden sm:block">Powered by Gemini AI</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-white hover:bg-white/20 h-6 w-6 sm:h-7 sm:w-7 p-0"
                >
                  <History className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewChat}
                  className="text-white hover:bg-white/20 h-6 w-6 sm:h-7 sm:w-7 p-0"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20 h-6 w-6 sm:h-7 sm:w-7 p-0"
                >
                  {isMinimized ? <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 h-6 w-6 sm:h-7 sm:w-7 p-0"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              {showHistory ? (
                <div className="flex-1 p-2 sm:p-4">
                  <h3 className="font-semibold mb-3 text-gray-800">Chat History</h3>
                  <ScrollArea className="h-full">
                    <div className="space-y-2">
                      {conversations.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-8">No chat history yet</p>
                      ) : (
                        conversations.map((conv) => (
                          <Card 
                            key={conv._id} 
                            className="cursor-pointer hover:bg-gray-50 transition-colors border border-gray-200"
                            onClick={() => loadConversation(conv.conversationId)}
                          >
                            <CardContent className="p-2 sm:p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                                    {getConversationTitle(conv)}
                                  </p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Clock className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                                    <p className="text-xs text-gray-500">
                                      {new Date(conv.lastUpdated).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {conv.messages.length} msgs
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <>
                  <ScrollArea className="flex-1 p-2 sm:p-3">
                    <div className="space-y-3 min-h-0">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-1 sm:gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            {message.sender === 'bot' && (
                              <Avatar className="w-5 h-5 sm:w-6 sm:h-6 border border-purple-200 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                                  <Bot className="w-2 h-2 sm:w-3 sm:h-3" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div
                              className={`max-w-[80%] sm:max-w-[75%] rounded-lg px-2 sm:px-3 py-2 text-xs shadow-sm break-words ${
                                message.sender === 'user'
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-sm'
                                  : 'bg-gray-100 text-gray-800 border border-gray-200 rounded-bl-sm'
                              }`}
                            >
                              <p className="leading-relaxed whitespace-pre-wrap">{message.text}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {message.sender === 'user' && (
                              <Avatar className="w-5 h-5 sm:w-6 sm:h-6 border border-blue-200 flex-shrink-0">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                                  <User className="w-2 h-2 sm:w-3 sm:h-3" />
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        ))
                      )}
                      {isTyping && (
                        <div className="flex gap-1 sm:gap-2 justify-start">
                          <Avatar className="w-5 h-5 sm:w-6 sm:h-6 border border-purple-200 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                              <Bot className="w-2 h-2 sm:w-3 sm:h-3" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-gray-100 rounded-lg rounded-bl-sm px-2 sm:px-3 py-2 text-xs border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-gray-500 text-xs hidden sm:inline">AI thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <div className="p-2 sm:p-3 border-t bg-gray-50/50 backdrop-blur-sm flex-shrink-0">
                    <div className="flex gap-1 sm:gap-2">
                      <Input
                        placeholder="Ask about your vehicle..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 border border-purple-200 focus:border-purple-400 rounded-lg bg-white/80 backdrop-blur-sm text-xs h-8 sm:h-9"
                        disabled={isTyping}
                        maxLength={500}
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={!input.trim() || isTyping}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg px-2 sm:px-3 shadow-lg flex-shrink-0 h-8 sm:h-9"
                        size="sm"
                      >
                        <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 hidden sm:block">
                        Powered by Gemini AI
                      </p>
                      <p className="text-xs text-gray-400">
                        {input.length}/500
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}