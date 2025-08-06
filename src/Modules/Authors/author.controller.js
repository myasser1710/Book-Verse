import { ObjectId } from "mongodb";
import { dbPromise } from "../../DB/dbConnection.js";
import { sendError, sendSuccess } from "../../Utils/responseHandler.utils.js";
import { createLogServices } from "../Logs/log.service.js";
import { createAuthorServices } from "./author.service.js";

const authorServices = createAuthorServices(await dbPromise);
const logServices = createLogServices(await dbPromise);

export const insertAuthor = async (req, res) => {
  try {
    const { name, bio, ...extraFields } = req.body;

    if (!name) {
      return sendError(res, 400, "required fields missing");
    }

    const authorData = {
      name,
      bio: bio || "",
      ...(Object.keys(extraFields).length ? extraFields : {}),
    };

    const result = await authorServices.insertAuthor(authorData);

    if (result.insertedId) {
      await logServices.insertLog({
        action: "create",
        entityType: "author",
        entityId: result.insertedId,
        timestamp: new Date(),
      });
    }

    return sendSuccess(res, 201, "author created successfully", result);
  } catch (error) {
    return sendError(res, 500, "failed to insert author", error);
  }
};

export const getAllAuthors = async (req, res) => {
  try {
    const authors = await authorServices.getAllAuthors();
    if (authors.length === 0) {
      return sendError(res, 404, "no authors found");
    }
    return sendSuccess(res, 200, "authors retrieved successfully", authors);
  } catch (error) {
    return sendError(res, 500, "failed to get all authors", error);
  }
};

export const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return sendError(res, 400, "invalid author id");
    }
    const author = await authorServices.getAuthorById(id);

    if (!author) return sendError(res, 404, "author not found");
    return sendSuccess(res, 200, "author found", author);
  } catch (error) {
    return sendError(res, 500, "failed to get author by id", error);
  }
};

export const getAuthorAndBooks = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return sendError(res, 400, "invalid author id");
    }
    const result = await authorServices.getAuthorBooks(id);

    if (!result || result.length === 0) return sendError(res, 404, "author not found or has no books");
    return sendSuccess(res, 200, "author and books retrived", result);
  } catch (error) {
    return sendError(res, 500, "failed to get author and books", error);
  }
};
