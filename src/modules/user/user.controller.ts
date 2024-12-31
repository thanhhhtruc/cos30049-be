import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserInput, UserDto } from './user.dto';
import { ApiPostResponse } from 'src/common/decorators/api-response.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiPostResponse(UserDto, 'User created')
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() input: CreateUserInput) {
    return this.userService.createUser(input);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('/needAuth')
  // async needAuth() {
  //   return 'You need to be authenticated to access this route';
  // }
}
