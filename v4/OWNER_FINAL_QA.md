# Current owner-reference pass: actual scene evidence

Baseline and limitations: [OWNER_FINAL_REVIEW.md](OWNER_FINAL_REVIEW.md).
These are actual frames from the connected Three.js/PBR runtime. Only the HTML
HUD is suppressed in the capture script; no scene objects move or disappear for
a camera. The original PR #7 QA remains historical evidence, not this pass's result.

| Requested view | Desktop | Touch viewport, 390 × 844 |
| --- | --- | --- |
| Hallway, both openings, visible Zone A/B, broom and no bin | [Frame](qa/owner-final/desktop-hallway.png) | [Frame](qa/owner-final/mobile-hallway.png) |
| Kitchen, five doors, washer appliances, two mugs, bin edge | [Frame](qa/owner-final/desktop-kitchen.png) | [Frame](qa/owner-final/mobile-kitchen.png) |
| Bathroom sink, toilet, plain mirror and window | [Frame](qa/owner-final/desktop-bathroom-first.png) | [Frame](qa/owner-final/mobile-bathroom-first.png) |
| Shower, niche beneath heater, triangular three-tier shelf | [Frame](qa/owner-final/desktop-bathroom-shower.png) | [Frame](qa/owner-final/mobile-bathroom-shower.png) |
| Closed door, high hook and straight long mop | [Frame](qa/owner-final/desktop-bathroom-closed.png) | [Frame](qa/owner-final/mobile-bathroom-closed.png) |
| Top-down kitchen / bathroom relationship | [Frame](qa/owner-final/desktop-kitchen-bathroom-measurement.png) | — |
| Top-down bathroom doorway | [Frame](qa/owner-final/desktop-bathroom-door-top-down.png) | — |
| Original photographed mug fronts | [Detail](qa/owner-final/desktop-mug-detail.png) | — |

[Camera/renderer records](qa/owner-final/cameras.json) ·
[Measured geometry, door rays and continuous walk](qa/owner-final/proofs.json) ·
[Four-case regression and context recovery](qa/owner-final/regression.json) ·
[Derived model schematic](qa/owner-final/plan.svg) ·
[Labeled clearance measurement](qa/owner-final/clearance-measurement.png) ([SVG](qa/owner-final/clearance-measurement.svg)) ·
[Measurement coordinates](qa/owner-final/clearance-measurement.json) ·
[Door/mop wall-clearance comparison](qa/owner-final/mop-clearance.png) ([coordinates](qa/owner-final/mop-clearance.json)).

## Checklist

PASS describes an implemented and verified property, not owner visual approval.
PARTIAL identifies a remaining visible difference or measurement limitation.

| Check | Status | Evidence and limit |
| --- | --- | --- |
| Reference audit | PASS | Both text files read, 32 images decoded, all 31 manifest entries verified |
| Review baseline | PASS | Live PR #7 and remote heads matched `131ec19…`; one isolated branch from that head |
| Bedroom and entrance freeze | PASS | Construction blocks and bedroom/sofa/curtain assets compared with PR #7; no edits |
| Five white upper cabinet doors | PASS | Five separate front-surface intervals measured from runtime triangles |
| Washer and shelf contents | PASS | Only rice cooker/kettle on washer; three bottles above and two mugs below beige shelf; no removed clutter introduced |
| Original mug artwork | PARTIAL | Actual IMG_9974 front pixels, corrected reading direction; photographed edge is partly obscured and unseen backs remain plain blue |
| Kitchen-only composition | PARTIAL | Continuous blank left wall and clipped bin; camera lens/product silhouettes remain photo fits |
| Bin placement | PASS | Approximately 0.60 m clear of washer front; one bin in kitchen only; collision/map/fallback agree |
| Estimated kitchen clearance | PARTIAL | Owner directed no architectural movement. Nominal wall-axis-to-jamb is 1.78 m; inner-face-to-jamb ≈1.71 m; counter-front-to-jamb ≈1.04 m. Labeled top-down diagram and actual render document the discrepancy |
| Niche | PASS | Physical recessed back approximately 9 cm behind front; directly below heater on charcoal partition |
| Shower shelf | PASS | Downward mesh rays prove three levels and the absent fourth corner of triangular trays |
| Mop and door | PASS | Owner-approved 70.5° stop gives 1.8 cm precise mesh clearance. Hallway rays to hook/handle/head first hit the leaf; closed-view mop remains visible. Original door geometry, hinge/jamb/walls and mop GLB unchanged |
| Bathroom inventory | PASS | Existing coherent toilet, ordinary mirror, sink/window, shower fittings and drain retained; exactly two sink bottles; no glass enclosure/debris |
| Hallway inventory and sunlight | PARTIAL | Existing four-chair set, sofa, console/bracket, shelving/trolley, curtains, fixtures and real sun shadows retained; added accessories are approximate silhouettes |
| Continuous hall → kitchen → bathroom walk | PASS | Actual input-driven route recorded by `tests/owner-final.cjs` |
| Desktop/touch × PBR/Canvas regression | PASS | Existing `tests/smoke.cjs` |
| Context loss/restoration | PASS | Existing `tests/context.cjs` |
| Syntax, asset rebuild and whitespace | PASS | JS/Python parsing, Blender re-export, schematic XML and diff check |
| Physical iPhone Safari | UNVERIFIED | No physical iPhone available; Chromium touch emulation does not establish device performance |
| Overall match to locked mockups | PARTIAL | Geometry/detail pass is reviewable; lighting, camera fit, ceramic/product forms, cloth and toy identities still differ |

## Reproduce

Serve the repository with `python3 -m http.server 8000 --bind 127.0.0.1`, then run
GPU jobs sequentially in software-rendered environments:

```sh
blender -b --python v4/tools/final_assets.py
node v4/tests/owner-final.cjs
node v4/tests/capture-owner-final.cjs
node v4/tests/smoke.cjs
node v4/tests/context.cjs
HW_PLAN_OUTPUT=v4/qa/owner-final/plan.svg node v4/tools/plan.cjs
node v4/tools/clearance-evidence.cjs
node v4/tools/mop-clearance.cjs
node v4/tools/render-evidence.cjs
git diff --check
```

Capture filters: `HW_DESKTOP_ONLY=1`, `HW_CAPTURE_VIEW=hallway,kitchen` and
`HW_CAPTURE_DIR=/path/outside/repo`. `HOUSEWALK_URL` selects a different server.
The fine joystick route avoids overshooting a turn when software-GPU frames are
long; existing smoke tests separately exercise keyboard controls. Cameras/lenses
are estimates fitted to the latest reference compositions, not surveyed optics.
Portrait framing naturally sees a narrower portion of the same room.

The top-down inspection eye is 2.65 m, below the unchanged ceiling. Both measurement views use the closed bathroom-door state; wall occlusion is retained. It is an inspection camera, not a walking pose. The separate measurement diagram is generated from model coordinates and does not embed the private floor plan.

The final interaction rerun uses `HW_SMOKE_RENDER_SCALE=.5`: CSS viewports remain 800 × 600 and 390 × 844, with the same complete geometry, controls and assertions, while PBR render buffers and reflection targets are smaller for software-GPU checks. Full-resolution review captures use the capture script without this setting. Context recovery uses the original unscaled test. Neither mode establishes physical-device FPS.
