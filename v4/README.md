# Housewalk V4 — connected living, dining and kitchen

This preview implements a **real, walkable, depth-tested WebGL scene**, not a picture mapped onto a wall. Its targets are the latest owner-approved living/dining and kitchen images; see [REFERENCE_NOTES.md](REFERENCE_NOTES.md). It preserves the original Housewalk V3 production homepage, its mirrored floor plan, touch joystick, look gestures, door controls, mini map and guided tour.

The renderer now uses edge-sampled rounded meshes, reclined and piped cushions,
shaped fan blades, closed lamp lenses, a cross-room dining table and L track,
and one-time RGBA8 sun and ceiling-light shadow bakes. It needs no external runtime libraries
or WebGL depth-texture extensions.

## Review locally

These changes are isolated to `v4/` on a development branch based on
PR #2 (`codex/v4-reference-living-dining`). No deployment is part of this change.
From the repository root, run `python3 -m http.server 8000 --bind 127.0.0.1`
and open `http://127.0.0.1:8000/v4/`.

See [QA.md](QA.md) for test commands, screenshots and remaining device checks.

## Details to verify

- Dining near the entrance at **middle-left**, near the solid left wall; one dark rectangular table with **four** cream-seat ladder chairs, **two per long side**.
- Black **L-shaped three-head** track lighting. Two heads are on the near-camera section and point toward the tabletop.
- Living sequence from the entrance: **downlight → fan → downlight**; an additional centered downlight in the window recess.
- **Straight** three-seat upholstered sofa against the left wall (no L-shape), textile texture, cushion seams, two light pillows, one warm accent pillow.
- White wall-mounted air conditioner on the short projecting wall section at the far end of the sofa.
- TV wall: low white cabinet with gray top and **empty black mounting bracket**, **no TV**, no clutter. Empty slim white five-level rack near the window.
- Pale **lengthwise natural oak** flooring with generated tileable grain matched to the references; warm light and subtle soft contact shadow.
- A **deep** alcove with **no horizontal beam**, taupe curtains and **two adjoining grey-blue framed windows**. Their glazed area is around **30% to 80%** of wall height, not floor-to-ceiling.
- Bedroom and bathroom remain deliberately simple draft models until later reference images are provided.

## Tech and fallback

`webgl.js` is dependency-free WebGL 1, using static detail meshes with depth testing and an optional photo-derived `materials.jpg` atlas with generated tileable oak and woven upholstery. If WebGL is unsupported it falls back to the original canvas renderer. On a slow iPhone, wait for the atlas to decode; the procedural textures display first.

## Limitations

This is a **detailed interactive reconstruction**, not a photogrammetry scan or pixel-identical path-traced render. The original reference is only the visual target, never a disguised full-screen game texture. Actual iPhone Safari frame rate and the visual result must be inspected on device before promoting V4 to the live homepage.

The kitchen now includes white upper cabinets, textured grey base fronts, black
countertops, individually modeled backsplash tiles, a real sink cavity and curved
faucet, framed window/lightwell, gas hob/hood, dark metallic refrigerator and
front-loading washer. The living room has a three-tier white mesh trolley with
black castors. The pantry-facing bathroom doorway and adjacent bedroom partition
are reflected in the mini-map, collisions and tour stops.
