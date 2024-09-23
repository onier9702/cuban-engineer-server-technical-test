import { Controller, Get, Post, Body, Patch, Param, Delete, InternalServerErrorException } from '@nestjs/common';

import { AuthService } from './auth.service';

import { Auth } from './entities/auth.entity';

import { AuthDecorator } from './decorators/auth.decorator';
import { GetUser } from './decorators/get-user.decorator';

import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

import { ListRoles } from './interfaces/list-roles';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('sign-in')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Get('renew')
  @AuthDecorator()
  revalidateToken( @GetUser() user: Auth // decorator
  ) {
    return this.authService.revalidateToken( user );
  }

  @Get('logout')
  @AuthDecorator()
  logout( @GetUser() user: Auth // decorator
  ) {
    
    return user 
      ? { ok: true }
      : new InternalServerErrorException('It is not possible to close session without being authenticated, review --logs-- Admin');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  @AuthDecorator(ListRoles.admin)
  remove(@Param('id') id: string) { // Soft delete === inactive
    return this.authService.remove(+id);
  }

}
