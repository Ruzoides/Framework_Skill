# Framework_Skill

A Claude Code Skill that scaffolds a complete, secure, production-ready
Next.js + Postgres website — landing page, admin dashboard, authentication,
payments, transactional email, security hardening, CI, and deployment — from
a single invocation, or adds any one of those pieces to a project that
already exists.

## What this is

Every website ends up needing the same handful of parts: a public landing
page, a protected admin area, auth that isn't trivially breakable, a payments
integration, transactional email, and a deployment pipeline with some basic
security scanning wired in. This skill packages a consistent, hardened
default for all of that so a new project starts from a solid baseline
instead of being rebuilt by hand each time.

See `SKILL.md` for the full workflow, and `references/` for the reasoning
and setup detail behind each area (auth, database, payments, email, security,
deployment).

## Installing

Claude Code Skills are matched by directory name under `~/.claude/skills/`.
This repo's skill identity (the `name:` field in `SKILL.md`'s frontmatter) is
`website-scaffold`, so install it by copying or symlinking this repo into
that location:

```
ln -s /path/to/Framework_Skill ~/.claude/skills/website-scaffold
```

Once installed, invoking Claude Code with a request like "set up a new
website with a landing page and admin dashboard" or "add Stripe payments to
my site" will trigger this skill.

## Stack

- **Next.js** (App Router) + **Postgres**
- **Prisma** for schema/migrations
- **Clerk** (default) or **Auth.js/NextAuth** for authentication
- **Stripe** for payments/subscriptions
- **Resend** for transactional email
- **Upstash Redis** (or in-memory fallback) for rate limiting
- **Vercel** for deployment
- **GitHub Actions**: lint/typecheck/test, `npm audit`, CodeQL, gitleaks,
  Dependabot

## Layout

```
SKILL.md              orchestrator — the skill's entry point
scripts/               scaffold + postinstall automation
references/            setup detail and rationale per domain
assets/templates/      files copied into generated projects
```
