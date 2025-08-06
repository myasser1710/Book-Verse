import { Router } from 'express'
import * as logController from './log.controller.js'

const router = Router()

// router.post('', logController.createLog);        // logs cannot be created manually****
router.get('', logController.getAllLogs)
router.get('/:id', logController.getLogById)

export default router


