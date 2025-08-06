import { ObjectId } from 'mongodb'

export const createLogServices = db => {
  const dbLog = db.collection('logs')

  return {
    insertLog: async logData => {
      return dbLog.insertOne(logData)
    },

    findAllLogs: async () => {
      return dbLog.find().toArray()
    },

    findLogById: async id => {
      return dbLog.findOne({ _id: new ObjectId(id) })
    }

  }
}
