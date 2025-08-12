import { Router } from 'express'
import * as bookController from './book.controller.js'

const router = Router()

router.post('/', bookController.createBook)
router.post('/bulk', bookController.createBooks)
router.get('/', bookController.getAllBooks)
router.get('/:id', bookController.getBookById)
router.get('/:id/author', bookController.getBookAuthor)
router.patch('/update/:id', bookController.updateBook)
router.delete('/delete/:id', bookController.removeBook)


export default router

