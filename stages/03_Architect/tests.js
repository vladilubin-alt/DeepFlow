/**
 * DeepFlow — Unit Tests for State Machine & Timer Logic
 *
 * Self-contained test runner (no external test framework needed).
 * Run:  node stages/03_Architect/tests.js
 */

import { GuillotineStateMachine, STATES, EVENTS } from './state_machine.js';
import { TimerController } from './timer_logic.js';
import { SyncService, MemoryStorage, SYNC_STATUS } from './sync_service.js';
import { execSync } from 'child_process';

// ── Minimal test harness ─────────────────────────────────────────
let _passed = 0;
let _failed = 0;
let _currentSuite = '';

function suite(name) {
  _currentSuite = name;
  console.log(`\n═══ ${name} ═══`);
}

function assert(condition, label) {
  if (condition) {
    _passed++;
    console.log(`  ✅ ${label}`);
  } else {
    _failed++;
    console.error(`  ❌ ${label}`);
  }
}

function assertEqual(actual, expected, label) {
  assert(actual === expected, `${label} — got "${actual}", expected "${expected}"`);
}

function summary() {
  console.log(`\n──────────────────────────────────────`);
  console.log(`  Total: ${_passed + _failed}  |  ✅ ${_passed}  |  ❌ ${_failed}`);
  console.log(`──────────────────────────────────────\n`);
  process.exit(_failed > 0 ? 1 : 0);
}

// ══════════════════════════════════════════════════════════════════
// TEST SUITES
// ══════════════════════════════════════════════════════════════════

// ── 1. State Machine: Basic transitions ──────────────────────────
suite('State Machine — Basic Transitions');

{
  const sm = new GuillotineStateMachine({ graceTokens: 3 });

  assertEqual(sm.state, STATES.IDLE, 'Initial state is idle');

  sm.send(EVENTS.START);
  assertEqual(sm.state, STATES.WRITING, 'START → writing');

  sm.send(EVENTS.IDLE_TIMEOUT);
  assertEqual(sm.state, STATES.WARNING, 'IDLE_TIMEOUT → warning');

  sm.send(EVENTS.KEYSTROKE);
  assertEqual(sm.state, STATES.WRITING, 'KEYSTROKE in warning → writing');
}

// ── 2. State Machine: Guillotine path ────────────────────────────
suite('State Machine — Guillotine Path');

{
  const sm = new GuillotineStateMachine({ graceTokens: 3 });

  sm.send(EVENTS.START);
  sm.send(EVENTS.IDLE_TIMEOUT);
  sm.send(EVENTS.GUILLOTINE_TIMEOUT);

  assertEqual(sm.state, STATES.GUILLOTINED, 'GUILLOTINE_TIMEOUT → guillotined');
  assert(sm.ctx.guillotineTriggered === true, 'guillotineTriggered flag is set');
}

// ── 3. State Machine: Grace Token rescue ─────────────────────────
suite('State Machine — Grace Token Rescue');

{
  const sm = new GuillotineStateMachine({ graceTokens: 2 });

  sm.send(EVENTS.START);
  sm.send(EVENTS.IDLE_TIMEOUT);
  sm.send(EVENTS.GUILLOTINE_TIMEOUT);
  assertEqual(sm.state, STATES.GUILLOTINED, 'Reached guillotined');

  sm.send(EVENTS.USE_GRACE_TOKEN);
  assertEqual(sm.state, STATES.SAVED_BY_GRACE, 'Grace token → saved_by_grace');
  assertEqual(sm.ctx.graceTokens, 1, 'Grace tokens decremented to 1');
  assert(sm.ctx.graceTokenUsed === true, 'graceTokenUsed flag set');

  sm.send(EVENTS.KEYSTROKE);
  assertEqual(sm.state, STATES.WRITING, 'KEYSTROKE after grace → writing');
}

// ── 4. State Machine: Grace Token exhaustion ─────────────────────
suite('State Machine — Grace Token Exhaustion Guard');

{
  const sm = new GuillotineStateMachine({ graceTokens: 0 });
  let guardRejected = false;
  sm.on('guard_rejected', () => { guardRejected = true; });

  sm.send(EVENTS.START);
  sm.send(EVENTS.IDLE_TIMEOUT);
  sm.send(EVENTS.GUILLOTINE_TIMEOUT);

  const ok = sm.send(EVENTS.USE_GRACE_TOKEN);
  assert(ok === false, 'USE_GRACE_TOKEN rejected when tokens = 0');
  assert(guardRejected, 'guard_rejected event emitted');
  assertEqual(sm.state, STATES.GUILLOTINED, 'State remains guillotined');
}

// ── 5. State Machine: Give Up ────────────────────────────────────
suite('State Machine — Give Up');

{
  const sm = new GuillotineStateMachine();
  sm.send(EVENTS.START);
  sm.send(EVENTS.IDLE_TIMEOUT);
  sm.send(EVENTS.GUILLOTINE_TIMEOUT);
  sm.send(EVENTS.GIVE_UP);

  assertEqual(sm.state, STATES.IDLE, 'GIVE_UP → idle');
}

// ── 6. State Machine: Session Completion ─────────────────────────
suite('State Machine — Session Completion');

{
  const sm = new GuillotineStateMachine();
  sm.send(EVENTS.START);
  sm.send(EVENTS.SESSION_COMPLETE);

  assertEqual(sm.state, STATES.COMPLETED, 'SESSION_COMPLETE → completed');
  assertEqual(sm.sessionStatus, 'completed', 'sessionStatus = "completed"');

  sm.send(EVENTS.RESET);
  assertEqual(sm.state, STATES.IDLE, 'RESET → idle');
}

// ── 7. State Machine: Invalid transitions ignored ────────────────
suite('State Machine — Invalid Transitions');

{
  const sm = new GuillotineStateMachine();
  const ok1 = sm.send(EVENTS.KEYSTROKE); // idle → (no transition)
  assert(ok1 === false, 'KEYSTROKE in idle is ignored');
  assertEqual(sm.state, STATES.IDLE, 'State remains idle');

  sm.send(EVENTS.START);
  const ok2 = sm.send(EVENTS.START); // writing → (no START transition)
  assert(ok2 === false, 'START in writing is ignored');
  assertEqual(sm.state, STATES.WRITING, 'State remains writing');
}

// ── 8. State Machine: History tracking ───────────────────────────
suite('State Machine — History Tracking');

{
  const sm = new GuillotineStateMachine();
  sm.send(EVENTS.START);
  sm.send(EVENTS.IDLE_TIMEOUT);
  sm.send(EVENTS.KEYSTROKE);
  sm.send(EVENTS.SESSION_COMPLETE);

  const h = sm.history;
  assertEqual(h.length, 4, 'History has 4 entries');
  assertEqual(h[0].from, STATES.IDLE, 'First transition from idle');
  assertEqual(h[0].to, STATES.WRITING, 'First transition to writing');
  assertEqual(h[3].to, STATES.COMPLETED, 'Last transition to completed');
}

// ── 9. State Machine: Snapshot / Hydrate ─────────────────────────
suite('State Machine — Snapshot & Hydrate');

{
  const sm = new GuillotineStateMachine({ graceTokens: 5 });
  sm.send(EVENTS.START);
  sm.send(EVENTS.IDLE_TIMEOUT);

  const snap = sm.snapshot();
  assertEqual(snap.state, STATES.WARNING, 'Snapshot state = warning');
  assertEqual(snap.ctx.graceTokens, 5, 'Snapshot preserves ctx');

  const restored = GuillotineStateMachine.hydrate(snap);
  assertEqual(restored.state, STATES.WARNING, 'Hydrated state = warning');
  assertEqual(restored.ctx.graceTokens, 5, 'Hydrated ctx.graceTokens = 5');

  // Continue from hydrated state
  restored.send(EVENTS.KEYSTROKE);
  assertEqual(restored.state, STATES.WRITING, 'Hydrated machine accepts events');
}

// ── 10. State Machine: Transition events ─────────────────────────
suite('State Machine — Transition Events');

{
  const sm = new GuillotineStateMachine();
  const transitions = [];
  sm.on('transition', (entry) => transitions.push(entry));

  sm.send(EVENTS.START);
  sm.send(EVENTS.SESSION_COMPLETE);

  assertEqual(transitions.length, 2, 'Two transition events fired');
  assertEqual(transitions[0].to, STATES.WRITING, 'First event: → writing');
  assertEqual(transitions[1].to, STATES.COMPLETED, 'Second event: → completed');
}

// ── 11. State Machine: Word count updates ────────────────────────
suite('State Machine — Word Count Payload');

{
  const sm = new GuillotineStateMachine({ targetWords: 500 });
  sm.send(EVENTS.START);
  sm.send(EVENTS.IDLE_TIMEOUT);
  sm.send(EVENTS.KEYSTROKE, { wordsWritten: 150 });
  assertEqual(sm.ctx.wordsWritten, 150, 'wordsWritten updated from payload');
}

// ── 12. Sync Service: Local draft persistence ────────────────────
suite('Sync Service — Local Draft Persistence');

{
  const storage = new MemoryStorage();
  const sync = new SyncService({
    supabaseUrl: null,
    supabaseKey: null,
    storage,
  });

  sync.saveDraftLocally('session-123', 'Hello world', 2);

  const draft = sync.getLocalDraft('session-123');
  assert(draft !== null, 'Draft saved locally');
  assertEqual(draft.content, 'Hello world', 'Draft content matches');
  assertEqual(draft.wordCount, 2, 'Draft word count matches');
  assert(draft.synced === false, 'Draft marked as unsynced');

  sync.destroy();
}

// ── 13. Sync Service: Status changes ─────────────────────────────
suite('Sync Service — Status Management');

{
  const sync = new SyncService({
    supabaseUrl: null,
    supabaseKey: null,
  });

  assertEqual(sync.status, SYNC_STATUS.IDLE, 'Initial status is idle');

  const statuses = [];
  sync.onStatusChange((s) => statuses.push(s));

  // Trigger a save — since supabaseUrl is null, it should go OFFLINE
  sync.saveSession({ id: 'test-1' });
  assert(statuses.includes(SYNC_STATUS.OFFLINE), 'Status went offline with no URL');

  sync.destroy();
}

// ── 14. Sync Service: Multiple drafts ────────────────────────────
suite('Sync Service — Multiple Drafts');

{
  const storage = new MemoryStorage();
  const sync = new SyncService({ storage });

  sync.saveDraftLocally('s1', 'Draft one', 2);
  sync.saveDraftLocally('s2', 'Draft two more words', 4);

  const d1 = sync.getLocalDraft('s1');
  const d2 = sync.getLocalDraft('s2');

  assert(d1 !== null && d2 !== null, 'Both drafts exist');
  assertEqual(d1.content, 'Draft one', 's1 content correct');
  assertEqual(d2.content, 'Draft two more words', 's2 content correct');

  sync.destroy();
}

// ── 15. Keystroke Validation: Python Integration ─────────────────
suite('Smart Keystroke Validation (Python Integration)');

{
  const runValidation = (text) => {
    const out = execSync('python3 execution/validate_keystrokes.py', {
      input: text,
      encoding: 'utf-8'
    });
    return JSON.parse(out);
  };

  // Test 1: Valid text resets warning state
  const sm1 = new GuillotineStateMachine();
  sm1.send(EVENTS.START);
  sm1.send(EVENTS.IDLE_TIMEOUT);
  assertEqual(sm1.state, STATES.WARNING, 'Machine entered warning');

  const res1 = runValidation('Deep work session is starting now');
  assertEqual(res1.valid, true, 'Valid sentence approved by python');
  if (res1.valid) {
    sm1.send(EVENTS.KEYSTROKE);
  }
  assertEqual(sm1.state, STATES.WRITING, 'KEYSTROKE sent on valid text → writing');

  // Test 2: Gibberish text is rejected and does not reset warning state
  const sm2 = new GuillotineStateMachine();
  sm2.send(EVENTS.START);
  sm2.send(EVENTS.IDLE_TIMEOUT);
  assertEqual(sm2.state, STATES.WARNING, 'Machine in warning state');

  const res2 = runValidation('asdfghjkl');
  assertEqual(res2.valid, false, 'Gibberish rejected by python');
  if (res2.valid) {
    sm2.send(EVENTS.KEYSTROKE);
  }
  assertEqual(sm2.state, STATES.WARNING, 'KEYSTROKE blocked on gibberish → remains warning');
}

// ── Done ─────────────────────────────────────────────────────────
summary();
