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
import { PluginService } from './plugin.service';
import { HybridAuthGuard } from '../auth/hybrid-auth.guard';
import { User } from '../auth/jwt-auth.decorator';
import { CreatePluginDto } from './dto/create-plugin.dto';
import { UpdatePluginDto } from './dto/update-plugin.dto';
import { ResponseUtil } from '../common/interfaces/response.interface';

@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get('available')
  @UseGuards(HybridAuthGuard)
  async getAvailable() {
    const plugins = await this.pluginService.getAvailablePlugins();
    return ResponseUtil.success(
      plugins,
      'Available plugins retrieved successfully',
    );
  }

  @Post()
  @UseGuards(HybridAuthGuard)
  async create(@Body() createPluginDto: CreatePluginDto, @User() user: any) {
    const plugin = await this.pluginService.create(
      createPluginDto,
      user?.userId,
    );
    return ResponseUtil.created(plugin, 'Plugin installed successfully');
  }

  @Get()
  @UseGuards(HybridAuthGuard)
  async findAll(@User() user: any) {
    const plugins = await this.pluginService.findAll(user?.userId);
    return ResponseUtil.success(plugins, 'Plugins retrieved successfully');
  }

  @Get(':id')
  @UseGuards(HybridAuthGuard)
  async findOne(@Param('id') id: string) {
    const plugin = await this.pluginService.findOne(id);
    return ResponseUtil.success(plugin, 'Plugin retrieved successfully');
  }

  @Put(':id')
  @UseGuards(HybridAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePluginDto: UpdatePluginDto,
  ) {
    const plugin = await this.pluginService.update(id, updatePluginDto);
    return ResponseUtil.success(plugin, 'Plugin updated successfully');
  }

  @Delete(':id')
  @UseGuards(HybridAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.pluginService.remove(id);
  }
}
