import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function GroupList({ groups, currentGroup, onSelectGroup }) {
  return (
    <div className="space-y-2">
      {groups.map(group => (
        <motion.div
          key={group._id}
          className={`p-3 rounded cursor-pointer transition-colors ${
            currentGroup?._id === group._id
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => onSelectGroup(group)}
        >
          <h3 className="font-medium">{group.name}</h3>
          <p className="text-sm text-gray-400">
            {group.members.length} members
          </p>
        </motion.div>
      ))}
    </div>
  );
}

GroupList.propTypes = {
  groups: PropTypes.array.isRequired,
  currentGroup: PropTypes.object,
  onSelectGroup: PropTypes.func.isRequired
}; 
