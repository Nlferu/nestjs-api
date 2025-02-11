import * as argon from 'argon2'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthDto } from './dto'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'

/** @notice It provides dependency injection */
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    // Generate the password hash
    const hash = await argon.hash(dto.password)

    try {
      // Save the user in the db
      const user = await this.prisma.user.create({
        data: { email: dto.email, hash: hash },
      })

      // Do not print password in response
      // const { hash: _, ...userWithoutHash } = user

      // Return the saved user
      // return { msg: 'User has been created!', userWithoutHash }
      return this.signToken(user.id, user.email)
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // Duplicate field prisma code
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken')
        }
      }

      throw error
    }
  }

  async signin(dto: AuthDto) {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    // If user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect')

    // Compare passwords
    const pwMatches = await argon.verify(user.hash, dto.password)

    // If password incorrect -> throw exception
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect')

    // If password correct -> send back the user
    // Do not print password in response
    // const { hash: _, ...userWithoutHash } = user

    // return { msg: 'You have logged in!', this.signToken(user.id, user.email) }
    return this.signToken(user.id, user.email)
  }

  signToken(userId: number, email: string): Promise<string> {
    const payload = { sub: userId, email }
    const secret = this.config.get('JWT_SECRET')

    return this.jwt.signAsync(payload, { expiresIn: '15m', secret: secret })
  }
}
