import dotenv from "dotenv";
import { join } from "node:path";

const pwd = process.env["PWD"];
const cwd = process.env["PROJECT_CWD"];
if (!pwd) throw new Error("Couldn't find workspace path");
if (!cwd) throw new Error("Couldn't find project root path");
dotenv.config({ path: [join(pwd, ".env"), join(cwd, ".env")] });

export interface IConfigEnvironments<T> {
  [key: string]: Partial<T>;
  defaultConfig: T;
}

export class Config<T> {
  public readonly data: T;

  constructor(configs: IConfigEnvironments<T>) {
    let config: T = configs.defaultConfig;

    const env = process.env["NODE_ENV"] ?? "development";
    if (Object.keys(configs).includes(env))
      config = {
        ...config,
        ...configs[env as keyof typeof configs],
      };
    this.data = config;
  }
}
