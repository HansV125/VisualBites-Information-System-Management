import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { validateUploadedFile, generateSafeFilename } from '../common/utils/file-upload.util';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(private readonly service: ProductsService) { }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() data: CreateProductDto) {
        return this.service.create(data);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: UpdateProductDto) {
        return this.service.update(id, data);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    // Recipe endpoints
    @Post(':id/recipe')
    setRecipe(@Param('id') id: string, @Body() body: { items: { ingredientId: string; quantity: number }[] }) {
        return this.service.setRecipe(id, body.items);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = path.resolve(process.cwd(), '../vb-frontend/public/uploads');
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                cb(null, generateSafeFilename(file.originalname));
            }
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
        fileFilter: (req, file, cb) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
            if (!allowedTypes.includes(file.mimetype)) {
                cb(new BadRequestException('Invalid file type'), false);
            } else {
                cb(null, true);
            }
        }
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        return { url: `/uploads/${file.filename}` };
    }
}
