const mongoose = require('mongoose')
const questionSchema = require('./questionSchema')

const sectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  instruction: { type: String, default: 'Attempt all questions.' },
  questions: [questionSchema],
}, { _id: false })

module.exports = sectionSchema
