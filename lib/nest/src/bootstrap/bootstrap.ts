import { getEnvVarOrThrow } from "@lib/config";
import { configShared } from "@lib/config-shared";
import { INestApplication, Type, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";

export interface IBootstrapOpts {
  enableVersioning?: boolean;
  enableValidationPipe?: boolean;
  enableMicroservice?: boolean;
  enableHttpService?: boolean;
}

export async function bootstrap(
  AppModule: Type<unknown>,
  {
    enableVersioning = true,
    enableValidationPipe = true,
    enableMicroservice = true,
    enableHttpService = true,
  }: IBootstrapOpts = {},
): Promise<{ app: INestApplication }> {
  const serviceName = getEnvVarOrThrow("npm_package_name");

  const app = await NestFactory.create(AppModule, {
    abortOnError: false,
    bufferLogs: true,
  });

  if (enableValidationPipe)
    app.useGlobalPipes(
      new ValidationPipe(configShared.data.validationPipeOptions),
    );

  if (enableMicroservice) {
    app.connectMicroservice(configShared.data.microserviceOptions, {
      inheritAppConfig: true,
    });
    await app.startAllMicroservices();
    if (!enableHttpService) await app.init();
    console.log(`✨ Microservice ${serviceName} has started`);
  }

  if (enableHttpService) {
    const httpPort = getEnvVarOrThrow("HTTP_PORT");
    if (enableVersioning) app.enableVersioning(configShared.data.versioning);
    configureSwagger(app, serviceName);
    await app.listen(httpPort, () => {
      console.log(
        `🌍 HTTP application ${serviceName} is accepting connections on port ${httpPort}`,
      );
    });
  }

  return { app };
}

function configureSwagger(
  app: INestApplication,
  serviceName: string,
): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle(serviceName)
    .addTag(serviceName)
    .setVersion(configShared.data.appVersion)
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);
  return documentFactory;
}
