import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBookmarkDto, EditBookmarkDto } from './dto'

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  // create
  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    return this.prisma.bookmark.create({ data: { userId, ...dto } })
  }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    })
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    return this.prisma.bookmark.findUnique({
      where: {
        userId,
        id: bookmarkId,
      },
    })
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.user.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    })

    return bookmark
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {}
}
