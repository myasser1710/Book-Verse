import { ObjectId } from "mongodb";
import { dbPromise } from "../../DB/dbConnection.js";
import { sendError, sendSuccess } from "../../Utils/responseHandler.utils.js";
import { createLogServices } from "./log.service.js";
const service = createLogServices(await dbPromise);

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
    const result = await service.findAllLogs();
    return sendSuccess(res, 200, "logs retrieved successfully", result);
  } catch (error) {
    return sendError(res, 500, "failed to get all logs", error);
  }
};

export const getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return sendError(res, 400, "invalid log id");
    }
    const log = await service.findLogById(id);
    if (!log) return sendError(res, 404, "log not found");
    return sendSuccess(res, 200, "log found", log);
  } catch (error) {
    return sendError(res, 500, "failed to get log by id", error);
  }
};
