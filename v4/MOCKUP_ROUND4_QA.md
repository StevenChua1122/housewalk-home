# PR #8 — Round 4 visual refinement

Continues `d90ed731a5fcc9a0ab406ff1e41c85353cdcc2c4` on the existing
`codex/final-approved-bathroom-kitchen-hallway` branch. Only V4 changes.
No merge or deployment. **This is implementation evidence, not owner approval.**

The owner specifically authorized the **cavity-only** niche adjustment on
16 November 2026: 202 × 320 × 150 mm, raised 40 mm, on the window-facing return,
with shorter navy bottles and a taller white/blue tube. That authorization does
not approve the bathroom's final appearance or PR #8.

## Evidence and visual assessment

Actual capture/validation evidence is in `qa/mockup-round4/`.
The five primary desktop poses and corresponding mobile poses remain byte-for-byte
in the original capture script. Inspection cameras are separately identified.
No scene geometry is hidden for screenshots; only the HTML HUD/tint is suppressed.
For full-resolution software-GPU readback, `tests/capture-still.cjs` temporarily
pauses WebGL frame scheduling after the capture script's completed frames, saves
the PNG, then resumes. This drains queued work without changing scene content,
cameras, resolution or quality. The primary capture script remains byte-identical
to the reviewed version. Interaction/recovery tests run without this helper.

Exact references inspected: `01_FINAL_HALLWAY_LOCKED.png`,
`02_ZONE_A_ZONE_B_SUNLIT_REFERENCE.png`, `03_FINAL_KITCHEN_LAUNDRY_LOCKED.png`,
`04_FINAL_BATHROOM_TWO_VIEWS_LOCKED.png` (each half separately), and
`05_FINAL_BATHROOM_CLOSED_DOOR_LOCKED.png`. Real photographs include
`IMG_9960.jpg`, `IMG_9961.jpg`, `IMG_9973.jpg`, `IMG_9974.jpg` and the supplied
hallway/broom photographs. Raw references and reference-containing comparison
sheets remain outside this public repository.

**Overall fidelity: PARTIAL.** The approved mockups remain the target. Technical
checks are separate from visual acceptance; the remaining differences below are
not an assertion of a completed match.

| Area | Result | Remaining differences |
| --- | --- | --- |
| Hallway / Zone A / Zone B | PARTIAL | Plush facial proportions, clothing folds and small ornament details still differ from the reference. The fixed reviewed camera projects the table/sofa differently from the mockup. Window exterior geometry is approximate. WebGL bounce/shadow softness differs from the offline mockup. |
| Original photograph inserts | FAIL — assets missing | No original console family-collage image or original top-of-white-shelf frame image is present in the supplied pack. Physical frames have untextured backings. No alternative photographs were invented or extracted from mockups for publication. |
| Kitchen/laundry | PARTIAL | Major contact and separate-object defects are corrected. Fine appliance/packaging typography and some product contours remain approximations. The fixed camera/room proportions do not reproduce every projected edge of the mockup. |
| Bathroom | PARTIAL | The authorized cavity dimensions/product arrangement are implemented. Overall niche/heater/window screen alignment still differs at the locked shower pose; fixture geometry/positions and room proportions were not moved to conceal it. |
| Physical iPhone rendering/performance | UNVERIFIED | Mobile captures and interactions are Chromium emulation, not a physical iPhone test. |

Per-view differences retained for inspection:

- **Hallway:** the fixed scene projects a larger foreground table, lower/more
  distant sofa group and different doorway/window edges than the mockup. The
  sunlight pattern has a narrower projected spread and WebGL's indirect warmth
  is weaker. Broom height/lean in the image and small shelf/trolley contents also
  differ. Furniture and cameras were not relocated to force the composition.
- **Kitchen:** appliance/cabinet silhouettes and the window/counter projection
  still differ. Minor packaging, washer-panel typography, the charm's fine face
  and woven cloth appearance remain reconstructions. Original mug-front pixels
  are preserved; unseen mug backs are plain blue.
- **Bathroom first:** the sink/mirror/door projection differs; the toilet bowl,
  lid contours, ceramic finish and tap/plumbing detail remain visually different
  from the mockup despite separate actual geometry and material refinement.
- **Shower:** opening size is close in projection, but its whole-screen location,
  heater separation and window framing differ. The window-facing return appears
  lighter under the local WebGL fill than the reference's charcoal face. The
  retained physical tile material is charcoal; it was not replaced with a white
  face or an image patch. Chrome response and indirect contact also differ.
- **Closed door:** the same door-back mop is present, but its image position and
  surrounding wall/sink/toilet proportions differ under the retained camera.
  Tile tone, towel fold detail and product silhouettes remain approximate.
- **Touch-size views:** the same eye, yaw, pitch and vertical lens naturally
  produce narrower horizontal coverage at 390 × 844. There is no separate
  owner-supplied mobile mockup; responsive captures are not physical-device tests.

These are remaining visual differences, not a claim that the required
photorealistic match has been achieved. Cycles improves physical illumination;
it does not make reconstructed assets or fixed framing identical to the mockups.

## Shower niche — geometry versus visual acceptance

The niche stays on face A, normal **−Z**, beside the unchanged heater-facing
**−X** side. The heater-facing interpretation from the real close-up was not
used. Before editing, the mockup, real photographs and reviewed model were
compared and an annotated plan/elevation plus actual candidate renders were
provided for review.

| Property | Reviewed Round 3 | Authorized Round 4 |
| --- | --- | --- |
| Clear width | 188 mm | 202 mm |
| Clear height | 320 mm | 320 mm |
| Depth from finished front to tiled back | 150 mm | 150 mm |
| Clear world-X limits | 6.018–6.206 m | 6.004–6.206 m |
| Sill / top elevation | 1.060 / 1.380 m | 1.100 / 1.420 m |
| Finished front / recessed back Z | 6.088 / 6.238 m | unchanged |
| Heater lower elevation | 1.480 m | unchanged; 60 mm above opening |
| Products | Navy pumps taller than the tube | Shorter navy pumps, taller white/blue tube |

These are model fit values, **not surveyed room measurements or proof of visual
acceptance**. The opening is made from actual partition pieces and tiled side
returns, sill, soffit and back. The return tiles are 6 mm thick. The backing's
vertex-colour attribute was corrected after an intermediate render exposed an
incorrect black patch; it receives the bathroom's actual-scene reflection map.

The outer partition envelope remains X 6.000–6.300, Y 0–2.770,
Z 6.100–6.380 m. Heater, rail, handset, hoses, controls, rain head, window,
WC, door opening and cameras retain their original positions. The source freeze
and actual mesh-ray checks verify those constraints independently of appearance.

The unchanged shower camera is X 5.30, eye 1.50, Z 5.10, yaw 2.70,
pitch −0.14, vertical FOV 82°, at 768 × 1024. A traced mockup-centre ray reaches
the current return plane at X ≈ 5.792 m, outside its nominal X ≥ 6.000 m face.
This documents an **image/geometry alignment difference under the locked camera**,
not a surveyed architectural discrepancy. The heater's projection also differs
independently. The cavity-only correction therefore cannot produce the complete
mockup framing. No camera or architecture was changed to force that alignment.

The opening projects to approximately X 201–282 / Y 466–621 pixels in the actual
768 × 1024 shower capture. Manual marks in the 767 × 1024 mockup half are
approximately X 332–412 / Y 412–568. Its projected size is close, but its screen
position and separation from the heater differ. These are approximate image
annotations, not a calibrated physical survey. See
[projection review](qa/mockup-round4/niche-projection-review.json) and
[actual surface-ray proof](qa/mockup-round4/niche-geometry.json).

Historical proposal images were captured before implementation and reviewed
privately before the specific cavity authorization. Final implementation evidence
is the primary/inspection set in `qa/mockup-round4/`.

## Zone A, shelf, frames and trolley — asset list

| Asset | Round 4 work | Fidelity limit |
| --- | --- | --- |
| Grey three-seat sofa | Sculpted local seat/backrest pressure, finer piping, woven normal/roughness response; existing feet/anchor retained | Cushion tailoring still differs in fine contours |
| Plain honey teddy | Narrower torso/head/muzzle; actual short velvet-pile geometry and distinct microfiber material | Reference head/muzzle/paw contours still differ |
| White heart teddy | Same tailored body/face refinement; retained sewn red heart and position | Fine facial proportions approximate |
| Small tan / grey teddies | Retained individual scale/arrangement, revised head/body proportions and short pile | Tiny reference details cannot be resolved exactly |
| Navy-shirt/yellow-tie bear | Revised shape; sewn sleeve cuffs/lower hem, retained collar/tie | Clothing/face remains a reconstruction |
| Two daisy cushions | Retained individual petals, yellow faces and embroidered smiles; distinct fabric response | Exact stuffing/seam shape approximate |
| Red festive doll | Retained cap, face, trim/buttons/green toes; microfiber response and supporting seat deformation | Fine facial/garment detail approximate |
| White shelf | Retained construction/anchor; corrected contents' support heights | Shelf's projected proportions differ under fixed pose |
| Clear collectible case | Physical panels/bottom/supports, six coloured objects; settled onto shelf | Fine collectible identities/printing not verified |
| White bear-shaped jar | Retained rounded jar/ears/face; settled onto shelf | Fine printed details not supplied |
| Glass globe | Replaced the former mushroom with two red/orange fish forms, glass globe and pedestal; corrected support | Small forms reconstructed from visible pixels |
| Both photograph frames | Four rails, recessed backing, 1.6 mm glazing, easel, lean toward wall; settled onto supports | Original image files missing; backings remain untextured |
| Blue and pink large-eared characters | Replaced disc-like ears with tapered/notched wing ears and inset linings; added pale muzzles/toe details | Fine ear/muzzle/eye contours remain approximate |
| Yellow/orange duck stack | Retained specific bodies, cap/ear details and placement; material/reflection refinement | Small printed details approximate |
| Yellow console container | Physical cylinder/lid/red band and small nearby ornament | Fine graphics/partly hidden contents approximate |
| Reed/tool cup | Retained separate reeds/handles/orange tool with improved material separation | Exact minor tool details approximate |
| Three-tier white trolley | Retained baskets/rails/castors/footprint; top cup/pouch/pump; more care bottles and blue-lid jar on middle level | Fine package labels not reproduced |
| Trolley lower basket | Removed generic rolled towels; modeled pink soft bag/cream contents and horizontal silver zip pouch | Hidden contents remain uncertain |
| Trolley hanging charm | Retained separate cord, cream body, eyes/mouth | Fine character shape approximate |
| Broom/red dustpan | Lighter grey shaft, retained black tip/red collar; wider/taller straw fan with individual fibres; corrected pan/front-lip floor contact | Exact straw disorder remains procedural |
| Loose bathroom slippers | Adult-size foot-shaped soles and broad rubber Y bands; resting pair aligned along the white wall to clear the unchanged door sweep | Loose accessories only; door/mop/fixed fixtures unchanged |
| Dining / console / fan / track/downlights | Retained approved furniture and fixture positions; distinct wood/fabric/metal response and actual-scene reflections | No generic furniture substitution; fine geometry still differs |

## Kitchen contacts and separate faucet/filter

The previous “white flask” intersected the tap's base. It is replaced by an
independent JOVEN canister, its own thin metal outlet, moulded base/lid/collar,
confirmed product lettering and a white hose to a separate tap diverter.

The real photo also revealed that the old basin left only a tiny rear ledge.
Within the unchanged cabinet/counter/window envelopes, the basin/cutout moved
105 mm toward the counter front, and the tap moved 55 mm forward. This leaves
40 mm in front of the sink rim and 115 mm behind it. The filter and utensils now
stand on that rear ledge and clear the window. The soap is between tap and filter
as in the locked mockup, rather than on the opposite side of the tap.
The cabinet run, refrigerator, washer/rice-cooker/kettle, window opening, five
upper-door centres and room/camera coordinates were not relocated.

Other corrections: narrower cabinet seams; washer push controls/display instead
of a generic rotary selector; genuinely cut spatula slots; a connected hanging
loop for the fish charm; shallower beige stand clearing the window; supported
mug/crock feet; a broad drying cloth beside the basin with a 2 mm thickness,
stitched hem and an actual curved fold around the eased stone edge.
Final comparison corrected the condiment order: tall red-cap/red-label bottle
on image-left, golden oil in the centre, and shorter dark soy/yellow-cap bottle
on image-right. Shelf position and footprint remain unchanged. Fine label
typography is omitted rather than invented.
The front fold was shortened after full-size inspection made its former 40 mm
drop look rigid; the final thin, wavy hem remains clear of the stone.

The contact proof tests exported triangles against the actual counter and window,
not just authored dimensions. It reports cloth penetrations/edge crossings,
support clearances, separate canister/tap body bounds and loose-object/window
intersections. The original isolated mug artwork remains pixel-identical; exactly
two mugs remain. No kitchen roll, red-lid container or orange rubber bands return.
The mesh bin retains its kitchen-only placement, approximately 0.606 m clear of
the washer front. The left wall stays continuous and blank.

## Lighting, materials and geometry

ACES exposure remains 0.95. The retained sun direction produces shadows from
actual window/curtain/furniture geometry. Intensity is reduced from 5.7 to 4.8
to limit blown highlights; bounded fill/bounce is adjusted without orange
post-grading. Desktop sun shadows increase from 2048 to 3072; touch stays at
2048. Normal bias decreases from 12 to 4 mm.

New HDR room reflections are rendered from the connected runtime itself,
GGX-filtered and packed as six small local day/night RGBE maps. They are PBR
illumination, never room scenery or photographic backgrounds. Normal page loads
use the bakes, avoiding live cube renders. Planar mirrors remain interactive.
Static probes approximate parallax and do not rebake for every door movement.

Materials distinguish woven cloth from plush microfiber, laminate, stone,
ceramic, plastic, brushed stainless and chrome. The in-scope oak gets a restrained
finish; bedroom/entrance retain their original floor material regions and UVs.
Tile UV/colour variation is subtle and uses procedural maps. Foliage retains the
original cluster placements/colours, with curved leaves around concealed volume;
touch uses fewer leaves. Manufactured edges and product silhouettes are authored
in the local Blender/GLB workflow.

Full-size review also exposed bright lines from the pale, untextured subfloor
showing through the existing plank joints. A dark physical substrate now sits 2 mm below the unchanged board plane,
only in the in-scope floor regions; original board positions/UVs and frozen
bedroom/entrance regions remain unchanged. This adds six finishing triangles,
not a room-dimension or circulation change. Retained shower/small bathroom
hardware uses the bathroom's dedicated local chrome response, leaving the shared
metal and original door group unchanged.

WebGL's cached illumination does not reproduce full multi-bounce path tracing,
soft indirect contact, dense fibre scattering or perfect local reflections.
Controlled Cycles comparisons use the **same connected runtime geometry and
placements**, not a separately staged decorative scene. The export/import proof
checks mesh topology, transforms and light directions; cameras come from the
unchanged capture script. Renderer/material/light translations are recorded in
`cycles-proof.json`, including removal of AO-only vertex multipliers for real
path-traced contact, physical mirrors, controlled world illumination and tone map.
The physical-daylight comparison disables six realtime bounce-light proxies
because Cycles computes their indirect contribution. Actual lamp, hood, ceiling
and track fixtures retain their positions and powers. The same frosted panes use
rough transmission and controlled daylight radiance; no pane, opening or other
geometry moves. The original runtime-fill shower render is retained separately
for comparison, not presented as the final physical-daylight result.
Final Cycles settings are 64 maximum samples, adaptive threshold 0.04/minimum 16,
eight total/four diffuse bounces, and official Intel OIDN using the actual
albedo/normal passes. The import verifies every runtime mesh topology and world
matrix; see [export proof](qa/mockup-round4/runtime-export-proof.json) and
[Cycles proof](qa/mockup-round4/cycles/cycles-proof.json).
All five full-resolution Cycles views are complete. Import checks cover 952
runtime mesh objects and 1,098,608 triangles; maximum absolute matrix-entry error
is below 0.000001. The [evidence manifest](qa/mockup-round4/evidence-manifest.json)
records source/recipe hashes and the dimensions/hashes of all 18 native WebGL
captures and five Cycles images. This establishes artifact consistency, not
visual acceptance.
No mockup is a scene texture or background.

## Architectural lock, regression and performance

Bedroom/entrance construction, original bedroom asset, door/mop asset, plan,
window-alcove geometry and primary camera script remain frozen. The bath stop is
70.519° with the approved door-back mop/hook/straight handle. No glass shower
enclosure or removed shower-floor debris is added. The GO BATH item remains a
decorative plaque. The three triangular tray levels and two sink bottles remain.

A final actual-mesh check found that the adult-size slippers entered the fixed
door sweep at their old loose-accessory centres. The resting pair alone is now
aligned along the white wall: centres (5.64, 4.52) and (5.63, 4.62), rotations
1.54 / 1.62 rad, versus (5.47, 4.72) / (5.57, 4.76). No door, mop, architecture
or mounted fixture moved. Exported triangle/inside checks sample 241 poses
through the original swing, independently of the primary screenshots.

The nominal **1.78 m** kitchen-window-wall-axis to bathroom south jamb discrepancy
is retained. See [existing measurement and top-down evidence](qa/owner-final/clearance-measurement.svg).
It was not forced to the estimated 1 m, and no opening moved.

| Profile at retained hallway pose | Round 3 | Round 4 |
| --- | --- | --- |
| Desktop visible triangles / calls | 758,412 / 200 | 930,600 / 211 |
| Touch visible triangles / calls | 455,514 / 127 | 556,060 / 138 |
| Desktop geometry / day texture allocations | 287 / 30 | 302 / 36 |
| Touch geometry / day texture allocations | 273 / 26 | 288 / 31 |
| Software desktop startup | 26.277 s | 28.475 s |
| Software touch startup | 22.661 s | 15.173 s |

The six specular maps total about **0.513 MB** compressed and at most **4.13 MB**
of RGBA16F image storage after both states are uploaded. There are zero runtime
cube captures on the normal baked path. Desktop sun-map area increases 2.25×;
touch remains 2048². The complete desktop authoring scene has 1,098,608 triangles;
visible draw counts differ from full source totals because of culling/mirrors.
Full measurements and raw software-frame intervals are in
[before](qa/mockup-round4/performance-before.json) /
[after](qa/mockup-round4/performance-after.json).

The floor uses two material groups, avoiding an intermediate per-board draw-call
increase. Touch uses eight foliage leaves per cluster versus sixteen on desktop.
The final substrate, local chrome, cloth, loose-footwear and condiment corrections
are included in this profile.

**Performance: PARTIAL.** Added geometry/materials have a measurable cost and
desktop software startup is higher in this sample. Timing varies between runs.
SwiftShader timings are diagnostic only: no physical
desktop GPU, mobile GPU or iPhone performance has been verified.

**Technical regression: PASS.** Actual niche surface rays, unchanged fixture and
camera checks, exported cloth/window/footwear contacts, GLB integrity and original
mug pixels pass. The five-waypoint walk, approved door/mop occlusion and clearance,
all four PBR/Canvas × desktop/touch cases, seven safe tours, map, day/night,
counter/wall collisions, both doors and touch joystick/look pass without page
errors. Full-size 900 × 650 context loss exposes Canvas and restores the PBR
assets successfully. [Structured results](qa/mockup-round4/regression.json).

Only interaction tests reduce the software-GPU draw buffer to 50%, retaining the
complete geometry and original CSS/input coordinates. All primary/inspection
PNGs are full resolution. Context recovery uses its original full-size buffer.
No physical iPhone or hardware-GPU performance claim is made.
The control/recovery suite predates the final loose-condiment order/label
correction, which changes no control, collider, wall/door or camera source.
Current-asset contacts, protected sources, original artwork and probe provenance
are checked again after it, and all full-resolution views are recaptured.

## Actual image evidence

| Primary view | Desktop actual | Touch-size actual | Same geometry in Cycles |
| --- | --- | --- | --- |
| Hallway | [1448 × 1086](qa/mockup-round4/desktop-hallway.png) | [390 × 844](qa/mockup-round4/mobile-hallway.png) | [Render](qa/mockup-round4/cycles/cycles-hallway.png) |
| Kitchen/laundry | [1448 × 1086](qa/mockup-round4/desktop-kitchen.png) | [390 × 844](qa/mockup-round4/mobile-kitchen.png) | [Render](qa/mockup-round4/cycles/cycles-kitchen.png) |
| Bathroom first | [768 × 1024](qa/mockup-round4/desktop-bathroom-first.png) | [390 × 844](qa/mockup-round4/mobile-bathroom-first.png) | [Render](qa/mockup-round4/cycles/cycles-bathroom-first.png) |
| Bathroom shower | [768 × 1024](qa/mockup-round4/desktop-bathroom-shower.png) | [390 × 844](qa/mockup-round4/mobile-bathroom-shower.png) | [Render](qa/mockup-round4/cycles/cycles-bathroom-shower.png) |
| Bathroom closed door | [1086 × 1448](qa/mockup-round4/desktop-bathroom-closed.png) | [390 × 844](qa/mockup-round4/mobile-bathroom-closed.png) | [Render](qa/mockup-round4/cycles/cycles-bathroom-closed.png) |

Additional actual geometry views: [niche close-up](qa/mockup-round4/desktop-niche-close-up.png),
[niche oblique](qa/mockup-round4/desktop-niche-oblique.png),
[implemented plan/elevation](qa/mockup-round4/niche-implemented-plan-elevation.png),
[tap/filter/cloth](qa/mockup-round4/inspection-kitchen-tap-filter-cloth.png),
[cloth overhead](qa/mockup-round4/inspection-kitchen-cloth-top.png),
[individual plush](qa/mockup-round4/inspection-zone-a-plush.png),
[shelf/frames](qa/mockup-round4/inspection-shelf-frames-ornaments.png),
[console/trolley](qa/mockup-round4/inspection-console-trolley.png) and
[loose floor accessories](qa/mockup-round4/inspection-bathroom-floor-accessories.png).

Public before/after sheets contain only actual renders:
[hallway](qa/mockup-round4/before-after-hallway.png),
[kitchen](qa/mockup-round4/before-after-kitchen.png),
[bath first](qa/mockup-round4/before-after-bathroom-first.png),
[shower](qa/mockup-round4/before-after-bathroom-shower.png),
[closed door](qa/mockup-round4/before-after-bathroom-closed.png).
Corresponding `lighting-*.png` sheets compare WebGL/Cycles on the same geometry.
Exact-reference comparison sheets are delivered privately, outside the repository.
