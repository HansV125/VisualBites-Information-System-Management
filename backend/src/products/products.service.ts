import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { eq, desc, inArray, sql } from 'drizzle-orm';
import * as schema from '../db/schema';

@Injectable()
export class ProductsService {
    constructor(private database: DatabaseService) { }

    async findAll() {
        const db = this.database.db;

        // 1. Fetch all products with recipes
        const products = await db.query.products.findMany({
            orderBy: desc(schema.products.createdAt),
            with: {
                recipe: {
                    with: {
                        ingredient: true
                    }
                }
            }
        });

        // 2. Get all unique ingredient names from recipes
        const ingredientNames = new Set<string>();
        products.forEach(product => {
            product.recipe.forEach(r => {
                ingredientNames.add(r.ingredient.name);
            });
        });

        if (ingredientNames.size === 0) {
            return products.map(product => ({
                ...product,
                hasOutOfStock: false
            }));
        }

        // 3. Batch query: Get total stock for all ingredient names at once
        const stockTotals = await db
            .select({
                name: schema.ingredients.name,
                totalQuantity: sql<number>`sum(${schema.ingredients.quantity})`
            })
            .from(schema.ingredients)
            .where(inArray(schema.ingredients.name, Array.from(ingredientNames)))
            .groupBy(schema.ingredients.name);

        // 4. Create a map for O(1) lookup
        const stockMap = new Map<string, number>();
        stockTotals.forEach(item => {
            stockMap.set(item.name, item.totalQuantity || 0);
        });

        // 5. Enrich products with stock info
        return products.map(product => {
            let hasOutOfStock = false;
            const recipeWithStock = product.recipe.map(r => {
                const available = stockMap.get(r.ingredient.name) || 0;
                const isOutOfStock = available < r.quantity;
                if (isOutOfStock) hasOutOfStock = true;

                return {
                    ...r,
                    availableStock: available,
                    isOutOfStock
                };
            });

            return {
                ...product,
                recipe: recipeWithStock,
                hasOutOfStock
            };
        });
    }

    async findOne(id: string) {
        return this.database.db.query.products.findFirst({
            where: eq(schema.products.id, id),
            with: {
                recipe: {
                    with: {
                        ingredient: true
                    }
                }
            }
        });
    }

    async create(data: { name: string; tag: string; badge?: string; description: string; price: number; stock: number; flavors: string[]; image: string; sticker?: string; status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' }) {
        const result = await this.database.db.insert(schema.products).values({
            name: data.name,
            tag: data.tag,
            badge: data.badge,
            description: data.description,
            price: data.price,
            stock: data.stock,
            flavors: data.flavors,
            image: data.image,
            sticker: data.sticker,
            status: data.status ?? 'ACTIVE',
            updatedAt: new Date(),
        }).returning();
        return result[0];
    }

    async update(id: string, data: Partial<{ name: string; tag: string; badge: string; description: string; price: number; stock: number; flavors: string[]; image: string; sticker: string; status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'; soldCount: number }>) {
        const result = await this.database.db.update(schema.products)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.products.id, id))
            .returning();
        return result[0];
    }

    async delete(id: string) {
        const result = await this.database.db.delete(schema.products)
            .where(eq(schema.products.id, id))
            .returning();
        return result[0];
    }

    async addRecipeItem(productId: string, ingredientId: string, quantity: number) {
        const result = await this.database.db.insert(schema.productIngredients).values({
            productId,
            ingredientId,
            quantity
        }).returning();
        return result[0];
    }

    async updateRecipeItem(id: string, quantity: number) {
        const result = await this.database.db.update(schema.productIngredients)
            .set({ quantity })
            .where(eq(schema.productIngredients.id, id))
            .returning();
        return result[0];
    }

    async removeRecipeItem(id: string) {
        const result = await this.database.db.delete(schema.productIngredients)
            .where(eq(schema.productIngredients.id, id))
            .returning();
        return result[0];
    }

    async setRecipe(productId: string, items: { ingredientId: string; quantity: number }[]) {
        // Delete existing recipe
        await this.database.db.delete(schema.productIngredients)
            .where(eq(schema.productIngredients.productId, productId));

        // Create new recipe items
        if (items.length > 0) {
            await this.database.db.insert(schema.productIngredients).values(
                items.map(item => ({
                    productId,
                    ingredientId: item.ingredientId,
                    quantity: item.quantity
                }))
            );
        }

        return this.findOne(productId);
    }
}
