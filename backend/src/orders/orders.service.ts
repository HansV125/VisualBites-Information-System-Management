import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { eq, desc, inArray, asc } from 'drizzle-orm';
import * as schema from '../db/schema';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

@Injectable()
export class OrdersService {
    constructor(private database: DatabaseService) { }

    async create(data: {
        customerName: string;
        customerPhone: string;
        total: number;
        items: { productId: string; quantity: number; price: number; flavor?: string }[];
    }) {
        const db = this.database.db;
        const { customerName, customerPhone, total, items } = data;

        // Create order
        const orderResult = await db.insert(schema.orders).values({
            customerName,
            customerPhone,
            total,
            status: 'PENDING',
            updatedAt: new Date(),
        }).returning();

        const order = orderResult[0];

        // Create order items
        if (items.length > 0) {
            await db.insert(schema.orderItems).values(
                items.map(item => ({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    flavor: item.flavor,
                }))
            );
        }

        return this.findOne(order.id);
    }

    async findAll(status?: OrderStatus) {
        const db = this.database.db;

        if (status) {
            return db.query.orders.findMany({
                where: eq(schema.orders.status, status),
                with: { items: { with: { product: true } } },
                orderBy: desc(schema.orders.createdAt),
            });
        }

        return db.query.orders.findMany({
            with: { items: { with: { product: true } } },
            orderBy: desc(schema.orders.createdAt),
        });
    }

    async findOne(id: string) {
        return this.database.db.query.orders.findFirst({
            where: eq(schema.orders.id, id),
            with: { items: { with: { product: true } } },
        });
    }

    async updateStatus(id: string, status: OrderStatus) {
        const db = this.database.db;

        const order = await db.query.orders.findFirst({
            where: eq(schema.orders.id, id),
            with: {
                items: {
                    with: {
                        product: {
                            with: {
                                recipe: {
                                    with: { ingredient: true }
                                }
                            }
                        }
                    }
                }
            },
        });

        if (!order) {
            throw new BadRequestException('Order not found');
        }

        // When order is CONFIRMED, deduct ingredients
        if (status === 'CONFIRMED' && order.status === 'PENDING') {
            await this.deductIngredients(order);
        }

        await db.update(schema.orders)
            .set({ status, updatedAt: new Date() })
            .where(eq(schema.orders.id, id));

        return this.findOne(id);
    }

    private async deductIngredients(order: any) {
        const db = this.database.db;

        for (const item of order.items) {
            const product = item.product;
            if (product?.recipe) {
                for (const recipeItem of product.recipe) {
                    const totalNeeded = recipeItem.quantity * item.quantity;

                    // Get all batches of this ingredient, sorted by expiry date (FIFO)
                    const batches = await db.query.ingredients.findMany({
                        where: eq(schema.ingredients.name, recipeItem.ingredient.name),
                        orderBy: asc(schema.ingredients.expiryDate)
                    });

                    let remaining = totalNeeded;
                    for (const batch of batches) {
                        if (remaining <= 0) break;
                        const deduct = Math.min(batch.quantity, remaining);
                        await db.update(schema.ingredients)
                            .set({ quantity: batch.quantity - deduct, updatedAt: new Date() })
                            .where(eq(schema.ingredients.id, batch.id));
                        remaining -= deduct;
                    }
                }
            }
        }
    }

    async update(id: string, data: { customerName?: string; customerPhone?: string; total?: number }) {
        await this.database.db.update(schema.orders)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(schema.orders.id, id));

        return this.findOne(id);
    }

    async getStatistics() {
        const db = this.database.db;

        const activeOrders = await db.query.orders.findMany({
            where: inArray(schema.orders.status, ['CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'COMPLETED']),
            with: { items: true },
            orderBy: asc(schema.orders.createdAt)
        });

        const totalEarnings = activeOrders.reduce((sum, order) => sum + order.total, 0);
        const itemsSold = activeOrders.reduce((sum, order) => sum + order.items.reduce((isum, item) => isum + item.quantity, 0), 0);

        // Group by Date for Chart
        const chartMap = new Map<string, number>();
        activeOrders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            const current = chartMap.get(date) || 0;
            chartMap.set(date, current + order.total);
        });

        const chartData = Array.from(chartMap.entries()).map(([date, revenue]) => ({
            date,
            revenue
        })).sort((a, b) => a.date.localeCompare(b.date));

        return { totalEarnings, itemsSold, orderCount: activeOrders.length, chartData };
    }

    async remove(id: string) {
        const db = this.database.db;

        // Delete order items first
        await db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, id));

        // Delete order
        const result = await db.delete(schema.orders).where(eq(schema.orders.id, id)).returning();
        return result[0];
    }
}
