import { ObjectId } from "mongodb";
import { sendError, sendSuccess } from "../../Utils/responseHandler.utils.js";
import { bookServices, logServices } from "../../DB/services.connection.js";


const MAX_FIELD_COUNT = 15;

export const createBook = async (req, res) => {
  try {
    const { title, authorId, year, summary, genre } = req.body;

    if (!title || !authorId || Object.keys(req.body).length > MAX_FIELD_COUNT) {
      return sendError(res, 400, "all required fields are needed");
    }

    if (!ObjectId.isValid(authorId))
      return sendError(res, 400, "valid author id required");

    const bookData = {
      title,
      authorId: new ObjectId(authorId),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...(summary && { summary }),
      ...(year && { year: Number(year) }),
      ...(genre && { genre })
    };

    const result = await bookServices.insertBook(bookData);

    if (result == null) return sendError(res, 400, "author id doesnt exist");

    if (result.insertedId) {
      await logServices.insertLog({
        action: "create",
        entityType: "book",
        entityId: result.insertedId,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, 201, "book created successfully", result);
  } catch (error) {
    return sendError(res, 500, "failed to insert book", error);
  }
};

export const createBooks = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return sendError(res, 400, "an array of books is required");
    }

    const books = req.body;
    const currentTime = new Date();

    const validBooks = [];
    const validationErrors = [];

    for (const book of books) {
      const { title, authorId, year, summary, genre } = book;

      if (
        !title ||
        !authorId ||
        Object.keys(book).length > MAX_FIELD_COUNT ||
        !ObjectId.isValid(authorId)
      ) {
        validationErrors.push({
          book: { title, authorId },
          reason: "missing or invalid required fields",
        });
        continue;
      }

      validBooks.push({
        title,
        authorId: new ObjectId(authorId),
        createdAt: currentTime,
        updatedAt: currentTime,
        ...(summary && { summary }),
        ...(year && { year: Number(year) }),
        ...(genre && { genre })
      });
    }

    if (validBooks.length === 0) {
      return sendError(res, 400, "no valid books to insert", {
        validationErrors,
      });
    }

    const { result, insertedBooks, skippedBooks } =
      await bookServices.insertBooks(validBooks);

    if (insertedBooks && result.insertedCount > 0) {
      for (const book of insertedBooks) {
        await logServices.insertLog({
          action: "create",
          entityType: "book",
          entityId: book._id,
          timestamp: new Date(),
        });
      }
    }

    const responseData = {
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
      skippedDueToInvalidAuthors: skippedBooks,
      validationErrors,
    };

    if (skippedBooks.length > 0) {
      return sendSuccess(
        res,
        201,
        "bulk insert partially completed",
        responseData
      );
    }
    return sendSuccess(res, 201, "books inserted successfully", responseData);
  } catch (error) {
    return sendError(res, 500, "failed to insert books", error);
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortParam = req.query.sort || "createdAt";
    let sort = {};

    if (isNaN(skip) || skip < 0) {
      return sendError(res, 400, "skip must be a non-negative integer");
    }
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return sendError(res, 400, "limit must be a positive integer (max 100)");
    }

    // enforce sort allowlist
    const allowedSortFields = ["createdAt", "title", "year"]; 
    const isDescending = sortParam.startsWith("-");
    const sortField = isDescending ? sortParam.substring(1) : sortParam;

    if (!allowedSortFields.includes(sortField)) {
      return sendError(res, 400, "invalid sort field");
    }

    sort[sortField] = isDescending ? -1 : 1;

    const data = await bookServices.findAllBooks({ skip, limit, sort });
    const total = await bookServices.countBooks();

    return sendSuccess(res, 200, "books retrieved successfully", {
      items: data,
      page: Math.floor(skip / limit) + 1,
      pageSize: limit,
      total,
      hasNext: skip + data.length < total,
    });
  } catch (error) {
    return sendError(res, 500, "failed to get all books", error);
  }
};

export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id))
      return sendError(res, 400, "valid book id require for search");

    const book = await bookServices.findBookById(id);

    if (!book) return sendError(res, 404, "book id not found", null);

    return sendSuccess(res, 200, "book found by id", book);
  } catch (error) {
    return sendError(res, 500, "failed to get book by id", error);
  }
};

export const getBookAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id))
      return sendError(res, 400, "valid book id required");

    const result = await bookServices.findBookAuthor(new ObjectId(id));

    if (!result.length) return sendError(res, 404, "book or author not found");

    return sendSuccess(res, 200, "book and author found", result[0]);
  } catch (error) {
    return sendError(res, 500, "failed to get book author", error);
  }
};

export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id))
      return sendError(res, 400, "valid book id required");

    const updateData = req.body || {};

    if (Object.keys(updateData).length === 0)
      return sendError(res, 400, "no data provided for update");

    // allowlist of updatable fields
    const allowed = new Set(["title", "summary", "year", "genre", "authorId"]);
    const filtered = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (!allowed.has(key)) continue;
      filtered[key] = value;
    }

    if (Object.keys(filtered).length === 0) {
      return sendError(res, 400, "no valid fields to update");
    }

    // validate and coerce types for allowed fields
    if (filtered.authorId) {
      if (!ObjectId.isValid(filtered.authorId)) {
        return sendError(res, 400, "valid author id required");
      }
      filtered.authorId = new ObjectId(filtered.authorId);
    }
    if (filtered.year !== undefined) {
      const n = Number(filtered.year);
      if (Number.isNaN(n)) {
        return sendError(res, 400, "year must be a number");
      }
      filtered.year = n;
    }

    filtered.updatedAt = new Date();

    const result = await bookServices.updateBook(new ObjectId(id), filtered);

    if (!result.matchedCount)
      return sendError(res, 404, "book id doesnt exist");

    // Log the update action
    await logServices.insertLog({
      action: "update",
      entityType: "book",
      entityId: new ObjectId(id),
      timestamp: new Date(),
    });

    return sendSuccess(res, 200, "book updated successfully",result);
  } catch (error) {
    console.log(error);
    return sendError(res, 500, "failed to update book", error);
  }
};

export const removeBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id))
      return sendError(res, 400, "valid book id require for deleting");

    const result = await bookServices.hardDeleteBook(new ObjectId(id));

    if (!result.deletedCount) return sendError(res, 404, "book id not found");

    if (!result.acknowledged)
      throw new Error("error while deleting book");

    // Log the delete action
    await logServices.insertLog({
      action: "delete",
      entityType: "book",
      entityId: new ObjectId(id),
      timestamp: new Date(),
    });

    return sendSuccess(res, 200, "book deleted", result);
  } catch (error) {
    return sendError(res, 500, "failed to get book by id", error);
  }
};
