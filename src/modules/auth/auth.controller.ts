import { Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { CurrentUser } from './auth.decorator';
import { User } from '@dbschema/interfaces';
import { Response } from 'express';
import {
  ApiGetResponse,
  ApiPostResponse,
} from 'src/common/decorators/api-response.decorator';
import { LoginOutput } from './auth.dto';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(LocalAuthGuard)
  @ApiPostResponse(LoginOutput, 'User logged in')
  @ApiOperation({ summary: 'Login' })
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login({ user, response });
  }

  @Get('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth()
  @ApiGetResponse(LoginOutput, 'Refreshed token')
  @ApiOperation({ summary: 'Refresh token' })
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login({ user, response });
  }
}
