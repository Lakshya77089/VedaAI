const mongoose = require('mongoose')
const sectionSchema = require('./sectionSchema')
const questionConfigItemSchema = require('./questionConfigItemSchema')

const capitalize = (v) => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v

const assignmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, set: capitalize },
  schoolName: { type: String, default: '' },
  subject: { type: String, required: true, trim: true, set: capitalize },
  className: { type: String, required: true, trim: true, set: capitalize },
  dueDate: { type: Date, required: true },
  additionalInstructions: { type: String, default: '' },
  additionalInfo: { type: String, default: '' },
  questionConfig: [questionConfigItemSchema],
  status: {
    type: String,
    enum: ['pending', 'processing', 'complete', 'error'],
    default: 'pending',
  },
  generatedContent: {
    sections: [sectionSchema],
    totalMarks: Number,
    totalQuestions: Number,
    timeAllowed: Number,
    generalInstructions: { type: String, default: '' },
  },
  errorMessage: { type: String },
}, { timestamps: true })

// Helpful indexes for the assignments listing endpoint.
assignmentSchema.index({ createdAt: -1 })
assignmentSchema.index({ name: 1 })
assignmentSchema.index({ status: 1 })
assignmentSchema.index({ name: 1, createdAt: -1 })

module.exports = mongoose.model('Assignment', assignmentSchema)
