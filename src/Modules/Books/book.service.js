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

    findAllBooks: async ({skip = 0,limit = 10,sort = { createdAt: 1 },} = {}) => {
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
      ]);
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

      const insertedBooks = [];
      const skippedBooks = [];

      for (const book of bookList) {
        if (validAuthorIds.has(book.authorId.toString())) {
          insertedBooks.push(book);
        } else {
          skippedBooks.push({
            title: book.title,
            authorId: book.authorId,
            reason: "author not found",
          });
        }
      }

      if (insertedBooks.length === 0) {
        return { insertedBooks: [], skippedBooks };
      }

      await dbBook.insertMany(insertedBooks, { ordered: false });

      return { insertedBooks, skippedBooks };
    },

    hardDeleteBook: async (id) => {
      return dbBook.deleteOne({ _id: id });
    },
  };
};

// [
//   {
//     title: "Clean Code",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 2008,
//     summary: "A Handbook of Agile Software Craftsmanship",
//     genre: "Software Engineering",
//   },
//   {
//     title: "The Pragmatic Programmer",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 1999,
//     summary: "Your Journey to Mastery",
//     genre: "Programming",
//     publisher: "Addison-Wesley",
//   },
//   {
//     title: "Refactoring",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 2018,
//     summary: "Improving the Design of Existing Code",
//     genre: "Software Design",
//   },
//   {
//     title: "Design Patterns",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 1994,
//     summary: "Elements of Reusable Object-Oriented Software",
//     genre: "Software Architecture",
//   },
//   {
//     title: "You Don't Know JS",
//     authorId: "INVALID_AUTHOR_ID", // ❌ Invalid format
//     year: 2020,
//     summary: "Deep Dive into JavaScript",
//     genre: "JavaScript",
//   },
//   {
//     title: "Cracking the Coding Interview",
//     authorId: "64d2e912fc13ae1a60000099", // ❌ Valid format, but author likely does not exist
//     year: 2015,
//     summary: "189 Programming Questions and Solutions",
//     genre: "Interview Prep",
//   },
//   {
//     title: "",
//     authorId: "64d2e912fc13ae1a60000004", // ❌ Missing title
//     year: 2009,
//     genre: "Computer Science",
//   },
//   {
//     title: "The Mythical Man-Month",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 1975,
//     summary: "Essays on Software Engineering",
//     genre: "Project Management",
//   },
//   {
//     title: "Continuous Delivery",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 2010,
//     summary: "Software release best practices",
//     genre: "DevOps",
//   },
//   {
//     title: "Site Reliability Engineering",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 2016,
//     summary: "How Google Runs Production Systems",
//     genre: "SRE",
//   },
//   {
//     title: "Domain-Driven Design",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 2003,
//     summary: "Tackling Complexity in Software",
//     genre: "Architecture",
//   },
//   {
//     title: "Bad Book With Too Many Fields", // ❌ More than 15 fields
//     authorId: "64d2e912fc13ae1a60000006",
//     field1: "value1",
//     field2: "value2",
//     field3: "value3",
//     field4: "value4",
//     field5: "value5",
//     field6: "value6",
//     field7: "value7",
//     field8: "value8",
//     field9: "value9",
//     field10: "value10",
//     field11: "value11",
//   },
//   {
//     title: "Missing Author ID", // ❌ Missing authorId
//     year: 2022,
//     genre: "Test",
//   },
//   {
//     title: "Soft Skills",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 2014,
//     summary: "The Software Developer's Life Manual",
//     genre: "Career",
//   },
//   {
//     title: "Working Effectively with Legacy Code",
//     authorId: "688f23e9cbd603861c91d7cd",
//     year: 2004,
//     summary: "Strategies for modifying legacy code safely",
//     genre: "Maintenance",
//   },
// ];
