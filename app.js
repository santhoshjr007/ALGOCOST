const $ = id => document.getElementById(id);
const ALGOS = {
  merge: ['Merge Sort', Sorting.mergeSort], quick: ['Quick Sort', Sorting.quickSort],
  insertion: ['Insertion Sort', Sorting.insertionSort], bubble: ['Bubble Sort', Sorting.bubbleSort]
};
const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626'];
const MAX_N = 10000;

function showDFA(dfa, raw, res) {
  const steps = res.trace.map(t => `<span class="chip ${t.to === 'DEAD' ? 'bad' : ''}">${t.from} \u2014${t.ch}\u2192 ${t.to}</span>`).join('');
  return `<h4>${dfa.name} DFA</h4><p>Input <code>${raw || '(empty)'}</code> \u2192 final state <b>${res.finalState}</b>:
    <b class="${res.accepted ? 'ok' : 'bad'}">${res.accepted ? 'ACCEPTED' : 'REJECTED'}</b></p><div>${steps}</div>`;
}
function tableOf(dfa) {
  const cls = [...dfa.classes], states = [...dfa.states].sort();
  return `<h4>${dfa.name} transition table <small>(\u2192 start, * accepting)</small></h4><table class="tt"><tr><th>\u03b4</th>${cls.map(c => `<th>${c}</th>`).join('')}</tr>` +
    states.map(s => `<tr><th>${s === dfa.start ? '\u2192 ' : ''}${s}${dfa.accept.includes(s) ? ' *' : ''}</th>${cls.map(c => `<td>${(dfa.delta[s] || {})[c] || '\u2205'}</td>`).join('')}</tr>`).join('') + '</table>';
}
function chart(xs, series) {
  const W = 620, H = 260, P = 44, maxX = Math.max(...xs), maxY = Math.max(1, ...series.flatMap(s => s.ys));
  const X = x => P + x / maxX * (W - 2 * P), Y = y => H - P - y / maxY * (H - 2 * P);
  let svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Comparisons vs n"><line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" stroke="currentColor"/><line x1="${P}" y1="${P / 2}" x2="${P}" y2="${H - P}" stroke="currentColor"/>
  <text x="${W / 2}" y="${H - 8}" text-anchor="middle" font-size="12" fill="currentColor">input size n (max ${maxX})</text>
  <text x="6" y="16" font-size="12" fill="currentColor">comparisons (max ${maxY.toLocaleString()})</text>`;
  series.forEach((s, i) => {
    const pts = xs.map((x, k) => `${X(x)},${Y(s.ys[k])}`).join(' ');
    svg += `<polyline points="${pts}" fill="none" stroke="${COLORS[i]}" stroke-width="2"/>` + xs.map((x, k) => `<circle cx="${X(x)}" cy="${Y(s.ys[k])}" r="3" fill="${COLORS[i]}"/>`).join('');
    svg += `<text x="${W - P - 110}" y="${P / 2 + i * 15}" font-size="12" fill="${COLORS[i]}">\u25cf ${s.name}</text>`;
  });
  return svg + '</svg>';
}

function run() {
  const err = $('err'); err.textContent = '';
  const sz = Automata.parseSizes($('sizes').value), fq = Automata.parseFrequency($('clock').value);
  $('dfa-out').innerHTML = showDFA(Automata.sizeListDFA, $('sizes').value.replace(/\s+/g, ''), sz.result) + showDFA(Automata.freqDFA, $('clock').value.replace(/\s+/g, ''), fq.result);
  if (!sz.ok) return err.textContent = 'Input sizes rejected by the DFA. Use comma-separated integers, e.g. 100,500,1000.';
  if (!fq.ok) return err.textContent = 'Clock rate rejected by the DFA. Use e.g. 2.5GHz, 800MHz.';
  const sizes = sz.sizes;
  if (sizes.some(n => n < 1 || n > MAX_N)) return err.textContent = `Each n must be between 1 and ${MAX_N}.`;
  const cpi = parseFloat($('cpi').value), pc = parseFloat($('ipc').value), pw = parseFloat($('ipw').value);
  if (!(cpi > 0 && pc >= 0 && pw >= 0)) return err.textContent = 'CPI must be > 0 and instruction counts must be \u2265 0.';
  const keys = Object.keys(ALGOS).filter(k => $('a-' + k).checked);
  if (!keys.length) return err.textContent = 'Select at least one algorithm.';

  const kind = $('kind').value, rows = [], byAlgo = {};
  for (const n of sizes) {
    const data = Sorting.generate(n, kind);
    for (const k of keys) {
      const r = Sorting.measure(ALGOS[k][1], data);
      const ic = CPU.estimateIC(r, { perCompare: pc, perWrite: pw });
      const t = CPU.cpuTime({ ic, cpi, clockHz: fq.hz });
      rows.push(`<tr><td>${ALGOS[k][0]}</td><td>${n}</td><td>${r.comparisons.toLocaleString()}</td><td>${r.writes.toLocaleString()}</td><td>${Sorting.isSorted(r.sorted) ? '\u2713' : '\u2717'}</td>
        <td class="m">${r.ms.toFixed(3)} ms</td><td class="t">${ic.toLocaleString()}</td><td class="t">${t.cycles.toLocaleString()}</td><td class="t">${CPU.fmtTime(t.seconds)}</td></tr>`);
      (byAlgo[k] = byAlgo[k] || []).push(r.comparisons);
    }
  }
  $('results').innerHTML = `<table><tr><th>Algorithm</th><th>n</th><th>Comparisons</th><th>Writes</th><th>Sorted?</th>
    <th class="m">Measured runtime<br><small>this machine, JS</small></th><th class="t">Instr. count<br><small>estimated</small></th><th class="t">Cycles<br><small>IC\u00d7CPI</small></th><th class="t">CPU time<br><small>IC\u00d7CPI/clock</small></th></tr>${rows.join('')}</table>
    <p class="note">Measured runtime is real wall-clock time of the JavaScript code on your machine. CPU time is a <b>theoretical estimate</b> from the CPU performance equation (${CPU.mips(cpi, fq.hz).toFixed(0)} MIPS). The two are not expected to match.</p>`;
  $('chart').innerHTML = chart(sizes, keys.map(k => ({ name: ALGOS[k][0], ys: byAlgo[k] })));

  const rec = sizes.map((n, i) => `<tr><td>${n}</td><td>${Sorting.recurrence(n).toLocaleString()}</td><td>${Sorting.closedForm(n).toLocaleString()}</td><td>${Math.round(n * Math.log2(n)).toLocaleString()}</td><td>${keys.includes('merge') ? byAlgo.merge[i].toLocaleString() : '-'}</td></tr>`).join('');
  $('recurrence').innerHTML = `<table><tr><th>n</th><th>T(n) from recurrence</th><th>Closed form n\u2308lg n\u2309 \u2212 2<sup>\u2308lg n\u2309</sup> + 1</th><th>n lg n</th><th>Measured Merge Sort comparisons (${kind})</th></tr>${rec}</table>`;
}

$('run').addEventListener('click', run);
['sizes', 'clock'].forEach(id => $(id).addEventListener('input', () => {
  const p = id === 'sizes' ? Automata.parseSizes($(id).value) : Automata.parseFrequency($(id).value);
  $(id).className = p.ok ? 'valid' : 'invalid';
}));
$('tables').innerHTML = tableOf(Automata.sizeListDFA) + tableOf(Automata.freqDFA);
run();
