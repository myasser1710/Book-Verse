import { getDB } from '../dbConnection.js'

export async function initBookCollection() {
  const db = getDB()
  const collectionName = 'books'

  try {
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray()
    const collectionExists = collections.length > 0

    if (!collectionExists) {
      await db.createCollection(collectionName, {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'authorId', 'createdAt'],
            properties: {
              title: {
                bsonType: 'string',
                minLength: 1,
                description: 'Required and must be at least 1 character'
              },
              authorId: {
                bsonType: 'objectId',
                description: 'Must reference an author document'
              },
              genres: {
                bsonType: 'array',
                items: { bsonType: 'string' },
                description: 'Array of genre strings'
              },
              year: {
                bsonType: 'int',
                minimum: 1000,
                maximum: new Date().getFullYear(),
                description: 'Year between 1000 and current year'
              },
              summary: {
                bsonType: 'string',
                description: 'Optional summary'
              },
              createdAt: {
                bsonType: 'date',
                description: 'Auto-set on insert'
              },
              updatedAt: {
                bsonType: 'date',
                description: 'Auto-updated on changes'
              }
            }
          }
        }
      })
      console.log(
        `Created collection '${collectionName}' with schema validation`
      )
    }

    await db.collection(collectionName).createIndex({ authorId: 1 })
    await db.collection(collectionName).createIndex({ title: 'text' })
    await db.collection(collectionName).createIndex({ genres: 1 })

    console.log(`schema ready for '${collectionName}'`)

    return db.collection(collectionName)
  } catch (err) {
    console.error(`Failed to initialize '${collectionName}':`, err)
    throw err // Re-throw to handle in your application startup
  }
}
