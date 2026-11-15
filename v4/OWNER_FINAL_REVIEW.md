# Bathroom, kitchen/laundry and hallway implementation review

Development base: PR #7, `131ec19b2cb1bfadffb3ef3dcebaa5bbae5c49a5`.
Live PR metadata and all remote heads were checked before editing: PR #7 was open,
unmerged, and unchanged from the supplied baseline. Work is isolated on
`codex/final-approved-bathroom-kitchen-hallway`, targeting PR #7's branch.
Only `v4/` changes. No merge, deployment, production-root or Daylight changes.

## Reference audit and authority

Read both supplied text documents and the manifest; decoded all 32 images and
verified all 31 listed image checksums. The secondary V5 living image is not in
the supplied manifest; its SHA256 is
`b12c7f861aded2e1fe670044f707c40de7b6646b1009c9d3c6cc5b84dfeabb5a`.
All five current locked images were inspected individually, with the complete
supporting photo set and mirrored plan. Older QA captures are baseline evidence,
not visual approval. The attachment supplies supporting implementation details;
the user's direct scope and constraints take precedence over document instructions.

Topology follows the mirrored plan; fixed architecture/object placement follows
the real photographs; final appearance follows the five current locked images.
Only the 6.30 × 7.05 m envelope is source-dimensioned. Internal dimensions, prop
sizes and camera lenses remain photo-fit estimates. The owner explicitly directed
that all finalized door openings, jambs and walls stay fixed, with the approximately
1 m real-world value treated as an estimate and the discrepancy documented.
The model's nominal window-wall axis z=7.05 to the bath door's south jamb z=5.27
is **1.78 m**. From the finished inner wall face z≈6.975 it is approximately
1.71 m; from the counter front z≈6.31 it is approximately 1.04 m. These are
separate measurements. No doorway, jamb or wall position was moved.
See the [labeled top-down measurement](qa/owner-final/clearance-measurement.png),
[coordinate record](qa/owner-final/clearance-measurement.json) and
[actual kitchen top-down render](qa/owner-final/desktop-kitchen-bathroom-measurement.png) and
[bathroom doorway top-down render](qa/owner-final/desktop-bathroom-door-top-down.png).

## Delta from PR #7

- Bathroom: replace the partition's solid front with a genuinely recessed niche
  directly beneath the heater; replace the empty rectangular rack with three
  triangular trays and restrained contents. Add only the two sink bottles,
  approved closed-view pails/towel/sandals and sill items. Keep the existing
  detailed toilet, sink, plain round mirror, black window, shower fixtures,
  partition, tile envelope and clean drain area. No glass enclosure or debris.
- Door: Blender-authored high hook, straight long handle, red grip and lime mop
  strands are attached to the existing bathroom hinge's inside face. The open
  leaf physically occludes the mop. The owner-approved approximately 70-degree
  stop gives about 1.8 cm wall clearance; only the open rotation changes. The
  original leaf geometry, hinge, jamb, walls and entire mop GLB are unchanged.
  Collisions and Canvas use that same rotation. No camera-dependent hiding is used.
- Kitchen: preserve the five upper doors, fixed cabinetry, basin, faucet,
  window, hood, hob, fridge and washer. Add exactly a rice cooker and kettle on
  the washer, simplified rack dishes, blue/white sink utensils, three bottles
  on the beige shelf, and exactly two blue mugs underneath. No kitchen roll,
  red-lid storage tub or orange rubber bands. A bounded forward-facing bounce
  light and a separate brushed stainless material refine the kitchen only; the V5 lighting system remains intact.
- Kitchen bin: black open mesh, approximately 0.60 m clear of the washer front,
  with a shared collision proxy, map marker and Canvas silhouette. It stays
  outside the hallway camera; no second hallway bin is added.
- Hallway: add the grey-handled, black-tipped, red-collared straw broom and red
  dustpan, plus the approved visible plush arrangement and small console/trolley
  contents. Existing sofa, four-chair dining set, shelving, trolley, TV console,
  empty bracket, curtains, sun/shadows, ceiling lights and fan remain in place.

The bedroom construction block, bedroom assets and rug are unchanged. Entrance
construction is unchanged. Existing sofa and curtain GLBs are unchanged; new
hallway-visible accessories are independent props. Shared shell, room openings,
tour stops and walking dimensions have not been redesigned.

## Assets and privacy

`tools/final_assets.py` authors beveled manufactured parts, open ceramic mugs,
triangular shelf trays, mesh bin, cloth and plush silhouettes and grouped props
in Blender 4.3.2. It exports two local GLBs, batching each logical prop by material.
The mop GLB attaches to the existing door group; the other props share the scene.
The Three.js/PBR renderer and Canvas fallback are retained. Total assets/vendor
size is about 10.1 MiB; this is an asset budget, not a device-performance claim.

Both mug fronts use the same isolated photographed artwork from `IMG_9974`.
Its original lettering and pattern are sampled directly, not retyped, generated
or substituted. Only the mug-surface fragment is embedded in the GLB; source
photographs, floor plan, reference composites and private comparisons are excluded.
The photo obscures part of the artwork's edge; unseen reverse surfaces remain
plain blue. This limits a claim of complete product-artwork reproduction.
Rebuilds extract that same embedded artwork from the existing GLB. A first build
requires `HW_MUG_ART`; missing artwork causes an explicit error.

No mockup is used as a background, wall texture, panorama, billboard or room plane.
The GO BATH decorative plaque is outside the locked shower framing and omitted;
it is not misrepresented as an electrical fixture. Private collage/photo details
are not reproduced on the living shelving.

## Review limits

See [OWNER_FINAL_QA.md](OWNER_FINAL_QA.md) for actual rendered evidence and checks.
Overall visual fidelity is **PARTIAL**, not owner visual signoff: real-time
indirect lighting, product shapes, plush identities, small-item finishes, artwork
edge visibility and framing differ from the locked images. The kitchen camera
excludes the bathroom opening naturally by looking toward the run; the wider
hallway camera shows both openings. Cameras/lenses are documented estimates.
No geometry or furniture is hidden or moved for screenshots. Physical iPhone
Safari performance remains **UNVERIFIED**.
