'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// --- Моковые типы и данные ---
type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachments?: { name: string; size: string; type: string }[];
};

type ChatRoom = {
  id: string;
  orderId: string;
  orderTitle: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientType: 'customer' | 'designer';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: ChatMessage[];
  budget: string;
  status: 'active' | 'archived';
};

const CURRENT_USER_ID = 'me_user';

const MOCK_CHATS: ChatRoom[] = [
  {
    id: 'chat_1',
    orderId: 'order1',
    orderTitle: 'Проектирование жилого комплекса «Парк Резиденс»',
    recipientId: 'dsn1',
    recipientName: 'Архитектурное бюро «ПРОЕКТ.А»',
    recipientType: 'designer',
    lastMessage: 'Да, конечно. Завтра вышлем вам ТЗ на согласование.',
    lastMessageTime: '10:42',
    unreadCount: 2,
    budget: '12 000 000 ₽',
    status: 'active',
    messages: [
      { id: 'm1', senderId: 'me_user', text: 'Здравствуйте! Ознакомился с вашим откликом. Вы готовы взяться за стадию П?', timestamp: 'Вчера, 14:20', isRead: true },
      { id: 'm2', senderId: 'dsn1', text: 'Добрый день! Да, наш штат полностью закрывает этот объем.', timestamp: 'Вчера, 15:05', isRead: true },
      { id: 'm3', senderId: 'dsn1', text: 'Единственное, нам потребуется уточнить геологию. У вас есть актуальные изыскания?', timestamp: 'Вчера, 15:06', isRead: true },
      { id: 'm4', senderId: 'me_user', text: 'Изыскания есть, прикрепил к заявке. Сможете подготовить детальное ТЗ?', timestamp: '09:15', isRead: true },
      { id: 'm5', senderId: 'dsn1', text: 'Да, конечно. Завтра вышлем вам ТЗ на согласование.', timestamp: '10:42', isRead: false },
    ]
  },
  {
    id: 'chat_2',
    orderId: 'order2',
    orderTitle: 'Рабочая документация коттеджа 350 м²',
    recipientId: 'dsn3',
    recipientName: 'Иванов Сергей Петрович',
    recipientType: 'designer',
    lastMessage: 'Я закончил первый этаж, жду комментариев.',
    lastMessageTime: 'Вчера',
    unreadCount: 0,
    budget: '650 000 ₽',
    status: 'active',
    messages: [
      { id: 'm1', senderId: 'dsn3', text: 'Добрый день. Приступаю к работе.', timestamp: 'Пн, 09:00', isRead: true },
      { id: 'm2', senderId: 'dsn3', text: 'Я закончил первый этаж, жду комментариев.', timestamp: 'Вчера, 18:30', isRead: true, attachments: [{ name: 'plan_1_l.dwg', size: '2.4 MB', type: 'dwg' }] }
    ]
  },
  {
    id: 'chat_3',
    orderId: 'order4',
    orderTitle: 'Водоснабжение микрорайона «Солнечный»',
    recipientId: 'cus5',
    recipientName: 'Муниципальный Заказчик',
    recipientType: 'customer',
    lastMessage: 'Ваш проект проходит госэкспертизу.',
    lastMessageTime: '24 Мар',
    unreadCount: 0,
    budget: '5 500 000 ₽',
    status: 'archived',
    messages: [
      { id: 'm1', senderId: 'cus5', text: 'Ваш проект проходит госэкспертизу.', timestamp: '24 Мар, 11:00', isRead: true }
    ]
  }
];

export default function ChatPage() {
  const [chats, setChats] = useState<ChatRoom[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string>(chats[0].id);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on load/new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [activeChatId, chats]);

  // Mark all as read when opening
  useEffect(() => {
    if (activeChat && activeChat.unreadCount > 0) {
      setChats(prev => prev.map(c => 
        c.id === activeChat.id ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [activeChat]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: CURRENT_USER_ID,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          messages: [...c.messages, msg],
          lastMessage: msg.text,
          lastMessageTime: msg.timestamp
        };
      }
      return c;
    }));

    setNewMessage('');
  };

  const filteredChats = chats.filter(c => 
    c.recipientName.toLowerCase().includes(search.toLowerCase()) || 
    c.orderTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in" style={{
      height: 'calc(100vh - 100px)', // adjust based on header
      display: 'flex',
      gap: 16,
      marginTop: -8 // compensate for page-container padding to max height
    }}>
      
      {/* 1. Left Sidebar - Chat List */}
      <div className="card" style={{ 
        width: 320, 
        display: 'flex', 
        flexDirection: 'column', 
        padding: 0,
        overflow: 'hidden',
        border: '1px solid var(--border)' 
      }}>
        {/* Chat List Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Коммуникации</h2>
          <div className="dsn-search-wrapper" style={{ margin: 0, background: 'var(--bg-primary)' }}>
            <span className="dsn-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск сообщений..."
              className="dsn-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 13, height: 36 }}
            />
          </div>
        </div>

        {/* Chats Array */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredChats.map(chat => {
            const isActive = chat.id === activeChatId;
            return (
              <div 
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  background: isActive ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  cursor: 'pointer',
                  borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'background 0.2s ease',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center'
                }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: chat.recipientType === 'designer' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #43e97b, #38f9d7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 16
                  }}>
                    {chat.recipientType === 'designer' ? 'Д' : 'З'}
                  </div>
                  {chat.unreadCount > 0 && (
                    <div style={{
                      position: 'absolute', top: -2, right: -2,
                      background: 'var(--status-error)', color: 'white',
                      fontSize: 10, fontWeight: 700, width: 18, height: 18,
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid var(--bg-secondary)'
                    }}>
                      {chat.unreadCount}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {chat.recipientName}
                    </div>
                    <div style={{ fontSize: 11, color: chat.unreadCount > 0 ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}>
                      {chat.lastMessageTime}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.orderTitle}
                  </div>
                  <div style={{ fontSize: 13, color: chat.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {chat.lastMessage}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Chat Window */}
      <div className="card" style={{ 
        flex: 1, 
        padding: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        border: '1px solid var(--border)' 
      }}>
        {activeChat ? (
          <>
            {/* Header */}
            <div style={{ 
              padding: '20px 24px', 
              borderBottom: '1px solid var(--border)', 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-secondary)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                 <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: activeChat.recipientType === 'designer' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #43e97b, #38f9d7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 18
                  }}>
                    {activeChat.recipientType === 'designer' ? 'Д' : 'З'}
                 </div>
                 <div>
                   <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{activeChat.recipientName}</h2>
                   <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                     {activeChat.recipientType === 'designer' ? 'Проектировщик' : 'Заказчик'}
                     <span>•</span>
                     <span style={{ color: 'var(--status-success)' }}>В сети</span>
                   </div>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setShowInfo(!showInfo)}>
                   {showInfo ? 'Скрыть детали' : 'Информация'}
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              padding: '24px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              background: 'var(--bg-input)'
            }}>
              {activeChat.messages.map((msg, i) => {
                const isMe = msg.senderId === CURRENT_USER_ID;
                const showAvatar = !isMe && (i === 0 || activeChat.messages[i-1].senderId !== msg.senderId);

                return (
                  <div key={msg.id} style={{
                    display: 'flex',
                    flexDirection: isMe ? 'row-reverse' : 'row',
                    gap: 12,
                    alignItems: 'flex-end'
                  }}>
                    {/* Avatar placeholder for recipient */}
                    {!isMe ? (
                      <div style={{ width: 32 }}>
                        {showAvatar && (
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: activeChat.recipientType === 'designer' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'linear-gradient(135deg, #43e97b, #38f9d7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: 12
                          }}>
                            {activeChat.recipientType === 'designer' ? 'Д' : 'З'}
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Bubble */}
                    <div style={{
                      maxWidth: '70%',
                      background: isMe ? 'var(--accent)' : 'var(--bg-secondary)',
                      padding: '12px 16px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      border: isMe ? 'none' : '1px solid var(--border)'
                    }}>
                      <div style={{ 
                        fontSize: 14, 
                        lineHeight: 1.5, 
                        color: isMe ? 'white' : 'var(--text-primary)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.text}
                      </div>
                      
                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          {msg.attachments.map((att, aIdx) => (
                            <div key={aIdx} style={{
                              display: 'flex', gap: 8, alignItems: 'center',
                              background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--bg-input)',
                              padding: '8px 12px', borderRadius: 8, cursor: 'pointer'
                            }}>
                              <span style={{ fontSize: 16 }}>📁</span>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: isMe ? 'white' : 'var(--text-primary)' }}>{att.name}</div>
                                <div style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>{att.size}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Meta info (time, read receipt) */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 6,
                        alignItems: 'center',
                        marginTop: 4,
                        fontSize: 10,
                        color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)'
                      }}>
                        {msg.timestamp}
                        {isMe && (
                          <span style={{ fontSize: 14, lineHeight: 1 }}>{msg.isRead ? '✓✓' : '✓'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                <button type="button" style={{ 
                   width: 44, height: 44, borderRadius: '50%', 
                   background: 'var(--bg-input)', border: 'none', 
                   color: 'var(--text-secondary)', fontSize: 20, 
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   cursor: 'pointer', flexShrink: 0
                }}>
                  📎
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea 
                    placeholder="Напишите сообщение..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    style={{
                      width: '100%',
                      minHeight: 44,
                      maxHeight: 120,
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 16px',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      resize: 'none',
                      outline: 'none',
                    }}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="btn btn-primary"
                  style={{ width: 44, height: 44, padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <h3 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Выберите чат</h3>
              <p>Для начала общения выберите собеседника в списке слева.</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Right Sidebar - Order Info */}
      {showInfo && activeChat && (
        <div className="card" style={{ 
          width: 280, 
          padding: 0,
          border: '1px solid var(--border)',
          overflowY: 'auto',
          animation: 'slideInRight 0.3s ease'
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
             <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
               Связанная заявка
             </h3>
             <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, lineHeight: 1.4 }}>
               {activeChat.orderTitle}
             </div>
             <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
               <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Бюджет</div>
               <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{activeChat.budget}</div>
             </div>
             <Link href={`/orders/detail?id=${activeChat.orderId}`} className="btn btn-secondary btn-block" style={{ textDecoration: 'none', textAlign: 'center' }}>
               Открыть заявку
             </Link>
          </div>

          {/* Files/Media shared */}
          <div style={{ padding: '20px' }}>
             <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 16 }}>
               Вложения
             </h3>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
               {/* Just showing static files for realism */}
               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                 <div style={{ width: 40, height: 40, background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                   П
                 </div>
                 <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ТЗ_Архитектура.pdf</div>
                   <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>1.2 MB</div>
                 </div>
               </div>
               
               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                 <div style={{ width: 40, height: 40, background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-success)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                   Ч
                 </div>
                 <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Сетка_Колонн.dwg</div>
                   <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>4.5 MB</div>
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}

      {/* Basic Keyframe polyfill via inline style just for completeness */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}} />
    </div>
  );
}
