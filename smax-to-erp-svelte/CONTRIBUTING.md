# Contributing to Smax to ERP Integration

Thank you for your interest in contributing to our project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## Getting Started

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/smax-to-erp-svelte.git
cd smax-to-erp-svelte
```

3. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

4. Install dependencies:
```bash
npm install
```

## Development Workflow

1. Make your changes
2. Run tests:
```bash
npm test
```

3. Build the project:
```bash
npm run build
```

4. Start the development server:
```bash
npm run dev
```

## Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript for type safety
- Follow Svelte best practices

## Commit Messages

Follow the conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Test changes
- chore: Maintenance tasks

## Pull Requests

1. Update your fork with the latest changes:
```bash
git fetch upstream
git rebase upstream/main
```

2. Push your changes:
```bash
git push origin feature/your-feature-name
```

3. Create a Pull Request:
   - Provide a clear description
   - Reference related issues
   - Include screenshots if applicable
   - Ensure all tests pass

## Testing

- Write tests for new features
- Update tests for modified features
- Ensure all tests pass before submitting
- Follow test-driven development when possible

## Documentation

- Update README.md for significant changes
- Add comments for complex code
- Document API changes
- Update examples if needed

## Review Process

1. Code review by maintainers
2. Address feedback and make changes
3. Get approval from at least one maintainer
4. Merge after approval

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a release tag
4. Deploy to production

## Questions?

Feel free to:
- Open an issue
- Join our Discord channel
- Email the maintainers

Thank you for contributing! 