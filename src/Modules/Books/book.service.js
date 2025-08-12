import { ObjectId } from "mongodb";

export const createBookServices = (db) => {
  const dbBook = db.collection("books");

  return {
    insertBook: async (bookdata) => {
      if (
        !(await db.collection("authors").findOne({ _id: bookdata.authorId }))
      ) {
        return null;
      }
      return dbBook.insertOne(bookdata);
    },

    findAllBooks: async ({
      skip = 0,
      limit = 10,
      sort = { createdAt: 1 },
    } = {}) => {
      return dbBook.find().sort(sort).skip(skip).limit(limit).toArray();
    },

    findBookById: async (id) => {
      return dbBook.findOne({ _id: new ObjectId(id) });
    },

    findBookAuthor: async (id) => {
      return dbBook.aggregate([
        { $match: { _id: id } },
        {
          $lookup: {
            from: "authors",
            localField: "authorId",
            foreignField: "_id",
            as: "author",
          },
        },
        { $unwind: "$author" },
      ]).toArray();
    },

    updateBook: async (id, updateData) => {
      return dbBook.updateOne({ _id: id }, { $set: updateData });
    },

    insertBooks: async (bookList) => {

      const authorIds = [...new Set(bookList.map((book) => book.authorId))]; 

      const existingAuthors = await db
        .collection("authors")
        .find({ _id: { $in: authorIds } })
        .project({ _id: 1 })
        .toArray();

      const validAuthorIds = new Set(
        existingAuthors.map((a) => a._id.toString())
      );

      const validBooks = [];
      const nonvalidBooks = [];

      for (const book of bookList) {
        if (validAuthorIds.has(book.authorId.toString())) {
          validBooks.push(book);
        } else {
          nonvalidBooks.push({
            title: book.title,
            authorId: book.authorId,
            reason: "author not found",
          });
        }
      }

      if (validBooks.length === 0) {
        return { validBooks: [], nonvalidBooks };
      }

      const result = await dbBook.insertMany(validBooks, { ordered: false });

      return { result ,insertedBooks: validBooks,skippedBooks: nonvalidBooks };
    },

    hardDeleteBook: async (id) => {
      return dbBook.deleteOne({ _id: id });
    },
  };
};



