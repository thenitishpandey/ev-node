import { Router } from "express";
import {
    getSheetHandler,
    getSheetsHandler,
    createSheetHandler,
    addColumnHandler,
    addRowHandler,
    updateColumnHandler,
    updateRowHandler,
    updateSheetHandler,
    deleteColumnHandler,
    deleteRowHandler,
    deleteSheetHandler,
} from "../controllers/sheet-controller";

const sheetRoutes = Router({ mergeParams: true });

sheetRoutes.get("/", getSheetsHandler);
sheetRoutes.post("/", createSheetHandler);
sheetRoutes.get("/:sheetId", getSheetHandler);
sheetRoutes.put("/:sheetId", updateSheetHandler);
sheetRoutes.delete("/:sheetId", deleteSheetHandler);

sheetRoutes.post("/:sheetId/columns", addColumnHandler);
sheetRoutes.put("/:sheetId/columns/:columnId", updateColumnHandler);
sheetRoutes.delete("/:sheetId/columns/:columnId", deleteColumnHandler);

sheetRoutes.post("/:sheetId/rows", addRowHandler);
sheetRoutes.put("/:sheetId/rows/:rowId", updateRowHandler);
sheetRoutes.delete("/:sheetId/rows/:rowId", deleteRowHandler);

export default sheetRoutes;
