# Gym App — Project Guide

This is a mobile gym workout tracker built with **React Native + Expo**, following a **local-first / offline-first** architecture. There is no backend for the MVP — SQLite is the single source of truth.

This project follows **spec-driven development**: all product and technical decisions live in `spec/`, organized by topic. Read the relevant spec file(s) before implementing or changing behavior in that area. If you find a bug, gap, or contradiction in the spec while implementing, resolve it in the spec first, then write the code to match.

## How to navigate the spec

The spec lives in `spec/`, split into four folders:

- **`spec/product/`** — what the app is and how it should feel (vision, UX principles).
- **`spec/technical/`** — cross-cutting technical decisions (stack, architecture, data model, database schema, i18n, dataset licensing, business rules that apply everywhere).
- **`spec/features/`** — one file per screen/feature, describing exactly what that part of the app does.
- **`spec/process/`** — acceptance criteria, build order, and delivery scope.

### Quick reference: "I need to..."

| I need to... | Read |
|---|---|
| Understand the product vision | `spec/product/overview.md` |
| Follow UI/UX principles | `spec/product/ux-guidelines.md` |
| Know the required stack/libraries | `spec/technical/stack.md` |
| Understand the offline-first architecture and layering | `spec/technical/architecture.md` |
| Know the core entities (Exercise, Workout, Program) | `spec/technical/data-model.md` |
| Design/modify SQLite tables or migrations | `spec/technical/database-schema.md` |
| Handle the exercise dataset or RepDB attribution | `spec/technical/dataset-and-licensing.md` |
| Implement translations / i18n | `spec/technical/i18n.md` |
| Check a cross-cutting rule (timers, TypeScript, reusable components) | `spec/technical/business-rules.md` |
| Work on the Workout screen (CRUD, sets, exercise catalog) | `spec/features/workout.md` |
| Work on the Program screen (days, duplication) | `spec/features/program.md` |
| Work on the Schedule screen (calendar, cycle engine) | `spec/features/schedule.md` — the most complex feature, read it in full before touching scheduling logic |
| Work on the Start screen (entry point to a workout) | `spec/features/start.md` |
| Work on the live workout execution flow (timers, sets, finish) | `spec/features/workout-execution.md` |
| Work on tab navigation | `spec/features/navigation.md` |
| Work on Settings/About | `spec/features/settings.md` |
| Know what "done" means for a feature | `spec/process/acceptance-criteria.md` |
| Know what order to build things in | `spec/process/implementation-roadmap.md` |
| Know what's in/out of MVP scope | `spec/process/delivery-and-roadmap.md` |

### Suggested reading order (new contributor or fresh agent session)

1. `spec/product/overview.md`
2. `spec/technical/stack.md` and `spec/technical/architecture.md`
3. `spec/technical/data-model.md`
4. The `spec/features/*.md` file for whatever you're about to touch (each one cross-references the others it depends on)
5. `spec/technical/database-schema.md` before writing any migration or query
6. `spec/process/implementation-roadmap.md` before starting implementation work, to confirm build order and dependencies between steps

## Conventions

- All spec files are written in **English**, regardless of the language used in conversation with the user.
- Cross-references between spec files use relative Markdown links (e.g. `[Schedule](../features/schedule.md)`) — follow them instead of re-deriving behavior that's already defined elsewhere.
- When a product or technical decision changes, update the relevant spec file(s) as part of the same change. The spec must never fall behind the implementation (or the other way around).
- Some spec files contain explicit `> **Open question**` callouts marking decisions that were deliberately left unresolved. Don't silently resolve these while implementing — surface them and get a decision first, since they involve product trade-offs, not just technical detail.
- "Why" notes are kept inline next to non-obvious rules (e.g. why the schedule has no pause mechanism, why duplication defaults to sharing Workouts). Don't strip them when editing — they exist to prevent re-litigating settled decisions.
