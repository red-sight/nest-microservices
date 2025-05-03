import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  // constructor() {}
  // @Inject(EInjectionTokens.REGISTRY_SERVICE)
  // private readonly client: ClientProxy,

  getHello() {
    // const registerOptions = {
    //   name: getEnvVarOrThrow('npm_package_name'),
    //   port: getEnvVarOrThrow('HTTP_PORT'),
    //   host: 'localhost',
    // };

    // this.client.send<unknown>('REGISTER', registerOptions).subscribe((data) => {
    //   console.log('Response from registry:');
    //   console.dir(data, { depth: null, colors: true });
    // });
    // return { message: 'Register request is being sent', registerOptions };
    return { message: "hello" };
  }
}
