export type TPermissionsRoles = Record<string, Set<string>>;
export type TRolesPermissions = Record<string, string[]>;

export abstract class AuthProvider {
  abstract getRolesPermissions(): Promise<TRolesPermissions>;

  async mapRolesPermissions(): Promise<TPermissionsRoles> {
    const roles = await this.getRolesPermissions();
    const permissions: TPermissionsRoles = {};
    Object.keys(roles).forEach(roleName => {
      roles[roleName].forEach(permission => {
        if (!Object.keys(permissions).includes(permission))
          permissions[permission] = new Set();
        permissions[permission].add(roleName);
      });
    });
    return permissions;
  }
}
