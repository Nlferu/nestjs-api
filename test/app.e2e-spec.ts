import * as pactum from 'pactum'
import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '../src/prisma/prisma.service'
import { AuthDto } from 'src/auth/dto'
import { EditUserDto } from 'src/user/dto'
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto'

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

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Vampire',
          email: 'coder@gmah.com',
        }

        /** @dev userId is picked from JWT access_token */
        return pactum
          .spec()
          .patch(`/users`)
          .withBearerToken('$S{userAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmark', () => {
    describe('Get empty bookmark', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get(`/bookmarks`)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBody([])
      })
    })

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s&ab_channel=freeCodeCamp.org',
      }

      it('should create bookmark', () => {
        return pactum
          .spec()
          .post(`/bookmarks`)
          .withBearerToken('$S{userAt}')
          .withBody(dto)
          .expectStatus(201)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.link)
          .stores('bookmarkId', 'id')
      })
    })

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get(`/bookmarks`)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(1)
      })
    })

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}')
      })
    })

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title: 'Edited Bookmark',
        description: 'Some forest description',
      }

      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAt}')
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description)
      })
    })

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete(`/bookmarks/{id}`)
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAt}')
          .expectStatus(204)
          .inspect()
      })

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get(`/bookmarks`)
          .withBearerToken('$S{userAt}')
          .expectStatus(200)
          .expectJsonLength(0)
      })
    })
  })
})
