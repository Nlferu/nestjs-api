import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';

/** @dev Controller calls Service (it's instance) so we define it in constructor to handle those calls automatically */
@Controller({})
export class AuthController {
  // 'private' just do following: authService: AuthService; this.authService = authServeice
  constructor(private authService: AuthService) {}
}
