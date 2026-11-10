# Housewalk V4 — warm living and dining room

This preview implements a **real, walkable, depth-tested WebGL scene**, not a picture mapped onto a wall. Its target is the owner-approved `reference.jpg` image. It preserves the original Housewalk V3 production homepage, its mirrored floor plan, touch joystick, look gestures, door controls, mini map and guided tour.

## Enter the preview

Once GitHub Pages publishes the `v4/` directory, open `https://stevenchua1122.github.io/housewalk-home/v4/` on Safari, Chrome or desktop. The original homepage remains unchanged.

## Details to verify

- Dining near the entrance at **middle-left**, near the solid left wall; one dark rectangular table with **four** cream-seat ladder chairs, **two per long side**.
- Black **L-shaped three-head** track lighting. Two heads are on the near-camera section and point toward the tabletop.
- Living sequence from the entrance: **downlight → fan → downlight**; an additional centered downlight in the window recess.
- **Straight** three-seat upholstered sofa against the left wall (no L-shape), textile texture, cushion seams, two light pillows, one warm accent pillow.
- White wall-mounted air conditioner on the short projecting wall section at the far end of the sofa.
- TV wall: low white cabinet with gray top and **empty black mounting bracket**, **no TV**, no clutter. Empty slim white five-level rack near the window.
- Pale **lengthwise natural oak** flooring using the reference floor photograph; warm light and subtle soft contact shadow.
- A **deep** alcove with **no horizontal beam**, taupe curtains and **two adjoining grey-blue framed windows**. Their glazed area is around **30% to 80%** of wall height, not floor-to-ceiling.
- Bedroom, bathroom and kitchen remain deliberately simple draft models until later reference images are provided.

## Tech and fallback

`webgl.js` is dependency-free WebGL 1, using static detail meshes with depth testing and an optional photo-derived `materials.jpg` atlas. If WebGL is unsupported it falls back to the original canvas renderer. On a slow iPhone, wait for the atlas to decode; the procedural textures display first.

## Limitations

This is a **detailed interactive reconstruction**, not a photogrammetry scan or pixel-identical path-traced render. The original reference is only the visual target, never a disguised full-screen game texture. Actual iPhone Safari frame rate and the visual result must be inspected on device before promoting V4 to the live homepage.