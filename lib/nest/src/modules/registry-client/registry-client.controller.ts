import { Controller, Get, Version, VERSION_NEUTRAL } from "@nestjs/common";

@Controller()
export class RegistryClientController {
  @Get("/health")
  @Version(VERSION_NEUTRAL)
  health() {
    return { healthy: true };
  }
}
