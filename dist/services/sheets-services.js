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
const client_1 = __importDefault(require("../prisma/client"));
const errors_1 = require("../config/errors");
const client_2 = require("@prisma/client");
class SheetServices {
    // Create a new sheet
    createSheet(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.sheet.create({
                data: Object.assign({ visibility: client_2.Visibility.PRIVATE }, data),
            });
        });
    }
    getAllSheets() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.sheet.findMany();
        });
    }
    // Get a single sheet with details
    getSheet(sheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sheet = yield client_1.default.sheet.findUnique({
                where: { id: sheetId },
                include: { rows: true, columns: true },
            });
            if (!sheet)
                throw new errors_1.AppError("Sheet not found", 404);
            return sheet;
        });
    }
    // Update a sheet (only owner can update)
    updateSheet(sheetId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const sheet = yield client_1.default.sheet.findUnique({
                where: { id: sheetId },
            });
            if (!sheet)
                throw new errors_1.AppError("Sheet not found", 404);
            return yield client_1.default.sheet.update({
                where: { id: sheetId },
                data,
            });
        });
    }
    // Delete a sheet (only owner can delete)
    deleteSheet(sheetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const sheet = yield client_1.default.sheet.findUnique({
                where: { id: sheetId },
            });
            if (!sheet)
                throw new errors_1.AppError("Sheet not found", 404);
            return yield client_1.default.$transaction([
                client_1.default.row.deleteMany({ where: { sheetId } }), // Remove rows
                client_1.default.column.deleteMany({ where: { sheetId } }), // Remove columns
                client_1.default.sheet.delete({ where: { id: sheetId } }), // Finally, remove the sheet
            ]);
        });
    }
    // Add a column to a sheet
    addColumn(sheetId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.column.create({
                data: Object.assign({ sheetId }, data),
            });
        });
    }
    // Update a column
    updateColumn(columnId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.column.update({
                where: { id: columnId },
                data,
            });
        });
    }
    // Delete a column
    deleteColumn(columnId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.column.delete({ where: { id: columnId } });
        });
    }
    // Add a row to a sheet
    addRow(sheetId, cells) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.row.create({
                data: { sheetId, cells },
            });
        });
    }
    // Update a row
    updateRow(rowId, cells) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.row.update({
                where: { id: rowId },
                data: { cells },
            });
        });
    }
    // Delete a row
    deleteRow(rowId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield client_1.default.row.delete({ where: { id: rowId } });
        });
    }
}
exports.default = new SheetServices();
