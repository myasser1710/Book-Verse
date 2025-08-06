import { Router } from 'express'
import * as authorController from './author.controller.js'

const router = Router()

router.post('/', authorController.insertAuthor)
router.get('/', authorController.getAllAuthors)
router.get('/:id', authorController.getAuthorById)
router.get('/:id/books', authorController.getAuthorAndBooks)

export default router

// zawed el validation b joi w el errhandler ely fe a5er chat bta3 chatgpt
// w test el factory pattern 4a8al wla la2 ?
