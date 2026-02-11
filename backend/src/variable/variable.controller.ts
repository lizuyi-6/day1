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
import { VariableService } from './variable.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';
import { ResponseUtil } from '../common/interfaces/response.interface';

@Controller('variables')
export class VariableController {
  constructor(private readonly variableService: VariableService) {}

  @Post()
  @UseGuards(HybridAuthGuard)
  async create(
    @Body() createVariableDto: CreateVariableDto,
    @User() user: any,
  ) {
    const variable = await this.variableService.create(
      createVariableDto,
      user?.userId,
    );
    return ResponseUtil.created(variable, 'Variable created successfully');
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  async findAll(@User() user: any) {
    const variables = await this.variableService.findAll(user?.userId);
    return ResponseUtil.success(variables, 'Variables retrieved successfully');
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  async findOne(@Param('id') id: string) {
    const variable = await this.variableService.findOne(id);
    return ResponseUtil.success(variable, 'Variable retrieved successfully');
  }

  @Get('by-name/:name')
  @UseGuards(HybridAuthGuard)
  async findByName(@Param('name') name: string, @User() user: any) {
    const variable = await this.variableService.findByName(name, user?.userId);
    if (!variable) {
      return ResponseUtil.notFound('Variable', name);
    }
    return ResponseUtil.success(variable, 'Variable retrieved successfully');
  }

  @Post('batch')
  @UseGuards(HybridAuthGuard)
  async getBatch(@Body() body: { names: string[] }, @User() user: any) {
    const variables = await this.variableService.getVariablesByNames(
      body.names,
      user?.userId,
    );
    return ResponseUtil.success(
      Object.fromEntries(variables),
      'Variables retrieved successfully',
    );
  }

  @Put(':id')
  @UseGuards(HybridAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateVariableDto: UpdateVariableDto,
  ) {
    const variable = await this.variableService.update(id, updateVariableDto);
    return ResponseUtil.success(variable, 'Variable updated successfully');
  }

  @Delete(':id')
  @UseGuards(HybridAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.variableService.remove(id);
  }
}
