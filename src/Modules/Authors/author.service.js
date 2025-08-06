import { ObjectId } from 'mongodb'

export const createAuthorServices = db => {
  const dbAuthor = db.collection('authors')

  return {
    insertAuthor: async authorData => {
      return dbAuthor.insertOne(authorData)
    },

    getAllAuthors: async () => {
      return dbAuthor.find().toArray()
    },

    getAuthorById: async id => {
      return dbAuthor.findOne({ _id: new ObjectId(id) })
    },

    getAuthorBooks: async id => {
      return dbAuthor.aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'books',
            localField: '_id',
            foreignField: 'authorId',
            as: 'books'
          }
        },
        {
          $project: {
            _id: 1,
            name: 1,
            bio: 1,
            books: {
              $map: {
                input: '$books',
                as: 'book',
                in: { _id: '$$book._id', title: '$$book.title' }
              }
            }
          }
        }
      ]).toArray()
    }
}}
