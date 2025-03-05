import { getEnvVarOrThrow } from "@lib/config";
import { AppMicroserviceOptions, configShared } from "@lib/config-shared";
import {
  INestApplication,
  INestMicroservice,
  Type,
  ValidationPipe,
  ValidationPipeOptions,
  VersioningOptions,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";

interface IBootstrapOpts {
  versioning?: VersioningOptions | false;
  validationPipe?: ValidationPipeOptions | false;
  microservice?: AppMicroserviceOptions | false;
  httpService?: boolean;
}

const serviceName = getEnvVarOrThrow("npm_package_name");

export async function bootstrap(
  AppModule: Type<unknown>,
  opts: IBootstrapOpts = {},
) {
  const {
    versioning = configShared.data.versioning,
    validationPipe = configShared.data.validationPipeOptions,
    microservice = configShared.data.microserviceOptions,
    httpService = true,
  } = opts;

  const app = await NestFactory.create(AppModule);

  let service: INestMicroservice | undefined;

  if (versioning) app.enableVersioning(versioning);

  if (validationPipe) app.useGlobalPipes(new ValidationPipe(validationPipe));

  if (microservice) {
    console.log("In microservice");
    service = app.connectMicroservice<AppMicroserviceOptions>(microservice);
    await app.startAllMicroservices();
    console.log(`✨ Microservice ${serviceName} has started`);
  }

  if (httpService) {
    console.log("In httpservice");
    const httpPort = getEnvVarOrThrow("HTTP_PORT");
    configureSwagger(app);
    await app.listen(httpPort, () => {
      console.log(
        `🌍 HTTP application ${serviceName} is accepting connections on port ${httpPort}`,
      );
    });
  }

  return { service, app };
}

function configureSwagger(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle(serviceName)
    .setDescription("API description")
    .setVersion("1.0")
    .build();
  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, documentFactory);
  return documentFactory;
}
