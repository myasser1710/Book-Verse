import { ObjectId } from "mongodb";
import { dbPromise } from "../../DB/dbConnection.js";
import { sendError, sendSuccess } from "../../Utils/responseHandler.utils.js";
import { logServices } from "../../DB/services.connection.js";


// export const createLog = async (req, res) => {
//   try {
//     const { message, level, ...extraFields } = req.body;
//     const logData = { message, level, ...extraFields, createdAt: new Date() };
//     const result = await service.insertLog(logData);
//     return sendSuccess(res, 201, "log created successfully", result);
//   } catch (error) {
//     return sendError(res, 500, "failed to insert log", error);
//   }
// };

export const getAllLogs = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const sortParam = req.query.sort || "-timestamp";
    let sort = {};

    if (isNaN(skip) || skip < 0) {
      return sendError(res, 400, "skip must be a non-negative integer");
    }
    if (isNaN(limit) || limit <= 0 || limit > 100) {
      return sendError(res, 400, "limit must be a positive integer (max 100)");
    }

    const allowedSortFields = ["timestamp", "action", "entityType"];
    const isDescending = sortParam.startsWith("-");
    const sortField = isDescending ? sortParam.substring(1) : sortParam;
    if (!allowedSortFields.includes(sortField)) {
      return sendError(res, 400, "invalid sort field");
    }
    sort[sortField] = isDescending ? -1 : 1;

    const items = await logServices.findAllLogs({ skip, limit, sort });
    const total = await logServices.countLogs();

    return sendSuccess(res, 200, "logs retrieved successfully", {
      items,
      page: Math.floor(skip / limit) + 1,
      pageSize: limit,
      total,
      hasNext: skip + items.length < total,
    });
  } catch (error) {
    return sendError(res, 500, "failed to get all logs", error);
  }
};

export const getLogById = async (req, res) => {
  try {
    const { id } = req.params

    if (!ObjectId.isValid(id)||!id) {
      return sendError(res, 400, "invalid log id");
    }
    const log = await logServices.findLogById(id);
    if (!log) return sendError(res, 404, "log not found");
    return sendSuccess(res, 200, "log found", log);
  } catch (error) {
    return sendError(res, 500, "failed to get log by id", error);
  }
};
