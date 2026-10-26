# Algorithm Performance & CPU Cost Simulator

Micro Project integrating **DAA**, **COA** and **FLAT**. Pure HTML/CSS/JavaScript, no build step, no dependencies.

| Subject | Concept | Where in the code |
|---|---|---|
| DAA | Merge Sort and recurrence analysis (Module 2, Ch 2.8) | `js/sorting.js` (`mergeSort`, `recurrence`, `closedForm`) |
| COA | CPU performance equation (Module 3, Ch 3.14) | `js/cpu.js` (`cpuTime`, `estimateIC`) |
| FLAT | Deterministic Finite Automata (DFA) | `js/dfa.js` (`sizeListDFA`, `freqDFA`) |

## What it does
- Choose input sizes, input order (random / sorted / reversed) and algorithms (Merge, Quick, Insertion, Bubble).
- Shows comparisons, writes and **measured runtime** (wall-clock time of the JS code on your machine).
- Separately shows the **theoretical CPU time** = `Instruction count x CPI / Clock rate`, where instruction count is estimated from the operation counts. Measured runtime and theoretical CPU time are deliberately kept in separate, colour-coded columns.
- Compares measured Merge Sort comparisons with the recurrence `T(n) = T(floor(n/2)) + T(ceil(n/2)) + n - 1` and its closed form `n*ceil(lg n) - 2^ceil(lg n) + 1`.
- Two DFAs validate user input and show the state-by-state trace and transition table:
  - `L1 = (digit+ ,)* digit+` for the list of input sizes
  - `L2 = digit+ (. digit+)? (Hz | MHz | GHz)` for the clock rate

## Run
Open `index.html` in a browser. Or host it free with GitHub Pages (Settings > Pages > deploy from `main` branch, root).

## Test
```
node tests/test.js
```
Requires Node.js 16+. Covers sorting correctness, recurrence = closed form, comparison bounds, CPU equation scaling and DFA accept/reject cases.
