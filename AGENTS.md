# Codex instructions for Housewalk

- Keep Housewalk separate from the Daylight app. Never touch the Daylight repository, Supabase projects, or unrelated deployments.
- This is a dependency-free static website. The playable app is `index.html`; it uses the built-in Canvas 2D API and must remain functional on iOS Safari, Chrome, and desktop browsers.
- Preserve the horizontally **mirrored** floor plan: overall 6.30 m width by 7.05 m height; entrance lower-left; dining middle-left immediately after entrance; living ahead toward upper-left; kitchen/pantry toward lower-middle; bedroom upper-right; bath lower-right.
- Preserve user-requested room flow and basic furnishings. Bedroom and bath appearance is provisional until further visual reference is provided.
- Do not expose exact address, raw apartment video, personal images, or private user data in the public website.
- Keep mobile controls usable, no scroll bleed, with clear feedback when a browser doesn't support interactive graphics.
- When changing room geometry, check that the minimap, collisions, tour viewpoints, and room labels remain consistent.
- Avoid unrelated refactors and runtime external dependencies unless explicitly approved.
- Do not push directly to `main`, merge a PR, or publish unreviewed design changes. Create a branch/PR and report what you verified and what still requires manual iPhone testing.