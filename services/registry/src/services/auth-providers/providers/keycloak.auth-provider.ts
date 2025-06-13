import { configShared } from "@lib/config-shared";
import { Injectable } from "@nestjs/common";
import { KeycloakAdminClient } from "@s3pweb/keycloak-admin-client-cjs";

import { AuthProvider } from "../auth-provider";

const { config, credentials } = configShared.data.keycloakAdminClient;

@Injectable()
export class KeycloakAuthProvider extends AuthProvider {
  private client: KeycloakAdminClient;

  constructor() {
    super();
    this.client = new KeycloakAdminClient(config);
  }

  private async auth() {
    await this.client.auth(credentials);
  }

  async getRolesPermissions() {
    await this.auth();
    const realmRoles = await this.client.roles.find({ realm: "app" });

    const rolesWithPermissions = await Promise.all(
      realmRoles.map(async realmRole => {
        const permissions = realmRole.id
          ? await this.client.roles.getCompositeRoles({
              id: realmRole.id,
              realm: "app",
            })
          : [];
        return {
          ...realmRole,
          permissions,
        };
      }),
    );

    const rolesPermissions = {};
    rolesWithPermissions.forEach(r => {
      if (!r.name) return;
      rolesPermissions[r.name] = r.permissions.map(p => p.name);
    });

    return rolesPermissions;
  }
}
