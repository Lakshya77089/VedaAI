const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'error'], 
    default: 'info' 
  },
  read: { type: Boolean, default: false },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
}, { timestamps: true })

notificationSchema.index({ createdAt: -1 })
notificationSchema.index({ read: 1 })

module.exports = mongoose.model('Notification', notificationSchema)
