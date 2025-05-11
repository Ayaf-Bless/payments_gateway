import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from '@app/users/dto/register.dto';
import { AuthResponseDto } from '@app/users/dto/auth-response.dto';
import { User } from '@app/users/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User has been created.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    await this.authService.register(registerDto);
    const { accessToken } = await this.authService.login({
      email: registerDto.email,
      password: registerDto.password,
    });

    return {
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      accessToken,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user and get a JWT token' })
  @ApiResponse({ status: 200, description: 'User has been authenticated.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    const { accessToken } = await this.authService.login(loginDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      accessToken,
    };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user information' })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved user information',
    type: User,
  })
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req): Promise<{
    statusCode: number;
    message: string;
    data: Omit<User, 'password'>;
  }> {
    const userInfo = await this.authService.findUserById(req.user.sub);
    return {
      statusCode: HttpStatus.OK,
      message: 'User information retrieved successfully',
      data: userInfo,
    };
  }
}
