# PRD — “StarkCAD” (working name)

*A webcam-only, hand-tracked CAD system that feels like Iron Man UI—fast, precise, and genuinely usable for real modeling.*

---

### 1) Summary

**StarkCAD** is a desktop CAD application (Windows/macOS) that lets users **model, edit, and assemble 3D parts using only a laptop webcam + hand tracking**, with optional mouse/keyboard as a fallback. The “Tony Stark” magic comes from:

* **Direct hand manipulation** (grab/rotate/pinch) that’s *predictable and low-latency*
* **Context-aware controls** (the software knows whether you’re selecting, sketching, transforming, or dimensioning)
* **AI copilots** for “do what I mean” CAD actions (constraints, feature creation, param edits, repair) powered by **Gemini 3 Pro** (or user-selectable models) ([Google Cloud Documentation][1])
* **On-device hand landmark tracking** using MediaPipe Hand Landmarker / Hands pipeline, with tracking mode for reduced latency ([Google AI for Developers][2])

---

### 2) Problem statement

CAD is powerful but **interaction-heavy**:

* Traditional CAD requires keyboard shortcuts, precise mouse control, menu hunting, and lots of mode switching.
* New users struggle with “how do I *do* the thing” more than geometry itself.
* Existing gesture/VR CAD options often require expensive hardware, controllers, or are not production-friendly.

**Webcam-only hand control is usually gimmicky** because it lacks:

* Reliable gesture recognition
* Strong visual feedback loops
* A safe “clutch” mechanism to prevent accidental edits
* CAD-native intent models (sketch vs transform vs dimension)
* Low-latency tracking and stabilization ([MediaPipe][3])

---

### 3) Goals & non-goals

**Goals (must hit):**

1. **Usable precision**: select edges/faces/vertices with ≥95% success after calibration.
2. **Low fatigue**: “micro-gestures” and clutching prevent gorilla-arm.
3. **Core CAD parity (MVP)**: sketches + constraints + extrude/revolve + fillet/chamfer + patterns + assemblies (basic mates).
4. **AI makes CAD faster, not weirder**: AI suggests and executes only when confidence is high and user intent is explicit.
5. **Privacy-first by default**: raw webcam frames never leave device unless user opts in.

**Non-goals (v1):**

* Full generative shape design (free-form topology optimization UI)
* Photorealistic rendering pipeline
* VR headset support (future expansion)

---

### 4) Target users (personas)

1. **Student Builder**: learning CAD; wants intuitive controls, guided constraints, easy dimensioning.
2. **Maker/3D Printer**: fast part iteration; needs STL export and param edits quickly.
3. **Mechanical Designer**: assemblies + revisions; cares about accuracy, constraints, and history tree.
4. **Presenter/Teacher**: wants “live modeling” demos with cinematic UI and minimal setup.

---

### 5) Key user journeys

#### Journey A — “First 5 minutes”

1. Launch → webcam permission → **lighting/position check**
2. Calibration: neutral pose + pinch strength + dominant hand
3. Tutorial: clutch, rotate/pan/zoom, select, confirm/cancel
4. User completes: sketch rectangle → dimension → extrude

**Success criteria:** user can create a dimensioned extrude without touching mouse.

#### Journey B — “Real part edit”

1. Import STEP
2. Select face → offset face → adjust dimension
3. Add hole pattern
4. Export STL

**Success criteria:** edit completed in ≤3 minutes with <2 accidental actions.

#### Journey C — “AI assist”

1. User says/types: “Put four M3 clearance holes on this flange, equally spaced.”
2. AI proposes: hole type + diameter + pattern parameters + references
3. User approves → feature created → constraints added

**Success criteria:** AI proposal is correct and editable in the history tree.

---

### 6) Core product requirements

#### 6.1 Functional requirements (P0 = must ship MVP)

**P0 CAD**

* Sketch on planes (XY/YZ/ZX + user-defined face plane)
* Constraints: coincident, parallel, perpendicular, equal, tangent, horizontal/vertical
* Dimensions: linear, angular, diameter/radius
* Features: extrude, revolve, cut, shell, fillet, chamfer
* Patterns: linear + circular
* Boolean ops: union/subtract/intersect
* History tree (feature timeline) with edit/rollback
* Import/export: STEP, IGES, STL, OBJ

**P0 Hand-first interaction**

* **Clutch gesture** (e.g., thumb-to-middle finger hold) to “arm” editing
* Navigation: orbit / pan / zoom
* Selection: ray-cast cursor + dwell highlight + pinch select
* Transform gizmos: translate/rotate handles + snapping
* Undo/redo via gesture + on-screen button
* Radial command menu (gesture-open)

**P0 Feedback & safety**

* Ghost-hand overlay + fingertip cursor + “armed/disarmed” indicator
* Snap indicators (grid/edge/vertex/face normal)
* Action confirmation for destructive ops
* “Panic” gesture to freeze tracking

**P0 AI assist (bounded)**

* Natural language command → proposes CAD macro (structured plan)
* Auto-constraint suggestions while sketching
* Constraint conflict explanations (“why it won’t solve”)
* “Select like this” AI helper (user points; AI resolves which face/edge likely intended)

#### 6.2 P1 (post-MVP)

* Assembly mates: planar, concentric, hinge, slider; simple kinematic playback
* 2D drawings: basic views + dimensions + title block
* AI “design intent repair” on imported dumb solids (infer planes, recognize holes/fillets)
* Gesture-customization editor (user remaps vocabulary)

#### 6.3 P2 (later)

* Real-time simulation previews (interference, simple motion)
* Collaborative sessions + shared cursor
* AR display mode (phone/tablet as second screen)

---

### 7) Interaction design: “Stark-grade” but practical

#### 7.1 Principles

* **Everything is clutch-gated.** No clutch = nothing edits.
* **Micro-gestures > big arm waves.** Reduce fatigue.
* **Two-hand grammar**:

  * Dominant hand: point/select/draw
  * Off-hand: mode modifier / depth adjust / menu / confirm

#### 7.2 Gesture vocabulary (default mapping)

**System**

* *Clutch (hold)*: arm input
* *Open palm (hold 0.5s)*: pause / freeze input
* *Fist + release*: cancel current tool

**Viewport**

* *Pinch + move (dominant)*: orbit (3D tumble)
* *Pinch + move (off-hand)*: pan
* *Two-hand pinch distance*: zoom
* *Two-hand twist*: roll camera (optional)

**Selection**

* *Point index*: hover highlight
* *Pinch click*: select
* *Pinch + drag*: box select (2D lasso)

**Sketch**

* *Point + clutch*: draw segment following fingertip
* *Pinch*: place point / end segment
* *Off-hand “tap air”*: toggle line/arc/rectangle/circle
* *Two-finger pinch (index+middle)*: constraint stamp mode (quick apply)

**Modeling**

* *Grab gesture on gizmo*: translate/rotate with snapping
* *Off-hand pinch wheel*: adjust numeric depth/increment (acts like a “virtual scroll”)

#### 7.3 Command access

* **Radial menu**: open with off-hand pinch-hold; items are large and “flickable”
* **Search bar**: optional keyboard; AI can also be the search (“create fillet 2mm”)
* **Context ribbon**: minimal; shows only tools valid for current selection

---

### 8) AI & CV system design

#### 8.1 Hand tracking (on-device)

* Use **MediaPipe Hand Landmarker / Hands** to detect **21 landmarks per hand**, handedness, and world coordinates ([Google AI for Developers][2])
* Run in “video stream” mode to reduce repeated detection and cut latency ([MediaPipe][3])
* Stabilization:

  * Temporal smoothing (EMA/Kalman)
  * Jitter suppression for fingertip cursor
  * Adaptive thresholds based on lighting + motion blur
* Occlusion handling:

  * Predictive tracking for 200–300ms
  * Reacquire with detection when confidence drops

#### 8.2 Gesture recognition

Hybrid approach:

1. **Rule-based** for high-confidence primitives (pinch, open palm, fist, point)
2. **ML temporal classifier** for nuanced gestures (twist, wheel, lasso intent)
3. **Contextual disambiguation**: same gesture means different things depending on:

   * active tool
   * selected entity types
   * cursor proximity to gizmos/handles
   * whether clutch is engaged

#### 8.3 AI copilot (Gemini 3 Pro)

* Gemini 3 Pro is used for **planning + interpretation**, not raw vision:

  * Convert natural language → **structured CAD plan** (features, references, constraints)
  * Explain constraint failures and propose fixes
  * Suggest param edits (“you changed thickness; keep hole centered?”)
* Model capability + multimodal scope documented by Google ([Google Cloud Documentation][1])
  **Important:** webcam frames stay local by default; AI gets **symbolic state** (feature tree, selection IDs, sketch graph) unless user explicitly opts in.

#### 8.4 “AI Guardrails”

* AI must always output:

  * a proposed action list
  * impacted features
  * reversible steps
  * confidence + reason
* Anything destructive requires explicit “Confirm” gesture/button.
* Never auto-run multi-step edits silently.

---

### 9) System architecture (high level)

**Client app (desktop)**

* Rendering: GPU-based (OpenGL/Metal/Vulkan via engine)
* CAD kernel: Parasolid/CGM-like equivalent (or open-source B-rep kernel) + constraint solver
* Input layer:

  * Webcam capture
  * Hand tracking inference (MediaPipe)
  * Gesture recognizer
  * Intent router → CAD command bus
* AI layer:

  * Local “intent hints” (lightweight)
  * Cloud LLM (Gemini 3 Pro) optional for NL commands and explanations ([Google Cloud Documentation][1])

**Cloud (optional)**

* LLM calls
* Account sync for settings, gesture profiles
* Telemetry (opt-in)

---

### 10) Privacy, safety, compliance

* **Default: on-device processing** for camera feed; do not upload frames.
* Clear camera indicator + “pause camera” hotkey.
* Opt-in data collection only (crash logs, anonymized gesture stats).
* Enterprise mode: fully offline AI (no cloud).

---

### 11) Performance targets (MVP)

* End-to-end interaction latency (frame → cursor update): **≤60ms target**, **≤90ms acceptable**
* Stable 30 FPS minimum on mid-range laptops
* Hand tracking confidence ≥0.8 in normal indoor lighting
* Accidental action rate: **<1 per 10 minutes** after onboarding
* Time-to-first-extrude: **<5 minutes**

(MediaPipe tracking optimizations for video streams are specifically designed to reduce latency ([MediaPipe][3]).)

---

### 12) Success metrics (what “hella good” means)

**Activation**

* % who complete onboarding + first part
* Time-to-first-dimensioned-extrude

**Core usage**

* Actions per minute (hand-only)
* Undo rate (proxy for misfires)
* Fatigue score (in-app quick survey)

**AI value**

* % AI suggestions accepted
* Editability: % AI-created features later modified successfully
* “Constraint fix” resolution rate

---

### 13) MVP scope & roadmap

**MVP (8–12 weeks)**

* Sketch + constraints + extrude/revolve
* Orbit/pan/zoom + selection + radial menu
* Fillet/chamfer + hole tool + simple patterns
* Import/export STL/STEP
* AI: NL → single-feature creation + constraint explanations

**V1 (next)**

* Assemblies + mates
* Drawing export
* AI “recognize features” on imported solids
* Gesture customization

**V2**

* Collaboration
* Simulation previews
* Optional AR second-screen viewer

---

### 14) Risks & mitigations

1. **Precision frustration**

   * Mitigation: snap-first design, clutch gating, large hit targets, zoom-to-select
2. **Lighting / camera variability**

   * Mitigation: setup wizard, adaptive thresholds, “high contrast mode”
3. **Fatigue**

   * Mitigation: micro-gestures, short-burst workflows, hybrid input always available
4. **AI hallucinating geometry**

   * Mitigation: strict structured plans + validations against CAD kernel + confirmations

---

### 15) Open questions (to resolve early)

* CAD kernel choice (licensing vs open-source B-rep)
* Constraint solver (performance vs robustness)
* Gesture set standardization vs customization from day 1
* Offline AI option for privacy-sensitive users

---

If you want, I can also generate:

* A **screen-by-screen UI spec** (onboarding, radial menu, sketch HUD, feature timeline)
* A **gesture grammar diagram** + state machine
* A **technical spec** for the recognition pipeline (confidence fusion, smoothing, intent routing)

[1]: https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro?utm_source=chatgpt.com "Gemini 3 Pro | Generative AI on Vertex AI"
[2]: https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker?utm_source=chatgpt.com "Hand landmarks detection guide | Google AI Edge"
[3]: https://mediapipe.readthedocs.io/en/latest/solutions/hands.html?utm_source=chatgpt.com "MediaPipe Hands - Read the Docs"
