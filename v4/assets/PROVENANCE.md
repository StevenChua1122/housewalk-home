# Locally bundled authored assets

- `materials/oak-albedo.jpg`: new generated seamless natural-oak material, guided
  by the approved finish. It is not an image of the user's home or a reference
  crop. Normal/roughness maps are derived by `tools/materials.py`.
- Fabric and cabinet support maps: original deterministic warp/weft material
  generation in `tools/materials.py`. `door-ash.jpg` is a pale ash remapping of
  the authored grain. No private photo is an asset input.
- `models/sofa-tailored.glb` and `models/curtains-draped.glb`: original custom
  geometry, authored and exported with `tools/hero_assets.py` in Blender 4.3.
  No downloaded furniture models or private pictures are embedded.
- Renderer dependency: Three.js r180, MIT; see `../vendor/THREE-LICENSE.txt`.
  Only required module/addon files are bundled. No remote runtime requests.

Model dimensions are design/photo fits, not surveyed product specifications.
