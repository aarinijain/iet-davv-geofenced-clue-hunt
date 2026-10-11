# DAVV Campus Quest · IET

**DAVV Campus Quest** is an interactive campus clue hunt designed for the students and visitors of the Institute of Engineering & Technology (IET), Devi Ahilya Vishwavidyalaya (DAVV), Indore. Players navigate the campus with a digital squad passport notebook, cracking trivia riddles, discovering campus landmarks, and stamping their passport with selfie verification.

---

## How a Checkpoint Works

Each checkpoint progresses through four sequential stages:

1. **Gatekeeper Quiz**: Squads crack a sealed multiple-choice question about campus history or trivia to break the wax seal.
2. **Location Clue & Search Area**: Once the seal breaks, a riddle clue reveals the destination. The map displays a dashed **150 m search area circle** (offset by 50 m from the target so the exact location remains a riddle). No exact distances are exposed.
3. **Arrival Verification**: The squad travels into the checkpoint's perimeter (40 m radius) and presses *"I have arrived"*. 
   - **3-Strikes Rule**: Three wrong arrival attempts outside the perimeter incur a **-50 point penalty** and permanently lock that stage with a VOID stamp.
4. **Squad Selfie**: Upon verified arrival, squads snap a live camera selfie (or upload photo) to receive the official green passport stamp and earn **+150 points**.

---

## How to Play

- **Live GPS Mode (On Campus)**: Walk across the IET DAVV campus with real-time GPS geolocation watching your movements as you hunt down each checkpoint.
- **Demo Mode (Remote Simulator)**: Test the entire game from anywhere using the on-screen walking simulator controls (nudge North, South, East, West, step sizes, or tap on the map) and quick teleportation buttons.

> **Demo Tools Configuration**: The constant `DEMO_TOOLS_ENABLED` in `src/App.tsx` turns the simulator panel, Live/Demo mode switch, and teleportation test tools on (`true`) or off (`false`) for pure live-GPS production events.

---

## Checkpoints List

The quest features six historic landmarks across the IET DAVV Indore campus:

1. **Checkpoint 1: M Block** — The historic academic wing and portico.
2. **Checkpoint 2: D Block** — Academic department block honoring Queen Ahilyabai Holkar.
3. **Checkpoint 3: Central Library** — The renovated campus library and reference archive.
4. **Checkpoint 4: IET Ground** — The main sports grounds for cricket, football, and athletics.
5. **Checkpoint 5: Canteen** — The student food hub famous for hot chai and Indori snacks.
6. **Checkpoint 6: Khandwa Road Entrance** — The campus gates meeting the highway.
