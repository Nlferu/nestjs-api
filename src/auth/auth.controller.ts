import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthDto } from './dto'

/** @dev Controller calls Service (it's instance) so we define it in constructor to handle those calls automatically */
@Controller('auth')
export class AuthController {
  // 'private' just do following: authService: AuthService; this.authService = authServeice
  constructor(private authService: AuthService) {}

  /** @dev Creating endpoints for login - (POST /auth/signup) */
  /** @dev 'dto' -> data transfer object */
  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto)
  }

  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto)
  }
}
