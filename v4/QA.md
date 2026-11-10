# Final-reference visual review and regression evidence

Development base: PR #4, `codex/v4-architecture-review` (`e31a409`), including PR #3
and PR #2. Only `v4/` changes. No merge or deployment.

## Actual in-game captures

These are genuine interactive 3D screenshots, not mockups. Controls remain visible;
only transient toast text is suppressed. No scene objects are hidden. Cameras are
collision checked and recorded in [cameras.json](qa/final/cameras.json). Desktop
frames match the supplied mockup aspect ratios; portrait frames are 390 × 844.

| View | Desktop | Mobile |
| --- | --- | --- |
| Living / dining wide | [Image](qa/final/desktop-01-living-dining.png) | [Image](qa/final/mobile-01-living-dining.png) |
| Oak close view | [Image](qa/final/desktop-02-oak-floor.png) | — |
| Curtain / window | [Image](qa/final/desktop-03-curtain-window.png) | [Image](qa/final/mobile-03-curtain-window.png) |
| Kitchen full upper run | [Image](qa/final/desktop-04-kitchen-first.png) | [Image](qa/final/mobile-04-kitchen-first.png) |
| Kitchen second angle | [Image](qa/final/desktop-05-kitchen-second.png) | — |
| Entrance / two racks | [Image](qa/final/desktop-06-entrance.png) | [Image](qa/final/mobile-06-entrance.png) |

[Top-down model plan](qa/final/plan.svg) labels dimension provenance. Historical
PR #2/#3 captures and PR #4 review schematics are not the final implementation.
Private side-by-side sheets are generated outside this repository using the
approved reference pack and these exact full-frame captures.

## Reproduce

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# Separate terminal; Playwright and /usr/bin/chromium are development tools:
node v4/tests/capture-final.cjs
node v4/tests/smoke.cjs
node v4/tests/context.cjs
git diff --check
```

`HOUSEWALK_URL` overrides the local URL. Run browser jobs sequentially when using
software WebGL. Movement checks wait for positions rather than assuming an FPS.
All four smoke cases passed, with no page JavaScript errors. The smoke script exercises PBR and forced Canvas, desktop and touch viewports:
map, day/night, seven safe tour stops, continuous shared-aisle walking, counter
collision, closed/open passages at both room doors, reset, page errors, and touch
joystick/look. PBR checks also verify loaded maps and two six-level narrow racks. The separate
context-loss test passed: Canvas appeared on loss and PBR reloaded on restoration.

## Visual review

The review specifically examines oak warmth/grain/direction/matte response,
drapery volume and fabric, frame/handle/fixed-pane structure, sofa softness,
2+2 chair count, L-track shape/count, cabinet continuity, door hardware and rack
number/orientation/shelf count. The first passes exposed a too-dark ceiling,
too-orange oak calibration, detached pillow trim and an unsafe living tour stop;
these were corrected before the final captures. The final close review also
removed loose back trim and moved the drape inside the recess to clear the shelf.
Static exterior/shell batching reduced the living view from 347 to 60 draw calls;
sofa subdivision was reduced without changing its silhouette. This is not an
iPhone FPS measurement.

The changes substantially improve the floor and curtains, but do not reproduce
the offline render pixel for pixel. See [remaining differences and material
provenance](FINAL_IMPLEMENTATION.md). Actual physical iPhone Safari performance,
sustained heat/frame pacing, Safari-specific touch handling and memory remain
**unverified**. A software-Chromium mobile pass establishes interaction coverage,
not real-device rendering performance or final visual acceptance.


To reproduce private comparisons (the output path is required to be outside git):

```sh
HW_REFERENCE_DIR=/path/to/private/reference-pack \
HW_COMPARISON_DIR=/path/outside/repository/review \
node v4/tools/compare.cjs
```

## Fidelity checklist for owner review

| Item | Implementation / remaining qualification |
| --- | --- |
| Plan and scale | Mirrored source-plan trace; only outer dimensions explicitly measured on source |
| Oak | Replaced material system; 2K colour + normal/roughness, lengthwise staggered boards, matte finish |
| Curtains | Replaced with volumetric GLB, soft folds/tiebacks, woven shading; stylized drape remains |
| Window / AC | Dark two-casement frame, handles, fixed lower panes, enclosed niche and solid AC support |
| Sofa / dining | Rounded fabric GLB; 3 seats, cream/orange pillows; black table, four chairs in 2+2 arrangement |
| Ceiling | L-track with exactly 3 heads; downlight/fan/downlight plus niche light |
| TV wall | White/grey console, empty bracket/shelf, separate white mesh trolley |
| Kitchen | White uppers continuous to washer end wall; retained appliances and grey surround |
| Entrance | Wood door/hardware, switch/bulkhead; exactly two perpendicular, empty six-level mesh racks |
| Lighting | Warm PBR, filtered environment and soft keys; indirect light remains approximated |
| Controls | Four desktop/mobile PBR/Canvas regression cases and context recovery passed |
| Physical iPhone Safari | Unverified; no physical-device FPS or Safari compatibility claim |
