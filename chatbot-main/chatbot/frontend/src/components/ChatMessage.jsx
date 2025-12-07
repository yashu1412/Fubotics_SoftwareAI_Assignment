import PropTypes from 'prop-types';

export default function ChatMessage({ message, isOwnMessage }) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isOwnMessage && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center">
            {message.sender.username.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isOwnMessage
            ? 'bg-purple-600 text-white'
            : 'bg-gray-800 text-gray-200'
        }`}
      >
        {!isOwnMessage && (
          <div className="text-xs text-gray-400 mb-1">
            {message.sender.username}
          </div>
        )}
        <div>{message.content}</div>
        <div className="text-xs mt-1 text-right text-gray-400">
          {new Date(message.createdAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}

ChatMessage.propTypes = {
  message: PropTypes.shape({
    content: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      username: PropTypes.string.isRequired,
      _id: PropTypes.string.isRequired
    }).isRequired,
    createdAt: PropTypes.string.isRequired
  }).isRequired,
  isOwnMessage: PropTypes.bool.isRequired
};
 