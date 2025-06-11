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
              Object.keys(doc.paths[key]).map(method => {
                let queryParams = [];

                if (
                  doc.paths?.[key]?.[method] &&
                  typeof doc.paths[key][method] === "object" &&
                  "parameters" in doc.paths[key][method]
                ) {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                  queryParams = doc.paths[key][method]?.parameters
                    .filter(
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
                      p => p.in && p.in === "query",
                    )
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
                    .map(p => p.name);
                }

                return {
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
                  input_query_strings: queryParams,
                  method:
                    method &&
                    Object.keys(EKrakendHttpMethod).includes(
                      method.toUpperCase(),
                    )
                      ? (method.toUpperCase() as EKrakendHttpMethod)
                      : EKrakendHttpMethod.GET,
                };
              })
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
