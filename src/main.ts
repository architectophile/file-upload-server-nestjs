import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all routes and origins
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());
  const server = app.getHttpServer();
  server.setTimeout(30 * 60 * 1000); // Set timeout to 30 minutes
  await app.listen(3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
