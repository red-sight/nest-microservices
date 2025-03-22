import { Config } from "@lib/config";

import * as environments from "./environments";

export * from "./config.interface";

export const configShared = new Config(environments);
