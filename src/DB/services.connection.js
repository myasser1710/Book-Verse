import { dbPromise } from "./dbConnection.js"
import { createBookServices } from "../Modules/Books/book.service.js"
import { createAuthorServices } from "../Modules/Authors/author.service.js"
import { createLogServices } from "../Modules/Logs/log.service.js"


export const bookServices = createBookServices(await dbPromise)
export const authorServices = createAuthorServices(await dbPromise)
export const logServices = createLogServices(await dbPromise)



