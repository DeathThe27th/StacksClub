# StacksClub design system

<!-- impeccable:design-schema 1 -->

## Direction

StacksClub is a market clubhouse: precise enough for financial decisions, warm enough for people to share a point of view. The interface uses a Cloud canvas with Deep Ink navigation and editorial Club Blue moments. It avoids casino energy, generic DeFi chrome, and fake market certainty.

## Tokens

- Club Blue `#5B5BF7`: action, navigation selection, verified/forward signal.
- Deep Ink `#0B0D12`: navigation, high-confidence surfaces, primary text.
- Cloud `#F7F8FC`: application canvas.
- Paper `#FFFFFF`: work surfaces and data containers.
- Restrained orange `#C36F34`: paused, stale, unavailable, or review-needed state.
- Restrained green `#20734D`: verified or positive state; never the only state cue.
- Body type: Inter. Display and section voice: Manrope.
- Radius: 8px controls, 11–15px surfaces, 99px status pills.
- Elevation: soft offset shadows only on hero/preview surfaces; borders carry most hierarchy.

## Composition

The desktop app uses a 236px dark sidebar, a 73px context bar, and a centered 1100px operating canvas. Mobile collapses the sidebar into a drawer, keeps the context bar compact, and stacks task content vertically. Lists use border rhythm and explicit empty/loading states rather than decorative card grids.

## Interaction language

Buttons name their action. Disabled actions explain the missing integration or prerequisite with a title and adjacent copy. Status pills pair a label with a dot and a distinct color. Motion is short, transform-based, and disabled under `prefers-reduced-motion`.

## Content rules

Provider, chain, route status, source, timestamp, and indicative/executable distinction are always near financial data. When the app lacks a verified response, it shows a waiting state and says why. Illustrative structures are labeled; no fabricated users, quotes, charts, volume, or performance.
