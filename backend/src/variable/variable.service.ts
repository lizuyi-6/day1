import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variable, VariableType } from './entities/variable.entity';
import { CreateVariableDto } from './dto/create-variable.dto';
import { UpdateVariableDto } from './dto/update-variable.dto';

@Injectable()
export class VariableService {
  constructor(
    @InjectRepository(Variable)
    private readonly variableRepository: Repository<Variable>,
  ) {}

  async create(
    createVariableDto: CreateVariableDto,
    userId?: string,
  ): Promise<Variable> {
    const existing = await this.variableRepository.findOne({
      where: { name: createVariableDto.name },
    });

    if (existing) {
      throw new BadRequestException(
        `Variable with name '${createVariableDto.name}' already exists`,
      );
    }

    const variable = this.variableRepository.create({
      ...createVariableDto,
      userId,
      type: createVariableDto.type || VariableType.STRING,
      value: createVariableDto.value || '',
    });

    return await this.variableRepository.save(variable);
  }

  async findAll(userId?: string): Promise<Variable[]> {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return await this.variableRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Variable> {
    const variable = await this.variableRepository.findOne({ where: { id } });
    if (!variable) {
      throw new NotFoundException(`Variable with ID '${id}' not found`);
    }
    return variable;
  }

  async findByName(name: string, userId?: string): Promise<Variable | null> {
    const where: any = { name };
    if (userId) {
      where.userId = userId;
    }

    const variable = await this.variableRepository.findOne({ where });
    return variable;
  }

  async update(
    id: string,
    updateVariableDto: UpdateVariableDto,
  ): Promise<Variable> {
    const variable = await this.findOne(id);

    if (updateVariableDto.name && updateVariableDto.name !== variable.name) {
      const existing = await this.variableRepository.findOne({
        where: { name: updateVariableDto.name },
      });

      if (existing) {
        throw new BadRequestException(
          `Variable with name '${updateVariableDto.name}' already exists`,
        );
      }
    }

    Object.assign(variable, updateVariableDto);
    return await this.variableRepository.save(variable);
  }

  async remove(id: string): Promise<void> {
    const variable = await this.findOne(id);
    await this.variableRepository.remove(variable);
  }

  async getVariablesByNames(
    names: string[],
    userId?: string,
  ): Promise<Map<string, any>> {
    const variables = await this.variableRepository.find({
      where: names.map((name) => ({ name })),
    });

    const result = new Map<string, any>();
    for (const variable of variables) {
      if (variable.userId && userId && variable.userId !== userId) {
        continue;
      }

      let parsedValue: any = variable.value;

      if (!variable.isSecret) {
        try {
          switch (variable.type) {
            case VariableType.NUMBER:
              parsedValue = Number(variable.value);
              break;
            case VariableType.BOOLEAN:
              parsedValue = variable.value.toLowerCase() === 'true';
              break;
            case VariableType.JSON:
            case VariableType.ARRAY:
              parsedValue = JSON.parse(variable.value);
              break;
          }
        } catch (e) {
          parsedValue = variable.value;
        }
      } else {
        parsedValue = '••••••••';
      }

      result.set(variable.name, parsedValue);
    }

    return result;
  }
}
