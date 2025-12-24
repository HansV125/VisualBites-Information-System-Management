import { IsString, IsNumber, IsArray, IsOptional, IsEnum, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    PROCESSING = 'PROCESSING',
    READY = 'READY',
    SHIPPED = 'SHIPPED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export class OrderItemDto {
    @ApiProperty({ example: 'uuid-product-id', description: 'Product ID' })
    @IsString()
    productId: string;

    @ApiProperty({ example: 2, description: 'Quantity ordered' })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ example: 15000, description: 'Price per item' })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiPropertyOptional({ example: 'Pedas', description: 'Selected flavor' })
    @IsOptional()
    @IsString()
    flavor?: string;
}

export class CreateOrderDto {
    @ApiProperty({ example: 'John Doe', description: 'Customer name' })
    @IsString()
    customerName: string;

    @ApiProperty({ example: '+6281234567890', description: 'Customer phone number' })
    @IsString()
    customerPhone: string;

    @ApiProperty({ example: 45000, description: 'Total order amount' })
    @IsNumber()
    @Min(0)
    total: number;

    @ApiProperty({ type: [OrderItemDto], description: 'Order items' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}

export class UpdateOrderDto {
    @ApiPropertyOptional({ example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    customerName?: string;

    @ApiPropertyOptional({ example: '+6289876543210' })
    @IsOptional()
    @IsString()
    customerPhone?: string;

    @ApiPropertyOptional({ example: 50000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    total?: number;

    @ApiPropertyOptional({ enum: OrderStatus })
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;
}

export class UpdateOrderStatusDto {
    @ApiProperty({ enum: OrderStatus, example: 'CONFIRMED', description: 'New order status' })
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
