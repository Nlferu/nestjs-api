import * as dotenv from 'dotenv'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' })
} else {
  dotenv.config({ path: '.env.production' })
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const PORT = process.env.PORT_BACKEND || 3001

  await app.listen(PORT)
  console.log(`Server is running at port: ${PORT}`)
}

bootstrap()
