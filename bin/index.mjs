#!/usr/bin/env node

// src/index.ts
import { program } from "commander";
import { blue } from "kolorist";

// package.json
var package_default = {
  name: "@soybeanjs/cli",
  version: "0.1.6",
  description: "SoybeanJS's command lint tools",
  author: {
    name: "Soybean",
    email: "honghuangdc@gmail.com",
    url: "https://github.com/honghuangdc"
  },
  license: "MIT",
  homepage: "https://github.com/honghuangdc/soybean-cli",
  repository: {
    url: "https://github.com/honghuangdc/soybean-cli.git"
  },
  bugs: {
    url: "https://github.com/honghuangdc/soybean-cli/issues"
  },
  bin: {
    soybean: "bin/index.mjs",
    soy: "bin/index.mjs"
  },
  files: [
    "bin"
  ],
  scripts: {
    build: "tsup",
    lint: "eslint . --fix",
    commit: "soy git-commit",
    cleanup: "soy cleanup",
    "update-pkg": "soy update-pkg",
    "update-version": "bumpp package.json",
    "publish-pkg": "pnpm -r publish --access public",
    release: "pnpm update-version && pnpm publish-pkg"
  },
  dependencies: {
    commander: "^10.0.0",
    execa: "7.0.0",
    kolorist: "^1.7.0",
    minimist: "^1.2.8",
    "npm-check-updates": "^16.7.12",
    prompts: "^2.4.2",
    rimraf: "^4.4.0"
  },
  devDependencies: {
    "@soybeanjs/cli": "workspace:*",
    "@types/prompts": "^2.4.2",
    bumpp: "^9.0.0",
    eslint: "^8.36.0",
    "eslint-config-soybeanjs": "0.3.0",
    esno: "^0.16.3",
    "lint-staged": "^13.2.0",
    "simple-git-hooks": "^2.8.1",
    tsup: "^6.6.3",
    typescript: "^4.9.5"
  },
  "simple-git-hooks": {
    "commit-msg": "pnpm soybean git-commit-verify",
    "pre-commit": "pnpm exec lint-staged --concurrent false"
  },
  "lint-staged": {
    "*": [
      "eslint . --fix"
    ]
  },
  publishConfig: {
    registry: "https://registry.npmjs.org/"
  }
};

// src/command/git/commit.ts
import prompts from "prompts";
import { execa } from "execa";

// src/command/git/config.ts
var types = [
  { value: "init", title: "init:     \u9879\u76EE\u521D\u59CB\u5316" },
  { value: "feat", title: "feat:     \u6DFB\u52A0\u65B0\u7279\u6027" },
  { value: "fix", title: "fix:      \u4FEE\u590Dbug" },
  { value: "docs", title: "docs:     \u4EC5\u4EC5\u4FEE\u6539\u6587\u6863" },
  { value: "style", title: "style:    \u4EC5\u4EC5\u4FEE\u6539\u4E86\u7A7A\u683C\u3001\u683C\u5F0F\u7F29\u8FDB\u3001\u9017\u53F7\u7B49\u7B49\uFF0C\u4E0D\u6539\u53D8\u4EE3\u7801\u903B\u8F91" },
  { value: "refactor", title: "refactor: \u4EE3\u7801\u91CD\u6784\uFF0C\u6CA1\u6709\u52A0\u65B0\u529F\u80FD\u6216\u8005\u4FEE\u590Dbug" },
  { value: "perf", title: "perf:     \u4F18\u5316\u76F8\u5173\uFF0C\u6BD4\u5982\u63D0\u5347\u6027\u80FD\u3001\u4F53\u9A8C" },
  { value: "test", title: "test:     \u6DFB\u52A0\u6D4B\u8BD5\u7528\u4F8B" },
  { value: "build", title: "build:    \u4F9D\u8D56\u76F8\u5173\u7684\u5185\u5BB9" },
  { value: "ci", title: "ci:       CI\u914D\u7F6E\u76F8\u5173\uFF0C\u4F8B\u5982\u5BF9k8s\uFF0Cdocker\u7684\u914D\u7F6E\u6587\u4EF6\u7684\u4FEE\u6539" },
  { value: "chore", title: "chore:    \u6539\u53D8\u6784\u5EFA\u6D41\u7A0B\u3001\u6216\u8005\u589E\u52A0\u4F9D\u8D56\u5E93\u3001\u5DE5\u5177\u7B49" },
  { value: "revert", title: "revert:   \u56DE\u6EDA\u5230\u4E0A\u4E00\u4E2A\u7248\u672C" }
];
var scopes = [
  ["projects", "\u9879\u76EE\u642D\u5EFA"],
  ["components", "\u7EC4\u4EF6\u76F8\u5173"],
  ["hooks", "hook \u76F8\u5173"],
  ["utils", "utils \u76F8\u5173"],
  ["types", "ts\u7C7B\u578B\u76F8\u5173"],
  ["styles", "\u6837\u5F0F\u76F8\u5173"],
  ["deps", "\u9879\u76EE\u4F9D\u8D56"],
  ["auth", "\u5BF9 auth \u4FEE\u6539"],
  ["release", "\u7248\u672C\u53D1\u5E03"],
  ["other", "\u5176\u4ED6\u4FEE\u6539"]
].map(([value, description]) => {
  return {
    value,
    title: `${value.padEnd(30)} (${description})`
  };
});

// src/command/git/commit.ts
async function gitCommit() {
  const result = await prompts([
    {
      name: "types",
      type: "select",
      message: "\u8BF7\u9009\u62E9\u63D0\u4EA4\u7684\u7C7B\u578B",
      choices: types
    },
    {
      name: "scopes",
      type: "select",
      message: "\u9009\u62E9\u4E00\u4E2Ascope",
      choices: scopes
    },
    {
      name: "description",
      type: "text",
      message: "\u8BF7\u8F93\u5165\u63D0\u4EA4\u63CF\u8FF0"
    }
  ]);
  const commitMsg = `${result.types}(${result.scopes}): ${result.description}`;
  execa("git", ["commit", "-m", commitMsg], { stdio: "inherit" });
}

// src/command/git/verify-commit.ts
import { readFileSync } from "fs";
import { bgRed, red, green } from "kolorist";
function verifyGitCommit() {
  const gitMsgPath = "./.git/COMMIT_EDITMSG";
  const commitMsg = readFileSync(gitMsgPath, "utf-8").trim();
  const RELEASE_MSG = "chore: release";
  const REG_EXP = new RegExp(
    `(${types.map((item) => item.value).join("|")})\\((${scopes.map((item) => item.value).join("|")})\\):\\s.{1,50}`
  );
  if (!REG_EXP.test(commitMsg) && !commitMsg.includes(RELEASE_MSG)) {
    throw new Error(
      `${bgRed(" ERROR ")} ${red("Git\u63D0\u4EA4\u4FE1\u606F\u4E0D\u7B26\u5408 Angular \u89C4\u8303!\n\n")}${green(
        "\u63A8\u8350\u4F7F\u7528\u547D\u4EE4 pnpm commit \u751F\u6210\u7B26\u5408\u89C4\u8303\u7684Git\u63D0\u4EA4\u4FE1\u606F"
      )}`
    );
  }
}

// src/scripts/cleanup.ts
import { rimraf } from "rimraf";
var pathStrs = ["node_modules", "dist", "package-lock.json", "yarn.lock", "pnpm-lock.yaml"];
function cleanup() {
  rimraf(pathStrs);
}
async function cleanupDeep() {
  const deepPathStrs = pathStrs.map((item) => `./**/${item}`);
  const allPathStrs = pathStrs.concat(deepPathStrs);
  rimraf(allPathStrs);
}

// src/scripts/git-hooks.ts
import { existsSync } from "fs";
import { execa as execa2 } from "execa";
import { rimraf as rimraf2 } from "rimraf";
async function initSimpleGitHooks() {
  const huskyDir = `${process.cwd()}/.husky`;
  const existHusky = existsSync(huskyDir);
  if (existHusky) {
    await rimraf2(".husky");
    await execa2("git", ["config", "core.hooksPath", ".git/hooks/"], { stdio: "inherit" });
  }
  await rimraf2(".git/hooks");
  await execa2("npx", ["simple-git-hooks"], { stdio: "inherit" });
}

// src/scripts/update-pkg.ts
import { execa as execa3 } from "execa";
async function updatePkg() {
  execa3("npx", ["ncu", "--deep", "-u"], { stdio: "inherit" });
}

// src/scripts/format.ts
import { execa as execa4 } from "execa";
function prettierFormat() {
  const formatFiles = [
    "!**/*.{js,jsx,mjs,cjs,json,ts,tsx,mts,cts,vue,svelte,astro}",
    "!*.min.*",
    "!CHANGELOG.md",
    "!dist",
    "!LICENSE*",
    "!output",
    "!coverage",
    "!public",
    "!temp",
    "!package-lock.json",
    "!pnpm-lock.yaml",
    "!yarn.lock",
    "!__snapshots__"
  ];
  execa4("npx", ["prettier", ".", "--write", ...formatFiles], {
    stdio: "inherit"
  });
}

// src/index.ts
program.command("git-commit").description("\u751F\u6210\u7B26\u5408 Angular \u89C4\u8303\u7684 git commit").action(() => {
  gitCommit();
});
program.command("git-commit-verify").description("\u6821\u9A8Cgit\u7684commit\u662F\u5426\u7B26\u5408 Angular \u89C4\u8303").action(() => {
  verifyGitCommit();
});
program.command("cleanup").description("\u6E05\u7A7A\u4F9D\u8D56\u548C\u6784\u5EFA\u4EA7\u7269").action(() => {
  cleanupDeep();
});
program.command("cleanup-deep").description("\u6E05\u7A7A\u4F9D\u8D56\u548C\u6784\u5EFA\u4EA7\u7269(\u5305\u542B\u6DF1\u5C42\u7EA7)").action(() => {
  cleanup();
});
program.command("init-git-hooks").description("\u521D\u59CB\u5316simple-git-hooks\u94A9\u5B50").action(() => {
  initSimpleGitHooks();
});
program.command("update-pkg").description("\u5347\u7EA7\u4F9D\u8D56").action(() => {
  updatePkg();
});
program.command("prettier-format").description("prettier\u683C\u5F0F\u5316").action(() => {
  prettierFormat();
});
program.version(package_default.version).description(blue("soybean alias soy\n\nhttps://github.com/soybeanjs/cli"));
program.parse(process.argv);