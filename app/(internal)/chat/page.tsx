// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { Icon } from '../../_orders/icons';
import { Avatar } from '../../_orders/shared';
import '../../_orders/orders.css';

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

const initials = (name: string, type: 'customer' | 'designer') =>
  (name || '').replace(/[^А-ЯA-Zа-яa-z]/g, '').slice(0, 2).toUpperCase() || (type === 'designer' ? 'Д' : 'З');

export default function ChatPage() {
  const { notify } = useApp();
  const [chats, setChats] = useState<ChatRoom[]>(MOCK_CHATS);
  // На десктопе всегда открыт первый чат по умолчанию
  const [activeChatId, setActiveChatId] = useState<string>(chats[0].id);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');

  // Состояния для десктопа и мобилки
  const [showInfo, setShowInfo] = useState(true);
  const [mobileView, setMobileView] = useState<'list' | 'chat' | 'info'>('list');

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on load/new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [activeChatId, chats, mobileView]);

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
    <div className="fx animate-in chat-layout" style={{
      height: 'calc(100vh - 100px)', // adjust based on header
      marginTop: -8, // compensate for page-container padding to max height
      position: 'relative',
      ...({
        '--mobile-list-display': mobileView === 'list' ? 'flex' : 'none',
        '--mobile-chat-display': mobileView === 'chat' ? 'flex' : 'none',
        '--mobile-info-display': mobileView === 'info' ? 'block' : 'none',
        '--desktop-info-display': showInfo ? 'block' : 'none',
      } as React.CSSProperties)
    }}>

      <div className="chat card" style={{
        height: '100%',
        padding: 0,
        overflow: 'hidden',
        // переопределяем правую колонку видимостью деталей (логика showInfo)
        gridTemplateColumns: showInfo ? '340px 1fr 300px' : '340px 1fr',
      }}>

        {/* 1. Left Sidebar - Chat List */}
        <aside className="chat__list chat-sidebar">
          {/* Chat List Header */}
          <h2 className="section-title" style={{ padding: '20px 20px 0', margin: 0 }}>Коммуникации</h2>
          <div style={{ padding: 16 }}>
            <div className="topbar__search" style={{ maxWidth: 'none' }}>
              <Icon name="search" />
              <input
                type="text"
                placeholder="Поиск сообщений…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Chats Array */}
          <div className="col" style={{ flex: 1, overflowY: 'auto' }}>
            {filteredChats.map(chat => {
              const isActive = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  className={'convitem' + (isActive ? ' is-active' : '')}
                  onClick={() => {
                    setActiveChatId(chat.id);
                    setMobileView('chat');
                  }}
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar text={initials(chat.recipientName, chat.recipientType)} size={44} />
                    {chat.unreadCount > 0 && (
                      <div style={{
                        position: 'absolute', top: -2, right: -2,
                        background: 'var(--red)', color: 'white',
                        fontSize: 10, fontWeight: 700, width: 18, height: 18,
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid var(--surface)'
                      }}>
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="row between">
                      <span className="convitem__name">{chat.recipientName}</span>
                      <span className="dim" style={{ fontSize: 11.5, color: chat.unreadCount > 0 ? 'var(--accent-2)' : undefined, flexShrink: 0 }}>
                        {chat.lastMessageTime}
                      </span>
                    </div>
                    <div className="convitem__order">{chat.orderTitle}</div>
                    <div className="convitem__last" style={{ color: chat.unreadCount > 0 ? 'var(--text)' : undefined }}>{chat.lastMessage}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* 2. Main Chat Window */}
        <section className="chat__thread chat-main">
          {activeChat ? (
            <>
              {/* Header */}
              <header className="chat__head">
                <button
                  className="mobile-back-btn iconbtn"
                  onClick={() => setMobileView('list')}
                  style={{ flexShrink: 0 }}
                >
                  <Icon name="chevR" size={18} style={{ transform: 'scaleX(-1)' }} />
                </button>
                <Avatar text={initials(activeChat.recipientName, activeChat.recipientType)} size={42} />
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activeChat.recipientName}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                    <span className="dim" style={{ color: 'var(--text-mute)' }}>{activeChat.recipientType === 'designer' ? 'Проектировщик' : 'Заказчик'}</span>
                    <span className="dim" style={{ color: 'var(--text-mute)' }}>•</span>
                    <span style={{ color: 'var(--green)' }}>● В сети</span>
                  </div>
                </div>

                <button
                  className="btn btn-ghost btn-sm chat-desktop-info-btn"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  {showInfo ? 'Скрыть детали' : 'Информация'}
                </button>
                <button
                  className="iconbtn chat-mobile-info-btn"
                  onClick={() => setMobileView('info')}
                >
                  <Icon name="comment" size={17} />
                </button>
              </header>

              {/* Messages Area */}
              <div className="chat__body">
                {activeChat.messages.map((msg, i) => {
                  const isMe = msg.senderId === CURRENT_USER_ID;
                  const showAvatar = !isMe && (i === 0 || activeChat.messages[i - 1].senderId !== msg.senderId);

                  return (
                    <div key={msg.id} className={'bubble-row' + (isMe ? ' out' : '')}>
                      {/* Avatar placeholder for recipient */}
                      {!isMe ? (
                        <div className="chat-avatar-placeholder" style={{ width: 30, flexShrink: 0 }}>
                          {showAvatar && (
                            <Avatar text={initials(activeChat.recipientName, activeChat.recipientType)} size={30} />
                          )}
                        </div>
                      ) : null}

                      {/* Bubble */}
                      <div className={'bubble' + (isMe ? ' bubble--out' : '')}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            {msg.attachments.map((att, aIdx) => (
                              <div key={aIdx} style={{
                                display: 'flex', gap: 8, alignItems: 'center',
                                background: isMe ? 'rgba(255,255,255,0.18)' : 'var(--surface-3)',
                                padding: '8px 12px', borderRadius: 'var(--r-sm)', cursor: 'pointer'
                              }}>
                                <Icon name="file" size={16} />
                                <div>
                                  <div style={{ fontSize: 12, fontWeight: 600 }}>{att.name}</div>
                                  <div style={{ fontSize: 10, opacity: 0.75 }}>{att.size}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Meta info (time, read receipt) */}
                        <div className="bubble__time">
                          {msg.timestamp}
                          {isMe && (
                            <Icon name="check" size={12} style={{ marginLeft: 4, opacity: msg.isRead ? 1 : 0.6 }} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form className="chat__compose" onSubmit={handleSendMessage}>
                <button type="button" className="iconbtn" onClick={() => notify('Прикрепление файлов — в разработке')}>
                  <Icon name="paperclip" size={17} />
                </button>
                <textarea
                  className="input grow"
                  placeholder="Сообщение…"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  style={{ minHeight: 46, maxHeight: 120, resize: 'none', padding: '12px 16px' }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn btn-primary"
                  style={{ width: 46, padding: 0 }}
                >
                  <Icon name="send" size={17} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty" style={{ flex: 1, justifyContent: 'center' }}>
              <Icon name="comment" size={40} style={{ color: 'var(--text-mute)', marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Выберите чат</h3>
              <p className="dim" style={{ margin: 0 }}>Для начала общения выберите собеседника в списке слева.</p>
            </div>
          )}
        </section>

        {/* 3. Right Sidebar - Order Info */}
        {activeChat && (
          <aside className="chat__info chat-info">
            {/* Mobile Header for Info */}
            <div className="chat-mobile-info-header" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Детали заявки</h2>
              <button className="iconbtn" onClick={() => setMobileView('chat')} style={{ fontSize: 22 }}>×</button>
            </div>

            <div className="overline" style={{ marginBottom: 12 }}>Связанная заявка</div>
            <h3 style={{ margin: '0 0 14px', fontSize: 16, lineHeight: 1.3 }}>{activeChat.orderTitle}</h3>
            <div className="card" style={{ background: 'var(--surface-2)', padding: 14, marginBottom: 16 }}>
              <div className="dim" style={{ fontSize: 12 }}>Бюджет</div>
              <div className="price mt4">{activeChat.budget}</div>
            </div>
            <Link href={`/orders/detail?id=${activeChat.orderId}`} className="btn btn-ghost btn-block" style={{ textDecoration: 'none', marginBottom: 24 }}>
              Открыть заявку
            </Link>

            {/* Files/Media shared */}
            <div className="overline" style={{ marginBottom: 12 }}>Вложения</div>
            <div className="col gap10">
              {/* Just showing static files for realism */}
              <div className="attach">
                <div className="attach__ic"><Icon name="file" size={16} /></div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>ТЗ_Архитектура.pdf</div>
                  <div className="dim" style={{ fontSize: 12 }}>1.2 MB</div>
                </div>
                <Icon name="download" size={15} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </div>

              <div className="attach">
                <div className="attach__ic"><Icon name="layers" size={16} /></div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Сетка_Колонн.dwg</div>
                  <div className="dim" style={{ fontSize: 12 }}>4.5 MB</div>
                </div>
                <Icon name="download" size={15} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Media Query polyfill via inline style (мобильная/десктоп логика видимости) */}
      <style dangerouslySetInnerHTML={{__html: `
        .fx .chat-info {
           display: var(--desktop-info-display);
        }
        .fx .chat-sidebar {
           display: flex;
        }
        .fx .chat-main {
           display: flex;
        }
        .fx .mobile-back-btn { display: none; }
        .fx .chat-mobile-info-btn { display: none; }

        @media (max-width: 768px) {
          .chat-layout {
            margin-top: 0 !important;
            height: calc(100vh - 80px) !important;
          }
          .fx .chat {
            grid-template-columns: 1fr !important;
          }
          .fx .chat-sidebar {
            display: var(--mobile-list-display) !important;
            border-right: none !important;
          }
          .fx .chat-main {
            display: var(--mobile-chat-display) !important;
          }
          .fx .chat-info {
            display: var(--mobile-info-display) !important;
            border-left: none !important;
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 50;
            background: var(--surface);
          }
          .fx .mobile-back-btn { display: flex !important; }
          .fx .chat-mobile-info-btn { display: flex !important; }
          .fx .chat-desktop-info-btn { display: none !important; }
          .fx .chat-mobile-info-header { display: flex !important; }
          .fx .chat-avatar-placeholder { display: none !important; }
        }
      `}} />
    </div>
  );
}
