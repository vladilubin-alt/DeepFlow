# DeepFlow ADHD Writing Timer Task Plan

## Phases & Goals

### Phase B: Blueprint Discovery & Schema Definition
- [x] Answer the 5 Discovery Questions
- [x] Define JSON Data Schemas in `gemini.mmd`
- [x] Setup folder structures and environments

### Phase L: Connectivity & API Handshakes
- [x] Setup Supabase connection, schemas, and RLS policies
- [x] Configure environment variables in `.env`
- [x] Verify connectivity and health check endpoints

### Phase A: Architecting the Smallest Useful Vertical Slice
- [x] Core Timer logic implementation
- [x] Forgiving Guillotine state machine
- [x] Session tracking and state management
- [/] Layer 1: Create architecture documentation
  - [/] `architecture/guillotine_logic.md` (Consequence Tiers & Streak Preservation)
  - [/] `architecture/sync_protocol.md` (Cloud-Sync Guardrails & Graveyard protocol)
- [ ] Layer 3: Implement `execution/validate_keystrokes.py` (Smart Keystroke Validation)
- [ ] Logic Expansion:
  - [x] Expand state machine with Grace Token consumption (in `state_machine.js`)
  - [ ] Implement "Graveyard" (Tiered Vault) backup logic in `sync_service.js`
- [ ] Security Hardening:
  - [ ] Create and enable RLS policies on `graveyard` table via Supabase MCP
  - [ ] Verify server-side validation design
- [/] Install Node.js runtime and run test suite


### Phase S: Styling & Refinement
- [ ] Apple-esque minimalistic UI implementation
- [ ] Mascot integration and subtle micro-animations
- [ ] ADHD flares and interactive design polishing

### Phase T: Trigger & Deployment
- [ ] APK packaging
- [ ] Play Store / ASO metadata compilation

---

## Current Sprint Checklist
- [x] Create project structure and project memory files
- [x] Run discovery questions and halt for user response
- [x] Populate schemas in `gemini.mmd`
- [x] Generate SQL schema script ([supabase_schema.sql](file:///Users/vladi/Desktop/DeepFlow/stages/02_Link/supabase_schema.sql))
- [x] Set active Supabase credentials in `.env` and verify connectivity
- [x] Apply SQL schema to Supabase and enable RLS
- [x] Implement state machine, timer, sync service, session orchestrator
- [x] Bootstrap Node.js runtime and verify base test harness (44 tests passing)
- [/] Initialize Layer 1 Architecture documentation
- [ ] Implement Layer 3 `execution/validate_keystrokes.py` Smart Keystroke Validation
- [ ] Implement Graveyard backup logic and apply RLS policies for `graveyard`
- [ ] Run self-annealing check and verify logic integration


