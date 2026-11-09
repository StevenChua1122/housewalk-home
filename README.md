# Housewalk — mirrored home POV walkthrough

Housewalk is an early **first-person, walkable home layout prototype** based on the corrected 6.30 × 7.05 m floor plan, flipped horizontally. The **entrance is at the lower left** of the mirrored map, followed by **dining on the middle-left**, **living farther ahead**, with the **kitchen/pantry toward the lower middle**, **bedroom upper-right**, and **bathroom lower-right**.

This is **a concept model, not a survey-accurate architectural or photorealistic reconstruction**. The bedroom and bathroom furnishings are placeholders. The living, dining, and kitchen colors/furniture are approximate references from a walkthrough video.

## Play

- On iPhone or Android: open the **published HTTPS website in Safari or Chrome**, drag to look around, use the left-side joystick to move. Tap **Tour** to move between preset viewpoints, **Plan** to open the map, or **Open door** near a door.
- On a laptop/desktop: use **W/A/S/D** to move, drag with a mouse to look, **E** for doors, **M** for map, and **Shift** to move faster.
- Use the sun/moon control for day/night mode and the round arrow to return to the entrance.

There are **no external libraries, CDNs, API keys, accounts, databases, trackers, or build steps**. The game uses the browser's built-in Canvas 2D API.

## Publish with GitHub Pages

1. This repository already contains the Housewalk game files on `main`.
2. In the repository, open **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: /(root)**, then save.
3. Once GitHub Pages publishes, open `https://StevenChua1122.github.io/housewalk-home/` in Safari or Chrome.

**Privacy warning:** GitHub Pages sites normally are public on the internet, even when a paid account allows the repository to be private. Do not upload address details, real photos, or other private data unless you're comfortable sharing them publicly. This prototype itself does not include the supplied source video or source plan images.

## Test checklist

- [ ] On mobile Safari, the room appears behind the controls (not a blank background)
- [ ] Joystick moves through the entrance, dining, and living zones
- [ ] Swiping rotates the view; no browser page scrolling
- [ ] Tour cycles through kitchen, bedroom, bathroom and resets
- [ ] Tapping Plan shows the mirrored plan with dining left of the entry-to-living route
- [ ] Bedroom and bathroom doors toggle when nearby
- [ ] Day/night toggle works
- [ ] PC keyboard and mouse controls work

## Development

Open `index.html` in a browser or host this folder with a static local server (`python3 -m http.server 8000`). There is no `npm install` step.

Codex guidance lives in [AGENTS.md](AGENTS.md). Development should use a feature branch and pull request; review the changes before merging to `main` because GitHub Pages may auto-publish after a merge.