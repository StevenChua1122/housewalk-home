# Housewalk V4 — PR #8 visual refinement

The current bathroom, kitchen/laundry and hallway pass continues reviewed PR #8
head `563ad42` on `codex/final-approved-bathroom-kitchen-hallway`. The existing
local Three.js/PBR/GLB runtime, navigation and Canvas fallback remain.
Only `v4/` changes; no merge or deployment.

See [current actual screenshots, defects and validation](VISUAL_REFINEMENT_QA.md).
Visual fidelity remains **PARTIAL**, pending owner review. The architectural
layout, original furniture anchors, all capture viewpoints, bedroom, entrance
and door-back mop geometry are retained. The bathroom door keeps its previously
authorized 70.5° stop. The nominal 1.78 m discrepancy remains documented.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
# Open http://127.0.0.1:8000/v4/
```

Refined furniture, individual toys, appliances, fabric and accessories are actual
local meshes with procedural PBR support maps and geometry-based contact shading.
No room reference image, panorama, floor plan or personal collage is rendered.
The original isolated IMG_9974 mug-front artwork is the sole photographic object
artwork embedded in the refined models. Unseen mug backs remain blue; private
photo frames retain neutral inserts.

Earlier evidence remains historical: [first PR #8 pass](OWNER_FINAL_QA.md),
[PR #7 V5 pass](V5_QA.md), [PR #6](INTEGRATED_V3.md) and [older QA](QA.md).
Physical iPhone Safari performance is unverified.
