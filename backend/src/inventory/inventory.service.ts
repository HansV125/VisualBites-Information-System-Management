import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { eq, sql, asc } from 'drizzle-orm';
import * as schema from '../db/schema';

@Injectable()
export class InventoryService {
    constructor(private database: DatabaseService) { }

    async findAll() {
        const db = this.database.db;
        const allIngredients = await db.query.ingredients.findMany({
            orderBy: [asc(schema.ingredients.name), asc(schema.ingredients.expiryDate)]
        });

        // Group by name
        const grouped = new Map<string, {
            name: string;
            unit: string;
            minStock: number;
            totalQuantity: number;
            batches: typeof allIngredients;
        }>();

        for (const item of allIngredients) {
            const existing = grouped.get(item.name);
            if (existing) {
                existing.totalQuantity += item.quantity;
                existing.batches.push(item);
            } else {
                grouped.set(item.name, {
                    name: item.name,
                    unit: item.unit,
                    minStock: item.minStock,
                    totalQuantity: item.quantity,
                    batches: [item]
                });
            }
        }

        return Array.from(grouped.values());
    }

    findAllFlat() {
        return this.database.db.query.ingredients.findMany({
            orderBy: asc(schema.ingredients.name)
        });
    }

    async create(data: { name: string; quantity: number; unit: string; minStock?: number; expiryDate?: string | Date; expiryWarningDays?: number }) {
        const result = await this.database.db.insert(schema.ingredients).values({
            name: data.name,
            quantity: data.quantity,
            unit: data.unit,
            minStock: data.minStock ?? 0,
            expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
            expiryWarningDays: data.expiryWarningDays ?? 7,
            updatedAt: new Date(),
        }).returning();
        return result[0];
    }


    async update(id: string, data: Partial<{ name: string; quantity: number; unit: string; minStock: number; expiryDate: string | Date; expiryWarningDays: number }>) {
        const updateData: any = { ...data, updatedAt: new Date() };
        if (data.expiryDate) {
            updateData.expiryDate = new Date(data.expiryDate);
        }
        const result = await this.database.db.update(schema.ingredients)
            .set(updateData)
            .where(eq(schema.ingredients.id, id))
            .returning();
        return result[0];
    }


    async delete(id: string) {
        const result = await this.database.db.delete(schema.ingredients)
            .where(eq(schema.ingredients.id, id))
            .returning();
        return result[0];
    }

    async adjustQuantity(id: string, amount: number, operation: 'add' | 'subtract') {
        const ingredient = await this.database.db.query.ingredients.findFirst({
            where: eq(schema.ingredients.id, id)
        });

        if (!ingredient) {
            throw new BadRequestException('Ingredient not found');
        }

        let newQuantity: number;
        if (operation === 'add') {
            newQuantity = ingredient.quantity + amount;
        } else {
            newQuantity = ingredient.quantity - amount;
            if (newQuantity < 0) {
                throw new BadRequestException('Cannot reduce quantity below 0');
            }
        }

        const result = await this.database.db.update(schema.ingredients)
            .set({ quantity: newQuantity, updatedAt: new Date() })
            .where(eq(schema.ingredients.id, id))
            .returning();
        return result[0];
    }

    async deductByName(name: string, amount: number) {
        const batches = await this.database.db.query.ingredients.findMany({
            where: eq(schema.ingredients.name, name),
            orderBy: asc(schema.ingredients.expiryDate)
        });

        let remaining = amount;
        for (const batch of batches) {
            if (remaining <= 0) break;

            const deduct = Math.min(batch.quantity, remaining);
            await this.database.db.update(schema.ingredients)
                .set({ quantity: batch.quantity - deduct, updatedAt: new Date() })
                .where(eq(schema.ingredients.id, batch.id));
            remaining -= deduct;
        }

        if (remaining > 0) {
            throw new BadRequestException(`Not enough stock for ${name}. Short by ${remaining}`);
        }
    }
}
