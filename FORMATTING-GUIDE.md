# Readable code formatting

The Analytics components have been manually reflowed to reduce long horizontal JSX and TypeScript lines.

The included Prettier configuration uses an 80-character print width and one JSX attribute per line. To apply it to the **entire repository**, install Prettier locally and run:

```bash
npm install --save-dev prettier
npx prettier --write "**/*.{ts,tsx,js,jsx,css,json,md}"
```

Review the diff before committing. This package has not been reformatted or build-tested in full.
