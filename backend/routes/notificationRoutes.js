const express = require('express')
const router = express.Router()
const Notification = require('../models/notificationModel')

// Get all notifications
router.get('/', async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50)
  res.json(notifications)
})

// Mark a notification as read
router.patch('/:id/read', async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
  res.json(notification)
})

// Mark all as read
router.patch('/read-all', async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true })
  res.json({ message: 'All marked as read' })
})

// Delete a notification
router.delete('/:id', async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id)
  res.json({ message: 'Deleted' })
})

module.exports = router
