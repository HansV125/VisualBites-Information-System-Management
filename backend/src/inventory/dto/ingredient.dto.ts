import { IsString, IsNumber, IsOptional, IsDateString, Min, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIngredientDto {
    @ApiProperty({ example: 'Tepung Terigu', description: 'Ingredient name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 5000, description: 'Quantity in specified unit' })
    @IsNumber()
    @Min(0)
    quantity: number;

    @ApiProperty({ example: 'gram', description: 'Unit of measurement' })
    @IsString()
    unit: string;

    @ApiPropertyOptional({ example: 1000, description: 'Minimum stock threshold' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minStock?: number;

    @ApiPropertyOptional({ example: '2024-12-31', description: 'Expiry date in ISO format' })
    @IsOptional()
    @IsDateString()
    expiryDate?: string;

    @ApiPropertyOptional({ example: 7, description: 'Days before expiry to trigger warning' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    expiryWarningDays?: number;
}

export class UpdateIngredientDto {
    @ApiPropertyOptional({ example: 'Tepung Terigu Premium' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 3000 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    quantity?: number;

    @ApiPropertyOptional({ example: 'gram' })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiPropertyOptional({ example: 500 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    minStock?: number;

    @ApiPropertyOptional({ example: '2025-06-30' })
    @IsOptional()
    @IsDateString()
    expiryDate?: string;

    @ApiPropertyOptional({ example: 7, description: 'Days before expiry to trigger warning' })
    @IsOptional()
    @IsNumber()
    @Min(0)
    expiryWarningDays?: number;
}

export class AdjustQuantityDto {
    @ApiProperty({ example: 100, description: 'Amount to adjust' })
    @IsNumber()
    @Min(0)
    amount: number;

    @ApiProperty({ enum: ['add', 'subtract'], example: 'add', description: 'Operation type' })
    @IsIn(['add', 'subtract'])
    operation: 'add' | 'subtract';
}
