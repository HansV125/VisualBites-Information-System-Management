import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProductStatus {
    ACTIVE = 'ACTIVE',
    DRAFT = 'DRAFT',
    ARCHIVED = 'ARCHIVED'
}

export class CreateProductDto {
    @ApiProperty({ example: 'Risol Mayo', description: 'Product name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'frozen-snack', description: 'Product tag/category' })
    @IsString()
    tag: string;

    @ApiPropertyOptional({ example: 'Best Seller', description: 'Optional badge' })
    @IsOptional()
    @IsString()
    badge?: string;

    @ApiProperty({ example: 'Risol mayo dengan isian lezat', description: 'Product description' })
    @IsString()
    description: string;

    @ApiProperty({ example: 15000, description: 'Product price in IDR' })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ example: 100, description: 'Initial stock count' })
    @IsNumber()
    @Min(0)
    stock: number;

    @ApiProperty({ example: ['Original', 'Pedas'], description: 'Available flavors' })
    @IsArray()
    @IsString({ each: true })
    flavors: string[];

    @ApiProperty({ example: '/uploads/risol.avif', description: 'Image path' })
    @IsString()
    image: string;

    @ApiPropertyOptional({ example: 'Lumer!!!', description: 'Optional sticker text' })
    @IsOptional()
    @IsString()
    sticker?: string;

    @ApiPropertyOptional({ enum: ProductStatus, default: ProductStatus.ACTIVE })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
}

export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Risol Mayo' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 'frozen-snack' })
    @IsOptional()
    @IsString()
    tag?: string;

    @ApiPropertyOptional({ example: 'Best Seller' })
    @IsOptional()
    @IsString()
    badge?: string;

    @ApiPropertyOptional({ example: 'Updated description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ example: 18000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ example: 50 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;

    @ApiPropertyOptional({ example: ['Original', 'Pedas', 'Keju'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    flavors?: string[];

    @ApiPropertyOptional({ example: '/uploads/risol-new.avif' })
    @IsOptional()
    @IsString()
    image?: string;

    @ApiPropertyOptional({ example: 'Hot!' })
    @IsOptional()
    @IsString()
    sticker?: string;

    @ApiPropertyOptional({ enum: ProductStatus })
    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;
}
