
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Conversation, UserRole } from '../types';

interface MessengerProps {
  profile: UserProfile;
  conversations: Conversation[];
  onSendMessage: (chatId: string, text: string) => void;
  activeChatId?: string | null;
  setActiveChatId?: (id: string | null) => void;
}

const Messenger: React.FC<MessengerProps> = ({ 
  profile, 
  conversations, 
  onSendMessage,
  activeChatId,
  setActiveChatId 
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use external state if available, otherwise fallback to local
  const [localChatId, setLocalChatId] = useState<string | null>(null);
  const selectedChatId = activeChatId !== undefined ? activeChatId : localChatId;

  const setSelectedChatId = (id: string | null) => {
    if (setActiveChatId) setActiveChatId(id);
    else setLocalChatId(id);
  };

  const selectedChat = conversations.find(c => c.id === selectedChatId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChat?.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedChatId) return;
    onSendMessage(selectedChatId, inputText);
    setInputText('');
  };

  const getOtherPartyName = (conv: Conversation) => {
    return profile.role === UserRole.FARMER ? conv.researcherName : conv.farmerName;
  };

  return (
    <div className="flex h-[600px] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 professional-shadow overflow-hidden transition-colors">
      {/* Sidebar */}
      <div className={`w-full md:w-80 flex flex-col border-r border-slate-100 dark:border-slate-800 ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversations.length === 0 ? (
            <div className="p-10 text-center space-y-4">
              <i className="fa-solid fa-message text-4xl text-slate-100 dark:text-slate-800"></i>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active chats found</p>
            </div>
          ) : (
            conversations.map(conv => (
              <button 
                key={conv.id}
                onClick={() => setSelectedChatId(conv.id)}
                className={`w-full p-4 flex items-center gap-4 transition-all border-b border-slate-50 dark:border-slate-800/50 ${selectedChatId === conv.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase truncate max-w-[120px]">
                      {getOtherPartyName(conv)}
                    </span>
                    <span className="text-[8px] font-bold text-slate-400">
                      {new Date(conv.messages[conv.messages.length - 1]?.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate font-medium uppercase tracking-tight">
                    {conv.lastMessage || 'Click to view'}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        {selectedChat ? (
          <>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedChatId(null)} className="md:hidden text-slate-400 mr-2">
                  <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none">
                    {getOtherPartyName(selectedChat)}
                  </h3>
                  <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 uppercase mt-1">Resource: {selectedChat.listingName}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50/10 dark:bg-slate-900/10" ref={scrollRef}>
              {selectedChat.messages.map(msg => {
                const isMe = msg.senderName === profile.name;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${isMe ? 'bg-slate-800 dark:bg-slate-700 text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700'}`}>
                      <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                      <span className={`text-[8px] block mt-2 font-bold uppercase opacity-40 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none dark:text-slate-100"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-12 h-12 bg-emerald-700 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-800 transition disabled:opacity-50"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center text-emerald-600 dark:text-emerald-500">
              <i className="fa-solid fa-comments text-3xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Your Inbox</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-xs uppercase font-bold tracking-widest">Select a researcher or farmer to begin communication regarding sustainable bio-waste validation on AniGuard.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
