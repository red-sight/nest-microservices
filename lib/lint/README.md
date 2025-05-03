# @lib/lint

## ESLint and Prettier shared configurations

## VSCode extensions

Install required extensions:

- ESLint
- Prettier

## Mandatory dev libraries

Install these libs to your workspace as dev dependencies

- eslint ^9
- prettier ^3

```
yarn workspace my-workspace add -D eslint prettier
```

## JS workspace config

- add eslint.config.mjs file to the root of your workspace:

```
import { jsConfig } from "@lib/lint/js";

export default jsConfig;
```

## TS workspace config

- add eslint.config.mjs file to the root of your workspace:

```
import { generateTsConfig } from "@lib/lint/ts";

export default generateTsConfig({
  tsconfigRootDir: import.meta.dirname
});
```

## Prettier

- add .prettierrc.mjs file to the root of your workspace:

```
import { prettierConfig } from "@lib/lint/prettier";

export default prettierConfig;
```

- add .prettierignore file to the root of your workspace:

```
dist/**/*
```

## Commands

- add npm scripts to your package.json

```
"lint": "eslint && prettier . -c",
"lint:fix": "prettier . --write && eslint --fix"
```
