# bun check: false TS2425 for an inferred object-literal method inherited through ReturnType

Minimal reproduction of a false TS2425 error in `bun check`. A class inherits an object-literal method through `ReturnType` and interface merging, then overrides it.

Reported in [oven-sh/bun#47530](https://github.com/oven-sh/bun/issues/47530).

## Reproduce

```sh
bun check --no-script --no-pretty --all -p tsconfig.json
# exit 1: TS2425

bunx --package typescript@7.0.2 tsc -p tsconfig.json
# exit 0: no diagnostics
```

## repro.ts

```ts
export {};
function mixin() {
  return { method(): number { return 1; } };
}
interface Base extends ReturnType<typeof mixin> {}
declare class Base {}
class Derived extends Base {
  override method(): number { return 2; }
}
```

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "lib": ["ES2021"],
    "module": "ESNext",
    "strict": true,
    "noEmit": true,
    "types": []
  },
  "files": ["repro.ts"]
}
```

## Expected behavior

No errors, matching TypeScript 5.5.4 and 7.0.2. The returned object declares `method` using method syntax, not a function-valued property.

## Actual behavior

```text
repro.ts(8,12): error TS2425: Class 'Base' defines instance member property 'method', but extended class 'Derived' defines it as instance member function.
```

Bun reports the inherited method as a property and rejects the override.

## Verified versions

Tested on Darwin arm64 on 2026-10-31:

| Checker | Result |
| --- | --- |
| TypeScript 5.5.4 | exit 0 |
| TypeScript 7.0.2 | exit 0 |
| Bun 1.4.4+38afee6c8 (current stable) | TS2425, exit 1 |
| Bun 1.4.4-canary.1+da867c60b | TS2425, exit 1 |

The canary came from npm package `bun@1.4.4-canary.20261030.1`:

```sh
bunx --package bun@1.4.4-canary.20261030.1 bun --revision
bunx --package bun@1.4.4-canary.20261030.1 bun check --no-script --no-pretty --all -p tsconfig.json
```

Full stable, canary, and TypeScript 7 output is in `results.txt`.
