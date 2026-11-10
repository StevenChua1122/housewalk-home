> Historical PR #3/#4 record. The final reference pack is now available and the
> renderer/geometry work is implemented on the new development branch. Current
> evidence and dimension provenance: [FINAL_IMPLEMENTATION.md](FINAL_IMPLEMENTATION.md).
> The provisional assumptions and approval gate below are superseded by the
> owner’s final implementation request.

# Approved connected-house reference interpretation

> Architecture review pending: the earlier dimensions and functional QA do not establish plan accuracy. See [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md). The source dimensioned plan and real-photo set are still needed. No further visual polishing is approved by this audit.

The two images attached to the follow-up request supersede the older
`reference.jpg` wherever their details differ. The existing PR #2 implementation
(commit `677a15b`) is the foundation. Original reference assets are retained;
no newly supplied home photograph is published as a website background.

The apartment stays 6.30 × 7.05 m with entrance lower-left, living upper-left,
dining middle-left, bedroom upper-right, kitchen lower-middle and bath lower-right.
Coordinates use x across the plan and z toward the entrance. The living alcove
retains the existing 0.65 m recess. The south kitchen counter faces the same
shared dining/living aisle; neither kitchen viewpoint is a separate scene.

- Sofa: approximately 2.5 m long including arms, grey woven fabric, three seats.
- Dining: 1.76 × 0.86 m bare black table, four cream-seat ladder chairs, 2+2.
- TV cabinet: approximately 2.0 m long with a grey top. The white mesh trolley
  is approximately 0.39 × 0.58 × 0.86 m, with exactly three trays and four black
  castors. Both fit on the solid wall before the bedroom door; the door is clear.
- Window alcove: two adjoining blue-grey frames from 0.82 to 2.22 m above the
  floor, floor-length taupe curtains with a narrower central opening, empty rack.
- Kitchen: south-wall run ends before the bathroom wall. Viewed from living,
  appliances read left-to-right as washer, sink/window, gas hob/hood, dark fridge.
  White upper doors, textured grey base doors, tiled backsplash and black counter.
- Bathroom: the same lower-right rectangle now opens west onto the pantry,
  matching the newly approved kitchen views. The old north opening is closed.
  The bedroom's west entry is preserved; its south wall closes the provisional
  open edge. Door leaves, frames, collisions, mini-map, labels and tours agree.

The new references do not establish every dimension or the exterior view.
Cabinet module sizes, camera lenses, curtain opening and neighboring facade are
estimated to fit the preserved plan. Glazing/reflections, cloth deformation and
indirect lighting remain realtime approximations. The kitchen's window looks
into modeled lightwell geometry, and the living window onto a modeled neighboring
facade and balconies, with real depth and parallax.
