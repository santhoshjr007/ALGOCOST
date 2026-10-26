// DAA: sorting algorithms with operation counting + Merge Sort recurrence analysis
(function (g) {
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // Merge Sort: T(n) = T(floor(n/2)) + T(ceil(n/2)) + O(n)
  function mergeSort(input) {
    const a = input.slice(), tmp = new Array(a.length);
    let comparisons = 0, writes = 0;
    (function sort(lo, hi) {
      if (hi - lo < 2) return;
      const mid = (lo + hi) >> 1;
      sort(lo, mid); sort(mid, hi);
      let i = lo, j = mid, k = lo;
      while (i < mid && j < hi) { comparisons++; tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++]; writes++; }
      while (i < mid) { tmp[k++] = a[i++]; writes++; }
      while (j < hi) { tmp[k++] = a[j++]; writes++; }
      for (let x = lo; x < hi; x++) { a[x] = tmp[x]; writes++; }
    })(0, a.length);
    return { sorted: a, comparisons, writes };
  }

  function insertionSort(input) {
    const a = input.slice(); let comparisons = 0, writes = 0;
    for (let i = 1; i < a.length; i++) {
      const key = a[i]; let j = i - 1;
      while (j >= 0) { comparisons++; if (a[j] > key) { a[j + 1] = a[j]; writes++; j--; } else break; }
      a[j + 1] = key; writes++;
    }
    return { sorted: a, comparisons, writes };
  }

  function bubbleSort(input) {
    const a = input.slice(); let comparisons = 0, writes = 0;
    for (let i = 0; i < a.length - 1; i++) {
      let swapped = false;
      for (let j = 0; j < a.length - 1 - i; j++) {
        comparisons++;
        if (a[j] > a[j + 1]) { const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; writes += 2; swapped = true; }
      }
      if (!swapped) break;
    }
    return { sorted: a, comparisons, writes };
  }

  function quickSort(input) {
    const a = input.slice(); let comparisons = 0, writes = 0;
    const swap = (i, j) => { if (i !== j) { const t = a[i]; a[i] = a[j]; a[j] = t; writes += 2; } };
    (function qs(lo, hi) {
      while (lo < hi) {
        swap((lo + hi) >> 1, hi);
        const p = a[hi]; let s = lo;
        for (let i = lo; i < hi; i++) { comparisons++; if (a[i] < p) { swap(i, s); s++; } }
        swap(s, hi);
        if (s - lo < hi - s) { qs(lo, s - 1); lo = s + 1; } else { qs(s + 1, hi); hi = s - 1; }
      }
    })(0, a.length - 1);
    return { sorted: a, comparisons, writes };
  }

  // Recurrence analysis (worst-case comparisons of Merge Sort)
  const memo = new Map();
  function recurrence(n) {            // T(n) = T(floor(n/2)) + T(ceil(n/2)) + n - 1, T(1)=0
    if (n <= 1) return 0;
    if (memo.has(n)) return memo.get(n);
    const v = recurrence(n >> 1) + recurrence(n - (n >> 1)) + n - 1;
    memo.set(n, v); return v;
  }
  function closedForm(n) {            // solved form: n*ceil(lg n) - 2^ceil(lg n) + 1
    if (n <= 1) return 0;
    const k = Math.ceil(Math.log2(n));
    return n * k - Math.pow(2, k) + 1;
  }

  // Deterministic input generation (seeded) so results are reproducible
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function generate(n, kind, seed = 42) {
    const r = rng(seed);
    const a = Array.from({ length: n }, () => Math.floor(r() * n * 10));
    if (kind === 'sorted') a.sort((x, y) => x - y);
    if (kind === 'reversed') a.sort((x, y) => y - x);
    return a;
  }

  // Measured runtime (wall-clock on THIS machine, in JS) - best of `reps` runs
  function measure(fn, data, reps = 3) {
    const first = fn(data); let best = Infinity;
    for (let r = 0; r < reps; r++) { const t = now(); fn(data); best = Math.min(best, now() - t); }
    return Object.assign({}, first, { ms: best });
  }
  function isSorted(a) { for (let i = 1; i < a.length; i++) if (a[i - 1] > a[i]) return false; return true; }

  const api = { mergeSort, insertionSort, bubbleSort, quickSort, recurrence, closedForm, generate, measure, isSorted };
  if (typeof module !== 'undefined') module.exports = api; else g.Sorting = api;
})(typeof window !== 'undefined' ? window : globalThis);
