# Final-reference implementation — 10 November 2026

## Reference inspection and priority

All seven required images were decoded and visually inspected before this
implementation. The ZIP, extracted images and private comparison sheets remain
outside the repository. No new source mockup, floor plan or real interior photo
is committed or used as an in-scene image.

| File | Use |
| --- | --- |
| `01_FINAL_LIVING_DINING.png` | Furniture, warm finishes, oak, drapery, lighting inventory |
| `02_FINAL_KITCHEN.png` | Cabinet/appliance run, continuous white upper cabinets, finishes |
| `03_FINAL_ENTRANCE.png` | Finished entrance, two narrow perpendicular six-level racks |
| `04_ORIGINAL_FLOORPLAN_MIRROR_HORIZONTALLY.jpg` | Mirrored shell, partitions, doorways and circulation |
| `05_REAL_LIVING_WINDOW.jpg` | Two casements, paired handles, fixed lower glazing and frames |
| `06_REAL_ENTRANCE_FROM_DINING.jpg` | Connected entrance geometry and orientation |
| `07_REAL_ENTRANCE_CLOSEUP.jpg` | Door/frame, closer, hinges and supporting wall |

These references supersede the older PR #3/#4 provisional assumptions. No
furniture was moved solely to improve a screenshot. All captures use the same
connected apartment and collision-clear camera positions.

## Geometry and dimension provenance

Coordinates: x increases right across the **mirrored** plan; z increases from
the living-window end toward the entrance. Units are metres. The original plan
explicitly dimensions **6.30 × 7.05 m**. Its dimension extensions were calibrated
at approximately x=306…794, y=115…662 in the 1024 × 701 source; horizontal mirror
mapping is x≈(794−pixelX)/77.46, z≈(pixelY−115)/77.59.

Internal coordinates are traced wall-centre estimates (approximately ±0.05 m,
not survey tolerances). Wall thickness, heights, openings' clear widths and all
furniture/product sizes are photo/design fits. They require measurements to
certify. The 2.77 m ceiling and 2.15 m interior door leaves are **estimates**.

| Element | Current model coordinates / estimated dimensions |
| --- | --- |
| Living / bedroom partition | x=3.15, z=0…4.37 |
| Bedroom south wall / doorway | z=4.37; opening x=3.43…4.27 |
| Bathroom west wall / doorway | x=4.95; upper west opening z=4.49…5.27 |
| Bathroom north wall | z≈4.43, x=4.95…6.30; source wall centre lines are approximate |
| AC support mass | x=0…1.35, z=0…0.98; solid full-height construction |
| Window recess | x=1.35…3.15, z=0…0.98; inside the overall envelope |
| Window | sill≈0.23, fixed-pane divider≈0.67, head≈2.49; photo-fit heights |
| Sofa | ≈2.12 m long, ≈0.93 m deep, seat≈0.48 m; against left wall |
| Dining table | ≈1.68 × 0.89 m; x=0.06…1.74, z=3.76…4.65 |
| TV console | ≈2.04 m long, ≈0.50 m deep, against right partition |
| Refrigerator surround | x≈1.75…2.57, front z≈6.27 |
| Continuous white uppers | x≈2.595…4.875, including the washing-machine end |
| Shoe racks | two centres x=1.44 / 1.65; each ≈0.18 × 0.50 × 1.22 m |

The bathroom swing arc resolves to an upper **west-wall** entrance, not an
additional north-wall opening. Its leaf opens east along the north wall. The
bedroom door opens north. Layout, map, collision proxies and rendered door pivots
share these positions. The alcove no longer adds negative-z length to the plan.
There is no beam across the niche; the AC attaches to the projecting solid mass.

## Material and asset changes

- **Oak:** dedicated 2048² authored colour map, independent normal/roughness maps,
  correct sRGB/linear usage, anisotropic filtering, low-sheen response. 180 mm
  boards run toward the window, staggered at 1.66 m nominal lengths, with per-board
  UV offsets/mirroring and restrained colour variation. The colour map is a new
  generated seamless material asset, not a crop from a home photo. It replaces the
  shared low-resolution atlas/procedural floor system.
- **Curtains:** custom GLB drapery with smooth variable folds, gathering at soft
  tiebacks, 5 mm physical thickness, hems, controlled asymmetry, woven normal
  detail, rough fabric and restrained sheen. Both panels belong to the same bay;
  they are not textured planes or vertical colour stripes. The drape sits
  inside the recessed bay (estimated hanging depth), behind the empty shelf,
  with physical clearance rather than intersecting shelf boards.
- **Sofa:** custom rounded/subdivided GLB upholstery, three seat/back cushions,
  reclined backs, piping/seams, rounded arms and cream/orange pillows. Separate
  fabric roughness/normal response replaces the old plastic-like shading.
- **Kitchen:** retained sink, curved faucet, burners, hood, washer and fridge;
  white upper run now reaches the end wall above the washer. Grey textured base
  fronts and full-height surround, tiled joints, PBR metal and dark counter.
- **Entrance:** pale ash door, frame, handle/lock, peephole, three hinges, closer,
  switch and bulkhead. Exactly two separate narrow empty mesh racks, six shelf
  levels each, bottom mesh at floor level, long axis perpendicular to door plane.
  Height is below the refrigerator freezer seam. Neither rack enters the door
  aperture or fridge footprint.

Approved object inventory remains unchanged: four dining chairs (two per long
side), three L-track heads, living downlight/fan/downlight plus niche light,
empty bracket, white console, empty shelf and separate white three-tray trolley.
No TV, rug, coffee table or decorative clutter is added.

## Renderer and maintainability

The previous hand-coded shaders could not deliver independent physical normal,
roughness, fabric sheen, glTF assets or filtered environment reflections without
becoming a new engine. The replacement is isolated to rendering. Three.js r180
and the few required addon files are bundled under `vendor/` with the MIT license.
`layout.js` is the shared shell/collision source; `mesh-library.js` retains and
adapts the established detailed furniture; `index.html` retains interaction/UI.

Colour textures use sRGB, lighting uses linear colour, output uses ACES filmic
mapping and sRGB. Environment reflections are prefiltered from a generated room
environment, not a private interior image. Two 1024² VSM keys are cached until
assets, a door or day/night changes; other fixture fills are unshadowed. A small authored ceiling bounce map and a single floor contact-occlusion field
provide indirect-light approximations; neither is a ray-traced bake. This is
**not** a baked global-illumination solution. DPR is capped at 1.5, racks and
repeated floor boards are merged, and hidden tabs stop rendering.

Assets plus vendor files are approximately **5.9 MiB** uncompressed. The final
living capture renders about **165k triangles / 60 draw calls** on desktop and
156k / 51 on portrait; the entrance is about 59k / 20. Cached-shadow refreshes
on asset/door/light changes add work beyond these settled-frame counts. These
are software-Chromium scene statistics, **not measured iPhone FPS**. Static shell
and exterior parts are batched by material. Excess sofa subdivision was removed
while retaining rounded silhouettes; the detailed curtain topology is retained.
Textures/models load asynchronously; mobile memory, thermal and download
behaviour still require device verification.

`tools/hero_assets.py` regenerates custom models with Blender 4.3; no random
furniture models were downloaded. `tools/materials.py` regenerates support maps
from the committed authored oak albedo (Pillow/NumPy), with an optional replacement
albedo argument. Generated assets are committed; Blender/Python are not runtime
dependencies. Draco/KTX decoders are not required.

## Honest remaining differences

The mockups contain offline-rendered soft indirect light and richer exterior
imagery. This implementation uses approximated bounce fill, filtered environment
reflections and limited realtime shadows; it does not provide path tracing,
ray-traced reflections or true lightmap GI. The neighboring building is simplified
3D geometry. Drapery and cushions are tailored approximations rather than a full
cloth simulation; folds remain more regular and the oak grain more uniform
than the approved mockup. Metal reflects the filtered room environment rather
than accurate local ray-traced surroundings. Window heights, furniture dimensions and lenses cannot be
certified from these images alone. Camera angles are reference fits; the AI
mockup's apparent lens/proportions cannot all be reconciled exactly with the
source plan. Portrait naturally has narrower horizontal coverage.

These limitations remain visible in the actual uncropped in-game frames. No
walls, furniture or lights are hidden for capture. Physical iPhone Safari remains
unverified; Chromium touch emulation is not a substitute. Design acceptance is
for the owner after reviewing the screenshots, independently of passing tests.
