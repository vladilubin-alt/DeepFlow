import { GuillotineStateMachine, STATES, EVENTS } from '../src/logic/GuillotineStateMachine';

describe('GuillotineStateMachine', () => {
  let machine;

  beforeEach(() => {
    machine = new GuillotineStateMachine({ graceTokens: 3, targetWords: 100, durationSeconds: 300 });
  });

  describe('initial state', () => {
    test('starts in IDLE', () => {
      expect(machine.state).toBe(STATES.IDLE);
    });

    test('has default context values', () => {
      expect(machine.ctx.graceTokens).toBe(3);
      expect(machine.ctx.targetWords).toBe(100);
      expect(machine.ctx.durationSeconds).toBe(300);
      expect(machine.ctx.wordsWritten).toBe(0);
    });

    test('sessionStatus is null in IDLE', () => {
      expect(machine.sessionStatus).toBeNull();
    });
  });

  describe('IDLE -> WRITING', () => {
    test('transitions on START', () => {
      const result = machine.send(EVENTS.START);
      expect(result).toBe(true);
      expect(machine.state).toBe(STATES.WRITING);
    });

    test('resets context on START', () => {
      machine.ctx.wordsWritten = 50;
      machine.send(EVENTS.START);
      expect(machine.ctx.wordsWritten).toBe(0);
      expect(machine.ctx.guillotineTriggered).toBe(false);
      expect(machine.ctx.graceTokenUsed).toBe(false);
      expect(machine.ctx.sessionStartedAt).toBeTruthy();
    });

    test('sessionStatus is active in WRITING', () => {
      machine.send(EVENTS.START);
      expect(machine.sessionStatus).toBe('active');
    });
  });

  describe('WRITING -> WARNING', () => {
    test('transitions on IDLE_TIMEOUT', () => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.IDLE_TIMEOUT);
      expect(machine.state).toBe(STATES.WARNING);
    });
  });

  describe('WARNING -> WRITING', () => {
    test('transitions on KEYSTROKE', () => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.IDLE_TIMEOUT);
      machine.send(EVENTS.KEYSTROKE, { wordsWritten: 10 });
      expect(machine.state).toBe(STATES.WRITING);
      expect(machine.ctx.wordsWritten).toBe(10);
    });
  });

  describe('WARNING -> GUILLOTINED', () => {
    test('transitions on GUILLOTINE_TIMEOUT', () => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.IDLE_TIMEOUT);
      machine.send(EVENTS.GUILLOTINE_TIMEOUT);
      expect(machine.state).toBe(STATES.GUILLOTINED);
      expect(machine.ctx.guillotineTriggered).toBe(true);
    });

    test('sessionStatus is guillotined', () => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.IDLE_TIMEOUT);
      machine.send(EVENTS.GUILLOTINE_TIMEOUT);
      expect(machine.sessionStatus).toBe('guillotined');
    });
  });

  describe('GUILLOTINED -> SAVED_BY_GRACE', () => {
    beforeEach(() => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.IDLE_TIMEOUT);
      machine.send(EVENTS.GUILLOTINE_TIMEOUT);
    });

    test('transitions on USE_GRACE_TOKEN when tokens available', () => {
      const result = machine.send(EVENTS.USE_GRACE_TOKEN);
      expect(result).toBe(true);
      expect(machine.state).toBe(STATES.SAVED_BY_GRACE);
      expect(machine.ctx.graceTokens).toBe(2);
      expect(machine.ctx.graceTokenUsed).toBe(true);
    });

    test('rejects when no grace tokens', () => {
      machine.ctx.graceTokens = 0;
      const result = machine.send(EVENTS.USE_GRACE_TOKEN);
      expect(result).toBe(false);
      expect(machine.state).toBe(STATES.GUILLOTINED);
    });

    test('emits guard_rejected when no tokens', () => {
      const listener = jest.fn();
      machine.on('guard_rejected', listener);
      machine.ctx.graceTokens = 0;
      machine.send(EVENTS.USE_GRACE_TOKEN);
      expect(listener).toHaveBeenCalledWith({
        event: EVENTS.USE_GRACE_TOKEN,
        state: STATES.GUILLOTINED,
      });
    });
  });

  describe('GUILLOTINED -> IDLE (give up)', () => {
    test('transitions on GIVE_UP', () => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.IDLE_TIMEOUT);
      machine.send(EVENTS.GUILLOTINE_TIMEOUT);
      machine.send(EVENTS.GIVE_UP);
      expect(machine.state).toBe(STATES.IDLE);
    });
  });

  describe('WRITING -> COMPLETED', () => {
    test('transitions on SESSION_COMPLETE', () => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.SESSION_COMPLETE);
      expect(machine.state).toBe(STATES.COMPLETED);
      expect(machine.sessionStatus).toBe('completed');
    });
  });

  describe('COMPLETED -> IDLE', () => {
    test('transitions on RESET', () => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.SESSION_COMPLETE);
      machine.send(EVENTS.RESET);
      expect(machine.state).toBe(STATES.IDLE);
    });
  });

  describe('invalid transitions', () => {
    test('rejects KEYSTROKE in IDLE', () => {
      expect(machine.send(EVENTS.KEYSTROKE)).toBe(false);
      expect(machine.state).toBe(STATES.IDLE);
    });

    test('rejects GUILLOTINE_TIMEOUT in WRITING', () => {
      machine.send(EVENTS.START);
      expect(machine.send(EVENTS.GUILLOTINE_TIMEOUT)).toBe(false);
    });

    test('rejects SESSION_COMPLETE in IDLE', () => {
      expect(machine.send(EVENTS.SESSION_COMPLETE)).toBe(false);
    });
  });

  describe('event listeners', () => {
    test('emits transition events', () => {
      const listener = jest.fn();
      machine.on('transition', listener);
      machine.send(EVENTS.START);
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          from: STATES.IDLE,
          to: STATES.WRITING,
          event: EVENTS.START,
        })
      );
    });

    test('unsubscribe works', () => {
      const listener = jest.fn();
      const unsub = machine.on('transition', listener);
      machine.send(EVENTS.START);
      expect(listener).toHaveBeenCalledTimes(1);
      unsub();
      machine.send(EVENTS.IDLE_TIMEOUT);
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('full session flow', () => {
    test('idle -> writing -> warning -> guillotined -> grace -> writing', () => {
      machine.send(EVENTS.START);
      machine.send(EVENTS.IDLE_TIMEOUT);
      machine.send(EVENTS.GUILLOTINE_TIMEOUT);
      machine.send(EVENTS.USE_GRACE_TOKEN);
      machine.send(EVENTS.KEYSTROKE, { wordsWritten: 25 });
      expect(machine.state).toBe(STATES.WRITING);
      expect(machine.ctx.graceTokens).toBe(2);
      expect(machine.ctx.wordsWritten).toBe(25);
    });
  });
});
