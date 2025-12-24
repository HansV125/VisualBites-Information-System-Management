import { Controller, Get, Post, Body, Patch, Param, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Body() body: CreateOrderDto) {
        return this.ordersService.create(body);
    }

    @Get()
    findAll(@Query('status') status?: OrderStatus) {
        return this.ordersService.findAll(status);
    }

    @Get('stats')
    getStats() {
        return this.ordersService.getStatistics();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateOrderDto) {
        return this.ordersService.update(id, body);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto) {
        return this.ordersService.updateStatus(id, body.status);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ordersService.remove(id);
    }
}
