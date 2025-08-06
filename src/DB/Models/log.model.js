import { getDB } from '../dbConnection.js'

export async function initLogCollection() {
  const db = getDB()
  const collectionName = 'logs'

  try {
    const collections = await db
      .listCollections({ name: collectionName })
      .toArray()
    const collectionExists = collections.length > 0

    if (!collectionExists) {
      await db.createCollection(collectionName, {
        capped: true,
        size: 1048576, // 1MB
        max: 1000, // documents
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['action', 'entityType', 'entityId', 'timestamp'],
            properties: {
              action: {
                enum: ['create', 'update', 'delete']
              },
              entityType: {
                enum: ['book', 'author']
              },
              entityId: {
                bsonType: 'objectId'
              },
              timestamp: {
                bsonType: 'date'
              }
            }
          }
        }
      })
      console.log(
        `Created capped collection '${collectionName}' with validation`
      )
    }

    console.log(`schema ready for '${collectionName}'`)

    return db.collection(collectionName)
  } catch (err) {
    console.error(`Failed to initialize '${collectionName}':`, err)
    throw err
  }
}
