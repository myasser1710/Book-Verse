import { Router } from 'express'
import * as bookController from './book.controller.js'
// import { createBookServices } from './book.service.js'

const router = Router()
// const bookServices = createBookServices(bookServices)

router.post('', bookController.createBook)
router.post('/bulk-create', bookController.createBooks)
router.get('', bookController.getAllBooks)
router.get('/:id', bookController.getBookById)
router.get('/author/:id', bookController.getBookAuthor)
router.patch('/update/:id', bookController.updateBook)
router.patch('/delete/:id', bookController.removeBook)

// router.post('/bulk-delete', bookController.bulkDeleteBooks)
// router.post('/bulk-update', bookController.bulkUpdateBooks)

export default router

// e3ml el validation b joi
