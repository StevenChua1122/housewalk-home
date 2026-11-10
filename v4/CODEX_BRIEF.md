# Codex follow-up: Housewalk V4 photorealistic fidelity

Project: `StevenChua1122/housewalk-home`; preview under `v4/`, production root must remain untouched until owner approves.

**Mission:** Refine the independent WebGL living/dining walkthrough until it materially approaches `v4/reference.jpg` in 3D mesh quality, warm-tone materials, ambient lighting, geometry and style. Keep the first-person movement, touch controls, collision handling, doors and fallback; prioritize smooth iPhone Safari behavior.

## Non-negotiable visual acceptance

1. Mirror the 6.3 m × 7.05 m floor plan. Dining is middle-left immediately beyond entrance, living ahead; kitchen, bedroom, bathroom remain light drafts.
2. Dining: dark rectangular table **against the left wall**, **four** black ladder chairs with cream upholstered pads, two chairs along each long side. Three matte-black/wood-accents spotlights on an **L-shaped** track, aimed at the table; no decorative clutter on table.
3. Straight gray-taupe three-seater sofa snug against left wall; no chaise, rug, coffee table, paintings or floor lamp. Visible woven fabric, tailored cushions and seams; light and rust-orange pillows. Retain protruding AC wall feature at its far end.
4. Correctly aligned ceiling **light–fan–light** in living zone, and **one** centered lamp in deep window niche.
5. TV wall: gray-topped white cabinet, no TV, empty black wall bracket. Empty white metal rack by window; no consumer items.
6. Oak flooring boards run vertically in approved camera angle, with tasteful natural grain and soft warm sun shadows.
7. Deep window inset with uninterrupted ceiling (no crossbeam). Exactly two adjacent blue-gray windows from approximately 30% to 80% of wall height, with a small lower panel on each. Taupe drapery and believable exterior perspective.
8. Compare real WebGL renders from iPhone portrait and desktop landscape against `v4/reference.jpg`; preserve correct room scaling and avoid meshes intersecting, flicker, transparency artifacts or disappearing surfaces.
9. No new libraries from CDNs; prefer bundled self-hosted assets and fallback. Test WebGL1 iOS Safari and daylight/night toggle.

## Source files

- `v4/index.html`: full-screen touch UI and original room navigation
- `v4/webgl.js`: interactive triangle mesh scene and lighting
- `v4/materials.jpg`: material atlas derived from approved photos/render
- `v4/reference.jpg`: approved visual target

**Do not claim photo-exact fidelity without screenshot QA.** Use isolated branches and PRs. Do not touch Daylight.