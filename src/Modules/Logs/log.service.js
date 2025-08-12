import { ObjectId } from 'mongodb'

export const createLogServices = db => {
  const dbLog = db.collection('logs')

  return {
    insertLog: async logData => {
      return dbLog.insertOne(logData)
    },

    findAllLogs: async ({ skip = 0, limit = 10, sort = { timestamp: -1 } } = {}) => {
      return dbLog.find().sort(sort).skip(skip).limit(limit).toArray()
    },

    countLogs: async () => {
      return dbLog.countDocuments()
    },

    findLogById: async id => {
      return dbLog.findOne({ _id: new ObjectId(id) })
    }

  }
}
