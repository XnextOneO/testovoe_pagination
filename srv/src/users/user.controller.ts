import { UserService } from './users.service';
import { Controller, Get, Logger } from '@nestjs/common';
import {UsersResponseDto} from "./users.response.dto";
import { Query } from '@nestjs/common';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    this.logger.log(`Get all users (page: ${page}, limit: ${limit})`);
    const { users, total } = await this.userService.findAll(page, limit);
    return {
      users: users.map((user) => UsersResponseDto.fromUsersEntity(user)),
      total,
    };
  }
}
