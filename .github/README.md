# GitHub Workflows

## CI Workflow (ci.yml)

This workflow runs on every push and pull request to the `master` and `main` branches.

### Jobs

The workflow consists of three parallel jobs:

1. **Build** - Builds the Remix application using `npm run build`
2. **Lint** - Runs ESLint code linting using `npm run lint`  
3. **Test** - Placeholder for future test implementation

### Configuration

- **Node.js**: Version 18+ (as required by package.json engines)
- **Dependencies**: Uses `npm install --legacy-peer-deps` for React 19 compatibility
- **Caching**: npm dependencies are cached for faster builds

### Local Development

To run the same checks locally:

```bash
npm run build  # Build the application
npm run lint   # Run ESLint
npm run typecheck  # Run TypeScript checks (has expected errors in dependencies)
```

### Adding Tests

When tests are added to the project:

1. Add a test script to `package.json`:
   ```json
   "scripts": {
     "test": "your-test-command"
   }
   ```

2. Update the test job in `.github/workflows/ci.yml`:
   ```yaml
   - name: Run tests
     run: npm run test
   ```

### Notes

- Build warnings about Remix future flags are expected and normal
- ESLint is configured to ignore build directories and only lint source files
- TypeScript errors in node_modules are expected and don't prevent builds