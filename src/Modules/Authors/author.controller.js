import { ObjectId } from "mongodb";
import { sendError, sendSuccess } from "../../Utils/responseHandler.utils.js";
import { authorServices, logServices } from "../../DB/services.connection.js";

export const insertAuthor = async (req, res) => {
  try {
    const { name, bio } = req.body;

    if (!name || Object.keys(req.body).length > 5 || typeof name !== 'string') {
      return sendError(res, 400, "required fields missing or too many fields");
    }

    if (bio && typeof bio !== 'string') {
      return sendError(res, 400, "bio must be a string");
    }

    const authorData = {
      name,
      bio: bio 
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
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortParam = req.query.sort || "name";
    let sort = {};

    if (isNaN(skip) || skip < 0) {
      return sendError(res, 400, "skip must be a non-negative integer");
    }

    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return sendError(res, 400, "limit must be a positive integer (max 100)");
    }

    const allowedSortFields = [ "name","age", "createdAt"];
    const isDescending = sortParam.startsWith("-");
    const sortField = isDescending ? sortParam.substring(1) : sortParam;

    if (!allowedSortFields.includes(sortField)) {
      return sendError(res, 400, "invalid sort field");
    }

    sort[sortField] = isDescending ? -1 : 1;

    const result = await authorServices.getAllAuthors({ skip, limit, sort });

    if (result.length === 0) {
      return sendError(res, 404, "no authors found");
    }
    return sendSuccess(res, 200, "authors retrieved successfully", result);
  } catch (error) {
    return sendError(res, 500, "failed to get authors", error);
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


export const updateAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || !ObjectId.isValid(id)) {
      return sendError(res, 400, "invalid author id");
    }

    if (Object.keys(updateData).length === 0) {
      return sendError(res, 400, "no fields to update");
    }

    const allowed = new Set(["name", "bio", "age"]);
    const filtered = {};
    for (const [key, value] of Object.entries(updateData)) {
      if (!allowed.has(key)) continue;
      filtered[key] = value;
    }

    if (Object.keys(filtered).length === 0) {
      return sendError(res, 400, "no valid fields to update");
    }

    if (filtered.name !== undefined && typeof filtered.name !== 'string') {
      return sendError(res, 400, "name must be a string");
    }
    if (filtered.bio !== undefined && typeof filtered.bio !== 'string') {
      return sendError(res, 400, "bio must be a string");
    }
    if (filtered.age !== undefined) {
      if (typeof filtered.age !== 'number' || filtered.age < 0) {
        return sendError(res, 400, "age must be a non-negative number");
      }
    }

    const result = await authorServices.updateAuthor(id, filtered);

    if (result.modifiedCount === 0) {
      return sendError(res, 404, "author not found or no changes made");
    }

    await logServices.insertLog({
      action: "update",
      entityType: "author",
      entityId: new ObjectId(id),
      timestamp: new Date(),
    });

    return sendSuccess(res, 200, "author updated successfully", result);
  } catch (error) {
    return sendError(res, 500, "failed to update author", error);
  }
}