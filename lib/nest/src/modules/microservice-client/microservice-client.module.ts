import {
  Inject,
  Module,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from "@nestjs/common";
import { ClientProxy, ClientsModule } from "@nestjs/microservices";
import { EInjectionTokens } from "../../types";
import { configShared } from "@lib/config-shared";

@Module({})
export class MicroserviceClientModule
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    @Inject(EInjectionTokens.REGISTRY_SERVICE)
    private readonly client: ClientProxy,
  ) {}

  static register() {
    const microserviceRegistryClientOptions = {
      name: EInjectionTokens.REGISTRY_SERVICE,
      ...configShared.data.microserviceRegistryClientOptions,
    };

    return {
      module: MicroserviceClientModule,
      imports: [ClientsModule.register([microserviceRegistryClientOptions])],
      exports: [ClientsModule],
    };
  }

  async onApplicationBootstrap() {
    console.log("connecting to broker");
    await this.client.connect();
    console.log("Connected to broker");
  }

  async onApplicationShutdown() {
    console.log("Closing the client");
    await this.client.close();
    console.log("Client closed");
  }

  async onModuleInit() {
    console.log("Module init - connecting to broker");
    try {
      await this.client.connect();
      console.log("Module init - connected to broker");
    } catch (error) {
      console.error("Failed to connect during module init:", error);
    }
  }

  async onModuleDestroy() {
    console.log("Module destroy - closing client");
    try {
      await this.client.close();
      console.log("Module destroy - client closed");
    } catch (error) {
      console.error("Failed to close client during module destroy:", error);
    }
  }
}
