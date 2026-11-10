# Connected V4 review — 10 November 2026

> Architecture review pending: the earlier dimensions and functional QA do not establish plan accuracy. See [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md). The source dimensioned plan and real-photo set are still needed. No further visual polishing is approved by this audit.

Built on PR #2 (`677a15b`) on `codex/v4-connected-kitchen-refinement`.
All changes are inside `v4/`. Production-root files and source reference assets
are unchanged. No deployment or merge is part of this change.

## Reproduce

From the repository root, serve locally and run the installed Playwright tools:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# In another terminal:
node --check v4/webgl.js
node --check v4/tests/smoke.cjs
node --check v4/tests/capture.cjs
node v4/tests/capture.cjs
node v4/tests/smoke.cjs
git diff --check
```

Playwright and system `/usr/bin/chromium` are development tools only. The website
has no runtime external dependency. Set `HOUSEWALK_URL` for another server URL.
Run browser jobs sequentially when using software WebGL to avoid starving input
frames. Movement assertions wait for camera positions rather than assuming a
particular software frame rate.

## Actual in-game captures

All images below are screenshots of the interactive WebGL renderer with its
normal controls visible, not generated marketing images. Capture camera positions
are checked against the application's collision function before taking a picture.
Portrait uses the same scene and a slight look adjustment for the second kitchen
angle to keep the appliances in its narrower field of view.

| Requested view | Desktop 1280 × 800 | Mobile 390 × 844 |
| --- | --- | --- |
| Living and dining | [Image](qa/desktop-living-dining.png) | [Image](qa/mobile-living-dining.png) |
| Living facing windows | [Image](qa/desktop-living-windows.png) | [Image](qa/mobile-living-windows.png) |
| Kitchen from living | [Image](qa/desktop-kitchen-from-living.png) | [Image](qa/mobile-kitchen-from-living.png) |
| Kitchen second angle | [Image](qa/desktop-kitchen-second-angle.png) | [Image](qa/mobile-kitchen-second-angle.png) |
| Kitchen evening | [Image](qa/desktop-kitchen-evening.png) | [Image](qa/mobile-kitchen-evening.png) |

The earlier PR #2 captures remain in this directory as historical evidence.

## Automated coverage

All four final smoke cases passed: WebGL desktop/mobile and Canvas desktop/mobile,
with no page JavaScript errors. All ten screenshot captures completed with both
sun and ceiling shadow targets active and collision-clear camera positions.

The smoke suite checks both software WebGL1 and forced Canvas fallback, at both
viewport sizes: rendered pixel diversity, no page JavaScript errors, plan modal,
day/evening toggle, seven tour stops, safe tour camera coordinates, reset,
keyboard movement and door controls. WebGL cases additionally walk the entire
living/dining aisle into the pantry, probe table and kitchen counter collisions,
and verify blocked/clear passage at the bedroom and pantry-facing bathroom doors.
Mobile cases use real browser touch events for the joystick and drag-to-look.
The desktop WebGL case forces context loss, checks Canvas recovery and restores
3D rendering. Open door leaves also block movement at their actual positions.

Screenshot iterations corrected clipped highlights, flat lighting, excessive
material texture contrast, curtain fold shading, second-view framing, and the
initial trolley/doorway clearance conflict. A provisional missing bedroom south
wall and a skirting run across the new bathroom doorway were also corrected.

## Rendering budget and limits

The static scene has approximately 82,000 triangles. Geometry and four door-state
buffers stay on the GPU. Static shadows use one 1024² sun target plus two 512²
ceiling targets, RGBA8 with depth renderbuffers; no depth-texture extension is
required. Shadow maps are baked once, with eight filtered taps in the main pass.
Texture colours are lit in linear space and tone mapped to preserve highlights.
DPR is capped at 1.55 and hidden tabs skip drawing.

These are budgets, not proof of real iPhone frame rate. Real iPhone Safari testing
remains necessary for sustained performance, heat, rotation, safe areas,
simultaneous movement/look and background/resume behavior. Chromium emulation
cannot verify Safari or on-device performance.

This is a realtime reconstruction, not a photo-exact or path-traced match. Cloth
and curtain drape are approximations, reflections are analytic rather than ray
traced, static shadows do not update with opening doors, exterior architecture is
estimated, and cabinet/camera proportions are fitted to the preserved floor plan.
Other rooms remain simple. [REFERENCE_NOTES.md](REFERENCE_NOTES.md) records the
mapping of the new references onto the connected house.
