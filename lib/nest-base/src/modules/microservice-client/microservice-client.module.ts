import { Inject, Module, OnApplicationBootstrap } from "@nestjs/common";
import { EInjectionTokens } from "../../types";
import { ClientProxy, ClientsModule } from "@nestjs/microservices";
import { AppMicroserviceOptions, configShared } from "@lib/config-shared";

@Module({})
export class MicroserviceClientModule implements OnApplicationBootstrap {
  constructor(
    @Inject(EInjectionTokens.MICROSERVICES)
    private readonly client: ClientProxy,
  ) {}

  static register(
    options: AppMicroserviceOptions = configShared.data.microserviceOptions,
  ) {
    return {
      module: MicroserviceClientModule,
      imports: [
        ClientsModule.register([
          {
            name: EInjectionTokens.MICROSERVICES,
            ...options,
          },
        ]),
      ],
      exports: [ClientsModule],
    };
  }

  async onApplicationBootstrap() {
    await this.client.connect();
    console.log("Connected to broker");
  }
}
