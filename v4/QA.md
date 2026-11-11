# Integrated v3 visual review and regression evidence

Base PR #5: `a96da34`, branch `codex/v4-integrated-reference-v3`. No merge or deploy.
Current reference audit and dimension provenance: [INTEGRATED_V3.md](INTEGRATED_V3.md).

## Actual WebGL captures

These are actual frames from the same connected 3D scene. Only transient toast
text is suppressed; controls remain visible. No object is hidden or repositioned
for a screenshot. Camera/lens estimates and normal/inspection poses are recorded
in [cameras.json](qa/integrated-v3/cameras.json).

| Requested view | Desktop | Mobile 390 × 844 |
| --- | --- | --- |
| Living/dining wide | [Image](qa/integrated-v3/desktop-01-living-dining.png) | [Image](qa/integrated-v3/mobile-01-living-dining.png) |
| Oak close-up | [Image](qa/integrated-v3/desktop-02-oak-floor.png) | — |
| Living curtain/window | [Image](qa/integrated-v3/desktop-03-living-window.png) | — |
| Kitchen full upper run | [Image](qa/integrated-v3/desktop-04-kitchen.png) | [Image](qa/integrated-v3/mobile-04-kitchen.png) |
| Entrance / two six-tier racks | [Image](qa/integrated-v3/desktop-05-entrance.png) | — |
| Bedroom main | [Image](qa/integrated-v3/desktop-06-bedroom-main.png) | [Image](qa/integrated-v3/mobile-06-bedroom-main.png) |
| Bedroom reverse | [Image](qa/integrated-v3/desktop-07-bedroom-reverse.png) | — |
| Cabinet top-down proof | [Image](qa/integrated-v3/desktop-08-bedside-top.png) | — |
| Cabinet side / whole AC | [Image](qa/integrated-v3/desktop-08b-bedside-side.png) | — |
| Hallway / both entrances | [Image](qa/integrated-v3/desktop-09-hallway.png) | [Image](qa/integrated-v3/mobile-09-hallway.png) |
| Bathroom sink/mirror/toilet | [Image](qa/integrated-v3/desktop-10-bathroom-first.png) | [Image](qa/integrated-v3/mobile-10-bathroom-first.png) |
| Bathroom shower | [Image](qa/integrated-v3/desktop-11-bathroom-shower.png) | [Image](qa/integrated-v3/mobile-11-bathroom-shower.png) |

[Derived model plan](qa/integrated-v3/plan.svg) is a public schematic, not the
private source plan. PR #5 screenshots in `qa/final/` remain historical evidence.
Reference comparison sheets stay outside the repository and are supplied in the
private review pack. Approved bathroom panels are compared with both actual views.

## PASS / PARTIAL / FAIL self-review

PASS means implemented/checked, not owner-approved appearance. PARTIAL records a
remaining fidelity or verification limit. No automated check establishes visual approval.

| Area | Result | Evidence / limitation |
| --- | --- | --- |
| Locked living furniture and lighting | PASS | 4 chairs in 2+2, 3-head L-track, fan sequence, empty bracket/shelf/trolley |
| Floor-standing console / no under-strip | PASS | White contacting plinth, retained grey top; no low emissive geometry |
| Oak colour/grain/finish | PARTIAL | Refined maps, scale, roughness and warmth; still more uniform than the mockup |
| Curtains / fabric softness | PARTIAL | True thick drapery with irregular softer folds; not a full cloth scan/simulation |
| Kitchen and entrance design | PASS | Continuous uppers; retained appliances; two separate perpendicular 6-level racks |
| Bedroom furniture / two-head floor lamp | PASS | Correct wall relationships, 5-blade fan, wardrobe, fixed-wall vanity/mirrors; no rug |
| One under-AC cabinet | PASS | Actual top/side frames and geometry bounds verify corner / perpendicular drawer front |
| Reverse-view framing | PASS | Vanity and standing mirror remain present outside the reference camera's frame |
| Hallway and room connection | PASS | Shared source-plan openings, soffit and same living furniture; no extra sofa |
| Bathroom design / plain mirror | PASS | Both views share fixtures; ordinary round mirror, no halo/backlight or glass enclosure |
| Offline-render realism | PARTIAL | Cloth, fixture detail, indirect light, exterior and reflections differ |
| Internal surveyed dimensions | PARTIAL | Plan traces and photo-fit estimates; only 6.30 × 7.05 explicitly dimensioned |
| Desktop/mobile interaction regression | PASS | PBR and Canvas × desktop/touch: navigation, collisions, doors, tours, map, lighting, joystick/look; no reported app errors |
| WebGL context-loss recovery | PASS | Canvas appeared on forced loss; PBR assets reloaded after restoration |
| Physical iPhone Safari | PARTIAL | Unverified; Chromium touch emulation is not Safari/device testing |

## Reproduce

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# Separate terminal; Playwright and /usr/bin/chromium are development tools:
node v4/tests/capture-integrated.cjs
node v4/tests/smoke.cjs
node v4/tests/context.cjs
node v4/tools/plan.cjs
git diff --check
```

`HOUSEWALK_URL` overrides the server. `HW_CAPTURE_VIEW` accepts comma-separated
view names; `HW_DESKTOP_ONLY=1` captures only desktop. `HW_CAPTURE_DIR` overrides
the output folder. Run WebGL jobs sequentially under software rendering.

Input regressions use 800 × 600 desktop and 390 × 844 touch viewports under
software WebGL; the visual captures retain their full reference resolutions.
The initial 1280 × 800 long-walk check timed out with a clear path at roughly
0.5 software-rendered FPS. Collision substeps permit a less restrictive time
clamp without tunneling; this does not establish physical-device performance.

Regression coverage includes PBR/Canvas × desktop/touch viewports: map, lighting,
seven safe tour stops, continuous shared-aisle walking, counter collision, closed
and open bedroom/bathroom passages, the narrow bedroom aisle/AC-corner route,
bathroom-to-shower access, reset, joystick and drag-to-look. PBR checks also verify
cabinet bounds/orientation/count, standing-lamp identity, no mirror backlight,
rack count/levels, loaded PBR maps and the unhidden reverse-view furniture bounds.
Context testing checks Canvas recovery and PBR restoration after a forced loss.

Visual review corrected wardrobe occlusion of the main lamp, mirror/wall
coplanarity, heater/partition occlusion, cupboard/bed clearances, tile grout and
self-shadowing, soft-furnishing profiles and cabinet-proof framing. These checks
are separate from navigation tests.

For private comparisons (the output is prohibited inside the repository):

```sh
HW_REFERENCE_DIR=/path/to/private/Housewalk_Codex_Final_Corrected_References_v3 \
HW_COMPARISON_DIR=/path/outside/repository/comparisons \
node v4/tools/compare-integrated.cjs
```
