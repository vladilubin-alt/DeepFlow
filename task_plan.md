# DeepFlow ADHD Writing Timer Task Plan

## Phases & Goals

### Phase B: Blueprint Discovery & Schema Definition
- [x] Answer the 5 Discovery Questions
- [x] Define JSON Data Schemas in `gemini.mmd`
- [x] Setup folder structures and environments

### Phase L: Connectivity & API Handshakes
- [/] Setup Supabase connection, schemas, and RLS policies
- [/] Configure environment variables in `.env`
- [ ] Verify connectivity and health check endpoints

### Phase A: Architecting the Smallest Useful Vertical Slice
- [ ] Core Timer logic implementation
- [ ] Forgiving Guillotine state machine
- [ ] Session tracking and state management

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
- [/] Initialize local Flutter/Dart and Python environment for development
- [ ] Set active Supabase credentials in `.env` and verify connectivity
- [ ] Apply SQL schema to Supabase and enable RLS
