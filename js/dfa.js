// FLAT: Deterministic Finite Automata used to validate the simulator's inputs
(function (g) {
  class DFA {
    constructor(name, start, accept, edges, classify) {
      this.name = name; this.start = start; this.accept = accept; this.classify = classify;
      this.delta = {}; this.states = new Set([start, ...accept]); this.classes = new Set();
      for (const [from, cls, to] of edges) {
        (this.delta[from] = this.delta[from] || {})[cls] = to;
        this.states.add(from); this.states.add(to); this.classes.add(cls);
      }
    }
    run(str) {
      let s = this.start; const trace = [];
      for (const ch of str) {
        const cls = this.classify(ch);
        const next = (this.delta[s] || {})[cls] || 'DEAD';
        trace.push({ from: s, ch, cls, to: next });
        s = next;
        if (s === 'DEAD') break;
      }
      return { accepted: this.accept.includes(s), finalState: s, trace };
    }
  }

  const isDigit = c => c >= '0' && c <= '9';

  // L1 = (digit+ ,)* digit+      e.g. "100,500,1000"
  const sizeListDFA = new DFA('Input-size list', 'q0', ['q1'], [
    ['q0', 'digit', 'q1'], ['q1', 'digit', 'q1'], ['q1', 'comma', 'q2'], ['q2', 'digit', 'q1']
  ], c => isDigit(c) ? 'digit' : c === ',' ? 'comma' : 'other');

  // L2 = digit+ (. digit+)? (Hz | MHz | GHz)      e.g. "2.5GHz"
  const freqDFA = new DFA('Clock-rate', 'q0', ['q7'], [
    ['q0', 'digit', 'q1'], ['q1', 'digit', 'q1'], ['q1', 'dot', 'q2'], ['q2', 'digit', 'q3'], ['q3', 'digit', 'q3'],
    ['q1', 'M', 'q4'], ['q3', 'M', 'q4'], ['q1', 'G', 'q5'], ['q3', 'G', 'q5'],
    ['q1', 'H', 'q6'], ['q3', 'H', 'q6'], ['q4', 'H', 'q6'], ['q5', 'H', 'q6'], ['q6', 'Z', 'q7']
  ], c => isDigit(c) ? 'digit' : c === '.' ? 'dot' : 'MGHZ'.includes(c.toUpperCase()) ? c.toUpperCase() : 'other');

  function parseFrequency(str) {
    const s = str.replace(/\s+/g, '');
    const result = freqDFA.run(s);
    if (!result.accepted) return { ok: false, result };
    const m = /^([\d.]+)(hz|mhz|ghz)$/i.exec(s);
    const mult = { hz: 1, mhz: 1e6, ghz: 1e9 }[m[2].toLowerCase()];
    return { ok: true, hz: parseFloat(m[1]) * mult, result };
  }
  function parseSizes(str) {
    const s = str.replace(/\s+/g, '');
    const result = sizeListDFA.run(s);
    return { ok: result.accepted, sizes: result.accepted ? s.split(',').map(Number) : [], result };
  }

  const api = { DFA, sizeListDFA, freqDFA, parseFrequency, parseSizes };
  if (typeof module !== 'undefined') module.exports = api; else g.Automata = api;
})(typeof window !== 'undefined' ? window : globalThis);
