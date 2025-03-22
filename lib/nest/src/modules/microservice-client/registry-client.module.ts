import { getEnvVarOrThrow } from "@lib/config";
import { configShared } from "@lib/config-shared";
import { EMessagePatternRegistry } from "@lib/types";
import { Inject, Module, OnApplicationBootstrap } from "@nestjs/common";
import { ClientProxy, ClientsModule } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

import { EInjectionTokens } from "../../types";

@Module({})
export class RegistryClientModuleSav implements OnApplicationBootstrap {
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
      exports: [ClientsModule],
      imports: [ClientsModule.register([registryClientOptions])],
      module: RegistryClientModuleSav,
      providers: [],
    };
  }

  async onApplicationBootstrap() {
    await this.client.connect();
    console.log("Connected to broker");

    const registerOptions = {
      host: "localhost",
      name: getEnvVarOrThrow("npm_package_name"),
      port: getEnvVarOrThrow("HTTP_PORT"),
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
