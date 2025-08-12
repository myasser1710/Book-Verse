import { MongoClient } from 'mongodb'
import 'dotenv/config'

let client
let database

export async function connectDB() {
  try {
    if (!process.env.MONGODB_URI || !process.env.DB_NAME) {
      throw new Error('Missing MongoDB configuration')
    }

    if (database) return database

    client = new MongoClient(process.env.MONGODB_URI)

    await client.connect()

    database = client.db(process.env.DB_NAME)

    console.log('Database connected successfully')

    return database
  } catch (err) {
    console.error('DB connection error:', err)
  }
}

export const dbPromise = connectDB()

/**
 * @returns {import('mongodb').Db}
 */

export function getDB() {
  if (!database) {
    throw new Error('Database not initialized. Call connectDB() first.')
  }
  return database
}


