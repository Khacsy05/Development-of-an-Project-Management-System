import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import * as Express from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(
    @Body() loginDto: LoginDto,
    @Res({passthrough: true}) response : Express.Response

  ){
    return this.authService.login(loginDto,response);
  }

  @Post('refreshToken')

  refreshToken(

    @Req() request:  Express.Request,

    @Res({ passthrough: true }) response:Express. Response

  ) {
      return this.authService.refreshTokens(request,response)
  }

}
 