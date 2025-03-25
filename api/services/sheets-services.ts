import prisma from "../prisma/client";
import { AppError } from "../config/errors";
import { ColumnType, Visibility } from "@prisma/client";

class SheetServices {
    // Create a new sheet
    async createSheet(data: { sheetName: string; description?: string }) {
        return await prisma.sheet.create({
            data: {
                visibility: Visibility.PRIVATE, // Default to private
                ...data,
            },
        });
    }

    async getAllSheets() {
        return await prisma.sheet.findMany();
    }

    // Get a single sheet with details
    async getSheet(sheetId: string) {
        const sheet = await prisma.sheet.findUnique({
            where: { id: sheetId },
            include: { rows: true, columns: true },
        });

        if (!sheet) throw new AppError("Sheet not found", 404);
        return sheet;
    }

    // Update a sheet (only owner can update)
    async updateSheet(sheetId: string, data: Partial<{ sheetName: string; description: string }>) {
        const sheet = await prisma.sheet.findUnique({
            where: { id: sheetId },
        });

        if (!sheet) throw new AppError("Sheet not found", 404);

        return await prisma.sheet.update({
            where: { id: sheetId },
            data,
        });
    }

    // Delete a sheet (only owner can delete)
    async deleteSheet(sheetId: string) {
        const sheet = await prisma.sheet.findUnique({
            where: { id: sheetId },
        });

        if (!sheet) throw new AppError("Sheet not found", 404);

        return await prisma.$transaction([
            prisma.row.deleteMany({ where: { sheetId } }), // Remove rows
            prisma.column.deleteMany({ where: { sheetId } }), // Remove columns
            prisma.sheet.delete({ where: { id: sheetId } }), // Finally, remove the sheet
        ]);
    }

    // Add a column to a sheet
    async addColumn(sheetId: string, data: { title: string; type: ColumnType }) {
        return await prisma.column.create({
            data: { sheetId, ...data },
        });
    }

    // Update a column
    async updateColumn(
        columnId: string,
        data: Partial<{ title: string; type: ColumnType; options: string[] }>
    ) {
        return await prisma.column.update({
            where: { id: columnId },
            data,
        });
    }

    // Delete a column
    async deleteColumn(columnId: string) {
        return await prisma.column.delete({ where: { id: columnId } });
    }

    // Add a row to a sheet
    async addRow(sheetId: string, cells: Record<string, any>) {
        return await prisma.row.create({
            data: { sheetId, cells },
        });
    }

    // Update a row
    async updateRow(rowId: string, cells: Record<string, any>) {
        return await prisma.row.update({
            where: { id: rowId },
            data: { cells },
        });
    }

    // Delete a row
    async deleteRow(rowId: string) {
        return await prisma.row.delete({ where: { id: rowId } });
    }
}

export default new SheetServices();
