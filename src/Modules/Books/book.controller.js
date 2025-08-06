import { ObjectId } from "mongodb";
import { dbPromise } from "../../DB/dbConnection.js";
import { sendError, sendSuccess } from "../../Utils/responseHandler.utils.js";
import { createLogServices } from "../Logs/log.service.js";
import { createBookServices } from "./book.service.js";

const bookServices = createBookServices(await dbPromise);
const logService = createLogServices(await dbPromise);

const MAX_FIELD_COUNT = 15;

export const createBook = async (req, res) => {
  try {
    const { title, authorId, year, summary, genre, ...extraFields } = req.body;
    const { __proto__, constructor, ...safeFields } = extraFields;

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
      ...(genre && { genre }),
      ...safeFields,
    };

    const result = await bookServices.insertBook(bookData);

    if (result == null) return sendError(res, 400, "author id doesnt exist");

    if (result.insertedId) {
      await logService.insertLog({
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
      const { title, authorId, year, summary, genre, ...extraFields } = book;
      const { __proto__, constructor, ...safeFields } = extraFields;

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
        ...(genre && { genre }),
        ...safeFields,
      });
    }

    if (validBooks.length === 0) {
      return sendError(res, 400, "no valid books to insert", {
        validationErrors,
      });
    }

    const { insertedBooks, skippedBooks } = await bookServices.insertBooks(
      validBooks
    );

    if (insertedBooks && insertedBooks.length > 0) {
      for (const book of insertedBooks) {
        await logService.insertLog({
          action: "create",
          entityType: "book",
          entityId: book._id,
          timestamp: new Date(),
        });
      }
    }

    const responseData = {
      insertedCount: insertedBooks.length,
      insertedBooks,
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

    const allowedSortFields = ["createdAt", "year", "title"];
    const isDescending = sortParam.startsWith("-");
    const sortField = isDescending ? sortParam.substring(1) : sortParam;

    if (!allowedSortFields.includes(sortField)) {
      return sendError(res, 400, "invalid sort field");
    }

    sort[sortField] = isDescending ? -1 : 1;
    
    const result = await bookServices.findAllBooks({ skip, limit, sort });

    if (!result) throw new Error("problem while retriving books");

    return sendSuccess(res, 200, "books retrieved successfully", result);
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

    const result = await bookServices
      .findBookAuthor(new ObjectId(id))
      .toArray();

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

    const { __proto__, constructor, ...safeUpdates } = req.body;

    if (Object.keys(safeUpdates).length === 0)
      return sendError(res, 400, "no data provided for update");

    safeUpdates.updatedAt = new Date();

    const result = await bookServices.updateBook(new ObjectId(id), safeUpdates);

    if (!result.matchedCount) return sendError(res, 404, "book not found");

    // Log the update action
    await logService.insertLog({
      action: "update",
      entityType: "book",
      entityId: new ObjectId(id),
      timestamp: new Date(),
    });

    return sendSuccess(res, 200, "book updated successfully");
  } catch (error) {
    return sendError(res, 500, "failed to update book", error);
  }
};

export const removeBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id))
      return sendError(res, 400, "valid book id require for deleting");
    const result = await bookServices.hardDeleteBook(id);

    if (!result.deletedCount) return sendError(res, 404, "book id not found");

    if (!result.acknowledged)
      throw new Error({ message: "error while fetching method" });

    // Log the delete action
    await logService.insertLog({
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
