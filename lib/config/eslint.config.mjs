import { generateTsConfig } from "@lib/lint/ts";

export default generateTsConfig({
  tsconfigRootDir: import.meta.dirname,
});
