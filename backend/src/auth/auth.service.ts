import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { LoginDto, RegisterDto } from './dto/login.dto';
import { PasswordValidator } from '../utils/password-validator';

@Injectable()
export class AuthService {
  private readonly bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const passwordValidation = PasswordValidator.validate(registerDto.password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(
        `Password requirements not met: ${passwordValidation.errors.join(', ')}`,
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email: registerDto.email }, { username: registerDto.username }],
    });

    if (existingUser) {
      throw new ConflictException(
        'User with this email or username already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.bcryptRounds,
    );

    const user = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: (registerDto.role as UserRole) || UserRole.USER,
    });

    await this.userRepository.save(user);

    const { password, ...result } = user;
    return result;
  }

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user;
    return result;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const passwordValidation = PasswordValidator.validate(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestException(
        `Password requirements not met: ${passwordValidation.errors.join(', ')}`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    user.password = await bcrypt.hash(newPassword, this.bcryptRounds);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}
