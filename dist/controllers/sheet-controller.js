"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRowHandler = exports.updateRowHandler = exports.addRowHandler = exports.deleteColumnHandler = exports.updateColumnHandler = exports.addColumnHandler = exports.deleteSheetHandler = exports.updateSheetHandler = exports.getSheetHandler = exports.createSheetHandler = exports.getSheetsHandler = void 0;
const sheets_services_1 = __importDefault(require("../services/sheets-services"));
const errors_1 = require("../config/errors");
/**
 * GET /sheets
 * Retrieves all sheets.
 */
const getSheetsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sheets = yield sheets_services_1.default.getAllSheets();
        res.status(200).json(sheets);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getSheetsHandler = getSheetsHandler;
/**
 * POST /sheets
 * Creates a new sheet.
 */
const createSheetHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sheetName, description } = req.body;
        const sheet = yield sheets_services_1.default.createSheet({ sheetName, description });
        res.status(201).json(sheet);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.createSheetHandler = createSheetHandler;
/**
 * GET /sheets/:sheetId
 * Retrieves a single sheet.
 */
const getSheetHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sheetId = req.params.sheetId;
        const sheet = yield sheets_services_1.default.getSheet(sheetId);
        res.status(200).json(sheet);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.getSheetHandler = getSheetHandler;
/**
 * PUT /sheets/:sheetId
 * Updates a sheet.
 */
const updateSheetHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sheetId = req.params.sheetId;
        const { sheetName, description } = req.body;
        const sheet = yield sheets_services_1.default.updateSheet(sheetId, { sheetName, description });
        res.status(200).json(sheet);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateSheetHandler = updateSheetHandler;
/**
 * DELETE /sheets/:sheetId
 * Deletes a sheet.
 */
const deleteSheetHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sheetId = req.params.sheetId;
        yield sheets_services_1.default.deleteSheet(sheetId);
        res.status(204).end();
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.deleteSheetHandler = deleteSheetHandler;
/**
 * POST /sheets/:sheetId/columns
 * Adds a column to a sheet.
 */
const addColumnHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sheetId = req.params.sheetId;
        const { title, type } = req.body;
        const column = yield sheets_services_1.default.addColumn(sheetId, { title, type });
        res.status(201).json(column);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.addColumnHandler = addColumnHandler;
/**
 * PUT /sheets/:sheetId/columns/:columnId
 * Updates a column.
 */
const updateColumnHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const columnId = req.params.columnId;
        const { title, type } = req.body;
        const column = yield sheets_services_1.default.updateColumn(columnId, { title, type });
        res.status(200).json(column);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateColumnHandler = updateColumnHandler;
/**
 * DELETE /sheets/:sheetId/columns/:columnId
 * Deletes a column.
 */
const deleteColumnHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const columnId = req.params.columnId;
        yield sheets_services_1.default.deleteColumn(columnId);
        res.status(204).end();
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.deleteColumnHandler = deleteColumnHandler;
/**
 * POST /sheets/:sheetId/rows
 * Adds a row to a sheet.
 */
const addRowHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sheetId = req.params.sheetId;
        const cells = req.body;
        const row = yield sheets_services_1.default.addRow(sheetId, cells);
        res.status(201).json(row);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.addRowHandler = addRowHandler;
/**
 * PUT /sheets/:sheetId/rows/:rowId
 * Updates a row.
 */
const updateRowHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rowId = req.params.rowId;
        const cells = req.body;
        const row = yield sheets_services_1.default.updateRow(rowId, cells);
        res.status(200).json(row);
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.updateRowHandler = updateRowHandler;
/**
 * DELETE /sheets/:sheetId/rows/:rowId
 * Deletes a row.
 */
const deleteRowHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rowId = req.params.rowId;
        yield sheets_services_1.default.deleteRow(rowId);
        res.status(204).end();
    }
    catch (err) {
        console.log(err);
        if (err instanceof errors_1.AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
});
exports.deleteRowHandler = deleteRowHandler;
