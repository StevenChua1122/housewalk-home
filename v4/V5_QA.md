# V5 actual scene review

Base PR #6: `c5ac96d`. Scope and reference audit: [V5_REVIEW.md](V5_REVIEW.md).
All captures are actual WebGL frames of the same connected apartment. No object
is hidden or moved for composition. Top-down cameras are inspection poses below
the ceiling. Main eye/lens values are estimated from the supplied references.

| View | Desktop | Touch 390 × 844 |
| --- | --- | --- |
| Living/dining | [Image](qa/v5-sunlit/desktop-01-living-dining.png) | [Image](qa/v5-sunlit/mobile-01-living-dining.png) |
| Alcove matching real 22 | [Image](qa/v5-sunlit/desktop-01a-alcove-close.png) | — |
| Alcove top-down | [Image](qa/v5-sunlit/desktop-01b-alcove-top.png) | — |
| Oak floor | [Image](qa/v5-sunlit/desktop-02-oak-floor.png) | — |
| Window/curtains | [Image](qa/v5-sunlit/desktop-03-living-window.png) | — |
| Bedroom main | [Image](qa/v5-sunlit/desktop-04-bedroom-main.png) | [Image](qa/v5-sunlit/mobile-04-bedroom-main.png) |
| Bedroom reverse | [Image](qa/v5-sunlit/desktop-05-bedroom-reverse.png) | — |
| AC oblique mounting proof | [Image](qa/v5-sunlit/desktop-06-bedroom-ac.png) | — |
| Cabinet/runner top-down | [Image](qa/v5-sunlit/desktop-07-bedroom-rug-top.png) | — |
| Cabinet corner/detail | [Image](qa/v5-sunlit/desktop-08-bedside-side.png) | — |
| Kitchen continuous uppers | [Image](qa/v5-sunlit/desktop-09-kitchen.png) | [Image](qa/v5-sunlit/mobile-09-kitchen.png) |
| Entrance racks | [Image](qa/v5-sunlit/desktop-10-entrance.png) | — |
| Hallway | [Image](qa/v5-sunlit/desktop-11-hallway.png) | [Image](qa/v5-sunlit/mobile-11-hallway.png) |
| Bathroom first | [Image](qa/v5-sunlit/desktop-12-bathroom-first.png) | [Image](qa/v5-sunlit/mobile-12-bathroom-first.png) |
| Toilet close-up | [Image](qa/v5-sunlit/desktop-13-toilet-close.png) | — |
| Bathroom shower | [Image](qa/v5-sunlit/desktop-14-bathroom-shower.png) | [Image](qa/v5-sunlit/mobile-14-bathroom-shower.png) |

[Derived model plan](qa/v5-sunlit/plan.svg) · [Camera record](qa/v5-sunlit/cameras.json) · [Actual regression results](qa/v5-sunlit/regression.json).
Private side-by-side comparisons are supplied separately, outside the public repo.

## Self-review

PASS means implemented and checked, not owner visual approval. PARTIAL identifies
a visible difference or an unverified limit. Automated checks do not approve appearance.

| Area | Result | Evidence / limitation |
| --- | --- | --- |
| Alcove geometry | PASS | Real depth/returns, solid sill wall and no inner beam; mesh rays confirm floor y≈0.015 and ceiling y≈2.768 through the niche |
| Locked furniture / lights | PASS | Existing positions/counts retained; four chairs, three-head L-track, floor-standing console and no under-strip |
| Daylight / oak finish | PARTIAL | Real window-shaped sun patches, refined maps/UV/roughness; grain and indirect-light character remain more uniform than the mockup |
| Curtains / sofa / bedding | PARTIAL | Refined meshes/materials; cloth remains authored rather than scanned/simulated |
| Bedroom AC | PASS | Casing back z≈1.005 contacts mounting-pad front; pad rear z≈0.980 meets the solid support; oblique proof shows the assembly |
| Cabinet / cat runner | PASS | One under-AC perpendicular cabinet; runner stays in its north aisle; top/side images and rays verify bed occlusion from the main eye position |
| Vanity mirrors / shelf | PARTIAL | Correct side-wall orientation/reflection; private collage replaced by neutral insert |
| Kitchen / entrance / hallway | PASS | Continuous uppers; two separate perpendicular six-level racks; retained actual doorway/soffit relationships |
| Toilet / bathroom | PARTIAL | Coherent remodelled bowl/seat/lid/cistern/base and two consistent views; product silhouette and ceramic lighting remain photo-fit approximations |
| Regression / context recovery | PASS | PBR/Canvas × desktop/touch matrix completed; forced context loss recovered through Canvas and restored PBR |
| Exact measured proportions | PARTIAL | Internal values and lenses remain estimates |
| Physical iPhone Safari | PARTIAL | UNVERIFIED; software Chromium touch emulation is not physical Safari |

Captured passes range from approximately 85k to 398k reported triangles and
19–137 calls, including reflection/shadow work when active. Assets plus vendor
modules are about 7.97 MiB. These are software-renderer counters, not device FPS.

The successful matrix combines the passing PBR desktop run with a targeted
rerun of PBR touch and both Canvas cases. A full-speed mobile scripted bathroom
turn initially timed out; the final turn uses fine joystick alignment to avoid
overshooting the narrow aisle during long software-rendered frames. The new
rear-window collision check also found and fixed a missing wall proxy. A new
proof test's scene lookup was corrected before the successful geometry checks.

The Canvas compatibility view retains simpler furniture/materials; the detailed
assets and high-fidelity review captures use PBR. No physical device FPS claim is
inferred from the software renderer or touch viewport.

## Reproduce

```sh
python3 -m http.server 8000 --bind 127.0.0.1
node v4/tests/capture-v5.cjs
node v4/tests/smoke.cjs
node v4/tests/context.cjs
node v4/tools/plan.cjs
git diff --check
```

`HW_CAPTURE_VIEW` selects comma-separated view names, `HW_DESKTOP_ONLY=1` skips
touch captures, `HW_CAPTURE_DIR` changes output and `HOUSEWALK_URL` changes the
server. `HW_SMOKE_CASE` selects comma-separated `pbr-desktop`, `pbr-mobile`,
`canvas-desktop`, `canvas-mobile` cases. Run GPU jobs sequentially under software rendering. Screenshots use
90-second compositor timeouts because software-GPU top views can exceed the
default 30 seconds. This is a development-environment limit, not device FPS evidence.

```sh
HW_REFERENCE_DIR=/path/to/private/Housewalk_V5_Compact \
HW_COMPARISON_DIR=/path/outside/repository/comparisons \
node v4/tools/compare-v5.cjs
```

Historical PR #6 captures and its QA report remain in `qa/integrated-v3/` and
[QA.md](QA.md); their prior PASS labels do not certify the V5 result.
