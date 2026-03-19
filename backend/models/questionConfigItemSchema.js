const mongoose = require('mongoose')

// Each item represents one question type the teacher has configured.
// type + label are user-defined — no enum restrictions.
const capitalize = (v) => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v

const questionConfigItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  label: { type: String, default: '', trim: true, set: capitalize },
  count: { type: Number, default: 0 },
  marksEach: { type: Number, default: 1 },
}, { _id: false })

module.exports = questionConfigItemSchema
