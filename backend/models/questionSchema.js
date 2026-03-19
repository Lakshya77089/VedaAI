const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  id: String,
  text: String,
  type: { type: String, default: 'short_answer' },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'], default: 'Moderate' },
  marks: { type: Number, default: 1 },
  answerKey: { type: String, default: '' },
  options: [String],
}, { _id: false })

module.exports = questionSchema
