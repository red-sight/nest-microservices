import { bootstrap } from "@lib/nest";

import { AppModule } from "./app.module";

void bootstrap(AppModule, {
  enableHttpService: false,
  enableValidationPipe: false,
  enableVersioning: false,
});
