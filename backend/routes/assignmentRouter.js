const express = require('express')
const router = express.Router()
const assignmentController = require('../controllers/assignmentController')

router.get('/', assignmentController.getAllAssignments)
router.post('/', assignmentController.createAssignment)
router.get('/:id', assignmentController.getAssignmentById)
router.delete('/:id', assignmentController.deleteAssignment)
router.post('/:id/regenerate', assignmentController.regenerateAssignment)

module.exports = router
