import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatMessage from './ChatMessage';
import GroupList from './GroupList';
import CreateGroupModal from './CreateGroupModal';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [showGroupMenu, setShowGroupMenu] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (currentGroup) {
      fetchMessages(currentGroup._id);
    }
  }, [currentGroup]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setGroups(response.data);
      if (response.data.length > 0) {
        setCurrentGroup(response.data[0]);
      }
    } catch (error) {
      setError('Failed to load groups');
    }
  };
  // 

  const fetchMessages = async (groupId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/messages/${groupId}`);
      setMessages(response.data.reverse());
      setError(null);
    } catch (error) {
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentGroup || !newMessage.trim()) return;
    
    try {
      const response = await axios.post(
        `/api/messages/${currentGroup._id}`,
        { content: newMessage.trim() },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Add the new message to the messages array with sender information
      const messageWithSender = {
        ...response.data,
        sender: {
          _id: user.id,
          username: user.username
        }
      };
      
      setMessages(prev => [...prev, messageWithSender]);
      setNewMessage('');
      setError(null);
    } catch (error) {
      console.error('Send message error:', error);
      setError(error.response?.data?.message || 'Failed to send message');
    }
  };

  const createGroup = async (groupData) => {
    try {
      const response = await axios.post('/api/groups', groupData);
      setGroups(prev => [...prev, response.data.group]);
      setShowCreateGroup(false);
    } catch (error) {
      setError('Failed to create group');
    }
  };

  const leaveGroup = async () => {
    if (!currentGroup) return;

    try {
      const response = await axios.post(`/api/groups/${currentGroup._id}/leave`);
      
      // Remove group from list if it was deleted (no members left)
      if (response.data.message.includes('deleted')) {
        setGroups(prevGroups => prevGroups.filter(g => g._id !== currentGroup._id));
        setCurrentGroup(null);
      } else {
        // Update the group in the list with new members
        const updatedGroups = groups.map(g => {
          if (g._id === currentGroup._id) {
            return {
              ...g,
              members: g.members.filter(memberId => memberId !== user.id)
            };
          }
          return g;
        });
        setGroups(updatedGroups);
        
        // If there are other groups, switch to the first one
        if (updatedGroups.length > 0 && currentGroup._id === updatedGroups[0]._id) {
          setCurrentGroup(updatedGroups[1] || null);
        } else {
          setCurrentGroup(updatedGroups[0] || null);
        }
      }
      
      setShowGroupMenu(false);
      setError(null);
    } catch (error) {
      console.error('Leave group error:', error);
      setError(error.response?.data?.message || 'Failed to leave group');
    }
  };

  const deleteGroup = async () => {
    if (!currentGroup) return;

    try {
      await axios.delete(
        `/api/groups/${currentGroup._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      // Remove group from list and clear messages
      setGroups(prevGroups => {
        const updatedGroups = prevGroups.filter(g => g._id !== currentGroup._id);
        // Switch to another group if available
        if (updatedGroups.length > 0) {
          setCurrentGroup(updatedGroups[0]);
        } else {
          setCurrentGroup(null);
          setMessages([]); // Clear messages when no groups left
        }
        return updatedGroups;
      });
      
      setShowGroupMenu(false);
      setError(null);
    } catch (error) {
      console.error('Delete group error:', error);
      setError(error.response?.data?.message || 'Failed to delete group');
    }
  };

  const canSendMessage = true;

  const handleMessageChange = (e) => {
    console.log('Input value:', e.target.value);
    setNewMessage(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="w-64 bg-gray-800 p-4">
        <button
          onClick={() => setShowCreateGroup(true)}
          className="w-full mb-4 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded transition-colors"
        >
          Create New Group
        </button>
        <GroupList
          groups={groups}
          currentGroup={currentGroup}
          onSelectGroup={setCurrentGroup}
        />
      </div>
      
      <div className="flex-1 flex flex-col">
        {currentGroup ? (
          <>
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{currentGroup.name}</h2>
              <div className="relative">
                <button
                  onClick={() => setShowGroupMenu(!showGroupMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
                {showGroupMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={leaveGroup}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Leave Group
                      </button>
                      {currentGroup?.creator === user.id && (
                        <button
                          onClick={deleteGroup}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete Group
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
              {messages.map((message) => (
                <motion.div key={message._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  <ChatMessage
                    message={message}
                    isOwnMessage={message.sender._id === user.id}
                  />
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  placeholder={canSendMessage ? "Type a message..." : "You can no longer send messages to this group"}
                  disabled={!canSendMessage}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <button 
                  onClick={sendMessage}
                  disabled={!canSendMessage || !newMessage.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors
                    ${(!canSendMessage || !newMessage.trim()) 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }
                  `}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a group or create a new one to start chatting
          </div>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={createGroup}
        />
      )}
    </div>
  );
}
