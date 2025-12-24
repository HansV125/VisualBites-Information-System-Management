import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { DatabaseService } from '../database.service';

@Module({
    controllers: [InventoryController],
    providers: [InventoryService, DatabaseService],
})
export class InventoryModule { }
