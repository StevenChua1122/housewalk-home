# PR #8 — Round 3 reference review

Continues reviewed head `6cf8d6b5aacb20bc405279db24931bd060bd0120` on the
same PR #8 branch. This is implementation evidence, **not owner approval**.
Only V4 changes; no merge or deployment.

The niche's wrong-face/occlusion defects are corrected. **Visual fidelity remains
PARTIAL**, including niche scale/screen alignment under the architectural lock.

## Shower niche: defect and correction

Before editing, the actual Round 2 shower frame was compared with the **right
half of `04_FINAL_BATHROOM_TWO_VIEWS_LOCKED.png`**, `IMG_9961.jpg` and
`IMG_9960.jpg`. The approved mockup controls the final visible arrangement;
the real photos establish actual recessed construction, tile returns and depth.
They are private and remain outside this repository.

Round 2 cut the aperture into the **heater-facing −X side**. The approved right
view shows the recess on the **window-facing −Z return**, perpendicular to the
heater/rail face. This was a geometry/placement defect; the old 93 mm depth check
did not validate it.

The cutout is now on that window-facing return. The old side opening is solid
tile again. Separate masonry pieces, clipped exterior tiles, two interior side
returns, a tiled back, sill and soffit form a real opening. The complete heater,
rain pipe/head, rail, controls, hand shower and hoses retain their reviewed
geometry and coordinates.

The first correction render exposed a second issue: an overly low niche sill
let the fixed window sill obscure the products. A second correction raised the
opening base above that sill while retaining the 100 mm gap below the heater.
The product order was also reversed to match the mockup: **two navy pump bottles
on the image left, white/blue tube on the image right**. All three stand inside
the recess on its sill, separate from the shower fittings.

| Property | Round 2 | Round 3 / reference relationship |
| --- | --- | --- |
| Wall face | −X heater/rail face | −Z window-facing return, perpendicular to heater face |
| Clear opening width | about 216 mm, measured along Z | 188 mm along X between actual tiled side returns |
| Clear opening height | about 368 mm above the old raised sill (380 mm masonry gap) | 320 mm |
| Clear recess depth | about 93 mm along X | 150 mm along Z; genuine tiled back and returns |
| Elevation | masonry base 1.000 m, sill top 1.012 m, opening top 1.380 m | base 1.060 m, top 1.380 m; base clears the fixed 1.054 m window-sill top |
| Opening center | approximately `(5.987, 1.196, 6.240)` above sill | approximately `(6.112, 1.220, 6.088)` |
| Heater relationship | overlapped its face/rail in the image | heater center `(5.950, 1.680, 6.240)` stays fixed; recess center offset is `(+0.162, −0.460, −0.152)` m across the corner |
| Vertical gap | about 100 mm below heater bottom | 100 mm retained |
| Bottles/tube | narrow partly obstructed contents | two separate navy pump profiles with collars/spouts and fine print; shaped white tube with blue cap/band; correct image order |
| Outer masonry envelope | X `6.000–6.300`, Y `0–2.770`, Z `6.100–6.380` m | unchanged, checked from actual component mesh bounds |

The images do not supply surveyed niche dimensions. The numerical values above
are **model measurements**, not claims about measured real-world width/height.
The retained window wall and partition provide only about 208 mm across this
return before tile thickness. Making this opening substantially wider would
require moving its outer corner or the locked window-wall geometry. Neither was
moved. Exact photo-fit aperture scale and overall framing therefore require
honest visual review rather than a claim of dimensional identity.

In the unregistered 768 × 1024 shower frames, the reference opening is approximately
81 pixels wide and 155 pixels high, centered near `(372, 489)`. The new actual
opening projects about 70 × 146 pixels, centered near `(240, 559)`; its exact
corner projections are recorded in the geometry JSON. Reference coordinates are
manual image estimates, not a calibrated survey. The model's entire fixed
window/partition/heater composition sits differently in this frame; the retained
heater also appears larger. Thus **the wall-face defect is corrected, but exact
aperture scale and screen alignment remain PARTIAL**. No corner, window, fixture
or walkthrough camera was moved to conceal that difference.

An additional [camera-ray constraint check](qa/niche-round3/niche-reference-fit.json)
maps the approximate reference center onto the existing return plane using the
unchanged reviewed camera. It lands at X ≈ **5.792 m**, outside the actual return
starting at X = **6.000 m**. This demonstrates why copying its screen position
onto this fixed model would move the opening off the partition. It is not a
survey of the photograph or a proposal to alter the architecture.

## Actual scene captures

The original walkthrough capture script, all five reviewed poses/lenses, furniture
anchors and room layout remain unchanged. Inspection cameras below are separate;
no scene object is hidden, translated or replaced for any screenshot. Only the
HTML HUD is suppressed.

| Approved view | Full-resolution desktop | Corresponding touch viewport |
| --- | --- | --- |
| Hallway / visible Zones A and B | [1448 × 1086](qa/niche-round3/desktop-hallway.png) | [390 × 844](qa/niche-round3/mobile-hallway.png) |
| Kitchen/laundry | [1448 × 1086](qa/niche-round3/desktop-kitchen.png) | [390 × 844](qa/niche-round3/mobile-kitchen.png) |
| Bathroom sink/toilet | [768 × 1024](qa/niche-round3/desktop-bathroom-first.png) | [390 × 844](qa/niche-round3/mobile-bathroom-first.png) |
| **Bathroom shower: reviewed final viewing angle** | [768 × 1024](qa/niche-round3/desktop-bathroom-shower.png) | [390 × 844](qa/niche-round3/mobile-bathroom-shower.png) |
| Bathroom closed door/mop | [1086 × 1448](qa/niche-round3/desktop-bathroom-closed.png) | [390 × 844](qa/niche-round3/mobile-bathroom-closed.png) |

- [Niche close-up, including heater position](qa/niche-round3/desktop-niche-close-up.png)
- [Oblique inspection of the physical recess](qa/niche-round3/desktop-niche-oblique.png)
- [Round 2 → Round 3 actual-only comparison, unchanged camera](qa/niche-round3/niche-before-after.png)
- [Ray-measured bounds, fixture freeze, product visibility and inspection poses](qa/niche-round3/niche-geometry.json)
- [Measured top-down/elevation diagram](qa/niche-round3/niche-measurements.png)
- [Original primary camera definitions and capture records](qa/niche-round3/cameras.json)

Each primary desktop and mobile view is paired privately with its exact latest
locked mockup; bathroom view 04 is split into its original left/right halves.
Zone A/B reference 02 supplements hallway reference 01. Comparisons are repeated
after corrections, with native aspect ratios and no perspective registration,
recoloring, scene masking or camera adjustments. Private reference sheets are
excluded from the public repository.

## Targeted corrections across the three areas

| Concrete Round 2 issue | Round 3 correction | Acceptance result |
| --- | --- | --- |
| Niche on wrong wall face, partly obstructed by rail and sill | Correct return-face cutout, complete tiled interior, raised sill, clear product arrangement; heater/rail/hoses unchanged | PASS face/recess/three-product visibility; PARTIAL exact aperture scale and frame alignment, quantified above |
| Close-up exposed overlapping pump collars and a raised tube label plaque | Collar shells sit outside bottle necks; blue band follows the actual tube profile | PASS corrected geometry artifacts; PARTIAL precise package/printing identity |
| Hallway teddies/doll/daisies looked away in profile | Reoriented individual toy faces about their existing centers; softened teddy head/body silhouette; console characters and helmeted duck now face the hallway more naturally | PARTIAL: faces/identities more readable, exact sewn expressions and contours differ |
| Sofa cushions looked uniformly rigid | Small irregular cloth compression on seat/back surfaces, retaining piping/supports, original transform and footprint | PARTIAL: individual fold/compression patterns remain interpretations |
| Curtain folds looked uniformly tubular and top parting too narrow | Deeper asymmetric folds with more compression at the existing tiebacks; top opening expanded from about 16% to 27% of the drape span, matching the locked reference's approximate ratio; outer anchors unchanged | PARTIAL: opening and gathered volume improved; exact pleats differ |
| Golden sunlight/floor illumination was weak | Modest real sun increase and stronger warm local living bounce; wider real curtain parting admits light; alternative azimuths compared and rejected because they weakened the reference floor-shadow pattern | PARTIAL: actual window shadows retained; golden indirect bounce still differs, with no orange color-grade overlay |
| Kitchen lower laminate looked flat; fridge/glass response was weak | More legible fine laminate normals, lower laminate roughness, neutral brushed fridge response and dielectric dark washer glass | PARTIAL: reflections/weave improved; exact finish and reference illumination differ |
| Washer controls were reversed relative to reference | Drawer on camera left, central selector, display/buttons on camera right; washer body/door position unchanged | PASS control arrangement; PARTIAL exact appliance profile/markings |
| A front cooker grip covered the control panel | Lateral grips moved onto the sides of the same cooker; taller maroon/orange control panel remains unobstructed | PASS obstruction removed; PARTIAL exact cooker contours/graphics |
| Bathroom sink bottles were too round; charcoal tiles too flat/dark | Rounded square bottle sections, restrained mineral tile finish and lighter warm charcoal response | PARTIAL: closer silhouettes/material separation; exact transparency, mineral variation and illumination differ |
| Correct details could regress during export | Preserve five upper doors, both original-art mugs, kitchen-only bin gap/blank wall, three triangular trays, two sink bottles, complete door-back mop and authorized open stop | PASS inventory/geometry checks and reference review; no removed clutter introduced |

Remaining fine product/toy contours, upholstery/curtain folds, packaging details,
indirect light, exterior context and neutral private-photo inserts are still
interpretations. The fixed model/camera proportions differ from the mockups.
The previous detailed inventory/remaining-difference record is retained in
[Round 2 QA](VISUAL_REFINEMENT_QA.md); it is historical evidence, not this round's
acceptance result. Original mug front pixels remain unchanged; occluded edges and
unseen reverse faces are not reconstructed.

| Approved view checked | Object / position / material / lighting / composition review | Result |
| --- | --- | --- |
| 01 Hallway, with 02 Zone A/B context | Toy identities/faces and sofa contacts, four dining chairs, console/shelf/trolley arrangement, curtain opening, fixtures, broom/dustpan and real sun shadows checked. Fine cloth/toy/product contours, neutral private-photo inserts, exterior context and golden indirect bounce still differ. The retained doorway/furniture framing is different from the mockup | PARTIAL |
| 03 Kitchen/laundry | Five upper doors, corrected washer control order and cooker grips, appliances, rack contents, two original-art mugs, bin gap and blank wall checked. Locked run/window proportions in-frame, fine appliance details, weave/metal finish and illumination differ; small real-time shadow/edge artifacts remain | PARTIAL |
| 04 LEFT Bathroom sink/toilet | Two rounded-square sink bottles, wall-hung basin/plumbing, plain mirror, window, open ceramic bowl/seat/lid/cistern and accessories checked. The fixed open door, window and toilet occupy different proportions of the frame; ceramic profile, tile pattern/gloss and indirect light differ | PARTIAL |
| 04 RIGHT Bathroom shower | Correct return-face recess, tiled depth, two navy bottles/tube in image order, unchanged heater/rail/hoses and three triangular shelf levels checked. Aperture screen alignment/scale, heater's apparent size, right-edge shelf cropping and product packaging remain different under the fixed model/camera | PARTIAL |
| 05 Bathroom closed door | Complete long door-back mop/high hook, visible closed pose, two sink bottles, buckets/slippers/towel and mirror checked. Towel drape, fine accessory profiles and fixed door/window composition differ; no mop or architecture was redesigned to fit the view | PARTIAL |

These are visual review results rather than an owner signoff. No view is reported
as an exact match simply because its inventory or geometry tests pass.

## Freeze and regression checks

| Check | Result / evidence |
| --- | --- |
| Correct niche face, clear dimensions, real tiled recess, all three products visible | PASS: [six surface rays, mesh bounds and three camera-visibility rays](qa/niche-round3/niche-geometry.json) |
| Unchanged heater/shower fittings, bathroom window/envelope and outer partition | PASS: source construction compared with `6cf8d6b`; actual outer masonry mesh union measured in [niche proof](qa/niche-round3/niche-geometry.json) |
| Protected layout, bedroom/entrance, door/mop and original primary capture script | PASS: [asset/source freeze](qa/niche-round3/asset-proof.json) and [regression fingerprints](qa/niche-round3/regression.json) |
| Blender/local GLBs, normals/contact fields and no embedded room-reference image | PASS: [asset integrity](qa/niche-round3/asset-proof.json); only the retained isolated mug-front art is photographic content |
| Original mug front pixels | PASS: [unchanged decoded 512 × 512 RGBA pixels](qa/niche-round3/mug-art-proof.json) |
| Five upper doors, triangular three-level shelf, 0.606 m bin gap and niche depth | PASS: [actual geometry proof](qa/niche-round3/proofs.json) |
| Door/mop open stop, clearance and natural hallway occlusion | PASS: 70.519°, 0.017996 m wall clearance, all three hallway rays hit the door leaf first; closed ray hits mop |
| Continuous input-driven route | PASS: five consecutive waypoints through hallway, kitchen and bathroom; no collision/error regression |
| Desktop/touch × PBR/Canvas controls | PASS: all four cases; map, day/night, seven safe tours, walking, collisions, both door passages and touch joystick/look; [record](qa/niche-round3/regression.json) |
| Late asynchronous fixture day/night state | PASS: [material-state check](qa/niche-round3/material-state-proof.json) |
| Full-size WebGL context loss/recovery | PASS: 900 × 650 full render; Canvas becomes visible during loss and restoration reloads PBR assets; [record](qa/niche-round3/regression.json) |
| Full-resolution captures and repeated exact-reference comparison | PASS evidence process: ten primary desktop/touch frames plus two separate actual niche inspection frames; visual results remain PARTIAL |
| JS/Python syntax, whitespace and unchanged HTML controls/Canvas | PASS: [source/capture checksums](qa/niche-round3/regression.json) |
| Exact niche screen alignment / all five approved views | PARTIAL: visible differences and fixed-camera conflict documented above |
| Physical iPhone Safari / physical-device FPS | UNVERIFIED |

The five refined GLBs total **556,266 triangles / 19.1 MB** before the retained
bedroom and shell. No renderer migration, postprocessing framework or runtime
dependency was added. Geometry checks do not constitute visual signoff.

The complete source-plan shell, bathroom window/envelope, toilet anchor, door,
hinge, jamb and openings remain fixed. Bedroom/entrance construction and bedroom
assets remain unchanged. The door retains its authorized 70.5° open stop and
complete mop/hook/handle geometry with natural leaf occlusion. The nominal
**1.78 m** kitchen wall-axis-to-jamb discrepancy remains documented in the
[unchanged measurement diagram](qa/owner-final/clearance-measurement.png) and
[coordinates](qa/owner-final/clearance-measurement.json); no geometry was changed
to force the estimated approximately 1 m clearance.

Reproduce with a local static server, GPU checks sequentially:

```sh
HW_PROOF_DIR=v4/qa/niche-round3 node v4/tests/refined-assets.cjs
HW_PROOF_DIR=v4/qa/niche-round3 python v4/tests/mug-art.py
HW_PROOF_DIR=v4/qa/niche-round3 node v4/tests/refined-materials.cjs
HW_CAPTURE_DIR=v4/qa/niche-round3 node v4/tests/capture-niche.cjs
HW_CAPTURE_VIEW=hallway,kitchen,bathroom-first,bathroom-shower,bathroom-closed HW_CAPTURE_DIR=v4/qa/niche-round3 node v4/tests/capture-owner-final.cjs
HW_PROOF_DIR=v4/qa/niche-round3 node v4/tests/niche-reference-fit.cjs
HW_PROOF_RENDER_SCALE=.5 HW_PROOF_DIR=v4/qa/niche-round3 node v4/tests/owner-final.cjs
HW_SMOKE_RENDER_SCALE=.5 node v4/tests/smoke.cjs
node v4/tests/context.cjs
```

Set `HOUSEWALK_URL` to the preview server (this round used port 8123). Interaction
checks retain complete geometry and CSS/input coordinates with smaller software-GPU
buffers; all acceptance screenshots and context recovery use full render sizes.
Physical iPhone Safari remains unverified.
