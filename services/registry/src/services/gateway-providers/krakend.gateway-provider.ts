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
                backend: [{ host: hosts, url_pattern: key }],
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
      endpoints,
      version: "3",
    };

    await writeFile(
      join(getEnvVarOrThrow("PWD"), "krakend/krakend.json"),
      JSON.stringify(krakendConfig, null, 2),
    );
  };
}
