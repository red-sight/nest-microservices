import { getEnvVarOrThrow } from "@lib/config";
import { EKrakendHttpMethod, IKrakendEndpoint } from "@lib/types";
import { Injectable } from "@nestjs/common";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { IApiDocMergeItem } from "../api-doc.service";
import { GatewayProvider } from "./gateway-provider.service";

@Injectable()
export class KrakendGatewayProvider implements GatewayProvider {
  readonly configure = async (docs: IApiDocMergeItem[]) => {
    const endpoints: IKrakendEndpoint[] = docs
      .map(({ doc, hosts, service }) => {
        console.log(service, hosts);
        if (doc.paths === undefined) return;
        return Object.keys(doc.paths)
          .map(key => {
            return (
              doc.paths?.[key] !== undefined &&
              Object.keys(doc.paths[key]).map(method => ({
                backend: [
                  {
                    extra_config: {
                      "backend/http": {
                        return_error_code: true,
                      },
                    },
                    host: hosts,
                    url_pattern: key,
                  },
                ],
                endpoint: join("/", service, key),
                method:
                  method &&
                  Object.keys(EKrakendHttpMethod).includes(method.toUpperCase())
                    ? (method.toUpperCase() as EKrakendHttpMethod)
                    : EKrakendHttpMethod.GET,
              }))
            );
          })
          .flat();
      })
      .flat()
      .filter(i => !!i);

    const krakendConfig = {
      $schema: "http://www.krakend.io/schema/krakend.json",
      endpoints,
      extra_config: {
        router: {
          return_error_msg: true,
        },
      },
      version: 3,
    };

    await writeFile(
      join(getEnvVarOrThrow("PWD"), "krakend/krakend.json"),
      JSON.stringify(krakendConfig, null, 2),
    );
  };
}
