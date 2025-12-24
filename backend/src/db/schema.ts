import { pgTable, text, varchar, integer, timestamp, pgEnum, doublePrecision, primaryKey, uniqueIndex, index, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const productStatusEnum = pgEnum('ProductStatus', ['ACTIVE', 'DRAFT', 'ARCHIVED']);
export const orderStatusEnum = pgEnum('OrderStatus', ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'COMPLETED', 'CANCELLED']);

// --- Tables ---

export const users = pgTable('User', {
    id: text('id').primaryKey().$defaultFn(() => cuid()),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: text('password').notNull(),
    name: varchar('name', { length: 255 }),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).$onUpdate(() => new Date()).notNull(),
});

export const products = pgTable('Product', {
    id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    tag: varchar('tag', { length: 100 }).notNull(),
    badge: varchar('badge', { length: 100 }),
    description: text('description').notNull(),
    price: integer('price').notNull(),
    stock: integer('stock').notNull(),
    flavors: text('flavors').array().notNull(),
    image: text('image').notNull(),
    sticker: text('sticker'),
    status: productStatusEnum('status').default('ACTIVE').notNull(),
    soldCount: integer('soldCount').default(0).notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).$onUpdate(() => new Date()).notNull(),
});

export const ingredients = pgTable('Ingredient', {
    id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    quantity: doublePrecision('quantity').notNull(),
    unit: varchar('unit', { length: 50 }).notNull(),
    minStock: doublePrecision('minStock').default(0).notNull(),
    expiryDate: timestamp('expiryDate', { mode: 'date' }),
    expiryWarningDays: integer('expiryWarningDays').default(7).notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index('Ingredient_name_idx').on(table.name),
    index('Ingredient_expiryDate_idx').on(table.expiryDate),
]);

export const productIngredients = pgTable('ProductIngredient', {
    id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    productId: uuid('productId').notNull().references(() => products.id, { onDelete: 'cascade' }),
    ingredientId: uuid('ingredientId').notNull().references(() => ingredients.id, { onDelete: 'cascade' }),
    quantity: doublePrecision('quantity').notNull(),
}, (table) => [
    uniqueIndex('ProductIngredient_productId_ingredientId_key').on(table.productId, table.ingredientId),
]);

export const orders = pgTable('Order', {
    id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    customerName: varchar('customerName', { length: 255 }).notNull(),
    customerPhone: varchar('customerPhone', { length: 50 }).notNull(),
    total: integer('total').notNull(),
    status: orderStatusEnum('status').default('PENDING').notNull(),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).$onUpdate(() => new Date()).notNull(),
}, (table) => [
    index('Order_status_idx').on(table.status),
    index('Order_createdAt_idx').on(table.createdAt),
]);

export const orderItems = pgTable('OrderItem', {
    id: uuid('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    orderId: uuid('orderId').notNull().references(() => orders.id),
    productId: uuid('productId').notNull().references(() => products.id),
    quantity: integer('quantity').notNull(),
    price: integer('price').notNull(),
    flavor: varchar('flavor', { length: 100 }),
});

// --- Relations ---

export const productsRelations = relations(products, ({ many }) => ({
    recipe: many(productIngredients),
    orderItems: many(orderItems),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
    recipes: many(productIngredients),
}));

export const productIngredientsRelations = relations(productIngredients, ({ one }) => ({
    product: one(products, { fields: [productIngredients.productId], references: [products.id] }),
    ingredient: one(ingredients, { fields: [productIngredients.ingredientId], references: [ingredients.id] }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
    items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
    product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

// --- Helper ---
function cuid(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const timestamp = Date.now().toString(36);
    let result = 'c' + timestamp;
    for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
