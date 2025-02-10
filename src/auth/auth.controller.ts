import { Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

/** @dev Controller calls Service (it's instance) so we define it in constructor to handle those calls automatically */
@Controller('auth')
export class AuthController {
  // 'private' just do following: authService: AuthService; this.authService = authServeice
  constructor(private authService: AuthService) {}

  /** @dev Creating endpoints for login - (POST /auth/signup) */
  @Post('signup')
  signup() {
    return this.authService.signup()
  }

  @Post('signin')
  signin() {
    return this.authService.signin()
  }
}
