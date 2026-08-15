# @kurdel/pirx

Command-line tooling for Kurdel applications. The current beta provides
interactive database migration commands backed by `@kurdel/migrations`.

## Installation

```bash
npm install --save-dev @kurdel/pirx@beta
```

## Usage

```bash
npx pirx migrate run
npx pirx migrate rollback
npx pirx migrate refresh
```

The commands use the database and migration configuration of the current
Kurdel application.

## Requirements

Node.js 20.19+, 22.12+, or 24+.

## License

MIT © Andrii Sorokin
