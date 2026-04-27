const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
  },
  text: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['hr', 'candidate', 'system'], default: 'hr' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

chatMessageSchema.index({ application: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
