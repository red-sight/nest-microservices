import { NestFactory } from "@nestjs/core";
import * as swaggerUi from "swagger-ui-express";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    "/swagger",
    swaggerUi.serve,
    swaggerUi.setup(null, {
      swaggerUrl: "/openapi.json",
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
