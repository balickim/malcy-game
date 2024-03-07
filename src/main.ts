import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from '~/app.module';
import { JwtGuard } from '~/models/auth/guards/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalGuards(new JwtGuard(app.get(Reflector)));

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || 3000;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
