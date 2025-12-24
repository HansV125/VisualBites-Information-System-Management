import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateIngredientDto, UpdateIngredientDto, AdjustQuantityDto } from './dto/ingredient.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
    constructor(private readonly service: InventoryService) { }

    @Get()
    findAll(@Query('flat') flat?: string) {
        // Use ?flat=true to get ungrouped data
        if (flat === 'true') {
            return this.service.findAllFlat();
        }
        return this.service.findAll();
    }

    @Post()
    create(@Body() data: CreateIngredientDto) {
        return this.service.create(data);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: UpdateIngredientDto) {
        return this.service.update(id, data);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Patch(':id/adjust')
    adjustQuantity(@Param('id') id: string, @Body() body: AdjustQuantityDto) {
        return this.service.adjustQuantity(id, body.amount, body.operation);
    }
}
