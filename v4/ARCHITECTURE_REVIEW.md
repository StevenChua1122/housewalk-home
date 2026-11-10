# PR #3 architecture audit — provisional, awaiting source plan

Feature and material-polishing work is stopped. This branch starts at PR #3,
`8bfe413`, and changes only local geometry conflicts, relative sofa scale and
camera parameters. It does **not** establish a floor-plan-accurate reconstruction.

## Source evidence and missing input

Available: the two approved attachments (living/dining mockup and two-view kitchen
mockup), PR #3's actual captures, code, existing `reference.jpg` and the inherited
6.30 × 7.05 m brief. The dimensioned source floor-plan image and the real interior
photograph set are not present in this checkout, PR comments or available local
attachments. The small illustrated map inside the kitchen mockup has no dimensions
and is not a substitute for the actual plan. The atlas is not a source photograph.

Consequently **no internal wall, bathroom doorway, room width or bay outline has
been newly claimed as a measured fact**. The 6.30 × 7.05 m envelope is inherited
from repository instructions; even that has not been checked against the actual
source plan here. `review/geometry.json` records provenance explicitly.

## Differences and decisions

| Area | PR #3 finding | This review |
| --- | --- | --- |
| Room proportions | 3.25 m partition, 4.55 m bedroom south edge and 4.79 m bath edge are code assumptions. PR #3 moved a bathroom doorway from a mockup interpretation. | Freeze these positions until the dimensioned plan is supplied. Do not move them again to make a screenshot fit. |
| Sofa | Approximately 1.30 m modeled depth and 0.64 m seat top; its seat is higher than the dining chairs. Reference silhouette is shallower and lower. | Candidate depth 0.96 m and seat top 0.48 m, **photo-fit estimates**. Three-seat mesh, weave, stitching and pillows retained. Upper back loses 0.16 m height; no replacement furniture design. |
| AC support | Body width 0.83 m overhangs a 0.72 m support. Its back at z=0.81 penetrates a mounting face at z=0.90. | Attachment moved outward by exactly 0.09 m. Candidate support width 1.20 m is a **mockup-ratio estimate**, not a surveyed wall width. Full jog topology remains unresolved. |
| Window / recess | Two 0.16 m gaps flank the frame. Repeated centre posts and two bottom rails overlap. Alcove planks overlap the main floor for z=0…0.31, causing coplanar faces. | Close side gaps, use one perimeter/centre post and one lower-panel rail, remove coplanar floor overlap. Retain inherited 2.08 × 1.40 m frame centre-lines and 0.94 m return coordinate span pending actual plan. |
| Bay proportions | AC wall front z=0.90, bay return front z=0.29 and back z=-0.65 are separate assumptions. They do not establish the actual recessed-wall profile. | Show these coordinates on the audit diagram. Do not call the inherited bay depth corrected or resize the bay from the illustration alone. |
| Kitchen | Appliance order matches the mockup broadly. The hood's underside intersects the window-head band; module run and room footprint are unverified. | Raise the existing hood group 0.10 m to clear the opening. Keep existing module order, widths, sink, hob and appliances. Do not infer the pantry's actual dimensions from these modules. |
| Camera | PR3 landscape VFOV 77° gives HFOV about 104° at 1280×800. Captures also use inconsistent viewpoints and aspect ratios relative to references. | Repeatable camera manifest; identical lens/pose for PR3-versus-candidate geometry. Living candidate VFOV 58° / HFOV about 83°. Kitchen uses the reference banner aspect ratio, where VFOV 58° means HFOV about 121°. All poses/lenses are estimates, not recovered lens calibration. |

The living reference still cannot be matched honestly in this inherited layout:
a camera at x≈1.65, z≈6.4 to see more dining furniture is inside the refrigerator's
model bounds. The collision-clear candidate stops at z=6.02 and still crops the
dining track/near chairs. The audit images show this failure; no wall was hidden,
appliance moved or field of view stretched to disguise it. Exact camera matching
requires the floor-plan reconciliation and real-photo perspective calibration.

## Review artifacts

`review/plan.svg` is a dimensioned **model-coordinate audit schematic**, not a
traced/certified floor plan. Amber dashed partitions are unverified. Blue shapes
are local scale proposals; red outlines are PR3 bounds. Labels show source status.

`review/capture.cjs` captures PR3 and candidate geometry from the same camera.
For PR3 it overrides only eye height/FOV for controlled comparison; geometry and
lighting remain from `8bfe413`. Original PR3 screenshots remain in `qa/` unchanged.
UI is hidden for inspection, not replaced. No scene surfaces are hidden.

Approved-reference comparison sheets are generated locally outside the public
repository, so newly supplied home images are not published as repository assets.

```sh
python3 v4/review/plan.py
HOUSEWALK_REVIEW_OUTPUT=/workspace/housewalk-review node v4/review/capture.cjs
```

Validation is limited to rendered views, collision-clear review cameras, JavaScript
initialization and a short walking/door regression. Passing these does not establish
architectural or visual fidelity. The previous large smoke suite is not the design
acceptance criterion and was not expanded for this audit.

## Geometry approval gate

Need the actual mirrored, dimensioned plan and real interior photographs next.
Trace and verify the wall centre lines/thicknesses, window returns and AC jog;
check the kitchen run and the bathroom/adjacent-door locations; confirm furniture
sizes against known dimensions or product measurements. Keep uncertain dimensions
flagged. Re-render the same reference poses before approving the geometry. No full
visual polish or renderer migration should start until that review.
