// COA: CPU Performance Equation  ->  CPU time = (Instruction Count x CPI) / Clock Rate
(function (g) {
  function cpuTime({ ic, cpi, clockHz }) {
    const cycles = ic * cpi;
    return { cycles, seconds: cycles / clockHz };
  }
  // Model: each comparison / write is translated into a fixed number of machine instructions
  function estimateIC(counts, { perCompare, perWrite }) {
    return counts.comparisons * perCompare + counts.writes * perWrite;
  }
  const mips = (cpi, clockHz) => clockHz / (cpi * 1e6);
  function fmtTime(s) {
    if (s >= 1) return s.toFixed(3) + ' s';
    if (s >= 1e-3) return (s * 1e3).toFixed(3) + ' ms';
    if (s >= 1e-6) return (s * 1e6).toFixed(3) + ' \u00b5s';
    return (s * 1e9).toFixed(1) + ' ns';
  }
  const api = { cpuTime, estimateIC, mips, fmtTime };
  if (typeof module !== 'undefined') module.exports = api; else g.CPU = api;
})(typeof window !== 'undefined' ? window : globalThis);
