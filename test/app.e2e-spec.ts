import * as pactum from 'pactum'
import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthDto } from '../src/auth/dto'

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService

  const port: number = 3001

  pactum.request.setBaseUrl(`http://localhost:${port}`)

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

    await app.init()
    await app.listen(port)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
  })

  afterAll(() => {
    app.close()
  })

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'nif@gmail.com',
      password: '123',
    }

    describe('Signup', () => {
      it('should fail if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({ password: dto.password })
          .expectStatus(400)
      })

      it('should fail if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody({ email: dto.email })
          .expectStatus(400)
      })

      it('should fail body empty', () => {
        return pactum.spec().post(`/auth/signup`).expectStatus(400)
      })

      it('should signup', () => {
        return pactum
          .spec()
          .post(`/auth/signup`)
          .withBody(dto)
          .expectStatus(201)
        // .inspect() // use this to see post request json
      })
    })

    describe('Signin', () => {
      it('should fail if email empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({ password: dto.password })
          .expectStatus(400)
      })

      it('should fail if password empty', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody({ email: dto.email })
          .expectStatus(400)
      })

      it('should fail body empty', () => {
        return pactum.spec().post(`/auth/signin`).expectStatus(400)
      })

      it('should signin', () => {
        return pactum
          .spec()
          .post(`/auth/signin`)
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token')
      })
    })
  })

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get(`/users/me`)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
      })
    })

    describe('Edit user', () => {})
  })

  describe('Bookmark', () => {
    describe('Create bookmark', () => {})

    describe('Get bookmarks', () => {})

    describe('Get bookmark by id', () => {})

    describe('Edit bookmark', () => {})

    describe('Delete bookmark', () => {})
  })
})
