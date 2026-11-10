# Codex instructions for Housewalk

- Keep Housewalk separate from the Daylight app. Never touch the Daylight repository, Supabase projects, or unrelated deployments.
- This is a dependency-free static website. The playable app is `index.html` with `webgl.js`, which uses native WebGL1 and has an original Canvas 2D fallback. Both renderers must remain functional on iOS Safari, Chrome, and desktop browsers.
- Preserve the horizontally **mirrored** floor plan: overall 6.30 m width by 7.05 m height; entrance lower-left; dining middle-left immediately after entrance; living ahead toward upper-left; kitchen/pantry toward lower-middle; bedroom upper-right; bath lower-right.
- Preserve user-requested room flow and basic furnishings. Bedroom and bath appearance is provisional until further visual reference is provided.
- Do not expose exact address, raw apartment video, personal images, or private user data in the public website.
- Keep mobile controls usable, no scroll bleed, with clear feedback when a browser doesn't support interactive graphics.
- When changing room geometry, check that the minimap, collisions, tour viewpoints, and room labels remain consistent.
- Avoid unrelated refactors and runtime external dependencies unless explicitly approved.
- Do not push directly to `main`, merge a PR, or publish unreviewed design changes. Create a branch/PR and report what you verified and what still requires manual iPhone testing.

- Keep the user-approved living/dining objects: straight gray 3-seat sofa, grey-top white TV cabinet and empty black TV bracket, empty white shelf, black rectangular dining table with exactly four cream-seat ladder-back chairs (two per long side), and uninterrupted warm oak floor. No clutter, rug, coffee table, TV, framed art or floor lamp.
- Ceiling: dining L-track with two heads on the camera-near branch aimed away toward table; living light / black fan / light sequence; additional centered window-niche light; white wall AC and a real wall jog near the window.
- Test WebGL context render, room collisions and mobile UI after rendering changes. Maintain the fallback for browsers that block WebGL.