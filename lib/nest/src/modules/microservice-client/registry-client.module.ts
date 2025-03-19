import { EMessagePatternRegistry } from "@lib/types";
import { Inject, Module, OnApplicationBootstrap } from "@nestjs/common";
import { ClientProxy, ClientsModule } from "@nestjs/microservices";
import { EInjectionTokens } from "../../types";
import { configShared } from "@lib/config-shared";
import { getEnvVarOrThrow } from "@lib/config";
import { firstValueFrom } from "rxjs";

@Module({})
export class RegistryClientModule implements OnApplicationBootstrap {
  constructor(
    @Inject(EInjectionTokens.REGISTRY_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  static register() {
    const registryClientOptions = {
      name: EInjectionTokens.REGISTRY_SERVICE,
      ...configShared.data.microserviceRegistryClientOptions,
    };

    return {
      module: RegistryClientModule,
      imports: [ClientsModule.register([registryClientOptions])],
      providers: [],
      exports: [ClientsModule],
    };
  }

  async onApplicationBootstrap() {
    await this.client.connect();
    console.log("Connected to broker");

    const registerOptions = {
      name: getEnvVarOrThrow("npm_package_name"),
      port: getEnvVarOrThrow("HTTP_PORT"),
      host: "localhost",
    };

    void firstValueFrom(
      this.client.send<unknown>(
        EMessagePatternRegistry.registrationRequest,
        registerOptions,
      ),
    );
    console.log("Registration request is being sent");
  }
}
