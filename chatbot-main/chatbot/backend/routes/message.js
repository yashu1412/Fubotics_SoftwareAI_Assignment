const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Group = require('../models/Group');
const auth = require('../middleware/auth.middleware');

// Get messages for a specific group
router.get('/:groupId', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Allow both current and past members to view messages
    if (!group.members.includes(req.userId) && !group.pastMembers.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized to view messages' });
    }

    const messages = await Message.find({ group: req.params.groupId })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send message to a group
router.post('/:groupId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const group = await Group.findById(req.params.groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is an active member (not past member)
    if (!group.members.includes(req.userId)) {
      return res.status(403).json({ message: 'You can no longer send messages to this group' });
    }

    const message = new Message({
      content,
      sender: req.userId,
      group: req.params.groupId
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
