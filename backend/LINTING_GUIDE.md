# ESLint & Prettier Configuration Guide

## Overview
This project uses **ESLint** for code linting and **Prettier** for code formatting to maintain consistent code quality and style across the backend.

## ESLint Configuration (`.eslintrc.json`)

### Environment
- **node**: Node.js globals
- **es2021**: ES2021 syntax support
- **commonjs**: CommonJS compatibility

### Key Rules

| Rule | Setting | Purpose |
|------|---------|---------|
| `indent` | 2 spaces | Consistent indentation with switch case handling |
| `quotes` | Single quotes | Code consistency (with escape handling) |
| `semi` | Always required | Enforce semicolons |
| `no-unused-vars` | Warning | Identify unused variables (ignore prefixed with `_`) |
| `eqeqeq` | Always use `===` | Prevent type coercion bugs |
| `no-var` | Error | Use `const`/`let` instead of `var` |
| `prefer-const` | Always | Use `const` when variable isn't reassigned |
| `no-trailing-spaces` | Error | Remove trailing whitespace |
| `comma-dangle` | Multiline | Trailing commas in multiline objects/arrays |
| `object-shorthand` | Always | Use shorthand for object properties |

### Test File Overrides
Test files have additional environments enabled (mocha, jest) for testing frameworks.

## Prettier Configuration (`.prettierrc.json`)

| Option | Value | Purpose |
|--------|-------|---------|
| `semi` | true | Add semicolons |
| `singleQuote` | true | Use single quotes |
| `trailingComma` | es5 | Trailing commas for ES5 compatibility |
| `printWidth` | 80 | Line length limit |
| `tabWidth` | 2 | 2-space indentation |
| `useTabs` | false | Use spaces, not tabs |
| `arrowParens` | always | Parentheses around arrow function parameters |
| `bracketSpacing` | true | Space between brackets: `{ foo }` |
| `endOfLine` | lf | Unix line endings |

## Running Linting & Formatting

### Check for Linting Issues
```bash
npm run lint
```

### Fix Linting Issues Automatically
```bash
npm run lint:fix
```

### Format Code with Prettier
```bash
npm run format
```

## Ignored Files

### ESLint (`.eslintignore`)
- `node_modules/`
- `dist/`, `build/` directories
- Environment files (`.env*`)
- Log files
- System files (`.DS_Store`)

### Prettier (`.prettierignore`)
- All ESLint ignored files
- `package.json`, `package-lock.json`
- `README.md` and markdown files

## Best Practices

1. **Pre-commit**: Run `npm run lint:fix && npm run format` before committing
2. **IDE Integration**: Install ESLint and Prettier extensions for real-time feedback
3. **Naming Convention**: Prefix unused variables with `_` (e.g., `_unusedParam`)
4. **Async/Await**: Preferred over `.then()` chains
5. **Arrow Functions**: Use arrow functions for callbacks when appropriate

## Fixing Common Issues

### Unused Variables
```javascript
// ❌ Bad - will error
function handler(req, res) {
  console.log('Hello');
}

// ✅ Good
function handler(_req, _res) {
  console.log('Hello');
}
```

### Variable Declarations
```javascript
// ❌ Bad
var x = 5;

// ✅ Good
const x = 5;
let y = 10;
```

### Object Shorthand
```javascript
// ❌ Bad
const obj = { name: name, age: age };

// ✅ Good
const obj = { name, age };
```

### Trailing Commas in Multiline
```javascript
// ✅ Good
const items = [
  'item1',
  'item2',
  'item3',
];
```

## IDE Setup Recommendations

### VS Code Extensions
1. **ESLint** (dbaeumer.vscode-eslint)
2. **Prettier** (esbenp.prettier-vscode)

### VS Code Settings (`.vscode/settings.json`)
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": ["javascript"],
  "eslint.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Troubleshooting

### Prettier and ESLint Conflicts
Both are configured to work together. Prettier runs before ESLint in the format/lint process.

### Changes Not Taking Effect
1. Ensure you've installed dependencies: `npm install`
2. Clear ESLint cache: `npx eslint --cache --cache-location .eslintcache --init` (optional)
3. Restart your IDE

### Custom Rules
To add custom rules, edit `.eslintrc.json` and add them to the `rules` object. For Prettier options, update `.prettierrc.json`.
