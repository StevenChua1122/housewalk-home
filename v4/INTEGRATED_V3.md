# Integrated final-reference correction — 11 November 2026

Base: latest PR #5 head verified by fetch, `a96da346e86e55db764dc2a2769c5e847b28e45b`.
Development branch: `codex/v4-integrated-reference-v3`. Only `v4/` changes.
No merge, deployment, production-root change or Daylight change is included.

## Evidence and priority

All **19** named images decoded successfully and were visually inspected before
implementation. The two text documents in the ZIP were read as reference
material; the user's direct request governs the work. The floor plan determines
topology, real photographs permanent construction, and approved mockups the
finished objects/materials. No newly supplied source image is committed, mapped
onto a wall or used as a panorama. Private comparisons are generated outside git.

| References | Applied evidence |
| --- | --- |
| 01 final living/dining | Locked sofa/table/4 chairs/L-track/console/shelf/trolley arrangement |
| 02 final kitchen | Existing cabinet/appliance run retained, uppers continuous through washer end |
| 03 final entrance | Two separate perpendicular six-level racks, empty, bottom shelves at floor |
| 04 original plan | Horizontally mirrored 6.30 × 7.05 m topology |
| 05 real living window | Dark two-casement frame, central handles, lower fixed glazing and recess |
| 06–07 real entrance | Door, closer, hinges, handle, refrigerator-side wall retained |
| 08 latest bedroom | Headboard, lamp, finishes and **superseding under-AC cabinet position** |
| 09 reverse bedroom | Wardrobe/door relationship; older cabinet placement is not copied |
| 10–11 real bedroom | East headboard wall, north AC mass/window, south wardrobe/entry |
| 12 real cabinet | One beige two-drawer cabinet, wood top, tan pull tabs |
| 13 real vanity/mirror | West fixed wall; drawers and chair under opposite ends of desk |
| 14 real living/dining | Existing scale/circulation retained; no new furniture |
| 15 secondary guide | Framing only; its conflicting layout/floating-console implications ignored |
| 16 real hallway | Adjacent perpendicular bedroom/bathroom entries, frame/soffit relationship |
| 17 approved bathroom pair | Plain round mirror, sink/toilet/window and shower fixture design |
| 18–19 real bathroom | Window-wall plumbing, existing solid column/partition, heater and shelf |

Only 6.30 × 7.05 m is explicitly dimensioned on the supplied source. Internal
wall centres remain image traces (approximately ±0.05 m, not survey accuracy).
Ceiling/soffit heights, furniture and camera/lens values are identified photo-fit
or standard-size **estimates**, not claimed measurements. The shared wall's
model centre is z=4.37. PR #5's overlapping extra skin at z=4.43 was removed;
it intersected the open bathroom leaf and disagreed with the collision proxy.
Doorway coordinates and apartment topology are retained.

## Targeted implementation

The PR #5 Three.js/PBR/GLB renderer, interaction bridge and established furniture
are reused. `room-details.js` completes the provisional rooms; it does not rebuild
the application. The kitchen and main entrance geometry are unchanged. The TV
console retains its body/grey top/position and gains a correctly contacting white
plinth. It is floor-standing and has no under-cabinet emissive strip.

Oak refinement uses the authored PR #5 colour map: retained broad grain,
suppressed harsh micro-fibres, a more neutral beige/honey palette, coarser physical
UV grain scale, restrained board variation and independently refined normal and
roughness maps. Normal strength is reduced from .16 to .045. Board direction and
stagger are retained. Upholstery weave contrast/normal strength is reduced.

Living drapery retains the existing custom solidified mesh pipeline. Nonuniform
pleat spacing, amplitude, curved tension paths and sag replace the more regular
fold field. The folds have less exaggerated depth and softer fabric shading.
The drape stays inside the window bay, clear of the shelf, close to the actual
window. The niche light keeps its fitting/location with softer intensity.

The custom `bedroom-soft.glb` supplies a grey upholstered bed and six-channel
headboard, plump/reclined cream pillows, continuously draped/folded duvet and
volumetric closed taupe curtains. Rounded Three.js geometry supplies the white
three-door wardrobe, fixed-wall vanity/drawers/perforated chair, standing arched
mirror, wavy tabletop mirror and the real two-head black standing lamp with
upward opal bowl, smaller angled reading head and round base. No rug is present.

### Under-AC cabinet proof

There is exactly **one** cabinet. Its body bounds are x=5.78…6.21,
z=1.06…1.56, with estimated total height 0.59 m. The AC support faces south
(normal +Z); the drawer front faces west (normal −X), so their front planes are
perpendicular. The cabinet sits in the inner north/east corner beside the
headboard, directly below the AC's horizontal footprint. It remains partly
occluded in the main view. [Top inspection](qa/integrated-v3/desktop-08-bedside-top.png)
and [side proof](qa/integrated-v3/desktop-08b-bedside-side.png) expose the actual
same geometry. The overhead camera is above the bed but below the AC; nothing
is hidden. The side view shows the supporting wall, whole AC and both drawers.

Vanity and full-length mirror stay on the west fixed wall. The reverse camera
keeps them out of frame by its real view direction/aspect ratio. They are never
deleted or toggled invisible. The reverse door is closed through the existing
door state, matching 09; main/hallway views use it open.

### Bathroom and transition

The bathroom is one continuous narrow room. Tiles and the actual frosted-window
opening occupy the east wall; the white sink/plain round mirror and toilet sit
along that wall. The existing solid shower partition carries the black heater,
rain head, handheld shower and hose. Bidet, paper holder, floor drain and empty
white three-tier mesh shelf are modeled. There is no glass shower enclosure,
backlight, halo, illuminated mirror border, products or buckets.

Grout has real geometry and restrained contrast. Tile fields do not cast tiny
self-shadows; structural surfaces and fixtures still do. Static batching preserves
this distinction. Porcelain has rounded profiles, a hollow bowl and restrained
cavity occlusion. Mirror/glass surfaces have physical clearance from wall faces.
The hallway retains the common furniture positions and both actual openings;
its camera shows no extra sofa or coffee table. The sofa remains in the scene.

## Rendering and interaction

Two additional 512² cached shadow keys complete bedroom/bath lighting alongside
the retained 1024² living/kitchen keys. Mirrors use bounded 256² touch / 512²
desktop planar targets, cache unchanged views and cap moving updates at 10 Hz.
Reflection cameras exclude other mirrors to avoid recursion; physical mirror
surfaces remain present in the main scene. All runtime modules/assets are local.
RoundedBoxGeometry and Reflector are from the same bundled Three.js r180/MIT.

The added soft-furnishing GLB is about 2.07 MiB / 99k triangles; all assets and
vendor modules together are about **7.44 MiB**. Captured normal views range from
roughly 86k to 325k triangles / 20–100 calls; touch frames have narrower coverage.
Mirror refreshes and shadow invalidation add work. These are software-Chromium
statistics, **not physical-iPhone FPS measurements**.

Collision proxies, map furniture and tour stops follow the same room coordinates.
Movement uses up to 25 mm substeps to avoid coarse stops during narrow turns.
Keyboard/touch walking, look, doors, labels, map, tours, day/night and Canvas
compatibility remain. Regression results and the visual checklist are in [QA.md](QA.md).

## Remaining visual limitations

This is a realtime reconstruction, not a pixel-identical offline render. Cloth
folds/bedding and fixture silhouettes remain tailored approximations; grain and
fabric do not fully reproduce the approved material photography. Indirect light
is approximated, shadow resolution is limited, and the neighboring facade is
simplified. Internal sizes and lenses cannot be certified from photographs.
Design fidelity remains for owner approval independently of automated tests.
Physical iPhone Safari performance, memory/thermal behaviour and Safari-specific
input/resume behaviour remain **unverified**.
