# English PR Template

Use for overseas / international open-source projects. Reviewers may not share your context or native language, so write plainly and concretely.

## Writing guide

- **Summary**: 1–3 sentences on what this PR does and why it matters. A reviewer should understand the intent without reading the diff.
- **Changes**: Bullet the behavioral changes, grouped by area. Describe *what changed*, not a file-by-file list. Mention breaking changes explicitly.
- **Motivation**: The problem or need behind the change. Link the issue if there is one.
- **How to test**: Commands you actually ran and their result, plus manual steps a reviewer can reproduce. Never claim a test passed if you did not run it — write "Not run locally" instead.
- **Screenshots**: Only for visible UI changes. Delete the section otherwise.
- **Checklist**: Check (`[x]`) only items you verified. Leave the rest unchecked.
- **Related issues**: Use `Closes #123` / `Refs #123`. Write "None" if there are none.
- Use present tense, imperative titles ("Add", "Fix"), no emoji, no marketing language.

## Template

```markdown
## Summary

<what this PR does and why, 1–3 sentences>

## Changes

- <change 1>
- <change 2>

## Motivation

<problem or need this addresses>

## How to test

- [ ] `<command>` — <result>
- <manual steps for reviewers>

## Screenshots

<before / after, UI changes only>

## Checklist

- [ ] Tests added or updated for the changed behavior
- [ ] Existing tests pass locally
- [ ] Documentation updated if behavior or usage changed
- [ ] No breaking changes (or they are described above)

## Related issues

<Closes #123 | None>
```
