import { getEnvVarOrThrow } from "@lib/config";
import { EKrakendHttpMethod, IKrakendEndpoint } from "@lib/types";
import { Injectable } from "@nestjs/common";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

import { IApiDocMergeItem } from "../api-doc.service";
import { KeycloakAuthProvider } from "../auth-providers";
import { GatewayProvider } from "./gateway-provider.service";

@Injectable()
export class KrakendGatewayProvider implements GatewayProvider {
  constructor(private readonly keycloakAuthProvider: KeycloakAuthProvider) {}

  readonly configure = async (docs: IApiDocMergeItem[]) => {
    const roles = await this.keycloakAuthProvider.mapRolesPermissions();

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
                let requiresAuthentication = true;
                const rolesSet = new Set();

                if (
                  doc.paths?.[key]?.[method] &&
                  typeof doc.paths[key][method] === "object"
                ) {
                  if ("parameters" in doc.paths[key][method])
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    queryParams = doc.paths[key][method]?.parameters
                      .filter(
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
                        p => p.in && p.in === "query",
                      )
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
                      .map(p => p.name);
                  if ("x-requires-authentication" in doc.paths[key][method]) {
                    requiresAuthentication =
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      doc.paths[key][method]["x-requires-authentication"] ===
                      true;
                  }
                  if ("x-authorized-permissions" in doc.paths[key][method]) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const authorizedPermissions =
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      doc.paths[key][method]["x-authorized-permissions"];
                    if (Array.isArray(authorizedPermissions)) {
                      authorizedPermissions.forEach(p => {
                        if (typeof p !== "string") return;
                        if (!Object.keys(roles).includes(p)) {
                          rolesSet.add(p);
                          return;
                        }
                        roles[p].forEach(r => {
                          rolesSet.add(r);
                        });
                      });
                    }
                  }
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
                  extra_config: {
                    ...(requiresAuthentication && {
                      "auth/validator": {
                        alg: "RS256",
                        disable_jwk_security: true,
                        issuer: "http://localhost:7080/realms/app",
                        jwk_url:
                          "http://host.docker.internal:7080/realms/app/protocol/openid-connect/certs",
                        ...(!!rolesSet.size && {
                          roles: [...rolesSet],
                          roles_key: "realm_access.roles",
                          roles_key_is_nested: true,
                        }),
                      },
                    }),
                  },
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
