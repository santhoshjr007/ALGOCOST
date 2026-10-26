const assert = require('assert');
const S = require('../js/sorting'), C = require('../js/cpu'), A = require('../js/dfa');
let pass = 0; const t = (name, fn) => { fn(); pass++; console.log('PASS', name); };

t('all sorts match native sort (random/sorted/reversed)', () => {
  for (const kind of ['random', 'sorted', 'reversed']) for (const n of [0, 1, 2, 7, 100, 1000]) {
    const d = S.generate(n, kind), exp = d.slice().sort((a, b) => a - b);
    for (const f of [S.mergeSort, S.quickSort, S.insertionSort, S.bubbleSort]) assert.deepStrictEqual(f(d).sorted, exp);
  }
});
t('recurrence equals closed form for n=1..500', () => { for (let n = 1; n <= 500; n++) assert.strictEqual(S.recurrence(n), S.closedForm(n)); });
t('known values T(1)=0 T(2)=1 T(4)=5 T(8)=17', () => [[1, 0], [2, 1], [4, 5], [8, 17]].forEach(([n, v]) => assert.strictEqual(S.recurrence(n), v)));
t('merge sort comparisons <= T(n) and >= (n/2)lg n - n', () => {
  for (const n of [10, 100, 1000, 5000]) for (const k of ['random', 'sorted', 'reversed']) {
    const c = S.mergeSort(S.generate(n, k)).comparisons;
    assert.ok(c <= S.recurrence(n)); assert.ok(c >= (n / 2) * Math.log2(n) - n);
  }
});
t('insertion sort: n-1 comparisons on sorted, n(n-1)/2 on reversed', () => {
  assert.strictEqual(S.insertionSort(S.generate(100, 'sorted')).comparisons, 99);
  assert.strictEqual(S.insertionSort(S.generate(100, 'reversed')).comparisons, 100 * 99 / 2);
});
t('merge sort uses fewer comparisons than bubble sort at n=2000', () =>
  assert.ok(S.mergeSort(S.generate(2000, 'random')).comparisons < S.bubbleSort(S.generate(2000, 'random')).comparisons));
t('CPU equation: 1e9 instr, CPI 2, 2GHz = 1 s', () => assert.strictEqual(C.cpuTime({ ic: 1e9, cpi: 2, clockHz: 2e9 }).seconds, 1));
t('doubling clock halves time; doubling CPI doubles time', () => {
  const b = C.cpuTime({ ic: 1e6, cpi: 1.5, clockHz: 1e9 }).seconds;
  assert.ok(Math.abs(C.cpuTime({ ic: 1e6, cpi: 1.5, clockHz: 2e9 }).seconds - b / 2) < 1e-15);
  assert.ok(Math.abs(C.cpuTime({ ic: 1e6, cpi: 3, clockHz: 1e9 }).seconds - 2 * b) < 1e-15);
});
t('estimateIC', () => assert.strictEqual(C.estimateIC({ comparisons: 10, writes: 5 }, { perCompare: 4, perWrite: 3 }), 55));
t('size-list DFA accepts valid', () => ['5', '100,500,1000', ' 1, 2 ,3 '].forEach(s => assert.ok(A.parseSizes(s).ok)));
t('size-list DFA rejects invalid', () => ['', ',5', '5,', '5,,6', '1.5', 'abc', '10;20'].forEach(s => assert.ok(!A.parseSizes(s).ok)));
t('frequency DFA accepts and converts', () => {
  assert.strictEqual(A.parseFrequency('2.5GHz').hz, 2.5e9); assert.strictEqual(A.parseFrequency('800 MHz').hz, 8e8);
  assert.strictEqual(A.parseFrequency('100hz').hz, 100);
});
t('frequency DFA rejects invalid', () => ['', 'GHz', '2.GHz', '.5GHz', '2.5', '2.5KHz', '2.5GHzz', '-2GHz'].forEach(s => assert.ok(!A.parseFrequency(s).ok)));
t('DFA reaches DEAD state on bad char', () => assert.strictEqual(A.sizeListDFA.run('12a').finalState, 'DEAD'));
console.log(`\n${pass} test groups passed`);
