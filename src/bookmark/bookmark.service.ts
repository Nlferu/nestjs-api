import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBookmarkDto, EditBookmarkDto } from './dto'

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: { userId, ...dto },
    })

    return bookmark
  }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    })
  }

  getBookmarkById(userId: number, bookmarkId: number) {
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
    // Get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    })

    // Check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resource denied')

    // Edit bookmark
    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    })
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    // Get the bookmark by id
    const bookmark = await this.getBookmarkById(userId, bookmarkId)

    // Check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId)
      throw new ForbiddenException('Access to resource denied')

    // Delete bookmark
    return this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    })
  }
}
