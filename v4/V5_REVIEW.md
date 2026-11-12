# V5 sunlit reference correction

Development base: PR #6 `c5ac96dd18db682ee11b9503964f7b61b3b54617`.
GitHub PR search and remote branch heads found no newer integrated review state.
Branch: `codex/v5-sunlit-alcove-refinement`. Only `v4/` changes; no merge/deploy.

## Reference audit

`README_FIRST.txt` and all 228 lines of `00_CODEX_PROMPT.txt` were read before
editing. The user explicitly incorporated that specification. All 22 JPEGs
decoded and every SHA256 manifest entry matched. This mobile ZIP contains `.jpg`
versions, rather than the `.png` filename in the chat; its README documents the
conversion. No older living image was substituted.

The authoritative living image SHA256 is
`98530b053bae8383ea553a72be5963e1d94902feeee9cdf565a2fda62de05038`.

- Approved 01/02 control the new sunny living/bedroom finish. Approved 03 is
  furniture verification only; 04/05/09 keep the kitchen, entrance and bathroom.
- Source 06 is horizontally mirrored for topology. Its printed room labels are
  the original orientation; the existing mirrored apartment remains unchanged.
- Guides 07/08 control framing/relationships, not replacement layouts.
- Real 10/22 control living-window construction and the ceiling/recess.
- Real 11/12/17/18 verify entrance, circulation, living and hallway relationships.
- Real 13–16 verify bedroom architecture, cabinet and fixed-side-wall vanity.
- Real 19/20 control toilet construction; real 21 controls the cat runner position.
- The supplied previous-v3 QA is diagnostic evidence, not visual approval.

No newly supplied photograph, original floor plan, private collage or reference
composite is committed or used as a scene background. Private comparisons are
written outside the repository. The shelf retains the approved frame and small
decor silhouettes with a neutral insert: personal collage pixels are omitted
under the owner's privacy restriction.

## Architectural correction, separate from rendering fidelity

The source-plan envelope remains **6.30 × 7.05 m**. Other dimensions below are
identified **photo-fit/model estimates**, not surveyed measurements.

The established living support projection and recess depth remain 0.98 m. The
solid left support is x=0…1.35; the niche is x=1.35…3.15, z=0…0.98. The opposite
return meets the existing room partition. Neither the room outline nor furniture
is moved to manufacture apparent depth.

`window-alcove.js` replaces the near-floor-height glazing with a solid
below-window wall and recessed sill: estimated sill 0.62 m, main divider 1.02 m,
head 2.45 m. Dark metal depth, two upper casements, paired central handles and
two lower fixed panes are modeled. The only head-wall strip is at the **rear
external wall**, above the actual frame. No dropped member spans the inner mouth.
The existing ceiling stays level at 2.768 m across the main room and recess.
Lengthwise oak continues through the niche at the same floor level, with no step,
gap, balcony opening, fake doorway or disconnected patch. The closed utility
panel visible on the left return in real photo 22 is shallow surface construction
on that solid mass; it adds no room or opening. Jamb infill closes the small
frame-to-masonry strips at both bedroom/living windows. The rear window wall is
also in the shared collision list, so the player's radius stops before its
interior face instead of relying on the older point-boundary limit.

The bedroom AC is a complete assembly. A 25 mm mounting pad meets the solid
support face z=0.98; casing back z=1.005, front z=1.245. Its fascia/louvers remain
outside the support volume. Actual oblique and top views show the mounting.
The single cabinet keeps its established corner and west-facing drawers,
perpendicular to that supporting wall. No visibility-driven relocation is used.

The cream cat-shaped runner is original vector geometry, estimated x=4.35…5.69,
z=1.075…1.545, in front of the cabinet and parallel to the bed's long axis. It
remains present in every camera state. The bed supplies actual main-view occlusion.

The toilet stays in the same east-wall footprint. Smooth sampled ceramic
profiles replace the coarse bowl, with an actual cavity/trap, annular moulded
seat, thin hinged lid, integrated rear bridge/cistern, cap/button and floor base.
It is no longer a scaled torus plus oversized elliptical lid. Sink, window,
partition, heater, shower and ordinary non-illuminated mirror stay in place.

## Materials and lighting

The existing local Three.js/PBR/GLB pipeline and controls are retained.
Oak maps are reproducibly refined from the PR #6 authored texture, with a more
neutral beige/honey colour, different physical grain scale, restrained board
variation and independent low-sheen roughness/normal response. Plank width,
lengthwise direction and stagger are retained.

Existing curtain meshes receive nonuniform pleat phase/amplitude and softer
tension fields. Both rooms now use open/tied taupe drapes with actual thickness.
The sofa keeps its silhouette/placement with fine pressure deformation. Bedroom
pillows are less inflated, and a fitted-sheet layer and turned duvet cuff make
the cream bedding read as separate cloth layers. Vanity mirror orientation is
parallel to the fixed side wall; it remains a real planar reflection.

Daylight is the default. One cached, shadowed sun lights both north windows in
the same direction; real frames, wall returns and curtains cast its shadows.
Bounded window-bounce lights approximate diffuse indoor transport. Existing
ceiling/floor-lamp fixtures remain, with reduced daytime power. Night mode
restores their prior intensity. PCF filtering avoids VSM artifacts on thin metal
frames. Exposure/tone mapping and local texture colour spaces remain explicit.
Outdoor buildings/foliage are shared 3D approximations, not source-image scenery.
Assets plus bundled vendor modules total about 7.97 MiB. The added sun uses one
2048² cached shadow map; existing room keys and bounded mirror targets remain.
These are asset/render budgets, not a physical-iPhone performance measurement.

## Review and limits

See [V5_QA.md](V5_QA.md) for actual captures and current regression results.
Full-frame private comparisons are generated by `tools/compare-v5.cjs` with
reference/output folders outside git. Cameras and lenses are recorded estimates;
geometry is not reshaped to force perspective correspondence.

Realtime cloth, fixture surfaces, outdoor context and approximate indirect light
still differ from the approved offline imagery. A neutral shelf insert replaces
the private collage. No claim of a pixel-perfect or owner-approved result is made.
Physical iPhone Safari performance and platform-specific behaviour remain
**UNVERIFIED** unless a physical device is tested.
