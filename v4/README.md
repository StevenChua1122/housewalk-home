# Housewalk V4 — PR #8 visual refinement

The current bathroom, kitchen/laundry and hallway pass continues reviewed PR #8
head `d90ed73` on `codex/final-approved-bathroom-kitchen-hallway`. The existing
local Three.js/PBR/GLB runtime, navigation and Canvas fallback remain.
Only `v4/` changes; no merge or deployment.

See [Round 4 screenshots, cavity revision, asset corrections, comparisons and validation](MOCKUP_ROUND4_QA.md).
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

Authoring uses the local Blender → GLB pipeline. `tools/bake-reflections.cjs` and
`tools/pack-reflections.py` generate the compact day/night room probes from this
actual scene. `tools/export-runtime.cjs` and `tools/render-runtime-cycles.py`
produce controlled Cycles comparisons of the connected geometry; they are QA
tools, not a second walkthrough or a replacement renderer. See the Round 4 report
for inputs, camera/geometry verification and rendering translations.

Earlier evidence remains historical: [Round 3](NICHE_ROUND3_QA.md), [Round 2](VISUAL_REFINEMENT_QA.md), [first PR #8 pass](OWNER_FINAL_QA.md),
[PR #7 V5 pass](V5_QA.md), [PR #6](INTEGRATED_V3.md) and [older QA](QA.md).
Physical iPhone Safari performance is unverified.
