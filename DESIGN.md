# Cloudbreak design direction

Started from **Direction A** (`design/A-duolingo-bright.png`), then at Rahul's direction moved off the Duolingo look:
soft light-sky blue, Nunito (bubbly, like the mockup), real icons (lucide) instead of emoji, soft shadows instead of chunky 3D buttons, mint (not green) for success.
Directions B (Kurzgesagt deep-space) and C (calm hybrid) were explored and not chosen.

## Tokens (source of truth: `src/app/globals.css` `@theme`)
| Role | Color | Use |
|---|---|---|
| sky | `#7CC8F8` (text/links: `#1673AD`) | primary fills; dark navy text on top for contrast |
| sun | `#FFB020` | XP, money kept, the sun |
| grass (mint) | `#10B39B` | correct answers, success |
| coral | `#F2545B` | SOS, crisis/988 button, blocked states |
| ink | `#141B34` | text |
| cloud / line | `#F7F7F7` / `#E5E5E5` | surfaces, borders |

- Type: **Nunito** (rounded, bubbly; heavy weights for headings), matching the mockup.
- Buttons: rounded, `btn-3d` = soft lift shadow + gentle press. Icons: lucide-react. No emoji in UI.
- Cards: `rounded-[--radius-card]`, soft tinted backgrounds (`*-soft`), no heavy shadows.
- Mascot: round cloud creature with a sunbeam breaking through it, used on home, the SOS screen and empty states.

## Non-negotiable UI rules
- The "Get real help" entry is visible on every screen.
- Every seeded community item carries a "Sample post · demo data" tag.
- Held/blocked content is **never** rendered to non-admins. Only a placeholder with the reason category is shown.
- Mobile-first: max content width about 28rem, centered; bottom tab bar (Learn, Community, SOS, Help).
