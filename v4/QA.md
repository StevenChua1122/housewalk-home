# V4 visual and interaction review — 10 November 2026

All changes are inside `v4/`. The production root, reference image and source
material atlas are unchanged. The review branch starts at V4 commit `3f1f71d`.
No deployment or merge was performed.

## Verification

With the repository served on port 8000, using the environment's installed
Playwright and `/usr/bin/chromium`:

```sh
node --check v4/webgl.js
node --check v4/tests/smoke.cjs
node v4/tests/smoke.cjs
node v4/tests/capture.cjs
git diff --check
```

Set `HOUSEWALK_URL` to use another local server. Playwright is a development test
dependency only; the website remains dependency-free.

The suite passed in software WebGL1 and forced Canvas fallback at 1280 × 800 and
390 × 844. It checks rendered pixel diversity, no JavaScript page errors, plan
open/close, day/evening switching, all seven tour stops, reset, keyboard movement
and door toggles. WebGL cases also check table collision, blocked closed bedroom
door and passage through the open doorway. Mobile cases exercise touch joystick
and drag-to-look using Chromium's touch input API. The desktop WebGL case forces
context loss, checks Canvas recovery, then restores the interactive 3D renderer.

The final static scene contains 56,862 triangles. Furniture shadows render once
into a 1024 × 1024 RGBA8 target with a depth renderbuffer; the main pass uses four
shadow taps. Geometry and door states stay in GPU buffers. Device pixel ratio is
still capped at 1.55, and hidden tabs skip drawing. These are implementation
budgets, not measurements of real iPhone frame rate.

## Screenshot review

| View | Evidence |
| --- | --- |
| Desktop daylight | [Screenshot](qa/desktop-day.png) |
| Three-head L track | [Screenshot](qa/dining-track.png) |
| iPhone-sized daylight | [Screenshot](qa/mobile-day.png) |
| iPhone-sized evening | [Screenshot](qa/mobile-evening.png) |

Compared against `reference.jpg` while iterating. Corrected the original shader
uniform precision mismatch that prevented WebGL initialization in Chromium;
corrected the vertically flipped photo atlas; rotated the table so its short end
meets the left wall and its four chairs sit two on each long side; adjusted the
L track; replaced coarse cushion rounding and block-like fan blades; added closed
lamp lenses, fabric weave, piping and angled pillows. Updated matching collision
boxes and mini-map furniture footprints. The Canvas fallback now also uses the
same bare table, four-chair arrangement, sofa and empty shelving; legacy living
room rug, coffee table and side-table clutter have been removed. Removed atlas mipmap filtering after
screenshots revealed visible seams at repeating UV boundaries.

The sofa stays against the left wall; the black table is bare; the TV bracket
and white shelving stay empty. The deep, beam-free alcove, two adjoining windows,
wall AC, light–fan–light sequence and separate niche light are preserved. The
exterior texture appears only behind the modeled windows; furniture, floor,
ceiling and room walls are depth-tested meshes that can be walked around.

## Remaining review

This is a realtime reconstruction, not a pixel-identical or path-traced match to
the reference. Shadow filtering, cloth deformation, glazing and indirect light
remain approximations. Other rooms retain their simple existing geometry.

A real iPhone Safari check remains required: portrait/landscape rotation, safe
areas, simultaneous joystick/look gestures, frame pacing, heat over several
minutes, navigation through both doorways, day/evening lighting and recovery
after backgrounding. Chromium mobile emulation does not verify Safari or actual
device performance. No visual assets or browser libraries load from a CDN.
