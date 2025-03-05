import { bootstrap } from '@lib/nest-base';
import { AppModule } from './app.module';

void bootstrap(AppModule, {
  httpService: false,
  versioning: false,
  validationPipe: false,
});
