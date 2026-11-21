# PR #8 — full visual refinement review

Historical Round 2 evidence. Current niche correction and new captures: [Round 3 review](NICHE_ROUND3_QA.md).

Review result: **PARTIAL visual match**, not owner approval or pixel-perfect
matching. This pass continues `563ad42dfe3fc78a98f1926ebf743f706bc5d26d` on the
same `codex/final-approved-bathroom-kitchen-hallway` branch. PR #8 remains draft,
open and unmerged. No deployment or production-root/Daylight change is included.

## Actual 3D evidence

All frames come from the connected Three.js/PBR runtime at the **unchanged
reviewed camera poses and lenses**. The capture script is byte-identical to the
reviewed head. It suppresses only the HTML HUD; no scene mesh is moved or hidden
for a shot. Portrait captures retain the same pose/lens and show a narrower field.

| Area / view | Full-resolution desktop | Corresponding 390 × 844 touch viewport |
| --- | --- | --- |
| Hallway, Zone A/B, both door openings | [1448 × 1086](qa/visual-refinement/desktop-hallway.png) | [Mobile](qa/visual-refinement/mobile-hallway.png) |
| Kitchen and laundry | [1448 × 1086](qa/visual-refinement/desktop-kitchen.png) | [Mobile](qa/visual-refinement/mobile-kitchen.png) |
| Bathroom sink and toilet | [768 × 1024](qa/visual-refinement/desktop-bathroom-first.png) | [Mobile](qa/visual-refinement/mobile-bathroom-first.png) |
| Bathroom shower and shelf | [768 × 1024](qa/visual-refinement/desktop-bathroom-shower.png) | [Mobile](qa/visual-refinement/mobile-bathroom-shower.png) |
| Bathroom closed door and mop | [1086 × 1448](qa/visual-refinement/desktop-bathroom-closed.png) | [Mobile](qa/visual-refinement/mobile-bathroom-closed.png) |

[Unchanged camera definitions and renderer records](qa/visual-refinement/cameras.json).
The bathroom pair uses the original reference's separate 768-pixel views rather
than shrinking both into one screenshot. Primary hallway reference is
`01_FINAL_HALLWAY_LOCKED.png`; Zone A/B reference `02` is additional context.
Kitchen uses `03`, the bathroom pair `04`, and closed door `05`.

Private side-by-side sheets pair each actual view with its exact latest approved
reference. Baseline, iteration 1, iteration 2 and final comparisons are kept
outside the public repository. Final mobile sheets preserve both images' native
aspect ratios. No reference was perspective-warped or used as runtime scenery.
The original approved images, real photos, plan and personal collage pixels are
not committed. Public screenshots below are actual models only.

## Defects, corrections and remaining differences

PASS denotes a verified implementation property. PARTIAL denotes a remaining
visible difference. It does not imply owner acceptance.

| Previously identified defect | Implemented correction | Result / remaining difference |
| --- | --- | --- |
| Hallway toys were generic primitive placeholders | Five separate teddy identities: plain gold, white with red heart, small tan, small grey, gold with navy shirt/yellow trim. Modeled muzzles, ears/insets, sewn limbs/pads, noses, eyes/highlights and embroidery; separate smiling daisies and red festive seated doll with cap, cheeks, trim and green toes; corrected the reversed near/far seat-daisy/doll order to the reference | PARTIAL: recognizable identity/color details added; exact handmade toy silhouettes and expressions remain interpretations |
| Sofa looked unsupported and rigid | Tailored rounded cushions, attached piping, upholstered base/back/arms and contacting timber feet, within the original placement transform and footprint; current plush/daisy arrangement replaces superseded scatter pillows | PARTIAL: no furniture moved; reference upholstery compression/fold pattern differs |
| Dining furniture was coarse | Eased timber tabletop/apron/legs, four ladder-back chairs, stretchers and crowned cream upholstered seats at the original coordinates | PASS count and anchors; PARTIAL timber/fabric appearance relative to reference |
| Console/shelf/trolley details lacked identity and contact | Oak/white console doors and open cubbies, bracket bolts, five-tier white shelving, colored squishy eggs in a clear framed case, a bear-shaped jar and a red mushroom under a clear dome, blue large-eared and pink long-eared characters, helmeted duck, three trolley baskets with open wire sides/floors and castors, horizontally rolled/folded cotton, blue-lid jar, bottles/carton/cup, fabric pouch/zipper and an embroidered face charm | PARTIAL: finer product silhouettes differ; private collage frames deliberately retain neutral inserts |
| Curtains lacked volume, pleats and tieback detail | Smooth asymmetric deep folds, 3.5 mm fabric thickness, sewn hems, fabric tieback ribbons and lining return | PARTIAL: tied-back taupe curtains remain within the original envelope; individual fold pattern differs |
| Broom/dustpan read as loose lines and boxes | Dense straw fan plus individual bound fibers, straight grey shaft leaning to contact the fixed wall face, black tip, red ferrule and molded red scoop/lips/loop handle; bristles contact the scoop | PASS inventory/colors and no hallway bin; PARTIAL individual straw silhouette |
| Fan/track/downlight shapes were crude | Three solid airfoil fan blades and motor profile; black spotlight mounts/cylinders, recessed luminous lenses and refined downlights; retained fixture coordinates | PASS type/locations; PARTIAL fine fixture profile |
| Hallway was flat and poorly grounded | Real directional warm sunlight now reaches the table/floor; balanced daylight fill, procedural geometry contact shading and actual foot-contact floor occlusion; exterior remains 3D geometry | PARTIAL: real window/furniture shadows present; warm indirect bounce and exterior city/foliage differ from reference |
| Cabinet edges, seams and texture were coarse | Five separate white upper fronts, fine bevels and reveals; refined grey woven laminate lower fronts and finger pulls in the original run | PASS five upper doors and unchanged run; PARTIAL photo-fit panel proportions |
| Washer was a box with a small flat disc | Real Boolean drum opening, larger dark convex glass, molded ring, gasket, steel rim/drum/perforations, inset fascia, selector, drawer, pull, service hatch and feet | PARTIAL: substantially improved depth; exact appliance make/profile is not established |
| Rice cooker and kettle were primitive | Rounded cooker body, domed lid/seam, maroon/orange controls, latches/grips; tapered kettle, sculpted handle, rising spout/opening and switch | PASS only these two on washer; PARTIAL exact product contours |
| Sink/hob/hood/fridge had weak edges and materials | Genuine counter cutout/open steel sink, curved faucet and strainer; grates/knobs; seated steel hood canopy, filters/buttons/lenses; brushed refrigerator door/grip/gaskets and retained surround | PARTIAL: correct locations retained, product and reflection details differ |
| Rack contents were simplified shapes | Dished plates with rolled rims, turned bowl, perforated black utensil cup with pale cooking tools; separate prominent blue/white sink utensils and a thin modeled mint fish/orange octopus hanging charm | PASS simplified inventory; PARTIAL exact utensil/product silhouettes |
| Shelf bottles and mug art were inaccurate | Three shaped condiment bottles; only two blue mugs below. Original isolated IMG_9974 front pixels retained on curved surfaces, open vessels and handles | PASS quantity; PARTIAL photographed edge occlusion remains and unseen reverse faces stay plain blue; no invented artwork |
| Removed kitchen clutter could reappear | No kitchen roll, red-lid container or orange rubber bands added; washer and shelf inventory stays restricted | PASS |
| Bin/left-wall composition could be wrong | Original kitchen-only mesh bin retained approximately 0.606 m clear of washer front; blank left wall and existing room dimensions retained | PASS placement; PARTIAL composition remains governed by the locked camera/layout |
| Toilet cavity appeared plugged by a rear bridge | Bridge moved behind aperture within the same toilet anchor; continuous inner ceramic cavity, annular seat, separate hinged lid/attached bumpers, connected cistern, broader stable skirt/base and water surface | PASS separate components and open cavity; PARTIAL precise ceramic profile/glaze relative to mockup |
| Sink/plumbing/mirror lacked realism | Thick open wall-hung basin with recessed interior contact shading, curved chrome tap and wall-connected trap/flange; plain round real-time mirror | PASS plain mirror and connected forms; PARTIAL basin proportions/reflections |
| Bathroom tile/window surfaces were flat | Independent mineral normal/roughness maps, subdued grout, differentiated charcoal/light walls and grey floor; retained black frame and sill | PARTIAL: actual tile architecture preserved; exact stone variation/gloss and photographic illumination differ |
| Shower fittings lacked detail | Heater mounting pad/fascia/control/status lens; rainfall plate with fine nozzles, handheld face/nozzles, curved flexible hose and retained controls | PARTIAL: functional forms are modeled; exact product finish/profile differs |
| Niche/shelf were the wrong type or misplaced | Physical recessed niche remains directly below heater on charcoal partition; two navy bottles and white squeeze tube. Three triangular molded trays with rails, posts, three visible top care bottles, jar and brush | PASS physical niche depth, placement and three triangular levels; PARTIAL exact packaging |
| Support gaps remained under appliances/mugs and in fixture connections | Added cooker feet/kettle base and closed mug feet; grounded rack contents, cloth and tray bottles; connected faucet side valve; supported counter on a real sink-cleared carcass; added wall/ceiling mounting details, shelf feet and shower connectors | PASS modeled supports; original room/furniture anchors unchanged |
| Paper roll looked like a solid cylinder | Separate annular paper and cardboard-core profiles around the retained holder; wall escutcheon supports the holder | PARTIAL fine paper layering; actual inner cavity and materials are present |
| GO BATH plaque was omitted from the prior pass | Added a physical decorative plaque on the opposite shower wall, with raised vector lettering and bear/towel illustration; no electrical semantics or reference-image texture | PARTIAL: sign is present outside the locked shower framing; illustration is a modeled approximation |
| Small bathroom accessories were primitive | Closed-bottom pink/purple pails with rolled lips/pivoting handles, nested teal pail, foot-shaped black slippers with Y straps, asymmetrically draped blue cotton towel and attached hem; exactly one green/one blue sink bottle | PASS inventory; PARTIAL cloth/container silhouettes |
| Door/mop might collide or be hidden by a visibility trick | Complete existing door/hinge/jamb/walls/openings and mop/hook/handle GLB unchanged. Previously authorized 70.5° stop retained. Geometry/ray checks measure about 1.8 cm wall clearance and natural door-leaf occlusion | PASS; no camera-dependent visibility toggle |
| Rotated ears/petals were displaced because their modeling origins were at scene origin | Recentered each sculpted part before local rotation; corrected daisy petal orientation and character ear angles | Corrected and re-rendered before final review |
| Broad contact shading created triangular cabinet stains during iteration 2 | Reduced occlusion blend on sparse broad manufactured panels; retained stronger contact shading in cloth recesses and small shapes | Corrected before final captures; inspect final kitchen image |
| Cabinet/wall contact showed small depth-fighting specks; finger pulls looked proud | Front-face culling for closed manufactured shells, and pulls recessed behind the panel face. The fixed wall, carcass anchor and run dimensions are unchanged | Corrected before final capture; no wall moved |
| Excessively flat/plastic material response | Separate textile sheen/weave, timber grain, ceramic clearcoat, brushed-metal normal/roughness, stone and molded-plastic finishes; proper thickness, edge radii and manufactured cap normals | PARTIAL overall realism: standard real-time PBR and geometry contact shading approximate indirect light; no claim of ray-traced GI |

## Remaining visible differences

- The retained model proportions and reviewed camera/lens produce a different composition from the mockups. The hallway's far-right edge includes clipped bathroom slippers; they remain in their real floor positions rather than being hidden for that view.
- Toy faces, fine product contours, upholstery compression, curtain folds and some material response remain modeled interpretations. Small edge aliasing can remain in a real-time frame.
- Sunlight is real shadow-casting geometry, but indirect bounce and the modeled exterior city/foliage differ from the photographic references.
- Personal photo/collage inserts remain neutral in the public model. Mug front pixels are original; occluded edges and unseen backs remain incomplete.

All three rooms therefore remain **PARTIAL for visual fidelity**. The implementation-property PASS results below must not be treated as visual signoff.

## Architectural lock and measurements

The retained nominal kitchen window wall-axis (`z = 7.05`) to bathroom south jamb
(`z = 5.27`) is **1.78 m**, compared with the owner's estimated approximately 1 m.
Finished inner wall face to jamb is about **1.705 m**; counter front to jamb about
**1.04 m**. The owner explicitly chose preservation over unilateral correction.
No wall, jamb, door, hinge, partition, opening or approved room dimension moved.

[Measured top-down diagram](qa/owner-final/clearance-measurement.png) ·
[Measurement coordinates](qa/owner-final/clearance-measurement.json) ·
[Original actual top-down view](qa/owner-final/desktop-kitchen-bathroom-measurement.png) ·
[Door/mop precise clearance](qa/owner-final/mop-clearance.png).
These geometric measurements remain valid because the complete architecture and
door/mop mesh are unchanged. Fresh [top-down kitchen/bathroom](qa/visual-refinement/desktop-kitchen-bathroom-measurement.png) and [bathroom doorway](qa/visual-refinement/desktop-bathroom-door-top-down.png) inspection captures accompany this pass.

## Validation

| Check | Result / evidence |
| --- | --- |
| Live PR/head before editing | PASS: PR #8 draft/open/unmerged, head `563ad42…`; same branch and PR retained |
| Layout, door/mop, cameras and frozen room implementation | PASS: [asset/freeze proof](qa/visual-refinement/asset-proof.json); source construction blocks compared with reviewed head |
| Blender and local-asset pipeline | PASS: refined props/furniture/soft furnishings built in Blender 4.3.2 and exported GLB; geometry-only contact bake |
| GLB integrity, normals, contact attributes and privacy boundary | PASS: [asset proof](qa/visual-refinement/asset-proof.json); only isolated mug-front art is embedded photographic content; [decoded pixel comparison](qa/visual-refinement/mug-art-proof.json) confirms the reviewed 512 × 512 crop is unchanged |
| Five uppers, triangular shelf, niche, bin gap, mop clearance/occlusion and continuous route | PASS: [geometry, door rays and five-waypoint continuous walk](qa/visual-refinement/proofs.json) |
| Desktop/touch × PBR/Canvas interaction matrix | PASS: [four-case regression record](qa/visual-refinement/regression.json); map, day/night, seven tours, walking/collisions, both doorways and touch joystick/look |
| Asynchronous fixture day/night state | PASS: [material-state proof](qa/visual-refinement/material-state-proof.json); fixtures created after a theme change inherit it |
| WebGL context loss and recovery | PASS: full 900 × 650 render; Canvas becomes visible during loss, restored PBR reloads assets; [record](qa/visual-refinement/regression.json) |
| Full-resolution desktop/mobile captures and repeated reference comparisons | PASS evidence process: five desktop primary views, five touch views, three inspection/detail frames; repeated private exact-reference comparisons after corrections. Visual fidelity remains PARTIAL |
| JS/Python syntax, whitespace and unchanged HTML controls/Canvas | PASS: [source fingerprints and capture checksums](qa/visual-refinement/regression.json) |
| Physical iPhone Safari | UNVERIFIED; Chromium touch emulation does not establish physical-device FPS |
| Hallway visual match | PARTIAL |
| Kitchen/laundry visual match | PARTIAL |
| Bathroom visual match | PARTIAL |

Interaction and continuous-walk checks use half-size PBR buffers and 128-pixel reflection targets with complete geometry and unchanged CSS/input coordinates. Full-resolution acceptance captures and the context-recovery check use full render sizes.

The five refined GLBs contain about 552,000 triangles and 19.8 MB of uncompressed
GLB data, plus the retained bedroom/shell. Maps and shadows are local and cached;
contact shading is a deterministic geometry-based approximation. This pass adds
no postprocessing framework, renderer migration or runtime external dependency.

## Reproduce

Run GPU checks/captures sequentially when using software rendering:

```sh
python v4/tools/refinement_materials.py
blender -b --python v4/tools/refined_props.py
blender -b --python v4/tools/refined_furnishings.py
blender -b --python v4/tools/refined_soft_furnishings.py
blender -b --python v4/tools/bake_refined_contacts.py
node v4/tests/refined-assets.cjs
node v4/tests/refined-materials.cjs
python v4/tests/mug-art.py
HW_PROOF_RENDER_SCALE=.5 HW_PROOF_DIR=v4/qa/visual-refinement node v4/tests/owner-final.cjs
HW_CAPTURE_VIEW=hallway,kitchen,bathroom-first,bathroom-shower,bathroom-closed,mug-detail,bathroom-door-top-down HW_CAPTURE_DIR=v4/qa/visual-refinement node v4/tests/capture-owner-final.cjs
HW_CAPTURE_DIR=v4/qa/visual-refinement node v4/tests/capture-measurement.cjs
HW_SMOKE_RENDER_SCALE=.5 node v4/tests/smoke.cjs
node v4/tests/context.cjs
git diff --check
```

`final_assets.py` is the legacy initial-pass author, imported for stable helpers
and the original isolated mug art. Do not run its main export for this refinement:
it would replace refined props and regenerate the frozen mop. The new scripts
never export the mop. Existing original sofa/curtain GLBs remain historical assets;
the runtime now loads refined replacements at the same transforms. The frozen
bedroom GLB continues through its original material path.

The separate measurement capture reads the same frozen inspection pose from the original capture script, closes the PBR page, then captures the SVG diagram. This avoids software-GPU starvation while preserving the actual 3D view and full resolution.
