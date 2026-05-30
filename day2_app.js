// Main Application Controller for HCLTech Cloud Security & Identity Session Activities
// Manages presentation views, dynamic interactive templates, selections, and scoring.
// Integrates DiagramRenderer creating unique, dynamic vector illustrations for all 34 states.
// Dynamic diagrams update states upon submission to visually show correct vs compromised configurations.

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});

class AppController {
  constructor() {
    this.currentView = 'hub'; // 'hub' | 'game' | 'results'
    this.activeModule = null;
    this.activeGame = null;
    this.currentDecisionIndex = 0;
    this.selectedOptionIndex = null;
    
    // Activity-specific states
    this.dragSelectedCardId = null; // for click-to-move in drag-drop
    this.dragPlacements = {};       // itemId -> "left" | "right"
    this.currentSwiperIndex = 0;    // for card swiper
    this.toggleStates = {};         // toggleId -> boolean
    this.sortingOrder = [];         // array of item objects
    
    // Interactive visual feedback states
    this.isCurrentStepResolved = false;
    this.isCurrentStepCorrect = false;

    // Scoring state
    this.score = 0;
    this.answersLog = []; // array of booleans (only for scenarios/swiper)
    this.completedGames = JSON.parse(localStorage.getItem('completed_games_day2')) || {};

    // DOM bindings
    this.hubView = document.getElementById('hub-view');
    this.moduleView = document.getElementById('module-view');
    this.gameView = document.getElementById('game-view');
    this.resultsView = document.getElementById('results-view');
  }

  init() {
    this.updateHUD();
    this.renderHub();

    // Global Action Listeners
    document.getElementById('btn-submit').addEventListener('click', () => this.submitSelection());
    document.getElementById('btn-next').addEventListener('click', () => this.nextStep());
    document.getElementById('btn-quit').addEventListener('click', () => this.quitToHub());
    document.getElementById('btn-results-quit').addEventListener('click', () => this.quitToHub());
    document.getElementById('btn-results-retry').addEventListener('click', () => {
      this.launchGame(this.activeModule.id, this.activeGame.id);
    });

    document.getElementById('btn-reveal-explanation').addEventListener('click', () => this.revealExplanation());

    // Module View Listeners
    document.getElementById('btn-module-back').addEventListener('click', () => {
      this.switchView('hub');
    });
    document.getElementById('btn-module-reset').addEventListener('click', () => {
      if (this.activeModule) {
        this.resetModuleProgress(this.activeModule.id);
      }
    });
  }

  updateHUD() {
    const tally = document.getElementById('hud-score-tally');
    if (!tally) return;

    if (this.activeGame) {
      const type = this.activeGame.type;
      let completedCount = 0;
      let totalCount = 5;

      if (type === 'scenario') {
        completedCount = this.currentDecisionIndex + (this.isCurrentStepResolved ? 1 : 0);
      } else if (type === 'swiper') {
        completedCount = this.currentSwiperIndex + (this.isCurrentStepResolved ? 1 : 0);
      } else if (type === 'drag_drop' || type === 'sorting' || type === 'toggle_dashboard') {
        completedCount = this.isCurrentStepResolved ? 1 : 0;
        totalCount = 1;
      }
      tally.textContent = `${completedCount} / ${totalCount}`;
    } else {
      tally.textContent = '0 / 5';
    }
  }

  // ==================== View Transitions ====================
  switchView(viewName) {
    this.currentView = viewName;
    this.hubView.style.display = viewName === 'hub' ? 'block' : 'none';
    this.moduleView.style.display = viewName === 'module' ? 'block' : 'none';
    this.gameView.style.display = viewName === 'game' ? 'grid' : 'none';
    this.resultsView.style.display = viewName === 'results' ? 'flex' : 'none';

    if (viewName === 'hub') {
      this.renderHub();
    }
  }

  // ==================== Hub Rendering ====================
  renderHub() {
    const modulesGrid = document.querySelector('.modules-grid');
    modulesGrid.innerHTML = ''; // clear

    window.gameData.modules.forEach((mod, modIdx) => {
      const card = document.createElement('div');
      card.className = 'collapsible-card';

      // Calculate completed activities count
      let completedCount = 0;
      mod.games.forEach(g => {
        if (this.completedGames[g.id] !== undefined) {
          completedCount++;
        }
      });
      const totalCount = mod.games.length;
      const progressLabel = completedCount === totalCount ? 
        `<span class="game-status-badge secured">Completed</span>` : 
        `<span class="game-status-badge" style="color: var(--neon-cyan); border: 1px solid rgba(0, 181, 226, 0.2); background: rgba(0, 181, 226, 0.03);">${completedCount} / ${totalCount} Done</span>`;

      card.innerHTML = `
        <div class="collapsible-card-header">
          <div class="collapsible-card-header-top">
            <span class="module-badge">Module 0${modIdx + 1}</span>
            <div class="collapsible-card-header-right">
              ${progressLabel}
              <span class="collapsible-card-chevron">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
          </div>
          <div class="collapsible-card-title">${mod.title}</div>
        </div>
        <div class="collapsible-card-content">
          <p class="collapsible-card-desc">${mod.description}</p>
          <div class="collapsible-card-actions">
            <span style="font-size:0.85rem; color:var(--text-muted);">${totalCount} Activities inside</span>
            <button class="btn-launch-game btn-enter-module" data-mod="${mod.id}" style="font-size:0.9rem; padding:8px 16px;">Open Module Page</button>
          </div>
        </div>
      `;

      // Toggle collapse on header click
      const header = card.querySelector('.collapsible-card-header');
      header.addEventListener('click', () => {
        const isExpanded = card.classList.contains('expanded');
        document.querySelectorAll('.modules-grid .collapsible-card').forEach(c => c.classList.remove('expanded'));
        if (!isExpanded) {
          card.classList.add('expanded');
        }
      });

      // Enter module page click listener
      const enterBtn = card.querySelector('.btn-enter-module');
      enterBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent header toggle click
        const modId = enterBtn.getAttribute('data-mod');
        this.launchModulePage(modId);
      });

      modulesGrid.appendChild(card);
    });
  }

  launchModulePage(modId) {
    this.activeModule = window.gameData.modules.find(m => m.id === modId);
    this.switchView('module');

    const titleEl = document.getElementById('module-view-title');
    const descEl = document.getElementById('module-view-desc');
    const gamesListEl = document.getElementById('module-games-list');

    titleEl.textContent = this.activeModule.title;
    descEl.textContent = this.activeModule.description;
    gamesListEl.innerHTML = ''; // clear

    this.activeModule.games.forEach((game, gameIdx) => {
      const card = document.createElement('div');
      card.className = 'collapsible-card';

      const isCompleted = this.completedGames[game.id] !== undefined;
      let statusBadge = '';
      let formatLabel = '';

      if (game.type === 'drag_drop') formatLabel = 'Drag & Drop';
      else if (game.type === 'swiper') formatLabel = 'Card Swiper';
      else if (game.type === 'toggle_dashboard') formatLabel = 'Dashboard Card';
      else if (game.type === 'sorting') formatLabel = 'Sequential Sorting';
      else formatLabel = 'Scenario MCQ';

      if (isCompleted) {
        statusBadge = `<span class="game-status-badge secured">Completed</span>`;
      } else {
        statusBadge = `<span class="game-status-badge" style="color: var(--neon-cyan); border: 1px solid rgba(0, 181, 226, 0.2); background: rgba(0, 181, 226, 0.03);">${formatLabel}</span>`;
      }

      card.innerHTML = `
        <div class="collapsible-card-header">
          <div class="collapsible-card-header-top">
            <span class="module-badge">Activity 0${gameIdx + 1}</span>
            <div class="collapsible-card-header-right">
              ${statusBadge}
              <span class="collapsible-card-chevron">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </span>
            </div>
          </div>
          <div class="collapsible-card-title">${game.title}</div>
        </div>
        <div class="collapsible-card-content">
          <h4 style="margin-bottom:8px; font-weight:700; color:var(--text-primary); font-size:1rem;">${game.subtitle}</h4>
          <p class="collapsible-card-desc">${game.description}</p>
          <div class="collapsible-card-actions">
            <span style="font-size:0.85rem; color:var(--text-muted);">Format: ${formatLabel}</span>
            <button class="btn-launch-game btn-start-activity" data-mod="${this.activeModule.id}" data-game="${game.id}" style="font-size:0.9rem; padding:8px 16px;">Start Activity</button>
          </div>
        </div>
      `;

      // Toggle collapse on header click
      const header = card.querySelector('.collapsible-card-header');
      header.addEventListener('click', () => {
        const isExpanded = card.classList.contains('expanded');
        gamesListEl.querySelectorAll('.collapsible-card').forEach(c => c.classList.remove('expanded'));
        if (!isExpanded) {
          card.classList.add('expanded');
        }
      });

      // Start activity click listener
      const startBtn = card.querySelector('.btn-start-activity');
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent header toggle click
        const modId = startBtn.getAttribute('data-mod');
        const gameId = startBtn.getAttribute('data-game');
        this.launchGame(modId, gameId);
      });

      gamesListEl.appendChild(card);
    });
  }

  resetModuleProgress(modId) {
    if (!confirm("Are you sure you want to reset progress for this module?")) return;
    
    const moduleToReset = window.gameData.modules.find(m => m.id === modId);
    if (!moduleToReset) return;

    moduleToReset.games.forEach(g => {
      delete this.completedGames[g.id];
    });

    localStorage.setItem('completed_games_day2', JSON.stringify(this.completedGames));
    this.updateHUD();
    this.launchModulePage(modId);
  }

  // ==================== Launch Activity ====================
  launchGame(modId, gameId) {
    this.activeModule = window.gameData.modules.find(m => m.id === modId);
    this.activeGame = this.activeModule.games.find(g => g.id === gameId);
    
    // Reset indicators
    this.currentDecisionIndex = 0;
    this.currentSwiperIndex = 0;
    this.score = 0;
    this.answersLog = [];
    this.selectedOptionIndex = null;
    this.dragSelectedCardId = null;
    this.dragPlacements = {};
    this.toggleStates = {};
    
    this.isCurrentStepResolved = false;
    this.isCurrentStepCorrect = false;

    // Set headers
    document.getElementById('current-game-title').textContent = this.activeGame.title;

    // Show/Hide Progress Ticks based on format
    const ticksContainer = document.getElementById('progress-ticks');
    const isMultiStep = this.activeGame.type === 'scenario' || this.activeGame.type === 'swiper';
    
    if (isMultiStep) {
      ticksContainer.style.display = 'flex';
      ticksContainer.innerHTML = '';
      for (let i = 0; i < 5; i++) {
        const tick = document.createElement('div');
        tick.className = 'progress-tick';
        ticksContainer.appendChild(tick);
      }
    } else {
      ticksContainer.style.display = 'none';
    }

    // Set initial states for toggle dashboards
    if (this.activeGame.type === 'toggle_dashboard') {
      this.activeGame.toggles.forEach(t => {
        this.toggleStates[t.id] = t.defaultState;
      });
    }

    // Shuffle steps for sorting activity
    if (this.activeGame.type === 'sorting') {
      this.sortingOrder = this.shuffleArray([...this.activeGame.items]);
    }

    this.switchView('game');
    this.renderDecision();
  }

  // ==================== Dynamic Template Switcher ====================
  renderDecision() {
    // Reset resolved indicators for the new step
    this.isCurrentStepResolved = false;
    this.isCurrentStepCorrect = false;

    // Clear alerts
    document.getElementById('correct-feedback').style.display = 'none';
    document.getElementById('incorrect-feedback').style.display = 'none';
    document.getElementById('reveal-block').style.display = 'none';

    const workspace = document.getElementById('activity-workspace');
    workspace.innerHTML = ''; // clear

    const btnSubmit = document.getElementById('btn-submit');
    const btnNext = document.getElementById('btn-next');
    
    btnSubmit.style.display = 'flex';
    btnSubmit.disabled = true;
    btnNext.style.display = 'none';

    const type = this.activeGame.type;

    if (type === 'scenario') {
      this.renderScenario(workspace);
    } else if (type === 'drag_drop') {
      this.renderDragDrop(workspace);
    } else if (type === 'swiper') {
      this.renderSwiper(workspace);
    } else if (type === 'toggle_dashboard') {
      this.renderToggleDashboard(workspace);
    } else if (type === 'sorting') {
      this.renderSorting(workspace);
    }

    // Render unique illustration on left panel
    this.renderLeftDiagram();
    this.updateHUD();
  }

  // ==================== Template 1: Scenario MCQ ====================
  renderScenario(workspace) {
    const decision = this.activeGame.decisions[this.currentDecisionIndex];
    this.selectedOptionIndex = null;
    
    document.getElementById('btn-submit').textContent = "Confirm Selection";

    // Update Progress Ticks
    const ticks = document.querySelectorAll('#progress-ticks .progress-tick');
    ticks.forEach((tick, idx) => {
      tick.className = 'progress-tick';
      if (idx === this.currentDecisionIndex) {
        tick.classList.add('current');
      } else if (idx < this.currentDecisionIndex) {
        tick.classList.add(this.answersLog[idx] ? 'correct' : 'incorrect');
      }
    });

    workspace.innerHTML = `
      <div class="scenario-workspace">
        <div class="scenario-details">
          <span class="module-badge">Scenario ${this.currentDecisionIndex + 1} of 5</span>
          <div class="scenario-box">${decision.scenario}</div>
          <h4 class="question-text">${decision.question}</h4>
        </div>
        <div id="options-list" class="options-list"></div>
      </div>
    `;

    const optionsContainer = workspace.querySelector('#options-list');
    decision.options.forEach((opt, idx) => {
      const optBtn = document.createElement('button');
      optBtn.className = 'option-btn';
      optBtn.innerHTML = `<span style="font-weight:800; color:#0056b3; min-width:24px; display:inline-block; flex-shrink:0;">${idx + 1}.</span> ${opt}`;
      optBtn.style.display = 'flex';
      optBtn.style.alignItems = 'flex-start';
      optBtn.style.gap = '6px';
      optBtn.style.textAlign = 'left';
      optBtn.addEventListener('click', () => this.selectOption(idx));
      optionsContainer.appendChild(optBtn);
    });
  }

  selectOption(idx) {
    if (document.getElementById('btn-next').style.display === 'block') return;

    this.selectedOptionIndex = idx;
    
    const options = document.querySelectorAll('#options-list .option-btn');
    options.forEach((btn, btnIdx) => {
      if (btnIdx === idx) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });

    document.getElementById('btn-submit').disabled = false;
  }

  // ==================== Template 2: Drag & Drop ====================
  renderDragDrop(workspace) {
    const game = this.activeGame;
    document.getElementById('btn-submit').textContent = "Verify Placements";

    workspace.innerHTML = `
      <div class="drag-drop-workspace">
        <div class="scenario-box" style="margin-bottom:12px; font-size:0.95rem;">
          <strong>Interactive Mappings</strong>: Sort the 6 security duties into their correct category column. Click a card to select it, then click a target column to drop it, or drag them directly.
        </div>
        
        <div class="drag-deck" id="drag-card-deck"></div>

        <div class="drop-buckets-container">
          <div class="drop-bucket" id="bucket-left" data-bucket="left">
            <div class="drop-bucket-title">${game.leftBucket}</div>
          </div>
          <div class="drop-bucket" id="bucket-right" data-bucket="right">
            <div class="drop-bucket-title">${game.rightBucket}</div>
          </div>
        </div>
      </div>
    `;

    const deck = workspace.querySelector('#drag-card-deck');
    const bucketLeft = workspace.querySelector('#bucket-left');
    const bucketRight = workspace.querySelector('#bucket-right');

    game.items.forEach(item => {
      const placement = this.dragPlacements[item.id];
      
      const card = document.createElement('div');
      card.className = 'drag-card';
      card.id = item.id;
      card.draggable = true;
      card.textContent = item.text;

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.getElementById('btn-next').style.display === 'block') return;

        if (placement) {
          delete this.dragPlacements[item.id];
          this.dragSelectedCardId = null;
          this.renderDecision();
        } else {
          document.querySelectorAll('.drag-card').forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.dragSelectedCardId = item.id;
        }
      });

      card.addEventListener('dragstart', (e) => {
        if (document.getElementById('btn-next').style.display === 'block') {
          e.preventDefault();
          return;
        }
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', item.id);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });

      if (!placement) {
        deck.appendChild(card);
      } else if (placement === 'left') {
        bucketLeft.appendChild(card);
      } else if (placement === 'right') {
        bucketRight.appendChild(card);
      }
    });

    [bucketLeft, bucketRight].forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('hovered');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('hovered');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('hovered');
        const cardId = e.dataTransfer.getData('text/plain');
        if (cardId) {
          this.dragPlacements[cardId] = zone.getAttribute('data-bucket');
          this.renderDecision();
        }
      });

      zone.addEventListener('click', () => {
        if (this.dragSelectedCardId) {
          this.dragPlacements[this.dragSelectedCardId] = zone.getAttribute('data-bucket');
          this.dragSelectedCardId = null;
          this.renderDecision();
        }
      });
    });

    const placedCount = Object.keys(this.dragPlacements).length;
    document.getElementById('btn-submit').disabled = placedCount !== game.items.length;
  }

  // ==================== Template 3: Card Swiper ====================
  renderSwiper(workspace) {
    const game = this.activeGame;
    document.getElementById('btn-submit').style.display = 'none';

    // Update Progress Ticks
    const ticks = document.querySelectorAll('#progress-ticks .progress-tick');
    ticks.forEach((tick, idx) => {
      tick.className = 'progress-tick';
      if (idx === this.currentSwiperIndex) {
        tick.classList.add('current');
      } else if (idx < this.currentSwiperIndex) {
        tick.classList.add(this.answersLog[idx] ? 'correct' : 'incorrect');
      }
    });

    workspace.innerHTML = `
      <div class="swiper-workspace">
        <div class="scenario-box" style="margin-bottom:6px; font-size:0.95rem; width:100%; text-align:center;">
          <strong>Card Sorting</strong>: Classify the auth event. Click <strong>Vulnerable</strong> or <strong>Secure</strong> below.
        </div>
        
        <div class="card-deck-container" id="swiper-deck"></div>

        <div class="swiper-controls" id="swiper-btns">
          <button class="btn-swipe-vulnerable" id="btn-vulnerable">Vulnerable</button>
          <button class="btn-swipe-secure" id="btn-secure">Secure</button>
        </div>
      </div>
    `;

    const deck = workspace.querySelector('#swiper-deck');
    
    for (let i = game.items.length - 1; i >= this.currentSwiperIndex; i--) {
      const item = game.items[i];
      const depth = i - this.currentSwiperIndex;

      const card = document.createElement('div');
      card.className = `swiper-card card-depth-${Math.min(depth, 3)}`;
      card.id = `card-${item.id}`;
      if (depth === 0) {
        card.innerHTML = `
          <div class="swiper-card-header">Activity Card ${i + 1} of 5</div>
          <div class="swiper-card-body">${item.scenario}</div>
          <div class="swiper-card-question">${item.question}</div>
        `;
      } else {
        card.innerHTML = `
          <div class="swiper-card-header">Activity Card ${i + 1} of 5</div>
          <div class="swiper-card-body" style="display: flex; align-items: center; justify-content: center; height: 100%; min-height: 150px; opacity: 0.15;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: auto;">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        `;
      }
      deck.appendChild(card);
    }

    const btnVuln = workspace.querySelector('#btn-vulnerable');
    const btnSec = workspace.querySelector('#btn-secure');

    if (this.currentSwiperIndex >= game.items.length) {
      workspace.querySelector('#swiper-btns').style.display = 'none';
      return;
    }

    if (document.getElementById('btn-next').style.display === 'block') {
      btnVuln.disabled = true;
      btnSec.disabled = true;
      return;
    }

    btnVuln.addEventListener('click', () => this.swipeCard('vulnerable'));
    btnSec.addEventListener('click', () => this.swipeCard('secure'));
  }

  swipeCard(action) {
    const topCard = document.querySelector('.swiper-card.card-depth-0');
    if (!topCard) return;

    if (action === 'vulnerable') {
      topCard.classList.add('swipe-left');
    } else {
      topCard.classList.add('swipe-right');
    }

    document.getElementById('btn-vulnerable').disabled = true;
    document.getElementById('btn-secure').disabled = true;

    const item = this.activeGame.items[this.currentSwiperIndex];
    const isCorrect = action === item.correctAction;

    // Trigger visual feedback variables immediately upon selection
    this.isCurrentStepResolved = true;
    this.isCurrentStepCorrect = isCorrect;
    this.renderLeftDiagram(); // Re-render the diagram on left to show secure or breached state

    this.answersLog.push(isCorrect);
    if (isCorrect) {
      this.score++;
      this.updateHUD();
      
      setTimeout(() => {
        document.getElementById('correct-feedback').style.display = 'block';
        document.getElementById('correct-explanation').textContent = item.revealCause;
      }, 300);
    } else {
      setTimeout(() => {
        document.getElementById('incorrect-feedback').style.display = 'block';
        document.getElementById('btn-reveal-explanation').style.display = 'inline-block';
        document.getElementById('reveal-cause-text').textContent = item.revealCause;
      }, 300);
    }

    setTimeout(() => {
      const nextBtn = document.getElementById('btn-next');
      nextBtn.style.display = 'flex';
      nextBtn.textContent = this.currentSwiperIndex < 4 ? "Next Scenario" : "View Results";
    }, 400);
  }

  // ==================== Template 4: Toggle Dashboard ====================
  renderToggleDashboard(workspace) {
    const game = this.activeGame;
    document.getElementById('btn-submit').textContent = "Verify Configuration";
    document.getElementById('btn-submit').disabled = false;

    let isAllCorrect = true;
    game.toggles.forEach(t => {
      if (this.toggleStates[t.id] !== t.correctState) {
        isAllCorrect = false;
      }
    });

    workspace.innerHTML = `
      <div class="dashboard-workspace">
        <div class="scenario-box" style="margin-bottom:12px; font-size:0.95rem;">
          <strong>Interactive Controls</strong>: Configure the app server panel. Discuss settings with the audience and toggle switches. Click verify configuration when aligned.
        </div>

        <div class="server-card">
          <div class="server-header">
            <div class="server-title">
              <svg style="width:20px; height:20px; fill:#0056b3" viewBox="0 0 24 24"><path d="M12,16A3,3 0 0,1 9,13C9,11.88 9.77,10.94 10.8,10.68L8.6,3H10L12,10L14,3H15.4L13.2,10.68C14.23,10.94 15,11.88 15,13A3,3 0 0,1 12,16M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>
              PaaS Config dashboard card
            </div>
            <div class="server-status-pill ${isAllCorrect ? 'secure' : 'vulnerable'}" id="threat-indicator">
              ${isAllCorrect ? 'Secure Posture' : 'Vulnerable Posture'}
            </div>
          </div>

          <div id="toggles-container"></div>
        </div>
      </div>
    `;

    const container = workspace.querySelector('#toggles-container');
    const isLocked = document.getElementById('btn-next').style.display === 'block';

    game.toggles.forEach(t => {
      const row = document.createElement('div');
      row.className = 'toggle-row';
      row.innerHTML = `
        <div class="toggle-info">
          <span class="toggle-label">${t.name}</span>
          <span class="toggle-desc">${t.desc}</span>
        </div>
        <label class="switch">
          <input type="checkbox" id="${t.id}" ${this.toggleStates[t.id] ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
          <span class="slider"></span>
        </label>
      `;

      const input = row.querySelector('input');
      input.addEventListener('change', () => {
        this.toggleStates[t.id] = input.checked;
        
        let correctCheck = true;
        game.toggles.forEach(chk => {
          if (this.toggleStates[chk.id] !== chk.correctState) correctCheck = false;
        });

        const indicator = document.getElementById('threat-indicator');
        if (correctCheck) {
          indicator.className = 'server-status-pill secure';
          indicator.textContent = 'Secure Posture';
        } else {
          indicator.className = 'server-status-pill vulnerable';
          indicator.textContent = 'Vulnerable Posture';
        }

        // Live update the left diagram as toggles shift!
        this.renderLeftDiagram();
      });

      container.appendChild(row);
    });
  }

  // ==================== Template 5: Reordering/Sorting ====================
  renderSorting(workspace) {
    document.getElementById('btn-submit').textContent = "Verify Sequence";
    document.getElementById('btn-submit').disabled = false;

    workspace.innerHTML = `
      <div class="sorting-workspace">
        <div class="scenario-box" style="margin-bottom:12px; font-size:0.95rem;">
          <strong>Sequential Ordering</strong>: ${this.activeGame.description || 'Arrange the steps in the correct chronological order.'}
        </div>

        <div class="sorting-list" id="sorting-list-container"></div>
      </div>
    `;

    const container = workspace.querySelector('#sorting-list-container');
    const isLocked = document.getElementById('btn-next').style.display === 'block';

    this.sortingOrder.forEach((step, idx) => {
      const item = document.createElement('div');
      item.className = 'sorting-item';
      item.innerHTML = `
        <div class="sorting-number">${idx + 1}</div>
        <div class="sorting-text">${step.text}</div>
        <div class="sorting-controls">
          <button class="btn-sort-arrow btn-up" ${idx === 0 || isLocked ? 'disabled' : ''}>▲</button>
          <button class="btn-sort-arrow btn-down" ${idx === this.sortingOrder.length - 1 || isLocked ? 'disabled' : ''}>▼</button>
        </div>
      `;

      item.querySelector('.btn-up').addEventListener('click', () => {
        this.swapSorting(idx, idx - 1);
      });

      item.querySelector('.btn-down').addEventListener('click', () => {
        this.swapSorting(idx, idx + 1);
      });

      container.appendChild(item);
    });
  }

  swapSorting(i, j) {
    [this.sortingOrder[i], this.sortingOrder[j]] = [this.sortingOrder[j], this.sortingOrder[i]];
    this.renderDecision();
  }

  // ==================== Submit Selection & Verification ====================
  submitSelection() {
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.disabled = true;
    btnSubmit.style.display = 'none';

    const type = this.activeGame.type;

    if (type === 'scenario') {
      this.verifyScenario();
    } else if (type === 'drag_drop') {
      this.verifyDragDrop();
    } else if (type === 'toggle_dashboard') {
      this.verifyToggleDashboard();
    } else if (type === 'sorting') {
      this.verifySorting();
    }
  }

  verifyScenario() {
    const decision = this.activeGame.decisions[this.currentDecisionIndex];
    const isCorrect = this.selectedOptionIndex === decision.correctIndex;
    
    // Set feedback variables
    this.isCurrentStepResolved = true;
    this.isCurrentStepCorrect = isCorrect;
    this.renderLeftDiagram(); // Re-render diagram to show state transition

    this.answersLog.push(isCorrect);
    if (isCorrect) {
      this.score++;
      this.updateHUD();

      document.getElementById('correct-feedback').style.display = 'block';
      document.getElementById('correct-explanation').textContent = decision.revealCause;
    } else {
      document.getElementById('incorrect-feedback').style.display = 'block';
      document.getElementById('btn-reveal-explanation').style.display = 'inline-block';
      document.getElementById('reveal-cause-text').textContent = decision.revealCause;
    }

    const nextBtn = document.getElementById('btn-next');
    nextBtn.style.display = 'flex';
    nextBtn.textContent = this.currentDecisionIndex < 4 ? "Next Scenario" : "View Results";
  }

  verifyDragDrop() {
    const items = this.activeGame.items;
    let errorsCount = 0;
    
    items.forEach(item => {
      const placement = this.dragPlacements[item.id];
      if (placement !== item.correctBucket) {
        errorsCount++;
      }
    });

    const isSuccess = errorsCount === 0;
    this.score = isSuccess ? 5 : 0;
    this.updateHUD();

    this.isCurrentStepResolved = true;
    this.isCurrentStepCorrect = isSuccess;
    this.renderLeftDiagram(); // Re-render diagram to balance scale or flash indicator

    document.querySelectorAll('.drag-card').forEach(card => {
      card.draggable = false;
      card.style.cursor = 'default';
    });

    let compiledHTML = `<p style="margin-bottom:10px;"><strong>Key Mappings Explanations:</strong></p><ul style="padding-left:20px; font-size:0.88rem; line-height:1.5;">`;
    items.forEach(item => {
      const correctName = item.correctBucket === 'left' ? this.activeGame.leftBucket : this.activeGame.rightBucket;
      compiledHTML += `<li style="margin-bottom:6px;"><strong>${item.text}</strong> $\\rightarrow$ <span style="color:#0056b3; font-weight:bold;">${correctName}</span><br><span style="color:#485c70">${item.revealCause}</span></li>`;
    });
    compiledHTML += `</ul>`;

    if (isSuccess) {
      document.getElementById('correct-feedback').style.display = 'block';
      document.getElementById('correct-explanation').innerHTML = `All items are correctly mapped! Excellent alignment.<br><br>${compiledHTML}`;
    } else {
      items.forEach(item => {
        const placement = this.dragPlacements[item.id];
        if (placement !== item.correctBucket) {
          const card = document.getElementById(item.id);
          if (card) card.style.borderColor = '#e74c3c';
        }
      });

      document.getElementById('incorrect-feedback').style.display = 'block';
      document.getElementById('btn-reveal-explanation').style.display = 'inline-block';
      document.getElementById('reveal-cause-text').innerHTML = `${errorsCount} mappings are incorrect. Review correct alignment and discuss details below.<br><br>${compiledHTML}`;
    }

    const nextBtn = document.getElementById('btn-next');
    nextBtn.style.display = 'flex';
    nextBtn.textContent = "View Results";
  }

  verifyToggleDashboard() {
    const toggles = this.activeGame.toggles;
    let errorsCount = 0;

    toggles.forEach(t => {
      if (this.toggleStates[t.id] !== t.correctState) {
        errorsCount++;
      }
    });

    const isSuccess = errorsCount === 0;
    this.score = isSuccess ? 5 : 0;
    this.updateHUD();

    this.isCurrentStepResolved = true;
    this.isCurrentStepCorrect = isSuccess;
    this.renderLeftDiagram(); // Re-render diagram to show lock statuses

    let compiledHTML = `<p style="margin-bottom:10px;"><strong>Configuration Explanations:</strong></p><ul style="padding-left:20px; font-size:0.88rem; line-height:1.5;">`;
    toggles.forEach(t => {
      const targetState = t.correctState ? "Enabled" : "Disabled";
      compiledHTML += `<li style="margin-bottom:6px;"><strong>${t.name}</strong> should be <span style="color:#0056b3; font-weight:bold;">${targetState}</span><br><span style="color:#485c70">${t.revealCause}</span></li>`;
    });
    compiledHTML += `</ul>`;

    document.querySelectorAll('.switch input').forEach(input => input.disabled = true);

    if (isSuccess) {
      document.getElementById('correct-feedback').style.display = 'block';
      document.getElementById('correct-explanation').innerHTML = `Configuration verified secure! App settings correctly aligned.<br><br>${compiledHTML}`;
    } else {
      toggles.forEach(t => {
        if (this.toggleStates[t.id] !== t.correctState) {
          const row = document.getElementById(t.id).closest('.toggle-row');
          if (row) row.style.background = 'rgba(231, 76, 60, 0.03)';
        }
      });

      document.getElementById('incorrect-feedback').style.display = 'block';
      document.getElementById('btn-reveal-explanation').style.display = 'inline-block';
      document.getElementById('reveal-cause-text').innerHTML = `Configuration rejected. ${errorsCount} settings are misconfigured. Review secure settings below.<br><br>${compiledHTML}`;
    }

    const nextBtn = document.getElementById('btn-next');
    nextBtn.style.display = 'flex';
    nextBtn.textContent = "View Results";
  }

  verifySorting() {
    const items = this.activeGame.items;
    let errorsCount = 0;

    this.sortingOrder.forEach((step, idx) => {
      if (step.correctIndex !== idx) {
        errorsCount++;
      }
    });

    const isSuccess = errorsCount === 0;
    this.score = isSuccess ? 5 : 0;
    this.updateHUD();

    this.isCurrentStepResolved = true;
    this.isCurrentStepCorrect = isSuccess;
    this.renderLeftDiagram(); // Re-render diagram to highlight correct/incorrect workflows

    document.querySelectorAll('.btn-sort-arrow').forEach(btn => btn.disabled = true);

    const sortedCorrectList = [...items].sort((a, b) => a.correctIndex - b.correctIndex);
    let compiledHTML = `<p style="margin-bottom:10px;"><strong>Correct Chronological Workflow:</strong></p><ol style="padding-left:20px; font-size:0.88rem; line-height:1.5;">`;
    sortedCorrectList.forEach(step => {
      compiledHTML += `<li style="margin-bottom:6px;"><strong>${step.text}</strong><br><span style="color:#485c70">${step.revealCause}</span></li>`;
    });
    compiledHTML += `</ol>`;

    let successMessage = "Sequence Verified Secure! The workflow order is correct.";
    if (this.activeGame.id === 'm2_g3') {
      successMessage = "Sequence Verified Secure! The Just-In-Time (JIT) privileged access steps are aligned correctly.";
    } else if (this.activeGame.id === 'm4_g3') {
      successMessage = "Sequence Verified Secure! The KMS key rotation workflow sequence is correct.";
    } else if (this.activeGame.id === 'm5_g3') {
      successMessage = "Sequence Verified Secure! The Incident Response pipeline stages are placed in the correct order.";
    }

    if (isSuccess) {
      document.getElementById('correct-feedback').style.display = 'block';
      document.getElementById('correct-explanation').innerHTML = `${successMessage}<br><br>${compiledHTML}`;
    } else {
      this.sortingOrder.forEach((step, idx) => {
        if (step.correctIndex !== idx) {
          const rows = document.querySelectorAll('.sorting-item');
          if (rows[idx]) rows[idx].style.borderColor = '#e74c3c';
        }
      });

      document.getElementById('incorrect-feedback').style.display = 'block';
      document.getElementById('btn-reveal-explanation').style.display = 'inline-block';
      document.getElementById('reveal-cause-text').innerHTML = `Sequence Rejected. Steps are out of order. Review sequence details below.<br><br>${compiledHTML}`;
    }

    const nextBtn = document.getElementById('btn-next');
    nextBtn.style.display = 'flex';
    nextBtn.textContent = "View Results";
  }

  revealExplanation() {
    document.getElementById('reveal-block').style.display = 'block';
    document.getElementById('btn-reveal-explanation').style.display = 'none';
  }

  // ==================== Next Step Routing ====================
  nextStep() {
    const type = this.activeGame.type;

    if (type === 'scenario') {
      this.currentDecisionIndex++;
      if (this.currentDecisionIndex < 5) {
        this.renderDecision();
      } else {
        this.renderResults();
      }
    } else if (type === 'swiper') {
      this.currentSwiperIndex++;
      if (this.currentSwiperIndex < 5) {
        this.renderDecision();
      } else {
        this.renderResults();
      }
    } else {
      this.renderResults();
    }
  }

  // ==================== Results View Rendering ====================
  renderResults() {
    this.switchView('results');

    const resultsPanel = document.querySelector('.results-panel');
    const badge = resultsPanel.querySelector('.results-badge');
    const title = resultsPanel.querySelector('.results-title');
    const subtitle = resultsPanel.querySelector('.results-subtitle');

    badge.className = 'results-badge success';
    badge.innerHTML = `<svg class="results-icon success" viewBox="0 0 24 24"><path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z"/></svg>`;

    title.className = 'results-title success';
    title.textContent = 'ACTIVITY COMPLETED';
    
    subtitle.innerHTML = `You have reviewed all checkpoints for this session activity. The review is complete.`;

    this.completedGames[this.activeGame.id] = true;
    localStorage.setItem('completed_games_day2', JSON.stringify(this.completedGames));

    const type = this.activeGame.type;
    const totalCount = (type === 'scenario' || type === 'swiper') ? 5 : 1;

    document.getElementById('final-score').textContent = `${totalCount} / ${totalCount}`;
    document.getElementById('final-percent').textContent = `Reviewed`;
  }

  quitToHub() {
    if (this.activeModule) {
      const modId = this.activeModule.id;
      this.activeGame = null;
      this.launchModulePage(modId);
    } else {
      this.activeGame = null;
      this.switchView('hub');
    }
  }

  // ==================== Utilities ====================
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // ==================== Dynamic Diagram Panel Builder ====================
  renderLeftDiagram() {
    const container = document.getElementById('diagram-panel-container');
    if (!container) return;

    const gameId = this.activeGame.id;
    const type = this.activeGame.type;
    const stepIdx = (type === 'scenario') ? this.currentDecisionIndex : (type === 'swiper') ? this.currentSwiperIndex : 0;

    let svgContent = '';

    // Module 1: Threat Detection & Incident Response
    if (gameId === 'm1_g1') {
      svgContent = this.drawM1IRLifecycle();
    } else if (gameId === 'm1_g2') {
      svgContent = this.drawM1ThreatDetection();
    } else if (gameId === 'm1_g3') {
      svgContent = this.drawM1Containment(stepIdx);
    } 
    // Module 2: Vulnerability & Patch Management
    else if (gameId === 'm2_g1') {
      svgContent = this.drawM2CVSSScale();
    } else if (gameId === 'm2_g2') {
      svgContent = this.drawM2PatchingPriorities(stepIdx);
    } else if (gameId === 'm2_g3') {
      svgContent = this.drawM2ScannerConsole();
    }
    // Module 3: Compliance & Governance
    else if (gameId === 'm3_g1') {
      svgContent = this.drawM3ComplianceLedger();
    } else if (gameId === 'm3_g2') {
      svgContent = this.drawM3GovernancePolicy();
    } else if (gameId === 'm3_g3') {
      svgContent = this.drawM3AuditEvidence(stepIdx);
    }
    // Module 4: Cloud Security Operations
    else if (gameId === 'm4_g1') {
      svgContent = this.drawM4SOARWorkflow();
    } else if (gameId === 'm4_g2') {
      svgContent = this.drawM4SOARPlaybook();
    } else if (gameId === 'm4_g3') {
      svgContent = this.drawM4OpsCost(stepIdx);
    }
    // Module 5: Logging & Visibility
    else if (gameId === 'm5_g1') {
      svgContent = this.drawM5LoggingTiers();
    } else if (gameId === 'm5_g2') {
      svgContent = this.drawM5AuditingCoverage();
    } else if (gameId === 'm5_g3') {
      svgContent = this.drawM5WORMStorage(stepIdx);
    }
    // Module 6: Application & API Security
    else if (gameId === 'm6_g1') {
      svgContent = this.drawM6OWASPBrowser(stepIdx);
    } else if (gameId === 'm6_g2') {
      svgContent = this.drawM6APIGateway();
    } else if (gameId === 'm6_g3') {
      svgContent = this.drawM6WAFRegex(stepIdx);
    }
    // Module 7: Secure DevOps
    else if (gameId === 'm7_g1') {
      svgContent = this.drawM7PipelineGates();
    } else if (gameId === 'm7_g2') {
      svgContent = this.drawM7IaCConsole(stepIdx);
    } else if (gameId === 'm7_g3') {
      svgContent = this.drawM7SecretLeak(stepIdx);
    }

    container.innerHTML = svgContent;
  }

  wrapSVG(innerContent) {
    return `<svg class="diagram-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="none"/>
      ${innerContent}
    </svg>`;
  }

  // ==================== Day 2 Module 1: Threat Detection & Incident Response ====================
  drawM1IRLifecycle() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const correctOrder = ['ir_phase_identify','ir_phase_contain','ir_phase_eradicate','ir_phase_recover','ir_phase_lessons'];
    const labels = ['Identify','Contain','Eradicate','Recover','Lessons'];
    let nodeHTML = '';
    const startY = 75;
    const spacingY = 73;
    for (let i = 0; i < 5; i++) {
      const step = this.sortingOrder[i];
      if (!step) continue;
      const labelIdx = correctOrder.indexOf(step.id);
      const label = labelIdx >= 0 ? labels[labelIdx] : `Step ${i+1}`;
      const isCorrect = step.correctIndex === i;
      let nodeColor = '#0056b3';
      if (resolved) nodeColor = isCorrect ? '#2ecc71' : '#e74c3c';
      if (i < 4) {
        nodeHTML += `<line x1="250" y1="${startY+i*spacingY+22}" x2="250" y2="${startY+(i+1)*spacingY-22}" stroke="${resolved&&correct?'#2ecc71':'#cbd5e1'}" stroke-width="3" stroke-dasharray="${resolved&&correct?'6,4':'none'}" class="${resolved&&correct?'animate-dash-slow':''}"/>`;
        nodeHTML += `<polygon points="250,${startY+(i+1)*spacingY-22} 245,${startY+(i+1)*spacingY-30} 255,${startY+(i+1)*spacingY-30}" fill="${resolved&&correct?'#2ecc71':'#cbd5e1'}"/>`;
      }
      nodeHTML += `<rect x="140" y="${startY+i*spacingY-22}" width="220" height="44" rx="8" fill="#fff" stroke="${nodeColor}" stroke-width="2"/>`;
      nodeHTML += `<text x="250" y="${startY+i*spacingY+7}" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">${label}</text>`;
      if (resolved) {
        nodeHTML += `<circle cx="120" cy="${startY+i*spacingY}" r="11" fill="${nodeColor}"/>`;
        nodeHTML += `<text x="120" y="${startY+i*spacingY+4}" font-family="sans-serif" font-size="11" fill="#fff" font-weight="bold" text-anchor="middle">${isCorrect?'✔':'✖'}</text>`;
      }
    }
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="20" width="420" height="38" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="44" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'IR Lifecycle Sequence':(correct?'Correct Lifecycle Order!':'Sequence Out of Order')}</text>
      ${nodeHTML}
    `);
  }

  drawM1ThreatDetection() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const leftCount = Object.values(this.dragPlacements).filter(v=>v==='left').length;
    const rightCount = Object.values(this.dragPlacements).filter(v=>v==='right').length;
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Threat Detection Engine Map':(correct?'Engines Correctly Mapped!':'Mapping Mismatch Detected')}</text>
      <rect x="40" y="105" width="185" height="220" rx="10" fill="#fff" stroke="${resolved&&!correct?'#e74c3c':'#0056b3'}" stroke-width="2"/>
      <rect x="40" y="105" width="185" height="36" rx="10" fill="#f0f6ff"/>
      <text x="133" y="128" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">SIEM &amp; XDR Engines</text>
      ${[['SIEM',75,195],['XDR',133,240],['Email',193,285]].map(([lbl,cx,cy],i)=>`<circle cx="${cx}" cy="${cy}" r="18" fill="${leftCount>i?'#0056b3':'#cbd5e1'}"/><text x="${cx}" y="${cy+4}" font-family="sans-serif" font-size="9" fill="#fff" font-weight="bold" text-anchor="middle">${lbl}</text>`).join('')}
      <rect x="275" y="105" width="185" height="220" rx="10" fill="#fff" stroke="${resolved&&!correct?'#e74c3c':'#00b5e2'}" stroke-width="2"/>
      <rect x="275" y="105" width="185" height="36" rx="10" fill="rgba(0,181,226,0.05)"/>
      <text x="368" y="128" font-family="sans-serif" font-size="11" fill="#00b5e2" font-weight="bold" text-anchor="middle">Cloud-Native Detection</text>
      ${[['Guard',308,195],['SecHub',368,240],['Flow',428,285]].map(([lbl,cx,cy],i)=>`<circle cx="${cx}" cy="${cy}" r="18" fill="${rightCount>i?'#00b5e2':'#cbd5e1'}"/><text x="${cx}" y="${cy+4}" font-family="sans-serif" font-size="9" fill="#fff" font-weight="bold" text-anchor="middle">${lbl}</text>`).join('')}
      ${resolved&&correct?`<rect x="140" y="400" width="220" height="40" rx="8" fill="rgba(46,204,113,0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/><text x="250" y="424" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">All Sources Correctly Routed</text>`:''}
      ${resolved&&!correct?`<rect x="140" y="400" width="220" height="40" rx="8" fill="rgba(231,76,60,0.08)" stroke="#e74c3c" stroke-width="2" class="glow-danger"/><text x="250" y="424" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">Review Engine Assignments</text>`:''}
    `);
  }

  drawM1Containment(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const scenarios = ['NSG Isolation','Key Revocation','Bastion Route','Bucket ACL','Session Revoke'];
    const label = resolved ? (correct ? scenarios[stepIdx] : 'Containment Failure') : 'Analyzing Threat Vector';
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    const shieldColor = !resolved ? '#cbd5e1' : (correct ? '#2ecc71' : '#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">Scenario ${stepIdx+1}: ${label}</text>
      <rect x="60" y="110" width="130" height="75" rx="8" fill="#fff" stroke="#e74c3c" stroke-width="2"/>
      <text x="125" y="152" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">Active Threat</text>
      <path d="M 190,147 L 310,147" fill="none" stroke="${!resolved ? '#cbd5e1' : (correct ? '#2ecc71' : '#e74c3c')}" stroke-width="4" stroke-dasharray="${resolved?'none':'6,4'}" class="${!resolved?'animate-dash-fast':''}"/>
      <polygon points="250,90 230,130 270,130" fill="${shieldColor}" opacity="0.15"/>
      <polygon points="250,90 230,130 270,130" fill="none" stroke="${shieldColor}" stroke-width="3"/>
      <text x="250" y="120" font-family="sans-serif" font-size="18" fill="${shieldColor}" font-weight="bold" text-anchor="middle">${resolved&&correct?'🔒':'🛡'}</text>
      <rect x="310" y="110" width="130" height="75" rx="8" fill="#fff" stroke="${resolved&&correct?'#2ecc71':'#cbd5e1'}" stroke-width="2"/>
      <text x="375" y="152" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Cloud Resource</text>
      <rect x="100" y="260" width="300" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${!resolved?'#cbd5e1':(correct?'#2ecc71':'#e74c3c')}" stroke-width="2" ${resolved?(correct?'class="glow-success"':'class="glow-danger"'):''}/>
      <text x="250" y="289" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Select containment strategy':(correct?'Breach Contained Successfully':'Incorrect — Threat Spreads')}</text>
    `);
  }

  // ==================== Day 2 Module 2: Vulnerability & Patch Management ====================
  drawM2CVSSScale() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const leftCount = Object.values(this.dragPlacements).filter(v=>v==='left').length;
    const rightCount = Object.values(this.dragPlacements).filter(v=>v==='right').length;
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'CVSS v3 Metric Groups':(correct?'Correct Metric Classification!':'Review Metric Assignments')}</text>
      <rect x="40" y="100" width="190" height="200" rx="10" fill="#fff" stroke="${resolved&&!correct?'#e74c3c':'#0056b3'}" stroke-width="2"/>
      <rect x="40" y="100" width="190" height="36" rx="10" fill="#f0f6ff"/>
      <text x="135" y="123" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">Base Metrics (Static)</text>
      ${['Attack Vector (AV)','Privileges Required (PR)','User Interaction (UI)'].map((lbl,i)=>`<circle cx="58" cy="${162+i*52}" r="9" fill="${leftCount>i?'#0056b3':'#cbd5e1'}"/><text x="80" y="${166+i*52}" font-family="sans-serif" font-size="10" fill="#485c70">${lbl}</text>`).join('')}
      <rect x="270" y="100" width="190" height="200" rx="10" fill="#fff" stroke="${resolved&&!correct?'#e74c3c':'#00b5e2'}" stroke-width="2"/>
      <rect x="270" y="100" width="190" height="36" rx="10" fill="rgba(0,181,226,0.05)"/>
      <text x="365" y="123" font-family="sans-serif" font-size="11" fill="#00b5e2" font-weight="bold" text-anchor="middle">Temporal &amp; Env Metrics</text>
      ${['Exploit Maturity (E)','Remediation Level (RL)','Conf. Requirement (CR)'].map((lbl,i)=>`<circle cx="288" cy="${162+i*52}" r="9" fill="${rightCount>i?'#00b5e2':'#cbd5e1'}"/><text x="310" y="${166+i*52}" font-family="sans-serif" font-size="10" fill="#485c70">${lbl}</text>`).join('')}
      <rect x="80" y="380" width="340" height="45" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="406" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Drag metrics to correct group':(correct?'CVSS Groups Correctly Mapped!':'Review metric assignments')}</text>
    `);
  }

  drawM2PatchingPriorities(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const urgencies = ['CRITICAL — Patch Now','Scheduled Patch','Config Mitigation','Archive & Remove','Proactive Prep'];
    const urgency = resolved ? (correct ? urgencies[stepIdx] : 'Incorrect Priority') : 'Evaluating Exposure Risk';
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    const barColors = ['#e74c3c','#f2a900','#00b5e2','#2ecc71','#0056b3'];
    const scores = [9.8,7.2,5.3,3.1,7.8];
    let barsHTML = '';
    for (let i=0;i<5;i++) {
      const w = Math.round(scores[i]*28);
      barsHTML += `<rect x="90" y="${130+i*50}" width="${w}" height="32" rx="4" fill="${i===stepIdx?barColors[i]:'#e2e8f0'}" opacity="${i===stepIdx?1:0.5}"/>`;
      barsHTML += `<text x="86" y="${150+i*50}" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="end">CVSS ${scores[i]}</text>`;
      if (i===stepIdx) barsHTML += `<text x="${90+w+8}" y="${150+i*50}" font-family="sans-serif" font-size="9" fill="${barColors[i]}" font-weight="bold">← Active</text>`;
    }
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">Scenario ${stepIdx+1}: ${urgency}</text>
      <text x="90" y="110" font-family="sans-serif" font-size="11" fill="#485c70" font-weight="bold">Risk Level</text>
      ${barsHTML}
      <rect x="40" y="400" width="420" height="40" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.06)':'rgba(231,76,60,0.06)')}" stroke="${!resolved?'#cbd5e1':(correct?'#2ecc71':'#e74c3c')}" stroke-width="1.5"/>
      <text x="250" y="424" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Prioritize by risk & exposure':(correct?'Correct Prioritization Chosen':'Review Patching Priority Logic')}</text>
    `);
  }

  drawM2ScannerConsole() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    const assets = ['Server-01','Server-02','DB-01','API-GW','VM-05'];
    let assetsHTML = assets.map((name,i)=>`
      <rect x="80" y="${140+i*42}" width="340" height="34" rx="6" fill="#f8fafc" stroke="${resolved&&correct?'#2ecc71':(resolved?'#e74c3c':'#cbd5e1')}" stroke-width="1.5"/>
      <circle cx="105" cy="${157+i*42}" r="8" fill="${resolved&&correct?'#2ecc71':(resolved?'#e74c3c':'#00b5e2')}"/>
      <text x="125" y="${161+i*42}" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold">${name}</text>
      <text x="390" y="${161+i*42}" font-family="sans-serif" font-size="10" fill="${resolved&&correct?'#2ecc71':(resolved?'#e74c3c':'#7d93a8')}" text-anchor="middle">${resolved&&correct?'Secured':(resolved?'At Risk':'Scanning...')}</text>
    `).join('');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Vulnerability Scanner Config':(correct?'Scanner Fully Configured!':'Scanner Misconfigured')}</text>
      <rect x="60" y="88" width="380" height="290" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="60" y="88" width="380" height="36" rx="10" fill="#f8fafc"/>
      <text x="250" y="111" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">Asset Health Dashboard</text>
      ${assetsHTML}
      <rect x="80" y="410" width="340" height="40" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="434" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Configure scanner settings above':(correct?'All assets scanned & secured':'Review scanner configuration')}</text>
    `);
  }

  // ==================== Day 2 Module 3: Compliance & Governance ====================
  drawM3ComplianceLedger() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const leftCount = Object.values(this.dragPlacements).filter(v=>v==='left').length;
    const rightCount = Object.values(this.dragPlacements).filter(v=>v==='right').length;
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Compliance Framework Controls':(correct?'Frameworks Correctly Mapped!':'Framework Mismatch Detected')}</text>
      <rect x="40" y="90" width="190" height="220" rx="10" fill="#fff" stroke="${resolved&&!correct?'#e74c3c':'#0056b3'}" stroke-width="2"/>
      <rect x="40" y="90" width="190" height="36" rx="10" fill="#f0f6ff"/>
      <text x="135" y="113" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">ISO 27001 &amp; NIST CSF</text>
      ${['ISMS Structure','Risk Treatment Plan','5 Core Functions'].map((lbl,i)=>`<rect x="60" y="${138+i*55}" width="150" height="38" rx="6" fill="${leftCount>i?'rgba(0,86,179,0.06)':'#f8fafc'}" stroke="${leftCount>i?'#0056b3':'#e2e8f0'}"/><text x="135" y="${162+i*55}" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">${lbl}</text>`).join('')}
      <rect x="270" y="90" width="190" height="220" rx="10" fill="#fff" stroke="${resolved&&!correct?'#e74c3c':'#00b5e2'}" stroke-width="2"/>
      <rect x="270" y="90" width="190" height="36" rx="10" fill="rgba(0,181,226,0.05)"/>
      <text x="365" y="113" font-family="sans-serif" font-size="11" fill="#00b5e2" font-weight="bold" text-anchor="middle">SOC 2 Type II Audits</text>
      ${['Control Effectiveness','AICPA TSC Audit','Change Evidence'].map((lbl,i)=>`<rect x="290" y="${138+i*55}" width="150" height="38" rx="6" fill="${rightCount>i?'rgba(0,181,226,0.05)':'#f8fafc'}" stroke="${rightCount>i?'#00b5e2':'#e2e8f0'}"/><text x="365" y="${162+i*55}" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">${lbl}</text>`).join('')}
      ${resolved&&correct?`<rect x="130" y="385" width="240" height="40" rx="8" fill="rgba(46,204,113,0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/><text x="250" y="409" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">All Controls Correctly Filed</text>`:''}
    `);
  }

  drawM3GovernancePolicy() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    const toggleItems = [['Block Public Buckets',true],['Enforce Cost Tags',true],['Disable Root Login',true],['Data Residency',true],['Block Triple Sync',false]];
    const togglesHTML = toggleItems.map(([lbl,isOn],i)=>{
      const toggleColor = resolved&&correct?'#2ecc71':(resolved?'#e74c3c':(isOn?'#0056b3':'#cbd5e1'));
      return `<rect x="100" y="${148+i*45}" width="300" height="36" rx="6" fill="#f8fafc" stroke="#e2e8f0"/><text x="118" y="${170+i*45}" font-family="sans-serif" font-size="10" fill="#485c70">${lbl}</text><rect x="357" y="${154+i*45}" width="30" height="18" rx="9" fill="${isOn?toggleColor:'#e2e8f0'}"/><circle cx="${isOn?376:364}" cy="${163+i*45}" r="7" fill="#fff"/>`;
    }).join('');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Cloud Governance Policy Engine':(correct?'Posture Secured!':'Policy Violation Found')}</text>
      <rect x="80" y="88" width="340" height="305" rx="12" fill="#fff" stroke="${resolved?(correct?'#2ecc71':'#e74c3c'):'#0056b3'}" stroke-width="2"/>
      <rect x="80" y="88" width="340" height="40" rx="12" fill="#f0f6ff"/>
      <text x="250" y="113" font-family="sans-serif" font-size="13" fill="#0056b3" font-weight="bold" text-anchor="middle">Policy Guard Rails</text>
      ${togglesHTML}
      <rect x="80" y="420" width="340" height="40" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.06)':'rgba(231,76,60,0.06)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="444" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Configure policy controls':(correct?'Policy Engine Verified Secure':'Policy misconfiguration found')}</text>
    `);
  }

  drawM3AuditEvidence(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const labels = ['Artifact Download','Config Rules','RBAC Matrix','Vendor SOC 2','Baseline Restore'];
    const label = resolved ? (correct ? labels[stepIdx] : 'Evidence Rejected') : 'Evaluating Compliance Request';
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">Audit ${stepIdx+1}: ${label}</text>
      <rect x="140" y="100" width="220" height="200" rx="10" fill="#fff" stroke="${statusColor}" stroke-width="2"/>
      <text x="250" y="142" font-family="sans-serif" font-size="30" text-anchor="middle">${resolved&&correct?'📋':(resolved?'⚠️':'🔍')}</text>
      <text x="250" y="185" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Compliance Evidence</text>
      <line x1="165" y1="205" x2="335" y2="205" stroke="#e2e8f0"/>
      <text x="250" y="228" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">${label}</text>
      <text x="250" y="270" font-family="sans-serif" font-size="10" fill="${statusColor}" text-anchor="middle">${!resolved?'Awaiting verification':(correct?'✓ Audit evidence accepted':'✗ Evidence insufficient')}</text>
      <rect x="80" y="370" width="340" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5" ${resolved?(correct?'class="glow-success"':'class="glow-danger"'):''}/>
      <text x="250" y="399" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Select audit evidence strategy':(correct?'Correct Evidence Method':'Audit Evidence Rejected')}</text>
    `);
  }

  // ==================== Day 2 Module 4: Cloud Security Operations ====================
  drawM4SOARWorkflow() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const statusColor = !resolved ? '#0056b3' : (correct ? '#2ecc71' : '#e74c3c');
    const onItems = ['Auto-Escalate Critical','Correlate Alarms','Hourly Threat Hunt'];
    const offItems = ['Route Syslog to Chat','Manual Triage Low'];
    const onHTML = onItems.map((lbl,i)=>`<rect x="80" y="${144+i*52}" width="340" height="40" rx="6" fill="#f8fafc" stroke="${resolved&&correct?'#2ecc71':'#e2e8f0'}" stroke-width="${resolved&&correct?2:1}"/><circle cx="100" cy="${164+i*52}" r="8" fill="${resolved&&correct?'#2ecc71':'#0056b3'}"/><text x="120" y="${168+i*52}" font-family="sans-serif" font-size="10" fill="#0a1c2a">${lbl}</text><text x="400" y="${168+i*52}" font-family="sans-serif" font-size="10" fill="${resolved&&correct?'#2ecc71':'#0056b3'}" text-anchor="middle">ON</text>`).join('');
    const offHTML = offItems.map((lbl,i)=>`<rect x="80" y="${300+i*52}" width="340" height="40" rx="6" fill="#f8fafc" stroke="${resolved&&!correct?'#e74c3c':'#e2e8f0'}" stroke-width="${resolved&&!correct?2:1}"/><circle cx="100" cy="${320+i*52}" r="8" fill="${resolved&&!correct?'#e74c3c':'#cbd5e1'}"/><text x="120" y="${324+i*52}" font-family="sans-serif" font-size="10" fill="#0a1c2a">${lbl}</text><text x="400" y="${324+i*52}" font-family="sans-serif" font-size="10" fill="${resolved&&!correct?'#e74c3c':'#cbd5e1'}" text-anchor="middle">OFF</text>`).join('');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'SOC Command Center':(correct?'SOC Optimized!':'SOC Misconfigured')}</text>
      <rect x="60" y="88" width="380" height="300" rx="10" fill="#fff" stroke="${resolved?(correct?'#2ecc71':'#e74c3c'):'#0056b3'}" stroke-width="2"/>
      <rect x="60" y="88" width="380" height="36" rx="10" fill="#f0f6ff"/>
      <text x="250" y="111" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">Alert Queue Configuration</text>
      ${onHTML}${offHTML}
      <rect x="80" y="420" width="340" height="38" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="443" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Configure alert routing rules':(correct?'SOC Alert Rules Optimized':'Alert Config Has Issues')}</text>
    `);
  }

  drawM4SOARPlaybook() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const steps = ['Detect Threat','Block IP','Revoke Sessions','Assign Ticket','Reset Credential'];
    const correctOrder = ['soar_step_detect','soar_step_block_ip','soar_step_disable_user','soar_step_notify','soar_step_unlock'];
    let nodeHTML = '';
    const startY = 80;
    const spacingY = 72;
    for (let i=0;i<5;i++) {
      const step = this.sortingOrder[i];
      if (!step) continue;
      const labelIdx = correctOrder.indexOf(step.id);
      const label = labelIdx>=0?steps[labelIdx]:`Step ${i+1}`;
      const isCorrect = step.correctIndex===i;
      let nodeColor = !resolved?'#0056b3':(isCorrect?'#2ecc71':'#e74c3c');
      if (i<4) {
        nodeHTML += `<line x1="250" y1="${startY+i*spacingY+20}" x2="250" y2="${startY+(i+1)*spacingY-20}" stroke="${resolved&&correct?'#2ecc71':'#cbd5e1'}" stroke-width="3" stroke-dasharray="${resolved&&correct?'5,3':'none'}" class="${resolved&&correct?'animate-dash-slow':''}"/>`;
        nodeHTML += `<polygon points="250,${startY+(i+1)*spacingY-20} 245,${startY+(i+1)*spacingY-28} 255,${startY+(i+1)*spacingY-28}" fill="${resolved&&correct?'#2ecc71':'#cbd5e1'}"/>`;
      }
      nodeHTML += `<rect x="120" y="${startY+i*spacingY-20}" width="260" height="40" rx="8" fill="#fff" stroke="${nodeColor}" stroke-width="2"/>`;
      nodeHTML += `<text x="250" y="${startY+i*spacingY+5}" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">${label}</text>`;
      if (resolved) {
        nodeHTML += `<circle cx="100" cy="${startY+i*spacingY}" r="11" fill="${nodeColor}"/>`;
        nodeHTML += `<text x="100" y="${startY+i*spacingY+4}" font-family="sans-serif" font-size="11" fill="#fff" font-weight="bold" text-anchor="middle">${isCorrect?'✔':'✖'}</text>`;
      }
    }
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="20" width="420" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="43" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'SOAR Playbook Sequence':(correct?'Playbook Correctly Ordered!':'Playbook Sequence Error')}</text>
      ${nodeHTML}
    `);
  }

  drawM4OpsCost(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const labels = ['False Positive Risk','VM Isolation Plan','Cred Revocation','WAF Rate-Limit','Network Isolation'];
    const label = resolved ? (correct ? labels[stepIdx] : 'Miscalibrated Response') : 'Analyzing Operations Balance';
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    const secVal = !resolved?50:(correct?80:20);
    const bizVal = !resolved?50:(correct?60:90);
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">Scenario ${stepIdx+1}: ${label}</text>
      <rect x="60" y="90" width="170" height="200" rx="10" fill="#fff" stroke="#0056b3" stroke-width="2"/>
      <text x="145" y="118" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">Security Score</text>
      <path d="M 95,220 A 50,50 0 0,1 195,220" fill="none" stroke="#e2e8f0" stroke-width="12" stroke-linecap="round"/>
      <path d="M 95,220 A 50,50 0 0,1 ${145+Math.cos(Math.PI*(1-secVal/100))*50},${220-Math.sin(Math.PI*(1-secVal/100))*50}" fill="none" stroke="${statusColor}" stroke-width="12" stroke-linecap="round"/>
      <text x="145" y="245" font-family="sans-serif" font-size="18" fill="${statusColor}" font-weight="bold" text-anchor="middle">${secVal}%</text>
      <rect x="270" y="90" width="170" height="200" rx="10" fill="#fff" stroke="#00b5e2" stroke-width="2"/>
      <text x="355" y="118" font-family="sans-serif" font-size="11" fill="#00b5e2" font-weight="bold" text-anchor="middle">Business Impact</text>
      <path d="M 305,220 A 50,50 0 0,1 405,220" fill="none" stroke="#e2e8f0" stroke-width="12" stroke-linecap="round"/>
      <path d="M 305,220 A 50,50 0 0,1 ${355+Math.cos(Math.PI*(1-bizVal/100))*50},${220-Math.sin(Math.PI*(1-bizVal/100))*50}" fill="none" stroke="#00b5e2" stroke-width="12" stroke-linecap="round"/>
      <text x="355" y="245" font-family="sans-serif" font-size="18" fill="#00b5e2" font-weight="bold" text-anchor="middle">${bizVal}%</text>
      <rect x="80" y="380" width="340" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="409" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Balance security vs uptime':(correct?'Optimal Balance Achieved':'Response disrupts operations')}</text>
    `);
  }

  // ==================== Day 2 Module 5: Logging & Visibility ====================
  drawM5LoggingTiers() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const leftCount = Object.values(this.dragPlacements).filter(v=>v==='left').length;
    const rightCount = Object.values(this.dragPlacements).filter(v=>v==='right').length;
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Log Storage Tier Mapping':(correct?'Log Tiers Correctly Mapped!':'Review Tier Assignments')}</text>
      <rect x="40" y="100" width="190" height="230" rx="10" fill="#fff" stroke="${resolved&&!correct?'#e74c3c':'#0056b3'}" stroke-width="2"/>
      <rect x="40" y="100" width="190" height="36" rx="10" fill="#f0f6ff"/>
      <text x="135" y="123" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">🔥 Hot Analytics Tier</text>
      ${['Active SIEM Logs','Firewall Stream','API Rate Audit'].map((lbl,i)=>`<rect x="60" y="${148+i*58}" width="150" height="44" rx="6" fill="${leftCount>i?'rgba(0,86,179,0.06)':'#f8fafc'}" stroke="${leftCount>i?'#0056b3':'#e2e8f0'}"/><text x="135" y="${175+i*58}" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">${lbl}</text>`).join('')}
      <rect x="270" y="100" width="190" height="230" rx="10" fill="#fff" stroke="${resolved&&!correct?'#e74c3c':'#00b5e2'}" stroke-width="2"/>
      <rect x="270" y="100" width="190" height="36" rx="10" fill="rgba(0,181,226,0.05)"/>
      <text x="365" y="123" font-family="sans-serif" font-size="11" fill="#00b5e2" font-weight="bold" text-anchor="middle">❄️ Cold Archive Tier</text>
      ${['7yr WORM Audit Logs','DB Forensic Blobs','PCI Access Logs'].map((lbl,i)=>`<rect x="290" y="${148+i*58}" width="150" height="44" rx="6" fill="${rightCount>i?'rgba(0,181,226,0.05)':'#f8fafc'}" stroke="${rightCount>i?'#00b5e2':'#e2e8f0'}"/><text x="365" y="${175+i*58}" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">${lbl}</text>`).join('')}
      ${resolved&&correct?`<rect x="130" y="408" width="240" height="40" rx="8" fill="rgba(46,204,113,0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/><text x="250" y="432" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">Log Architecture Verified!</text>`:''}
    `);
  }

  drawM5AuditingCoverage() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    const nodes = [['CloudTrail',60,120],['VPC Flows',440,120],['KMS Logs',60,320],['CMK Encrypt',440,320]];
    const nodesHTML = nodes.map(([lbl,x,y])=>`<rect x="${x-50}" y="${y-20}" width="100" height="40" rx="6" fill="#fff" stroke="${resolved&&correct?'#2ecc71':(resolved?'#e74c3c':'#cbd5e1')}" stroke-width="2"/><text x="${x}" y="${y+5}" font-family="sans-serif" font-size="10" fill="#485c70" font-weight="bold" text-anchor="middle">${lbl}</text><line x1="${x}" y1="${y+20}" x2="250" y2="220" stroke="${resolved&&correct?'#2ecc71':'#cbd5e1'}" stroke-width="1.5" stroke-dasharray="4,3" class="${resolved&&correct?'animate-dash-slow':''}"/>`).join('');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Cloud Audit Coverage Map':(correct?'Coverage Fully Configured!':'Audit Gaps Detected')}</text>
      <circle cx="250" cy="220" r="85" fill="#f0f6ff" stroke="${statusColor}" stroke-width="3"/>
      <text x="250" y="205" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">Cloud Audit Hub</text>
      <text x="250" y="235" font-family="sans-serif" font-size="26" text-anchor="middle">${resolved&&correct?'🛡':(resolved?'⚠️':'📡')}</text>
      <text x="250" y="268" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">${resolved&&correct?'All Trails Active':(resolved?'Gaps Found':'Pending Config')}</text>
      ${nodesHTML}
    `);
  }

  drawM5WORMStorage(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const labels = ['WORM Object Lock','Offhost Log Forward','Hash Validation','Bucket Restriction','Lifecycle Policy'];
    const label = resolved ? (correct ? labels[stepIdx] : 'Log Compromise') : 'Analyzing Log Security Policy';
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">Scenario ${stepIdx+1}: ${label}</text>
      <rect x="100" y="110" width="300" height="200" rx="12" fill="#fff" stroke="${statusColor}" stroke-width="3"/>
      <rect x="100" y="110" width="300" height="40" rx="12" fill="${!resolved?'#f0f6ff':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}"/>
      <text x="250" y="135" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">Secure Log Vault</text>
      <text x="250" y="195" font-family="sans-serif" font-size="36" text-anchor="middle">${resolved&&correct?'🔒':(resolved?'💀':'📦')}</text>
      <text x="250" y="238" font-family="sans-serif" font-size="11" fill="#485c70" text-anchor="middle">${label} Control</text>
      <text x="250" y="278" font-family="sans-serif" font-size="10" fill="${statusColor}" text-anchor="middle">${!resolved?'Awaiting selection...':(correct?'✓ Log tamper-proof':'✗ Logs modifiable')}</text>
      <rect x="80" y="385" width="340" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5" ${resolved?(correct?'class="glow-success"':'class="glow-danger"'):''}/>
      <text x="250" y="414" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Select log integrity control':(correct?'Log Integrity Preserved':'Logs Vulnerable to Tampering')}</text>
    `);
  }

  // ==================== Day 2 Module 6: Application & API Security ====================
  drawM6OWASPBrowser(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const item = this.activeGame&&this.activeGame.items?this.activeGame.items[stepIdx]:null;
    const isVulnerable = item?item.correctAction==='vulnerable':false;
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    const reviews = ['SQL Injection','Schema Check','Secret Leak','Rate Limit','MD5 Passwords'];
    const review = resolved ? (correct ? (reviews[stepIdx] || 'Code Review') : 'Vulnerability Check Failed') : 'Scanning Code Patterns';
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">OWASP Code Review ${stepIdx+1}: ${review}</text>
      <rect x="60" y="92" width="380" height="250" rx="10" fill="#1a1a2e" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="60" y="92" width="380" height="30" rx="10" fill="#2d2d44"/>
      <circle cx="85" cy="107" r="6" fill="#e74c3c"/><circle cx="105" cy="107" r="6" fill="#f2a900"/><circle cx="125" cy="107" r="6" fill="#2ecc71"/>
      <text x="250" y="110" font-family="sans-serif" font-size="10" fill="#7d93a8" text-anchor="middle">browser console</text>
      <text x="80" y="148" font-family="monospace" font-size="10" fill="#00b5e2">// ${review} review</text>
      <text x="80" y="172" font-family="monospace" font-size="10" fill="${resolved ? (isVulnerable ? '#e74c3c' : '#2ecc71') : '#f2a900'}">${resolved ? (isVulnerable ? '⚠ VULNERABLE PATTERN' : '✓ SECURE PATTERN') : 'ANALYZING PATTERN...'}</text>
      <text x="80" y="200" font-family="monospace" font-size="9" fill="#7d93a8">Severity: ${resolved ? (isVulnerable ? 'CRITICAL' : 'PASS') : 'PENDING...'}</text>
      <text x="80" y="225" font-family="monospace" font-size="9" fill="#7d93a8">OWASP Classification: ${resolved ? (stepIdx < 2 ? 'A03-Injection' : (stepIdx < 3 ? 'A07-Auth' : 'A02-Cryptographic')) : 'PENDING...'}</text>
      <rect x="60" y="360" width="380" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="389" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Classify: Secure or Vulnerable?':(correct?'Correct Classification!':'Review OWASP Category')}</text>
    `);
  }

  drawM6APIGateway() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    const gateItems = ['CORS Restrict','Rate Limiting','JWT Verify','Schema Validate'];
    const gatesHTML = gateItems.map((lbl,i)=>`<rect x="160" y="${148+i*44}" width="180" height="34" rx="6" fill="#f8fafc" stroke="${resolved&&correct?'#2ecc71':'#e2e8f0'}"/><circle cx="175" cy="${165+i*44}" r="7" fill="${resolved&&correct?'#2ecc71':'#0056b3'}"/><text x="195" y="${169+i*44}" font-family="sans-serif" font-size="10" fill="#0a1c2a">${lbl}</text><text x="325" y="${169+i*44}" font-family="sans-serif" font-size="9" fill="${resolved&&correct?'#2ecc71':'#7d93a8'}" text-anchor="middle">Active</text>`).join('');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'API Gateway Defense Layer':(correct?'Gateway Fully Secured!':'Gateway Misconfigured')}</text>
      <rect x="140" y="90" width="220" height="240" rx="10" fill="#fff" stroke="${statusColor}" stroke-width="3"/>
      <rect x="140" y="90" width="220" height="40" rx="10" fill="${!resolved?'#f0f6ff':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}"/>
      <text x="250" y="115" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">API Gateway</text>
      ${gatesHTML}
      <path d="M 60,220 L 140,220" fill="none" stroke="${resolved&&correct?'#2ecc71':'#0056b3'}" stroke-width="3" stroke-dasharray="5,3" class="animate-dash-slow"/>
      <text x="100" y="210" font-family="sans-serif" font-size="9" fill="#7d93a8" text-anchor="middle">Client</text>
      <path d="M 360,220 L 440,220" fill="none" stroke="${resolved&&correct?'#2ecc71':'#0056b3'}" stroke-width="3" stroke-dasharray="5,3" class="animate-dash-slow"/>
      <text x="400" y="210" font-family="sans-serif" font-size="9" fill="#7d93a8" text-anchor="middle">Service</text>
      <rect x="80" y="405" width="340" height="40" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="429" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Configure API gateway defenses':(correct?'API Gateway Hardened':'Gateway Has Security Gaps')}</text>
    `);
  }

  drawM6WAFRegex(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const attacks = ['XSS Script Inject','Slowloris HTTP','Admin Path Probe','Bot Scraping','Zero-Day Virtual Patch'];
    const attackLabel = resolved ? attacks[stepIdx] : 'Incoming HTTP Request Payload';
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">WAF Rule ${stepIdx+1}: ${resolved ? 'Filter Active' : 'Rule Analysis'}</text>
      <rect x="60" y="100" width="380" height="240" rx="10" fill="#fff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="60" y="100" width="380" height="36" rx="10" fill="#f8fafc"/>
      <text x="250" y="123" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">WAF L7 Payload Inspector</text>
      <rect x="80" y="148" width="340" height="60" rx="6" fill="#1a1a2e"/>
      <text x="100" y="170" font-family="monospace" font-size="9" fill="#e74c3c">INBOUND: ${attackLabel}</text>
      <text x="100" y="190" font-family="monospace" font-size="9" fill="${resolved&&correct?'#2ecc71':'#f2a900'}">RULE ENGINE: ${resolved?(correct?'MATCH → BLOCK':'NO MATCH'):'SCANNING...'}</text>
      <rect x="80" y="220" width="340" height="50" rx="6" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.06)':'rgba(231,76,60,0.06)')}" stroke="${!resolved?'#cbd5e1':(correct?'#2ecc71':'#e74c3c')}" stroke-width="2"/>
      <text x="250" y="249" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Rule Result: Pending...':(correct?'✓ Attack Blocked':'✗ Attack Passes Through')}</text>
      <rect x="80" y="365" width="340" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="394" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Select WAF rule to apply':(correct?'WAF Rule Applied Successfully':'Wrong Rule Selected')}</text>
    `);
  }

  // ==================== Day 2 Module 7: Secure DevOps ====================
  drawM7PipelineGates() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const gateLabels = ['Commit','SAST','SCA','IaC Scan','DAST'];
    const correctOrder = ['devops_step_commit','devops_step_sast','devops_step_sca','devops_step_iac','devops_step_dast'];
    let gateHTML = '';
    const startX = 50;
    const spacingX = 85;
    for (let i=0;i<5;i++) {
      const step = this.sortingOrder[i];
      if (!step) continue;
      const labelIdx = correctOrder.indexOf(step.id);
      const label = labelIdx>=0?gateLabels[labelIdx]:`G${i+1}`;
      const isCorrect = !resolved||step.correctIndex===i;
      const gateColor = !resolved?'#0056b3':(isCorrect?'#2ecc71':'#e74c3c');
      const cx = startX+i*spacingX+40;
      if (i>0) {
        gateHTML += `<line x1="${startX+(i-1)*spacingX+80}" y1="200" x2="${cx}" y2="200" stroke="${resolved&&correct?'#2ecc71':'#cbd5e1'}" stroke-width="3" stroke-dasharray="${resolved&&correct?'5,3':'none'}" class="${resolved&&correct?'animate-dash-slow':''}"/>`;
      }
      gateHTML += `<circle cx="${cx}" cy="200" r="32" fill="#fff" stroke="${gateColor}" stroke-width="3"/>`;
      gateHTML += `<text x="${cx}" y="200" font-family="sans-serif" font-size="9" fill="${gateColor}" font-weight="bold" text-anchor="middle">${label}</text>`;
      if (resolved) gateHTML += `<text x="${cx}" y="235" font-family="sans-serif" font-size="14" text-anchor="middle">${isCorrect?'✔':'✖'}</text>`;
    }
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'DevSecOps Pipeline Gates':(correct?'Pipeline Order Verified!':'Gate Sequence Error')}</text>
      <line x1="50" y1="200" x2="450" y2="200" stroke="#e2e8f0" stroke-width="2"/>
      ${gateHTML}
      <rect x="80" y="320" width="340" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="349" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Sequence the pipeline scan gates':(correct?'DevSecOps Pipeline Secured':'Incorrect Gate Ordering')}</text>
    `);
  }

  drawM7IaCConsole(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const item = this.activeGame&&this.activeGame.items?this.activeGame.items[stepIdx]:null;
    const isVulnerable = item?item.correctAction==='vulnerable':false;
    const reviews = ['SSH 0.0.0.0/0','S3 Private ACL','DB Pass Hardcode','HTTP→HTTPS','Single Region Trail'];
    const review = resolved ? (correct ? (reviews[stepIdx] || 'IaC Scan') : 'Audit Failed') : 'Analyzing Template Resource';
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">IaC Review ${stepIdx+1}: ${review}</text>
      <rect x="60" y="92" width="380" height="250" rx="10" fill="#1a1a2e" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="60" y="92" width="380" height="28" rx="10" fill="#2d2d44"/>
      <text x="250" y="110" font-family="monospace" font-size="10" fill="#7d93a8" text-anchor="middle">terraform_config.tf — linter output</text>
      <text x="80" y="145" font-family="monospace" font-size="9" fill="#00b5e2">resource "${review.replace(/ /g,'_').toLowerCase()}" {'{'}</text>
      <text x="100" y="168" font-family="monospace" font-size="9" fill="${resolved ? (isVulnerable?'#e74c3c':'#2ecc71') : '#f2a900'}">${resolved ? (isVulnerable?'  ⚠ MISCONFIGURATION DETECTED':'  ✓ SECURE CONFIGURATION') : '  ANALYZING TEMPLATE PARAMS...'}</text>
      <text x="80" y="192" font-family="monospace" font-size="9" fill="#7d93a8">{'}'}</text>
      <text x="80" y="222" font-family="monospace" font-size="9" fill="#f2a900">// Risk: ${resolved ? (isVulnerable?'HIGH':'PASS') : 'PENDING'} — Compliance: ${resolved ? (isVulnerable?'FAIL':'PASS') : 'PENDING'}</text>
      <text x="80" y="248" font-family="monospace" font-size="9" fill="#7d93a8">Scan: Checkov v2.3.0</text>
      <text x="80" y="272" font-family="monospace" font-size="9" fill="${resolved ? (isVulnerable?'#e74c3c':'#2ecc71') : '#cbd5e1'}">Result: ${resolved ? (isVulnerable?'[FAILED] 1 misconfiguration':'[PASSED] No issues found') : 'Awaiting manual audit classification...'}</text>
      <rect x="60" y="360" width="380" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="389" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Classify: Secure or Vulnerable?':(correct?'Correct IaC Classification!':'Review Terraform Security Rules')}</text>
    `);
  }

  drawM7SecretLeak(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const labels = ['Key Revocation','Git Filter Repo','Key Vault Fetch','Pre-commit Hook','Pipeline Gate Block'];
    const label = resolved ? (correct ? labels[stepIdx] : 'Exposure Continuing') : 'Evaluating Secret Exposure';
    const statusColor = !resolved?'#0056b3':(correct?'#2ecc71':'#e74c3c');
    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="55" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">Scenario ${stepIdx+1}: ${label}</text>
      <rect x="100" y="100" width="300" height="200" rx="12" fill="#fff" stroke="${statusColor}" stroke-width="2"/>
      <rect x="100" y="100" width="300" height="36" rx="12" fill="${!resolved?'#fff8e1':(correct?'rgba(46,204,113,0.05)':'rgba(231,76,60,0.05)')}"/>
      <text x="250" y="123" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">Secret Exposure Response</text>
      <text x="250" y="185" font-family="sans-serif" font-size="36" text-anchor="middle">${resolved&&correct?'🔑':(resolved?'💀':'⚠️')}</text>
      <text x="250" y="232" font-family="sans-serif" font-size="11" fill="#485c70" text-anchor="middle">${label}</text>
      <text x="250" y="270" font-family="sans-serif" font-size="10" fill="${statusColor}" text-anchor="middle">${!resolved?'Step under evaluation...':(correct?'✓ Secret invalidated successfully':'✗ Credential exposure continues')}</text>
      <rect x="80" y="375" width="340" height="50" rx="8" fill="${!resolved?'#f8fafc':(correct?'rgba(46,204,113,0.08)':'rgba(231,76,60,0.08)')}" stroke="${statusColor}" stroke-width="1.5" ${resolved?(correct?'class="glow-success"':'class="glow-danger"'):''}/>
      <text x="250" y="404" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${!resolved?'Select secret remediation step':(correct?'Credential Leak Remediated':'Incorrect — Credential Still Active')}</text>
    `);
  }
}


