# Rendering recommendation — proposal only

The hand-coded renderer is useful for a walkable geometry review. It is not a
practical foundation for the approved mockup's final visual quality **as currently
implemented**. WebGL itself can render photorealistic scenes; the limitation is
this engine's triangle primitives, low-resolution shared atlas, analytic metal
highlights and simplified lighting. It has no glTF asset pipeline, physical
roughness/normal materials, image-based reflections or baked indirect-light
workflow. More shader patches would amount to writing and maintaining an engine.
Correcting the plan will not by itself solve these rendering limitations.

After geometry approval, use a bundled Three.js WebGL2 renderer and authored GLB
assets. This is a proposed exception to the current dependency-free approach;
no library or model has been installed and no migration is implemented here.

1. Build the verified architectural shell in Blender in metres, with named wall,
   opening, door and camera nodes. Export GLB with baked transforms. Keep a JSON
   measurement/provenance manifest and low-complexity collision proxies. Validate
   export dimensions against the approved plan, not against a screenshot alone.
2. Replace only the sofa/chairs/curtains/appliances with dimensionally correct,
   detailed licensed or custom models. Retain the approved designs and empty
   surfaces. Use sculpted upholstery and seam geometry where silhouettes matter;
   tileable normal/roughness maps for the weave and brushed metal.
3. Use glTF metallic/roughness PBR, correct sRGB/linear texture handling, consistent
   texture scale, prefiltered HDR environment reflections and a stable tone map.
   Export 1K/2K textures with KTX2/Basis and Meshopt-compressed meshes, self-hosting
   all decoders. Verify iPhone Safari support with the actual chosen versions.
4. Bake indirect illumination, contact shadows and most fixture lighting into
   UV2 lightmaps. Author separate day/evening bakes and switch/blend them. Use at
   most one live soft-shadow key light on mobile, plus limited unshadowed fills;
   avoid real-time GI, expensive SSR and a shadow map for every spotlight.
5. Keep existing `HousewalkBridge` movement, joystick, room labels, tours and map;
   drive both renderers from the same measured layout. Door pivots and collision
   proxies must share transforms. Preserve the Canvas fallback and WebGL context
   handling; do not rebuild the navigation app as part of the renderer swap.

Provisional engineering targets (budgets to validate, not achieved performance):
150–300k visible triangles with LODs, around 50–100 draw calls, roughly 3–8 MB first
room download and progressive loading after that. Prefer 1K shared textures and
2K hero maps, a 1024² mobile shadow map and adaptive DPR around 1–1.5. A realistic
initial device target is stable 30 fps on the agreed minimum iPhone, with 60 fps
optional where measured. Test thermal/frame pacing for several minutes on real
Safari; a Chromium emulation result is insufficient.

Do a small rendering proof on the approved shell and one sofa before migrating
all assets. Compare its fixed-camera screenshots against the reference and check
on-device frame/memory budgets. Only then expand to the approved living/dining
and kitchen inventory. No new features, redesign, merge or deployment is needed
for this proposal.
