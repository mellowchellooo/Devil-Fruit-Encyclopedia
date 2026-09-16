function getTypeLabel(fruit, category) {
  if (category === 'Zoan' && fruit.subtype) return fruit.subtype;
  return category;
}

function initPage(fruits, category) {
  const grid = document.getElementById('fruit-grid');
  const search = document.getElementById('search');
  const countEl = document.getElementById('fruit-count');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let activeFilter = 'all';
  let shown = fruits;

  function matchesFilter(f) {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'awakened') return f.awakened;
    if (activeFilter === 'artificial') return f.artificial;
    return f.subtype === activeFilter;
  }

  function matchesSearch(f, q) {
    return f.name.toLowerCase().includes(q) ||
      f.englishName.toLowerCase().includes(q) ||
      f.ability.toLowerCase().includes(q) ||
      f.currentOwner.toLowerCase().includes(q) ||
      (f.previousOwners || []).some(o => o.toLowerCase().includes(q)) ||
      f.arc.toLowerCase().includes(q);
  }

  function renderGrid(list) {
    if (list.length === 0) {
      grid.innerHTML = '<div class="empty-state">No fruits found.</div>';
      return;
    }
    grid.innerHTML = list.map((f, i) => {
      const typeLabel = getTypeLabel(f, category);
      return `
        <div class="fruit-card" data-index="${i}">
          <div class="fruit-card-top">
            <span class="fruit-card-type fruit-card-type--${typeLabel}">${typeLabel}</span>
            <span class="fruit-card-badges">
              ${f.artificial ? '<span class="fruit-card-artificial">Artificial</span>' : ''}
              ${f.awakened ? '<span class="fruit-card-awakened">Awakened</span>' : ''}
            </span>
          </div>
          <div class="fruit-card-name">${f.name}</div>
          <div class="fruit-card-english">${f.englishName}</div>
          <p class="fruit-card-ability">${f.ability}</p>
          <div class="fruit-card-footer">
            <span class="fruit-card-owner">${f.currentOwner}</span>
            <span class="fruit-card-chapter">${f.chapter ? 'Ch. ' + f.chapter : '—'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function update() {
    const q = search.value.toLowerCase().trim();
    shown = fruits.filter(f => matchesFilter(f) && (!q || matchesSearch(f, q)));
    countEl.textContent = (activeFilter === 'all' && !q)
      ? fruits.length + ' fruits documented'
      : shown.length + ' of ' + fruits.length + ' fruits';
    renderGrid(shown);
  }

  search.addEventListener('input', update);

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      update();
    });
  });

  grid.addEventListener('click', e => {
    const card = e.target.closest('.fruit-card');
    if (card) openModal(shown[card.dataset.index], category);
  });

  initModal();
  update();
}

function initModal() {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-close').onclick = closeModal;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function openModal(fruit, category) {
  const typeLabel = getTypeLabel(fruit, category);
  const bar = document.getElementById('modal-type-bar');
  bar.innerHTML = `<span class="modal-type-tag modal-type-tag--${typeLabel}">${typeLabel}</span>`;
  if (fruit.artificial) bar.innerHTML += `<span class="modal-type-tag modal-type-tag--artificial">Artificial</span>`;
  if (fruit.awakened) bar.innerHTML += `<span class="modal-type-tag modal-type-tag--awakened">Awakened</span>`;

  document.getElementById('modal-name').textContent = fruit.name;
  document.getElementById('modal-english').textContent = fruit.englishName;
  document.getElementById('modal-ability').textContent = fruit.ability;
  document.getElementById('modal-chapter').textContent = fruit.chapter ? 'Ch. ' + fruit.chapter : 'Unknown';
  document.getElementById('modal-arc').textContent = fruit.arc;

  const owners = document.getElementById('modal-owners');
  owners.innerHTML = (fruit.previousOwners || []).map(o =>
    `<li>${o} <span style="color:#aaa;font-size:11px;">(former)</span></li>`
  ).join('') + `<li class="current">${fruit.currentOwner}</li>`;

  const awakSection = document.getElementById('modal-awakening-section');
  if (fruit.awakened && fruit.awakeningAbility) {
    awakSection.style.display = 'block';
    document.getElementById('modal-awakening-text').textContent = fruit.awakeningAbility;
  } else {
    awakSection.style.display = 'none';
  }

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
