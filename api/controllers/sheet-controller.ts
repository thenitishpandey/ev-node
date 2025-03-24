import sheetsServices from "../services/sheets-services";
import { Request, Response } from "express";
import { AppError } from "../config/errors";

/**
 * GET /sheets
 * Retrieves all sheets.
 */

export const getSheetsHandler = async (req: Request, res: Response) => {
    try {
        const sheets = await sheetsServices.getAllSheets();
        res.status(200).json(sheets);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /sheets
 * Creates a new sheet.
 */

export const createSheetHandler = async (req: Request, res: Response) => {
    try {
        const { sheetName, description } = req.body;
        const sheet = await sheetsServices.createSheet({ sheetName, description });
        res.status(201).json(sheet);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * GET /sheets/:sheetId
 * Retrieves a single sheet.
 */

export const getSheetHandler = async (req: Request, res: Response) => {
    try {
        const sheetId = req.params.sheetId;
        const sheet = await sheetsServices.getSheet(sheetId);
        res.status(200).json(sheet);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /sheets/:sheetId
 * Updates a sheet.
 */

export const updateSheetHandler = async (req: Request, res: Response) => {
    try {
        const sheetId = req.params.sheetId;
        const { sheetName, description } = req.body;
        const sheet = await sheetsServices.updateSheet(sheetId, { sheetName, description });
        res.status(200).json(sheet);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * DELETE /sheets/:sheetId
 * Deletes a sheet.
 */

export const deleteSheetHandler = async (req: Request, res: Response) => {
    try {
        const sheetId = req.params.sheetId;
        await sheetsServices.deleteSheet(sheetId);
        res.status(204).end();
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /sheets/:sheetId/columns
 * Adds a column to a sheet.
 */

export const addColumnHandler = async (req: Request, res: Response) => {
    try {
        const sheetId = req.params.sheetId;
        const { title, type } = req.body;
        const column = await sheetsServices.addColumn(sheetId, { title, type });
        res.status(201).json(column);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /sheets/:sheetId/columns/:columnId
 * Updates a column.
 */

export const updateColumnHandler = async (req: Request, res: Response) => {
    try {
        const columnId = req.params.columnId;
        const { title, type } = req.body;
        const column = await sheetsServices.updateColumn(columnId, { title, type });
        res.status(200).json(column);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * DELETE /sheets/:sheetId/columns/:columnId
 * Deletes a column.
 */

export const deleteColumnHandler = async (req: Request, res: Response) => {
    try {
        const columnId = req.params.columnId;
        await sheetsServices.deleteColumn(columnId);
        res.status(204).end();
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * POST /sheets/:sheetId/rows
 * Adds a row to a sheet.
 */

export const addRowHandler = async (req: Request, res: Response) => {
    try {
        const sheetId = req.params.sheetId;
        const cells = req.body;
        const row = await sheetsServices.addRow(sheetId, cells);
        res.status(201).json(row);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * PUT /sheets/:sheetId/rows/:rowId
 * Updates a row.
 */

export const updateRowHandler = async (req: Request, res: Response) => {
    try {
        const rowId = req.params.rowId;
        const cells = req.body;
        const row = await sheetsServices.updateRow(rowId, cells);
        res.status(200).json(row);
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * DELETE /sheets/:sheetId/rows/:rowId
 * Deletes a row.
 */

export const deleteRowHandler = async (req: Request, res: Response) => {
    try {
        const rowId = req.params.rowId;
        await sheetsServices.deleteRow(rowId);
        res.status(204).end();
    } catch (err) {
        console.log(err);
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ message: err.message });
            return;
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};
