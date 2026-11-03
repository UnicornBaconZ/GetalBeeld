(() => {
  const SHAPES = ['cirkel', 'vierkant', 'driehoek', 'ster'];

  const COLOR_TEXT_CLASS = {
    zwart: 'text-black',
    blauw: 'text-blue-600',
    rood: 'text-red-600',
    geel: 'text-yellow-400',
  };

  // One box = 10 objects in a 2-row x 5-column grid. The 4-4-2 split is purely
  // visual: three clusters (2, 2 and 1 columns wide) with some space between them.
  const CLUSTER_WIDTHS = [2, 2, 1];
  const ROWS = 2;
  const BOX_SIZE = 10;

  const state = {
    mode: 10,
    shape: 'cirkel',
    direction: 'rows',
    color: 'zwart',
    count: 0,
    hidden: false,
    // Color of each filled object (by position in counting order). Colors are
    // forgotten again as soon as objects are removed.
    cellColors: new Array(20).fill(null),
  };

  // Adds objects in the currently selected color, or removes objects from the end.
  function setCount(newCount) {
    for (let i = newCount; i < state.count; i += 1) {
      state.cellColors[i] = null;
    }
    for (let i = state.count; i < newCount; i += 1) {
      state.cellColors[i] = state.color;
    }
    state.count = newCount;
  }

  const modeToggle = document.getElementById('mode-toggle');
  const shapeToggle = document.getElementById('shape-toggle');
  const directionVijfBtn = document.getElementById('direction-vijf');
  const directionKwadraatBtn = document.getElementById('direction-kwadraat');
  const randomBtn = document.getElementById('random-btn');
  const displayArea = document.getElementById('display-area');
  const numberButtons = document.getElementById('number-buttons');
  const currentNumberWrapper = document.getElementById('current-number-wrapper');
  const currentNumberEl = document.getElementById('current-number');
  const colorButtons = document.querySelectorAll('.color-btn');

  function shapeInner(shape, filled) {
    if (shape === 'vierkant') {
      return filled
        ? '<rect x="2" y="2" width="20" height="20" rx="4" fill="currentColor"/>'
        : '<rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="2"/>';
    }
    if (shape === 'driehoek') {
      return filled
        ? '<polygon points="12,2 22,21 2,21" fill="currentColor"/>'
        : '<polygon points="12,3 20.5,20 3.5,20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>';
    }
    if (shape === 'ster') {
      const points =
        '12,2 14.9,9.3 22.5,9.5 16.5,14.6 18.6,22 12,17.8 5.4,22 7.5,14.6 1.5,9.5 9.1,9.3';
      return filled
        ? `<polygon points="${points}" fill="currentColor"/>`
        : `<polygon points="${points}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
    // cirkel (default)
    return filled
      ? '<circle cx="12" cy="12" r="10" fill="currentColor"/>'
      : '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>';
  }

  function shapeSvg(colorKey) {
    const filled = colorKey !== null;
    const colorClass = filled ? COLOR_TEXT_CLASS[colorKey] : 'text-slate-300';
    return `<svg viewBox="0 0 24 24" class="w-full h-full ${colorClass}">${shapeInner(state.shape, filled)}</svg>`;
  }

  // Returns, per cluster, the color (or null) of every cell in DOM order.
  function computeBoxColors(boxIndex) {
    const cells = [];
    let colStart = 0;
    CLUSTER_WIDTHS.forEach((width, cluster) => {
      for (let r = 0; r < ROWS; r += 1) {
        for (let c = 0; c < width; c += 1) {
          cells.push({ cluster, dom: r * width + c, r, gc: colStart + c });
        }
      }
      colStart += width;
    });

    // Vijfstructuur: fill the first row completely, then the next row.
    // Kwadraatbeeld: fill column by column, top to bottom.
    const sorted = cells
      .slice()
      .sort((a, b) =>
        state.direction === 'rows' ? a.r - b.r || a.gc - b.gc : a.gc - b.gc || a.r - b.r,
      );

    // Each cell knows its color (or null) and the number it stands for when clicked.
    const result = CLUSTER_WIDTHS.map((width) =>
      new Array(width * ROWS).fill(null).map(() => ({ colorKey: null, number: 0 })),
    );
    sorted.forEach((cell, rank) => {
      const globalRank = boxIndex * BOX_SIZE + rank;
      result[cell.cluster][cell.dom] = {
        colorKey: globalRank < state.count ? state.cellColors[globalRank] : null,
        number: globalRank + 1,
      };
    });
    return result;
  }

  function buildClusterPanel(width, cells) {
    const panel = document.createElement('div');
    panel.className = 'grid gap-3 p-2';
    panel.style.gridTemplateColumns = `repeat(${width}, minmax(0, 1fr))`;

    cells.forEach(({ colorKey, number }) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.setAttribute('aria-label', String(number));
      cell.className =
        'w-12 h-12 md:w-14 md:h-14 flex items-center justify-center cursor-pointer rounded-full hover:bg-sky-100 transition-colors';
      cell.innerHTML = shapeSvg(colorKey);
      // Clicking an object shows the number up to and including that object.
      cell.addEventListener('click', () => {
        state.hidden = false;
        setCount(number);
        render();
      });
      panel.appendChild(cell);
    });
    return panel;
  }

  function buildTenBox(boxIndex) {
    const box = document.createElement('div');
    box.className =
      'flex flex-wrap items-center justify-center gap-5 py-8 px-4 rounded-3xl bg-sky-50/60 border-4 border-dashed border-sky-300';
    const colors = computeBoxColors(boxIndex);
    CLUSTER_WIDTHS.forEach((width, cluster) => {
      box.appendChild(buildClusterPanel(width, colors[cluster]));
    });
    return box;
  }

  function renderDisplay() {
    displayArea.innerHTML = '';
    // One box per ten; 20-modus shows two boxes stacked.
    for (let b = 0; b < state.mode / BOX_SIZE; b += 1) {
      displayArea.appendChild(buildTenBox(b));
    }
  }

  function buildNumberButtonRow(from, to) {
    const row = document.createElement('div');
    row.className = 'flex flex-wrap justify-center gap-2';
    for (let n = from; n <= to; n += 1) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = String(n);
      const active = !state.hidden && n === state.count;
      btn.className = active
        ? 'w-12 h-12 flex items-center justify-center rounded-xl font-bold text-lg bg-sky-600 text-white ring-4 ring-sky-300 transition-colors'
        : 'w-12 h-12 flex items-center justify-center rounded-xl font-bold text-lg bg-slate-100 text-slate-700 hover:bg-slate-200 ring-4 ring-transparent transition-colors';
      btn.addEventListener('click', () => {
        state.hidden = false;
        setCount(n);
        render();
      });
      row.appendChild(btn);
    }
    return row;
  }

  function renderNumberButtons() {
    numberButtons.innerHTML = '';
    numberButtons.appendChild(buildNumberButtonRow(0, 10));
    if (state.mode === 20) {
      numberButtons.appendChild(buildNumberButtonRow(11, 20));
    }
  }

  function updateCurrentNumber() {
    currentNumberEl.textContent = String(state.count);
    currentNumberWrapper.classList.toggle('invisible', state.hidden);
  }

  function updateControlLabels() {
    modeToggle.textContent =
      state.mode === 10 ? 'Schakel naar 20-modus' : 'Schakel naar 10-modus';
  }

  function updateDirectionButtons() {
    const activeClasses = ['bg-amber-500', 'text-white', 'shadow-md'];
    const inactiveClasses = ['bg-transparent', 'text-amber-700'];
    const vijfActive = state.direction === 'rows';

    activeClasses.forEach((cls) => directionVijfBtn.classList.toggle(cls, vijfActive));
    inactiveClasses.forEach((cls) => directionVijfBtn.classList.toggle(cls, !vijfActive));

    activeClasses.forEach((cls) => directionKwadraatBtn.classList.toggle(cls, !vijfActive));
    inactiveClasses.forEach((cls) => directionKwadraatBtn.classList.toggle(cls, vijfActive));
  }

  function updateColorButtons() {
    colorButtons.forEach((btn) => {
      const active = btn.dataset.color === state.color;
      btn.classList.toggle('ring-4', active);
      btn.classList.toggle('ring-sky-500', active);
      btn.classList.toggle('ring-2', !active);
      btn.classList.toggle('ring-transparent', !active);
    });
  }

  function render() {
    renderDisplay();
    renderNumberButtons();
    updateCurrentNumber();
    updateControlLabels();
    updateDirectionButtons();
    updateColorButtons();
  }

  modeToggle.addEventListener('click', () => {
    state.mode = state.mode === 10 ? 20 : 10;
    if (state.count > state.mode) setCount(state.mode);
    render();
  });

  shapeToggle.addEventListener('click', () => {
    const idx = SHAPES.indexOf(state.shape);
    state.shape = SHAPES[(idx + 1) % SHAPES.length];
    render();
  });

  directionVijfBtn.addEventListener('click', () => {
    state.direction = 'rows';
    render();
  });

  directionKwadraatBtn.addEventListener('click', () => {
    state.direction = 'columns';
    render();
  });

  randomBtn.addEventListener('click', async () => {
    let value;
    try {
      const res = await fetch(`/api/random?max=${state.mode}`);
      value = (await res.json()).value;
    } catch (err) {
      value = Math.floor(Math.random() * (state.mode + 1));
    }
    state.hidden = true;
    // Start from scratch so every object has the selected color.
    setCount(0);
    setCount(value);
    render();
  });

  // Choosing a color only sets the color for balls added from now on.
  colorButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.color = btn.dataset.color;
      render();
    });
  });

  render();
})();
