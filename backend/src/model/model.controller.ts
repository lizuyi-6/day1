import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ModelService } from './model.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { ResponseUtil } from '../common/interfaces/response.interface';

@Controller('models')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Post()
  @UseGuards(HybridAuthGuard)
  async create(@Body() createModelDto: CreateModelDto, @User() user: any) {
    const model = await this.modelService.create(createModelDto, user?.userId);
    return ResponseUtil.created(model, 'Model created successfully');
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  async findAll(@User() user: any) {
    const models = await this.modelService.findAll(user?.userId);
    return ResponseUtil.success(models, 'Models retrieved successfully');
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  async findOne(@Param('id') id: string) {
    const model = await this.modelService.findOne(id);
    return ResponseUtil.success(model, 'Model retrieved successfully');
  }

  @Post(':id/test')
  @UseGuards(HybridAuthGuard)
  async testConnection(@Param('id') id: string) {
    const result = await this.modelService.testConnection(id);
    return ResponseUtil.success(result, 'Connection test completed');
  }

  @Put(':id')
  @UseGuards(HybridAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateModelDto: UpdateModelDto,
  ) {
    const model = await this.modelService.update(id, updateModelDto);
    return ResponseUtil.success(model, 'Model updated successfully');
  }

  @Delete(':id')
  @UseGuards(HybridAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.modelService.remove(id);
  }
}
