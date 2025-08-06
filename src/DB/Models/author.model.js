import { getDB } from '../dbConnection.js'

export async function initAuthorCollection() {
  const db = getDB()
  const collectionName = 'authors'

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
            required: ['name'],
            properties: {
              name: {
                bsonType: 'string',
                minLength: 1,
                description: 'Required and must be at least 1 character'
              },
              bio: {
                bsonType: 'string',
                description: 'Optional biography'
              }
            }
          }
        }
      })
      console.log(
        `Created collection '${collectionName}' with schema validation`
      )
    }

    await db.collection(collectionName).createIndex({ name: 1 })

    console.log(`schema ready for '${collectionName}'`)

    return db.collection(collectionName)
  } catch (err) {
    console.error(`Failed to initialize '${collectionName}':`, err)
  }
}
