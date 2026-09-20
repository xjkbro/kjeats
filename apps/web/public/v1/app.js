/* ══════════════════════════════════════════════════════════
   FOODLOG — app.js
══════════════════════════════════════════════════════════ */

/* ── STATE ─────────────────────────────────────────────── */
let VIEW  = 'dashboard';
let DATA  = null;
let STACK = ['dashboard'];

/* Temp form state */
let tDishes = [], tIngredients = [], tSteps = [];

/* ── SAMPLE DATA ────────────────────────────────────────── */
const DB = {
  restaurants: [
    {
      id:'r1', emoji:'🍝', name:'The Golden Fork', cuisine:'Italian',
      location:'123 Broadway, Manhattan, NY', dateVisited:'2026-04-28',
      overallRating:4.5, priceRange:'$$',
      ratings:{ atmosphere:5, service:4, value:4 },
      review:'Absolutely phenomenal experience. The pasta was cooked to perfection, and the wine selection was impeccable. Will definitely return for their truffle risotto.',
      tags:['Fine Dining','Date Night'],
      dishes:[
        { id:'d1', name:'Truffle Risotto',  rating:5,   notes:'Buttery, rich, perfectly seasoned. Best I\'ve had in NYC.'    },
        { id:'d2', name:'Margherita Pizza', rating:4.5, notes:'Wood-fired with fresh mozzarella. Great char on the crust.'  },
        { id:'d3', name:'Tiramisu',         rating:5,   notes:'House-made. Perfect balance of coffee and mascarpone.'       },
      ]
    },
    {
      id:'r2', emoji:'🍱', name:'Sakura Garden', cuisine:'Japanese',
      location:'88 Flatbush Ave, Brooklyn, NY', dateVisited:'2026-05-01',
      overallRating:4.2, priceRange:'$$$',
      ratings:{ atmosphere:4, service:5, value:4 },
      review:"Exceptional omakase experience. The chef's attention to detail is remarkable. Fresh fish, beautiful presentation, and genuinely warm service.",
      tags:['Omakase','Special Occasion'],
      dishes:[
        { id:'d4', name:'Toro Sashimi', rating:5,   notes:'Melt-in-your-mouth fatty tuna. Incredible quality.' },
        { id:'d5', name:'Wagyu Nigiri', rating:4.5, notes:'Torched tableside. Rich and indulgent.'             },
        { id:'d6', name:'Miso Soup',    rating:3.5, notes:'Good but nothing extraordinary.'                    },
      ]
    },
    {
      id:'r3', emoji:'🌮', name:'La Cantina Mexicana', cuisine:'Mexican',
      location:'45 Jackson Ave, Queens, NY', dateVisited:'2026-05-06',
      overallRating:3.8, priceRange:'$',
      ratings:{ atmosphere:3, service:4, value:5 },
      review:'Authentic street food vibes with incredible value. The tacos al pastor are life-changing. Service can be slow on weekends but the food more than makes up for it.',
      tags:['Casual','Budget Friendly','Authentic'],
      dishes:[
        { id:'d7', name:'Tacos Al Pastor', rating:5,   notes:'Perfectly marinated pork with pineapple. Absolutely authentic.' },
        { id:'d8', name:'Guacamole',       rating:4,   notes:'Fresh, chunky, well-seasoned. Made tableside.'                  },
        { id:'d9', name:'Churros',         rating:3.5, notes:'Good but a bit greasy. Great cinnamon sugar ratio.'             },
      ]
    }
  ],
  recipes: [
    {
      id:'rec1', emoji:'🍕', name:'Homemade Margherita Pizza',
      category:'Italian', difficulty:'Medium',
      description:'A classic Neapolitan-style pizza with simple, high-quality ingredients. The key is the long dough fermentation and a scorching hot oven.',
      prepTime:20, cookTime:15, restTime:1440, servings:4,
      tags:['Italian','Vegetarian','Comfort Food'],
      ingredients:[
        { amount:'500', unit:'g',      name:'00 Flour (or bread flour)'  },
        { amount:'325', unit:'ml',     name:'Warm water'                 },
        { amount:'7',   unit:'g',      name:'Active dry yeast'           },
        { amount:'10',  unit:'g',      name:'Sea salt'                   },
        { amount:'1',   unit:'tbsp',   name:'Olive oil'                  },
        { amount:'200', unit:'ml',     name:'San Marzano tomato sauce'   },
        { amount:'250', unit:'g',      name:'Fresh mozzarella (torn)'    },
        { amount:'10',  unit:'leaves', name:'Fresh basil'                },
      ],
      steps:[
        'Dissolve yeast in warm water and let sit for 10 minutes until foamy.',
        'Mix flour and salt in a large bowl. Make a well and add the yeast mixture and olive oil.',
        'Knead for 8–10 minutes until smooth and elastic.',
        'Divide into 2 balls, cover, and refrigerate for 24–72 hours.',
        'Remove dough 2 hours before baking. Preheat oven to maximum (500°F+) with a pizza stone inside.',
        'Stretch dough by hand on a floured surface into a thin 12-inch round.',
        'Spread tomato sauce thinly leaving a 1-inch border. Add torn mozzarella.',
        'Bake for 8–12 minutes until crust is deeply charred and cheese is bubbling.',
        'Top with fresh basil immediately. Slice and serve hot.',
      ],
      nutrition:{
        servingSize:'2 slices (≈ 200g)', calories:480,
        totalFat:{v:16,dv:21}, saturatedFat:{v:7,dv:35}, transFat:{v:0},
        cholesterol:{v:35,dv:12}, sodium:{v:780,dv:34},
        totalCarbs:{v:66,dv:24}, fiber:{v:3,dv:11}, totalSugars:{v:4},
        addedSugars:{v:1,dv:2}, protein:{v:21},
        vitaminD:{v:0,dv:0}, calcium:{v:320,dv:25}, iron:{v:4.5,dv:25}, potassium:{v:380,dv:8}
      }
    },
    {
      id:'rec2', emoji:'🍛', name:'Chicken Tikka Masala',
      category:'Indian', difficulty:'Medium',
      description:'The ultimate comfort curry — tender charred chicken in a rich, aromatic tomato-cream sauce. Great for batch cooking and tastes even better the next day.',
      prepTime:30, cookTime:45, restTime:120, servings:6,
      tags:['Indian','Chicken','Curry','Meal Prep'],
      ingredients:[
        { amount:'900', unit:'g',     name:'Chicken breast, cubed'  },
        { amount:'200', unit:'ml',    name:'Full-fat yogurt'        },
        { amount:'2',   unit:'tbsp',  name:'Lemon juice'            },
        { amount:'2',   unit:'tsp',   name:'Garam masala'           },
        { amount:'1',   unit:'tsp',   name:'Kashmiri chili powder'  },
        { amount:'400', unit:'ml',    name:'Heavy cream'            },
        { amount:'800', unit:'g',     name:'Crushed tomatoes'       },
        { amount:'1',   unit:'large', name:'Yellow onion, minced'   },
      ],
      steps:[
        'Marinate chicken in yogurt, lemon juice, and half the spices for at least 2 hours (overnight is best).',
        'Grill or broil chicken on high until charred spots appear, about 8 minutes.',
        'Sauté onion in butter until deeply golden, about 12 minutes.',
        'Add garlic paste, ginger paste, and remaining spices. Cook 2 minutes until fragrant.',
        'Add crushed tomatoes and simmer 20 minutes until thickened.',
        'Blend sauce until smooth (optional). Return to pan.',
        'Add chicken and cream. Simmer 10–15 minutes until sauce coats the chicken.',
        'Finish with fresh cilantro and a pat of butter. Serve with basmati rice or naan.',
      ],
      nutrition:{
        servingSize:'1 serving (≈ 280g)', calories:385,
        totalFat:{v:20,dv:26}, saturatedFat:{v:11,dv:55}, transFat:{v:0},
        cholesterol:{v:120,dv:40}, sodium:{v:620,dv:27},
        totalCarbs:{v:14,dv:5}, fiber:{v:2,dv:7}, totalSugars:{v:8},
        addedSugars:{v:0,dv:0}, protein:{v:38},
        vitaminD:{v:1,dv:6}, calcium:{v:120,dv:9}, iron:{v:3.2,dv:18}, potassium:{v:620,dv:13}
      }
    },
    {
      id:'rec3', emoji:'🥑', name:'Avocado Toast Supreme',
      category:'American', difficulty:'Easy',
      description:'Elevated avocado toast with everything bagel seasoning, a soft poached egg, and chili flakes. Ready in 15 minutes and endlessly satisfying.',
      prepTime:10, cookTime:5, restTime:0, servings:2,
      tags:['Breakfast','Vegetarian','Quick','Healthy'],
      ingredients:[
        { amount:'2',  unit:'slices', name:'Sourdough bread, thick-cut'   },
        { amount:'2',  unit:'large',  name:'Ripe avocados'                 },
        { amount:'2',  unit:'large',  name:'Eggs (poached)'                },
        { amount:'1',  unit:'tbsp',   name:'Lemon juice'                   },
        { amount:'1',  unit:'tsp',    name:'Everything bagel seasoning'    },
        { amount:'¼',  unit:'tsp',    name:'Red chili flakes'              },
        { amount:'1',  unit:'pinch',  name:'Flaky sea salt'                },
      ],
      steps:[
        'Toast sourdough slices until deep golden and properly crispy.',
        'Halve avocados, remove pits, and scoop flesh into a bowl.',
        'Mash with lemon juice, salt, and pepper. Leave it slightly chunky.',
        'Poach eggs in simmering water with a splash of white vinegar for 3 minutes.',
        'Spread mashed avocado generously on each toast slice.',
        'Top each slice with a poached egg.',
        'Finish with everything bagel seasoning, chili flakes, and flaky salt.',
        'Serve immediately while the egg is still warm.',
      ],
      nutrition:{
        servingSize:'1 open-face toast (≈ 220g)', calories:410,
        totalFat:{v:28,dv:36}, saturatedFat:{v:5,dv:25}, transFat:{v:0},
        cholesterol:{v:185,dv:62}, sodium:{v:480,dv:21},
        totalCarbs:{v:32,dv:12}, fiber:{v:11,dv:39}, totalSugars:{v:2},
        addedSugars:{v:0,dv:0}, protein:{v:14},
        vitaminD:{v:1.5,dv:8}, calcium:{v:80,dv:6}, iron:{v:3,dv:17}, potassium:{v:810,dv:17}
      }
    }
  ]
};

/* Lookup maps for O(1) access */
const RMap = Object.fromEntries(DB.restaurants.map(r => [r.id, r]));
const PMap = Object.fromEntries(DB.recipes.map(r    => [r.id, r]));

/* ── UTILITIES ──────────────────────────────────────────── */
const uid    = () => '_' + Math.random().toString(36).substr(2, 9);
const fmtDate= s  => new Date(s).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' });
const fmtTime= m  => !m ? '—' : m < 60 ? `${m}m` : `${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}`;
const greet  = () => { const h = new Date().getHours(); return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'; };
const diffBadge = d => d === 'Easy' ? 'b-grn' : d === 'Medium' ? 'b-gold' : 'b-org';

function renderStars(n) {
  const full = Math.floor(n), half = n % 1 >= .5 ? 1 : 0, empty = 5 - full - half;
  return `<span class="stars">
    ${'<span class="star">★</span>'.repeat(full)}
    ${half ? '<span class="star" style="opacity:.5">★</span>' : ''}
    ${'<span class="star e">★</span>'.repeat(empty)}
    <span class="star-num">${n.toFixed(1)}</span>
  </span>`;
}

function starInput(key, val = 0) {
  const labels = ['Poor','Fair','Good','Great','Excellent'];
  return `<div class="star-inp" data-key="${key}">
    <input type="hidden" class="star-val" value="${val}">
    ${[1,2,3,4,5].map(i =>
      `<button type="button" class="star-inp-btn${i <= val ? ' on' : ''}" data-v="${i}" title="${labels[i-1]}">★</button>`
    ).join('')}
  </div>`;
}

function toast(msg, type = 'inf') {
  const icons = { ok:'✓', err:'✕', inf:'ℹ' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  document.getElementById('toasts').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0'; el.style.transition = 'opacity .3s';
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

/* ── NAVIGATION ─────────────────────────────────────────── */
function go(view, data = null) {
  const topLevel = ['dashboard','restaurants','recipes','profile'];
  if (topLevel.includes(view)) STACK = [view];
  else STACK.push(view);
  VIEW = view; DATA = data;
  render(); syncNav(); syncHeader();
  document.getElementById('main').scrollTop = 0;
}

function back() {
  if (STACK.length > 1) { STACK.pop(); VIEW = STACK[STACK.length - 1]; DATA = null; }
  render(); syncNav(); syncHeader();
  document.getElementById('main').scrollTop = 0;
}

function syncNav() {
  document.querySelectorAll('.nav-btn[data-view]').forEach(b => {
    const match = b.dataset.view === VIEW
      || (VIEW.includes('restaurant') && b.dataset.view === 'restaurants')
      || (VIEW.includes('recipe')     && b.dataset.view === 'recipes');
    b.classList.toggle('active', match);
  });
}

function syncHeader() {
  const topLevel = ['dashboard','restaurants','recipes','profile'];
  const isTop    = topLevel.includes(VIEW);
  document.getElementById('backBtn').classList.toggle('hidden', isTop);
  document.getElementById('brand').classList.toggle('hidden', !isTop);
  document.getElementById('srchBtn').classList.toggle('hidden', !isTop);
  const PT = document.getElementById('pageTtl');
  const titles = {
    restaurants:'Restaurants', recipes:'Recipes', profile:'Profile',
    'add-restaurant':'New Review', 'add-recipe':'New Recipe',
    'restaurant-detail': DATA?.name || 'Restaurant',
    'recipe-detail':     DATA?.name || 'Recipe',
  };
  isTop ? PT.classList.add('hidden') : (PT.textContent = titles[VIEW] || '', PT.classList.remove('hidden'));
}

function toggleSearch() {
  const bar = document.getElementById('srchBar');
  bar.classList.toggle('hidden');
  if (!bar.classList.contains('hidden')) document.getElementById('srchInput').focus();
}

/* ── ADD MENU ───────────────────────────────────────────── */
function openAddMenu()  { document.getElementById('addMenu').classList.remove('hidden'); }
function closeAddMenu() { document.getElementById('addMenu').classList.add('hidden');    }

/* ── RENDER ENGINE ──────────────────────────────────────── */
function render() {
  const views = {
    dashboard:           vDashboard,
    restaurants:         vRestaurants,
    'restaurant-detail': () => vRestaurantDetail(DATA),
    'add-restaurant':    vAddRestaurant,
    recipes:             vRecipes,
    'recipe-detail':     () => vRecipeDetail(DATA),
    'add-recipe':        vAddRecipe,
    profile:             vProfile,
  };
  const fn = views[VIEW];
  if (fn) { document.getElementById('main').innerHTML = fn(); afterRender(); }
}

function enableDragScroll(el) {
  if (el._dragBound) return;
  el._dragBound = true;
  let down = false, startX, startScroll;
  el.addEventListener('mousedown', e => {
    down = true;
    startX     = e.pageX;
    startScroll = el.scrollLeft;
    el.style.cursor     = 'grabbing';
    el.style.userSelect = 'none';
  });
  const stop = () => { down = false; el.style.cursor = ''; el.style.userSelect = ''; };
  el.addEventListener('mouseleave', stop);
  el.addEventListener('mouseup',    stop);
  el.addEventListener('mousemove', e => {
    if (!down) return;
    e.preventDefault();
    el.scrollLeft = startScroll - (e.pageX - startX);
  });
}

function afterRender() {
  /* Mouse-drag scroll on chip rows */
  document.querySelectorAll('.chips').forEach(enableDragScroll);

  /* Activate interactive star inputs */
  document.querySelectorAll('.star-inp').forEach(wrap => {
    const btns = wrap.querySelectorAll('.star-inp-btn');
    const inp  = wrap.querySelector('.star-val');
    btns.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        if (inp) inp.value = btn.dataset.v;
        btns.forEach((b, j) => b.classList.toggle('on', j <= i));
      });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   VIEWS
══════════════════════════════════════════════════════════ */

/* ── Dashboard ──────────────────────────────────────────── */
function vDashboard() {
  const { restaurants: rs, recipes: ps } = DB;
  const avg         = (rs.reduce((s,r) => s + r.overallRating, 0) / rs.length).toFixed(1);
  const totalDishes = rs.reduce((s, r) => s + r.dishes.length, 0);

  return `<div class="view">
    <div class="greet">
      <p class="greet-sub">Good ${greet()} 👋</p>
      <h2 class="greet-hd">Your Food <span>Journal</span></h2>
    </div>

    <div class="stats-grid">
      <div class="stat s-org" onclick="go('restaurants')">
        <div class="stat-ico">🍽️</div>
        <div class="stat-val">${rs.length}</div>
        <div class="stat-lbl">Restaurants</div>
        <div class="stat-up">+1</div>
      </div>
      <div class="stat s-gold" onclick="go('restaurants')">
        <div class="stat-ico">⭐</div>
        <div class="stat-val">${avg}</div>
        <div class="stat-lbl">Avg Rating</div>
      </div>
      <div class="stat s-teal" onclick="go('recipes')">
        <div class="stat-ico">📋</div>
        <div class="stat-val">${ps.length}</div>
        <div class="stat-lbl">Recipes</div>
        <div class="stat-up">+2</div>
      </div>
      <div class="stat s-purp">
        <div class="stat-ico">🍴</div>
        <div class="stat-val">${totalDishes}</div>
        <div class="stat-lbl">Dishes Rated</div>
      </div>
    </div>

    <div class="sec-row">
      <span class="sec-ttl">Recent Reviews</span>
      <button class="sec-link" onclick="go('restaurants')">See all</button>
    </div>
    ${rs.slice(0, 2).map(rCard).join('')}

    <div class="sec-row mt-5">
      <span class="sec-ttl">Recent Recipes</span>
      <button class="sec-link" onclick="go('recipes')">See all</button>
    </div>
    ${ps.slice(0, 2).map(pCard).join('')}
  </div>`;
}

/* ── Shared Card Templates ──────────────────────────────── */
function rCard(r) {
  return `<div class="card" onclick="go('restaurant-detail', RMap['${r.id}'])">
    <div class="card-top">
      <div class="card-ico">${r.emoji}</div>
      <div class="card-body">
        <div class="card-ttl">${r.name}</div>
        <div class="card-sub">
          <span>${r.cuisine}</span><span class="dot"></span>
          <span>${r.location.split(',').slice(1).join(',').trim()}</span>
        </div>
        <div class="card-tags">
          <span class="badge b-org">${r.priceRange}</span>
          ${r.tags.slice(0, 2).map(t => `<span class="badge b-blue">${t}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="card-foot">
      <div>
        ${renderStars(r.overallRating)}
        <div style="font-size:11px;color:var(--tx3);margin-top:3px;">${r.dishes.length} dishes · ${fmtDate(r.dateVisited)}</div>
      </div>
      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  </div>`;
}

function pCard(p) {
  const total = p.prepTime + p.cookTime;
  return `<div class="card" onclick="go('recipe-detail', PMap['${p.id}'])">
    <div class="card-top">
      <div class="card-ico">${p.emoji}</div>
      <div class="card-body">
        <div class="card-ttl">${p.name}</div>
        <div class="card-sub">
          <span>${p.category}</span><span class="dot"></span><span>${p.servings} servings</span>
        </div>
        <div class="card-tags">
          <span class="badge ${diffBadge(p.difficulty)}">${p.difficulty}</span>
          <span class="badge b-teal">⏱ ${fmtTime(total)}</span>
          ${p.tags.slice(0,1).map(t => `<span class="badge b-blue">${t}</span>`).join('')}
        </div>
      </div>
    </div>
    <div class="card-foot">
      <div style="font-size:12px;color:var(--tx2);">
        ${p.ingredients.length} ingredients · ${p.steps.length} steps<br>
        <span style="color:var(--tx3);">🔥 ${p.nutrition.calories} cal / serving</span>
      </div>
      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
    </div>
  </div>`;
}

/* ── Restaurants List ───────────────────────────────────── */
function vRestaurants() {
  return `<div class="view">
    <div class="chips">
      <button class="chip on" onclick="filterR('all')">All (${DB.restaurants.length})</button>
      <button class="chip" onclick="filterR('italian')">🍝 Italian</button>
      <button class="chip" onclick="filterR('japanese')">🍱 Japanese</button>
      <button class="chip" onclick="filterR('mexican')">🌮 Mexican</button>
      <button class="chip" onclick="filterR('top')">⭐ Top Rated</button>
    </div>
    <div id="rList">${DB.restaurants.map(rCard).join('')}</div>
  </div>`;
}

function filterR(t) {
  /* Update chip visual */
  document.querySelectorAll('.chips .chip').forEach(c => c.classList.remove('on'));
  event.currentTarget.classList.add('on');
  /* Filter */
  const filters = {
    italian:  r => r.cuisine === 'Italian',
    japanese: r => r.cuisine === 'Japanese',
    mexican:  r => r.cuisine === 'Mexican',
    top:      r => r.overallRating >= 4.2,
  };
  const items = filters[t] ? DB.restaurants.filter(filters[t]) : DB.restaurants;
  const list  = document.getElementById('rList');
  if (list) list.innerHTML = items.length
    ? items.map(rCard).join('')
    : `<div class="empty"><div class="empty-ico">🔍</div><div class="empty-ttl">No results</div><div class="empty-desc">No restaurants match this filter.</div></div>`;
}

/* ── Restaurant Detail ──────────────────────────────────── */
function vRestaurantDetail(r) {
  if (!r) return '';
  const pct = v => `${(v / 5) * 100}%`;
  return `<div class="view">
    <div class="hero">
      <span class="hero-emoji">${r.emoji}</span>
      <div class="hero-ttl">${r.name}</div>
      <div class="hero-meta"><span>📍 ${r.location}</span></div>
      <div class="hero-meta">
        <span>${r.cuisine}</span><span class="dot"></span>
        <span>${r.priceRange}</span><span class="dot"></span>
        <span>${fmtDate(r.dateVisited)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        ${renderStars(r.overallRating)}
        ${r.tags.map(t => `<span class="badge b-blue">${t}</span>`).join('')}
      </div>
    </div>

    <div class="sec-row"><span class="sec-ttl">Experience Ratings</span></div>
    <div style="background:var(--s1);border:1px solid var(--bdr-s);border-radius:var(--r4);padding:16px;margin-bottom:20px;">
      <div class="rbars">
        <div class="rbar-row"><span class="rbar-lbl">Atmosphere</span><div class="rbar-trk"><div class="rbar-fill" style="width:${pct(r.ratings.atmosphere)}"></div></div><span class="rbar-val">${r.ratings.atmosphere}</span></div>
        <div class="rbar-row"><span class="rbar-lbl">Service</span><div class="rbar-trk"><div class="rbar-fill" style="width:${pct(r.ratings.service)}"></div></div><span class="rbar-val">${r.ratings.service}</span></div>
        <div class="rbar-row"><span class="rbar-lbl">Value</span><div class="rbar-trk"><div class="rbar-fill" style="width:${pct(r.ratings.value)}"></div></div><span class="rbar-val">${r.ratings.value}</span></div>
      </div>
    </div>

    <div class="sec-row"><span class="sec-ttl">My Review</span></div>
    <div class="quote"><p>${r.review}</p></div>

    <div class="sec-row mt-5"><span class="sec-ttl">Dishes (${r.dishes.length})</span></div>
    ${r.dishes.map(d => `
      <div class="dish-card">
        <div class="dish-ico">🍴</div>
        <div class="dish-body">
          <div class="dish-name">${d.name}</div>
          <div class="dish-note">${d.notes}</div>
          ${renderStars(d.rating)}
        </div>
        <div class="dish-score">${d.rating}</div>
      </div>`).join('')}

    <div class="btn-row mt-5">
      <button class="btn btn-out btn-full">
        <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Review
      </button>
    </div>
  </div>`;
}

/* ── Add Restaurant Form ─────────────────────────────────── */
function vAddRestaurant() {
  tDishes = [{ id: uid() }];
  return `<div class="view">
  <form id="rForm" onsubmit="submitR(event)">

    <div class="fsec">
      <div class="fsec-ttl">Restaurant Info</div>
      <div class="fgrp">
        <label class="flbl">Name <span class="req">*</span></label>
        <input id="rName" class="fi" type="text" placeholder="e.g. The Golden Fork" required>
      </div>
      <div class="fgrp">
        <label class="flbl">Location / Address <span class="req">*</span></label>
        <input id="rLoc" class="fi" type="text" placeholder="e.g. 123 Broadway, New York, NY" required>
      </div>
      <div class="frow">
        <div class="fgrp mb-0">
          <label class="flbl">Cuisine <span class="req">*</span></label>
          <select id="rCuisine" class="fi">
            ${['American','Italian','Japanese','Mexican','Chinese','Indian','French','Mediterranean','Korean','Thai','Other'].map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="fgrp mb-0">
          <label class="flbl">Price Range</label>
          <select id="rPrice" class="fi">
            <option>$</option><option selected>$$</option><option>$$$</option><option>$$$$</option>
          </select>
        </div>
      </div>
    </div>

    <div class="fgrp">
      <label class="flbl">Date Visited</label>
      <input id="rDate" class="fi" type="date" value="${new Date().toISOString().split('T')[0]}">
    </div>

    <div class="fsec">
      <div class="fsec-ttl">Your Ratings</div>
      <div class="rate-grp"><div class="rate-grp-lbl">Overall Rating</div>${starInput('overall')}</div>
      <div class="rate-grp"><div class="rate-grp-lbl">Atmosphere</div>${starInput('atmosphere')}</div>
      <div class="rate-grp"><div class="rate-grp-lbl">Service</div>${starInput('service')}</div>
      <div class="rate-grp"><div class="rate-grp-lbl">Value for Money</div>${starInput('value')}</div>
    </div>

    <div class="fsec">
      <div class="fsec-ttl">Written Review</div>
      <div class="fgrp">
        <label class="flbl">Your Experience</label>
        <textarea id="rReview" class="fi" placeholder="Describe your dining experience, highlights, recommendations…"></textarea>
      </div>
      <div class="fgrp mb-0">
        <label class="flbl">Tags</label>
        <input id="rTags" class="fi" type="text" placeholder="Date Night, Romantic, Vegetarian…">
        <p class="fhint">Separate with commas</p>
      </div>
    </div>

    <div class="fsec">
      <div class="fsec-ttl">Dishes Tried</div>
      <div id="dfList" class="df-list">${dishFormItem(tDishes[0])}</div>
      <button type="button" class="add-row" onclick="addDish()">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Another Dish
      </button>
    </div>

    <div class="btn-row">
      <button type="button" class="btn btn-ghost" onclick="back()">Cancel</button>
      <button type="submit" class="btn btn-prim">
        <svg fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        Save Review
      </button>
    </div>

  </form></div>`;
}

function dishFormItem(d) {
  return `<div class="df-item" id="dfi-${d.id}">
    <div class="df-hdr">
      <span class="df-tag">Dish</span>
      <button type="button" class="rm-btn" onclick="removeDish('${d.id}')">✕</button>
    </div>
    <div class="fgrp"><input class="fi" type="text" placeholder="Dish name (e.g. Truffle Risotto)" id="dn-${d.id}"></div>
    <div class="fgrp"><label class="flbl">Rating</label>${starInput('d_' + d.id)}</div>
    <div class="fgrp mb-0"><textarea class="fi" style="min-height:68px;" placeholder="Notes about this dish…" id="dnt-${d.id}"></textarea></div>
  </div>`;
}

function addDish() {
  const d = { id: uid() };
  tDishes.push(d);
  const list = document.getElementById('dfList');
  if (list) { const t = document.createElement('div'); t.innerHTML = dishFormItem(d); list.appendChild(t.firstElementChild); afterRender(); }
}

function removeDish(id) {
  if (tDishes.length <= 1) { toast('At least one dish is required', 'err'); return; }
  tDishes = tDishes.filter(d => d.id !== id);
  document.getElementById('dfi-' + id)?.remove();
}

function submitR(e) {
  e.preventDefault();
  toast('Restaurant review saved!', 'ok');
  setTimeout(() => go('restaurants'), 500);
}

/* ── Recipes List ────────────────────────────────────────── */
function vRecipes() {
  return `<div class="view">
    <div class="chips">
      <button class="chip on" onclick="filterP('all')">All (${DB.recipes.length})</button>
      <button class="chip" onclick="filterP('easy')">🟢 Easy</button>
      <button class="chip" onclick="filterP('medium')">🟡 Medium</button>
      <button class="chip" onclick="filterP('breakfast')">🌅 Breakfast</button>
      <button class="chip" onclick="filterP('veg')">🥗 Vegetarian</button>
    </div>
    <div id="pList">${DB.recipes.map(pCard).join('')}</div>
  </div>`;
}

function filterP(t) {
  document.querySelectorAll('.chips .chip').forEach(c => c.classList.remove('on'));
  event.currentTarget.classList.add('on');
  const filters = {
    easy:      p => p.difficulty === 'Easy',
    medium:    p => p.difficulty === 'Medium',
    breakfast: p => p.tags.includes('Breakfast'),
    veg:       p => p.tags.includes('Vegetarian'),
  };
  const items = filters[t] ? DB.recipes.filter(filters[t]) : DB.recipes;
  const list  = document.getElementById('pList');
  if (list) list.innerHTML = items.length
    ? items.map(pCard).join('')
    : `<div class="empty"><div class="empty-ico">🔍</div><div class="empty-ttl">No results</div><div class="empty-desc">No recipes match this filter.</div></div>`;
}

/* ── Recipe Detail ───────────────────────────────────────── */
function vRecipeDetail(p) {
  if (!p) return '';
  const total = p.prepTime + p.cookTime + p.restTime;
  return `<div class="view">
    <div class="hero">
      <span class="hero-emoji">${p.emoji}</span>
      <div class="hero-ttl">${p.name}</div>
      <div class="hero-meta">
        <span>${p.category}</span><span class="dot"></span>
        <span>Serves ${p.servings}</span><span class="dot"></span>
        <span class="badge ${diffBadge(p.difficulty)}">${p.difficulty}</span>
      </div>
      <div class="hero-tags">${p.tags.map(t => `<span class="badge b-blue">${t}</span>`).join('')}</div>
    </div>

    <div class="info-grid">
      <div class="info-cell"><div class="info-lbl">Prep Time</div><div class="info-val">⏱ ${fmtTime(p.prepTime)}</div></div>
      <div class="info-cell"><div class="info-lbl">Cook Time</div><div class="info-val">🔥 ${fmtTime(p.cookTime)}</div></div>
      <div class="info-cell"><div class="info-lbl">Rest / Chill</div><div class="info-val">❄️ ${fmtTime(p.restTime)}</div></div>
      <div class="info-cell"><div class="info-lbl">Total</div><div class="info-val">⌚ ${fmtTime(total)}</div></div>
    </div>

    <div class="quote mb-5"><p>${p.description}</p></div>

    <div class="sec-row"><span class="sec-ttl">Ingredients (${p.servings} servings)</span></div>
    <div class="ing-disp mb-5">
      ${p.ingredients.map(i => `
        <div class="ing-drow">
          <span class="ing-dname"><span class="ing-ddot"></span>${i.name}</span>
          <span class="ing-damt">${i.amount} ${i.unit}</span>
        </div>`).join('')}
    </div>

    <div class="sec-row"><span class="sec-ttl">Instructions</span></div>
    <div class="steps mb-6">
      ${p.steps.map((s, i) => `
        <div class="step-row">
          <div class="step-num">${i + 1}</div>
          <div class="step-txt">${s}</div>
        </div>`).join('')}
    </div>

    <div class="sec-row"><span class="sec-ttl">Nutrition Facts</span></div>
    ${nfLabel(p.nutrition, p.servings)}

    <div class="btn-row">
      <button class="btn btn-out btn-full">
        <svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Recipe
      </button>
    </div>
  </div>`;
}

function nfLabel(n, servings = 4) {
  return `<div class="nf">
    <div class="nf-hdr"><div class="nf-hdr-t">Nutrition Facts</div></div>
    <div class="nf-serv"><strong>${servings} servings per container</strong><br>Serving size<span style="float:right;font-weight:700;">${n.servingSize}</span></div>
    <div class="nf-cal">
      <div><div class="nf-cal-l">Amount per serving</div><div class="nf-cal-l" style="font-size:22px;font-weight:900;">Calories</div></div>
      <div class="nf-cal-v">${n.calories}</div>
    </div>
    <div class="nf-dvhdr"><strong>% Daily Value*</strong></div>
    <div class="nf-row"><span><span class="nf-b">Total Fat</span> ${n.totalFat.v}g</span><span class="nf-pct">${n.totalFat.dv}%</span></div>
    <div class="nf-row s"><span>Saturated Fat ${n.saturatedFat.v}g</span><span class="nf-pct">${n.saturatedFat.dv}%</span></div>
    <div class="nf-row s"><span><em>Trans</em> Fat ${n.transFat.v}g</span><span></span></div>
    <div class="nf-row"><span><span class="nf-b">Cholesterol</span> ${n.cholesterol.v}mg</span><span class="nf-pct">${n.cholesterol.dv}%</span></div>
    <div class="nf-row"><span><span class="nf-b">Sodium</span> ${n.sodium.v}mg</span><span class="nf-pct">${n.sodium.dv}%</span></div>
    <div class="nf-row"><span><span class="nf-b">Total Carbohydrate</span> ${n.totalCarbs.v}g</span><span class="nf-pct">${n.totalCarbs.dv}%</span></div>
    <div class="nf-row s"><span>Dietary Fiber ${n.fiber.v}g</span><span class="nf-pct">${n.fiber.dv}%</span></div>
    <div class="nf-row s"><span>Total Sugars ${n.totalSugars.v}g</span><span></span></div>
    <div class="nf-row s2"><span>Includes ${n.addedSugars.v}g Added Sugars</span><span class="nf-pct">${n.addedSugars.dv}%</span></div>
    <div class="nf-row tk"><span><span class="nf-b">Protein</span> ${n.protein.v}g</span><span></span></div>
    <div class="nf-vits">
      <div class="nf-vit"><span>Vitamin D ${n.vitaminD.v}mcg</span><span>${n.vitaminD.dv}%</span></div>
      <div class="nf-vit"><span>Calcium ${n.calcium.v}mg</span><span>${n.calcium.dv}%</span></div>
      <div class="nf-vit"><span>Iron ${n.iron.v}mg</span><span>${n.iron.dv}%</span></div>
      <div class="nf-vit"><span>Potassium ${n.potassium.v}mg</span><span>${n.potassium.dv}%</span></div>
    </div>
    <div class="nf-foot">*The % Daily Value tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</div>
  </div>`;
}

/* ── Add Recipe Form ─────────────────────────────────────── */
const UNITS = ['g','kg','ml','L','tsp','tbsp','cup','oz','lb','piece','pinch','leaves','clove','slice'];

function vAddRecipe() {
  tIngredients = [{ id: uid() }];
  tSteps       = [{ id: uid() }];
  const nfFields = [
    ['Calories','kcal','nfCal'], ['Total Fat','g','nfFat'], ['Sat. Fat','g','nfSFat'],
    ['Trans Fat','g','nfTFat'], ['Cholesterol','mg','nfChol'], ['Sodium','mg','nfSod'],
    ['Total Carbs','g','nfCarb'], ['Dietary Fiber','g','nfFib'], ['Total Sugars','g','nfSug'],
    ['Added Sugars','g','nfASug'], ['Protein','g','nfPro'], ['Vitamin D','mcg','nfVitD'],
    ['Calcium','mg','nfCa'], ['Iron','mg','nfFe'], ['Potassium','mg','nfK'],
  ];

  return `<div class="view">
  <form id="pForm" onsubmit="submitP(event)">

    <div class="fsec">
      <div class="fsec-ttl">Recipe Info</div>
      <div class="fgrp">
        <label class="flbl">Recipe Name <span class="req">*</span></label>
        <input id="pName" class="fi" type="text" placeholder="e.g. Homemade Margherita Pizza" required>
      </div>
      <div class="fgrp">
        <label class="flbl">Description</label>
        <textarea id="pDesc" class="fi" style="min-height:76px;" placeholder="Brief description of the recipe…"></textarea>
      </div>
      <div class="frow">
        <div class="fgrp mb-0">
          <label class="flbl">Category</label>
          <select id="pCat" class="fi">
            ${['American','Italian','Japanese','Indian','Mexican','Mediterranean','French','Korean','Other'].map(c => `<option>${c}</option>`).join('')}
          </select>
        </div>
        <div class="fgrp mb-0">
          <label class="flbl">Difficulty</label>
          <select id="pDiff" class="fi"><option>Easy</option><option selected>Medium</option><option>Hard</option></select>
        </div>
      </div>
    </div>

    <div class="fsec">
      <div class="fsec-ttl">Timing &amp; Yield</div>
      <div class="frow">
        <div class="fgrp mb-0"><label class="flbl">Prep Time (min)</label><input id="pPrep" class="fi" type="number" placeholder="20" min="0"></div>
        <div class="fgrp mb-0"><label class="flbl">Cook Time (min)</label><input id="pCook" class="fi" type="number" placeholder="30" min="0"></div>
      </div>
      <div class="frow mt-4">
        <div class="fgrp mb-0"><label class="flbl">Rest / Chill (min)</label><input id="pRest" class="fi" type="number" placeholder="0" min="0"></div>
        <div class="fgrp mb-0"><label class="flbl">Servings <span class="req">*</span></label><input id="pServ" class="fi" type="number" placeholder="4" min="1" required></div>
      </div>
    </div>

    <div class="fsec">
      <div class="fsec-ttl">Tags</div>
      <div class="fgrp mb-0">
        <label class="flbl">Tags</label>
        <input id="pTags" class="fi" type="text" placeholder="Italian, Vegetarian, Quick…">
        <p class="fhint">Separate with commas</p>
      </div>
    </div>

    <div class="fsec">
      <div class="fsec-ttl">Ingredients</div>
      <div id="ingList" class="df-list">${ingredientFormItem(tIngredients[0])}</div>
      <button type="button" class="add-row" onclick="addIngredient()">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Ingredient
      </button>
    </div>

    <div class="fsec">
      <div class="fsec-ttl">Instructions</div>
      <div id="stepList" class="df-list">${stepFormItem(tSteps[0], 0)}</div>
      <button type="button" class="add-row" onclick="addStep()">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Step
      </button>
    </div>

    <div class="fsec">
      <div class="fsec-ttl">Nutrition (per serving, optional)</div>
      <div class="frow">
        ${nfFields.slice(0, 2).map(([lbl, unit, id]) => `<div class="fgrp mb-0"><label class="flbl">${lbl} (${unit})</label><input id="${id}" class="fi" type="number" placeholder="0" min="0"></div>`).join('')}
      </div>
      <div class="frow mt-4">
        ${nfFields.slice(2, 4).map(([lbl, unit, id]) => `<div class="fgrp mb-0"><label class="flbl">${lbl} (${unit})</label><input id="${id}" class="fi" type="number" placeholder="0" min="0"></div>`).join('')}
      </div>
      <div class="frow mt-4">
        ${nfFields.slice(4, 6).map(([lbl, unit, id]) => `<div class="fgrp mb-0"><label class="flbl">${lbl} (${unit})</label><input id="${id}" class="fi" type="number" placeholder="0" min="0"></div>`).join('')}
      </div>
      <div class="frow mt-4">
        ${nfFields.slice(6, 8).map(([lbl, unit, id]) => `<div class="fgrp mb-0"><label class="flbl">${lbl} (${unit})</label><input id="${id}" class="fi" type="number" placeholder="0" min="0"></div>`).join('')}
      </div>
      <div class="frow mt-4">
        ${nfFields.slice(8, 10).map(([lbl, unit, id]) => `<div class="fgrp mb-0"><label class="flbl">${lbl} (${unit})</label><input id="${id}" class="fi" type="number" placeholder="0" min="0"></div>`).join('')}
      </div>
      <div class="frow mt-4">
        ${nfFields.slice(10, 12).map(([lbl, unit, id]) => `<div class="fgrp mb-0"><label class="flbl">${lbl} (${unit})</label><input id="${id}" class="fi" type="number" placeholder="0" min="0"></div>`).join('')}
      </div>
      <div class="frow mt-4">
        ${nfFields.slice(12).map(([lbl, unit, id]) => `<div class="fgrp mb-0"><label class="flbl">${lbl} (${unit})</label><input id="${id}" class="fi" type="number" placeholder="0" min="0"></div>`).join('')}
      </div>
    </div>

    <div class="btn-row">
      <button type="button" class="btn btn-ghost" onclick="back()">Cancel</button>
      <button type="submit" class="btn btn-prim">
        <svg fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        Save Recipe
      </button>
    </div>

  </form></div>`;
}

function ingredientFormItem(ing) {
  return `<div class="df-item" id="ing-${ing.id}">
    <div class="df-hdr">
      <span class="df-tag">Ingredient</span>
      <button type="button" class="rm-btn" onclick="removeIngredient('${ing.id}')">✕</button>
    </div>
    <div class="frow">
      <div class="fgrp mb-0" style="flex:0 0 72px"><input class="fi" type="text" placeholder="Amt" id="ia-${ing.id}"></div>
      <div class="fgrp mb-0" style="flex:0 0 88px">
        <select class="fi" id="iu-${ing.id}">
          ${UNITS.map(u => `<option>${u}</option>`).join('')}
        </select>
      </div>
      <div class="fgrp mb-0" style="flex:1"><input class="fi" type="text" placeholder="Ingredient name" id="in-${ing.id}"></div>
    </div>
  </div>`;
}

function addIngredient() {
  const ing = { id: uid() };
  tIngredients.push(ing);
  const list = document.getElementById('ingList');
  if (list) { const t = document.createElement('div'); t.innerHTML = ingredientFormItem(ing); list.appendChild(t.firstElementChild); }
}

function removeIngredient(id) {
  if (tIngredients.length <= 1) { toast('At least one ingredient is required', 'err'); return; }
  tIngredients = tIngredients.filter(i => i.id !== id);
  document.getElementById('ing-' + id)?.remove();
}

function stepFormItem(step, index) {
  const num = (index !== undefined ? index : document.querySelectorAll('.step-fitem').length) + 1;
  return `<div class="df-item step-fitem" id="stp-${step.id}">
    <div class="df-hdr">
      <span class="df-tag">Step ${num}</span>
      <button type="button" class="rm-btn" onclick="removeStep('${step.id}')">✕</button>
    </div>
    <div class="fgrp mb-0">
      <textarea class="fi" style="min-height:68px;" placeholder="Describe this step…" id="st-${step.id}"></textarea>
    </div>
  </div>`;
}

function addStep() {
  const step = { id: uid() };
  tSteps.push(step);
  const list = document.getElementById('stepList');
  if (list) { const t = document.createElement('div'); t.innerHTML = stepFormItem(step, tSteps.length - 1); list.appendChild(t.firstElementChild); }
}

function removeStep(id) {
  if (tSteps.length <= 1) { toast('At least one step is required', 'err'); return; }
  tSteps = tSteps.filter(s => s.id !== id);
  document.getElementById('stp-' + id)?.remove();
  document.querySelectorAll('.step-fitem .df-tag').forEach((el, i) => { el.textContent = `Step ${i + 1}`; });
}

function submitP(e) {
  e.preventDefault();
  toast('Recipe saved!', 'ok');
  setTimeout(() => go('recipes'), 500);
}

/* ── Profile ─────────────────────────────────────────────── */
function vProfile() {
  const { restaurants: rs, recipes: ps } = DB;
  const allDishes  = rs.flatMap(r => r.dishes);
  const avg        = (rs.reduce((s, r) => s + r.overallRating, 0) / rs.length).toFixed(1);
  const topDish    = allDishes.reduce((best, d) => d.rating > (best?.rating ?? 0) ? d : best, null);
  const favCuisine = Object.entries(
    rs.reduce((acc, r) => { acc[r.cuisine] = (acc[r.cuisine] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return `<div class="view">
    <div class="hero" style="text-align:center;">
      <div class="avatar" style="width:72px;height:72px;font-size:26px;margin:0 auto 12px;">AJ</div>
      <div class="hero-ttl">Alex Johnson</div>
      <div class="hero-meta">Food enthusiast &amp; home chef</div>
    </div>

    <div class="stats-grid" style="margin-bottom:20px;">
      <div class="stat s-org">
        <div class="stat-ico">🍽️</div>
        <div class="stat-val">${rs.length}</div>
        <div class="stat-lbl">Reviews</div>
      </div>
      <div class="stat s-gold">
        <div class="stat-ico">⭐</div>
        <div class="stat-val">${avg}</div>
        <div class="stat-lbl">Avg Rating</div>
      </div>
      <div class="stat s-teal">
        <div class="stat-ico">📋</div>
        <div class="stat-val">${ps.length}</div>
        <div class="stat-lbl">Recipes</div>
      </div>
      <div class="stat s-purp">
        <div class="stat-ico">🍴</div>
        <div class="stat-val">${allDishes.length}</div>
        <div class="stat-lbl">Dishes</div>
      </div>
    </div>

    <div class="sec-row"><span class="sec-ttl">Food Insights</span></div>
    <div style="background:var(--s1);border:1px solid var(--bdr-s);border-radius:var(--r4);padding:16px;margin-bottom:20px;">
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--bdr-s);margin-bottom:12px;">
        <span style="font-size:13px;color:var(--tx2);min-width:110px;">Fav. Cuisine</span>
        <span style="font-size:14px;font-weight:600;">${favCuisine}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--bdr-s);margin-bottom:12px;">
        <span style="font-size:13px;color:var(--tx2);min-width:110px;">Top Dish</span>
        <span style="font-size:14px;font-weight:600;">${topDish ? topDish.name : '—'}</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:13px;color:var(--tx2);min-width:110px;">Top Score</span>
        <span style="font-size:14px;font-weight:600;">${topDish ? topDish.rating + ' ★' : '—'}</span>
      </div>
    </div>

    <div class="sec-row"><span class="sec-ttl">Settings</span></div>
    <div style="background:var(--s1);border:1px solid var(--bdr-s);border-radius:var(--r4);overflow:hidden;margin-bottom:32px;">
      ${[
        ['🔔','Notifications','Manage alerts'],
        ['🎨','Appearance','Dark mode enabled'],
        ['📤','Export Data','Download your journal'],
        ['ℹ️','About FoodLog','Version 1.0.0'],
      ].map(([ico, lbl, desc], i, arr) => `
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;${i < arr.length - 1 ? 'border-bottom:1px solid var(--bdr-s);' : ''}">
          <span style="font-size:20px;">${ico}</span>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:500;">${lbl}</div>
            <div style="font-size:12px;color:var(--tx3);">${desc}</div>
          </div>
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </div>`).join('')}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const prog    = document.querySelector('.ls-prog');
  const loading = document.getElementById('loading');
  const shell   = document.getElementById('shell');

  /* Animate progress bar then reveal the shell */
  let pct = 0;
  const tick = setInterval(() => {
    pct = Math.min(pct + Math.random() * 28, 90);
    if (prog) prog.style.width = pct + '%';
  }, 120);

  setTimeout(() => {
    clearInterval(tick);
    if (prog) prog.style.width = '100%';

    setTimeout(() => {
      if (loading) { loading.style.opacity = '0'; loading.style.transition = 'opacity .35s ease'; }
      setTimeout(() => {
        if (loading) loading.style.display = 'none';
        if (shell)   shell.classList.remove('hidden');
        render();
        syncNav();
        syncHeader();
      }, 350);
    }, 180);
  }, 800);
});
