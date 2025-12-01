import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    // Enable validation pipe globally
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // CORS origins from environment variables
    const corsOrigins = configService
      .get<string>("CORS_ORIGINS", "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim());

    app.enableCors({
      origin: corsOrigins,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    const port = configService.get<number>("PORT", 3001);
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error("Error starting the application:", error);
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  console.error("Fatal error during bootstrap:", error);
  process.exit(1);
});
