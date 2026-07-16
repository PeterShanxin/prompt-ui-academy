# Contributing to Prompt UI Academy

Thanks for helping people communicate with AI more clearly. Contributions can improve the product, course content, UI terminology, motion examples, quiz questions, accessibility, or documentation.

## Before you start

- Search existing issues before opening a new one.
- Use a focused issue for substantial features or content changes.
- Keep examples accurate, concise, and understandable without design jargon.
- Do not include private data, credentials, copyrighted course material, or generated content without a compatible license.

## Development workflow

1. Fork the repository and create a branch from `main`.
2. Use a descriptive branch name such as `feature/new-ui-terms` or `fix/mobile-navigation`.
3. Install the locked dependencies with `npm ci`.
4. Make one coherent change and add or update tests where useful.
5. Run the required checks:

```bash
npm run lint
npm run build:vercel
npm test
```

6. Open a pull request using the repository template.

## Content guidelines

New learning content should include:

- the standard Chinese and English term;
- a short explanation of when it is used;
- a concrete visual or interactive example;
- a reusable Prompt sentence;
- accessibility or misuse notes when relevant.

Quiz questions should test recognition in context, not obscure trivia. Motion examples should describe property, duration, easing, and sequence precisely.

## Pull requests

- Keep the scope small enough to review confidently.
- Explain the learner impact, not only the implementation.
- Include screenshots or a short recording for visible changes.
- Note responsive and keyboard behavior for interactive changes.
- Update `CHANGELOG.md` for user-facing changes.

By contributing, you agree that your contribution is licensed under the repository's MIT License.
