import { configShared } from "@lib/config-shared";
import { RedisModule, RegistryClientModule } from "@lib/nest";
import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

const options = configShared.data.redisOptions;

@Module({
  controllers: [AppController],
  imports: [RedisModule.register(options), RegistryClientModule.register()],
  providers: [AppService],
})
export class AppModule {}
