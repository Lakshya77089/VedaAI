const {
  handleGetAllAssignments,
  handleCreateAssignment,
  handleGetAssignmentById,
  handleDeleteAssignment,
  handleRegenerateAssignment,
} = require('../services/assignmentService')


async function getAllAssignments(req, res, next) {
  try {
    const result = await handleGetAllAssignments(req.query)
    res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}


async function createAssignment(req, res, next) {
  try {
    const io = req.app.locals.io
    const assignment = await handleCreateAssignment(req.body, io)
    res.status(201).json({ success: true, data: assignment })
  } catch (err) {
    next(err)
  }
}


async function getAssignmentById(req, res, next) {
  try {
    const assignment = await handleGetAssignmentById(req.params.id)
    res.status(200).json({ success: true, data: assignment })
  } catch (err) {
    next(err)
  }
}


async function deleteAssignment(req, res, next) {
  try {
    const result = await handleDeleteAssignment(req.params.id)
    res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}


async function regenerateAssignment(req, res, next) {
  try {
    const io = req.app.locals.io
    const result = await handleRegenerateAssignment(req.params.id, io)
    res.status(200).json({ success: true, ...result })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getAllAssignments,
  createAssignment,
  getAssignmentById,
  deleteAssignment,
  regenerateAssignment,
}
