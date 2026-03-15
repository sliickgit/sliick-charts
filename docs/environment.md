# Environment and Setup - Sliick Charts

## Prerequisites

- **Node.js**: v18 or later (required by the LWC Jest test runner)
- **npm**: v9 or later
- **Salesforce CLI** (`sf` or `sfdx`): Latest version
- A **Salesforce Dev Hub** org enabled for 2nd-generation packaging

## Local Development Setup

1. Clone the repository.

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Authenticate with your Dev Hub:
   ```bash
   sf org login web --set-default-dev-hub --alias MyDevHub
   ```

4. Create a scratch org for development:
   ```bash
   sf org create scratch --definition-file config/project-scratch-def.json --alias sliick-dev --duration-days 30
   ```

5. Push source to the scratch org:
   ```bash
   sf project deploy start --target-org sliick-dev
   ```

6. Open the scratch org:
   ```bash
   sf org open --target-org sliick-dev
   ```

## Running Tests

Unit tests run locally using Jest - no org connection required:

```bash
# Run all tests once
npm run test:unit

# Run with coverage report
npm run test:unit:coverage

# Watch mode (re-runs on file change)
npm run test:unit:watch
```

Test results and coverage output are written to the `coverage/` directory.

## Creating a Package Version

```bash
# Create a new package version (uses versionNumber from sfdx-project.json)
sf package version create --package sliick-charts --installation-key-bypass --wait 15
```

The package alias and version ID are written back to `sfdx-project.json` automatically.

## Environment Variables

This project has no required environment variables. Salesforce CLI uses its own authenticated session store (`~/.sf/`).

## Scratch Org Definition

The scratch org config is at `config/project-scratch-def.json`. Review it before creating a scratch org to ensure the correct features and settings are enabled.

## Code Quality

Run the Salesforce Code Analyzer to check for violations:
```bash
sf scanner run --target "force-app/**" --format html --outfile CodeAnalyzerReport.html
```

The output file is `CodeAnalyzerReport.html` in the project root.
