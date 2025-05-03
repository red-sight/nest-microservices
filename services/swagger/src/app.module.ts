import { configShared } from "@lib/config-shared";
import { RedisModule } from "@lib/nest";
import { Module } from "@nestjs/common";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  controllers: [AppController],
  imports: [RedisModule.register(configShared.data.redisOptions)],
  providers: [AppService],
})
export class AppModule {}
