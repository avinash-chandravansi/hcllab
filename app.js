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
    this.completedGames = JSON.parse(localStorage.getItem('completed_games')) || {};

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

    // Reset All Progress
    const btnResetAll = document.getElementById('btn-reset-all');
    if (btnResetAll) {
      btnResetAll.addEventListener('click', () => {
        if (confirm('Reset ALL progress across all modules?')) {
          this.completedGames = {};
          localStorage.setItem('completed_games', JSON.stringify(this.completedGames));
          this.renderHub();
        }
      });
    }

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
    this.gameView.style.display = (viewName === 'game' || viewName === 'results') ? 'grid' : 'none';
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

    localStorage.setItem('completed_games', JSON.stringify(this.completedGames));
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

    const labels = ['A', 'B', 'C', 'D', 'E'];

    workspace.innerHTML = `
      <div class="scenario-workspace">
        <div class="scenario-header-row">
          <span class="scenario-step-badge">Scenario ${this.currentDecisionIndex + 1} <span class="scenario-of-five">of 5</span></span>
        </div>
        <div class="scenario-context-block">
          <div class="scenario-context-label">SITUATION</div>
          <div class="scenario-context-text">${decision.scenario}</div>
        </div>
        <div class="question-block">
          <div class="question-icon">?</div>
          <h4 class="question-text-new">${decision.question}</h4>
        </div>
        <div id="options-list" class="options-list-new"></div>
      </div>
    `;

    const optionsContainer = workspace.querySelector('#options-list');
    decision.options.forEach((opt, idx) => {
      const optBtn = document.createElement('button');
      optBtn.className = 'option-btn-new';
      optBtn.innerHTML = `
        <span class="option-letter">${labels[idx]}</span>
        <span class="option-text-content">${opt}</span>
      `;
      optBtn.addEventListener('click', () => this.selectOption(idx));
      optionsContainer.appendChild(optBtn);
    });
  }

  selectOption(idx) {
    if (document.getElementById('btn-next').style.display === 'block') return;

    this.selectedOptionIndex = idx;
    
    const options = document.querySelectorAll('#options-list .option-btn-new');
    options.forEach((btn, btnIdx) => {
      if (btnIdx === idx) {
        btn.classList.add('selected');
        btn.querySelector('.option-letter').classList.add('selected-letter');
      } else {
        btn.classList.remove('selected');
        btn.querySelector('.option-letter').classList.remove('selected-letter');
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
        <div class="drag-instruction-bar">
          <span class="drag-instruction-icon">↔</span>
          <span>Click a card to select it, then click a column — or drag it directly into place</span>
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
        <div class="swiper-instructions">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          Classify each authentication event as <strong>Secure</strong> or <strong>Vulnerable</strong>
        </div>
        
        <div class="card-deck-container" id="swiper-deck"></div>

        <div class="swiper-controls" id="swiper-btns">
          <button class="btn-swipe-vulnerable" id="btn-vulnerable">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle; margin-right:6px"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            Vulnerable
          </button>
          <button class="btn-swipe-secure" id="btn-secure">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:middle; margin-right:6px"><path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3z"/></svg>
            Secure
          </button>
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
        <div class="scenario-context-block" style="margin-bottom:14px;">
          <div class="scenario-context-label">SECURITY AUDIT CHALLENGE</div>
          <div class="scenario-context-text">A security auditor has flagged your PaaS web application as vulnerable. Review each control below and toggle them to their correct security state to pass the audit.</div>
        </div>

        <div class="server-card">
          <div class="server-header">
            <div class="server-title">
              <svg style="width:20px; height:20px; fill:#0056b3" viewBox="0 0 24 24"><path d="M12,16A3,3 0 0,1 9,13C9,11.88 9.77,10.94 10.8,10.68L8.6,3H10L12,10L14,3H15.4L13.2,10.68C14.23,10.94 15,11.88 15,13A3,3 0 0,1 12,16M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/></svg>
              App Security Configuration Review
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
        <div class="sorting-instruction-bar">
          <span class="sorting-instruction-icon">↕</span>
          <span>Drag or use <strong>▲ ▼</strong> arrows to arrange steps in the correct chronological order</span>
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
    
    this.isCurrentStepResolved = true;
    this.isCurrentStepCorrect = isCorrect;
    this.renderLeftDiagram();

    // Visual feedback on option buttons
    const options = document.querySelectorAll('#options-list .option-btn-new');
    options.forEach((btn, idx) => {
      btn.style.pointerEvents = 'none';
      const letter = btn.querySelector('.option-letter');
      if (idx === decision.correctIndex) {
        btn.style.borderColor = '#2ecc71';
        btn.style.background = 'rgba(46,204,113,0.06)';
        if (letter) { letter.style.background='#2ecc71'; letter.style.borderColor='#2ecc71'; letter.style.color='#fff'; }
      } else if (idx === this.selectedOptionIndex && !isCorrect) {
        btn.style.borderColor = '#e74c3c';
        btn.style.background = 'rgba(231,76,60,0.05)';
        if (letter) { letter.style.background='#e74c3c'; letter.style.borderColor='#e74c3c'; letter.style.color='#fff'; }
      }
    });

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
    nextBtn.textContent = this.currentDecisionIndex < 4 ? 'Next Scenario' : 'View Results';
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
    localStorage.setItem('completed_games', JSON.stringify(this.completedGames));

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

    if (gameId === 'm1_g1') {
      if (stepIdx === 0) svgContent = this.drawIaaSOSPatching();
      else if (stepIdx === 1) svgContent = this.drawIaaSFirewall();
      else if (stepIdx === 2) svgContent = this.drawIaaSStorage();
      else if (stepIdx === 3) svgContent = this.drawIaaSDDoS();
      else if (stepIdx === 4) svgContent = this.drawIaaSHypervisor();
    } else if (gameId === 'm1_g2') {
      svgContent = this.drawPaaSDashboard();
    } else if (gameId === 'm1_g3') {
      if (stepIdx === 0) svgContent = this.drawSaaSCRM();
      else if (stepIdx === 1) svgContent = this.drawSaaSSharing();
      else if (stepIdx === 2) svgContent = this.drawSaaSVendorDB();
      else if (stepIdx === 3) svgContent = this.drawSaaSMFA();
      else if (stepIdx === 4) svgContent = this.drawSaaSPhysicalSecurity();
    } else if (gameId === 'm1_g4') {
      svgContent = this.drawSharedResponsibilityScale();
    } else if (gameId === 'm1_g5') {
      if (stepIdx === 0) svgContent = this.drawHybridVPN();
      else if (stepIdx === 1) svgContent = this.drawHybridADSync();
      else if (stepIdx === 2) svgContent = this.drawHybridFiberCut();
      else if (stepIdx === 3) svgContent = this.drawHybridAPIGateway();
      else if (stepIdx === 4) svgContent = this.drawHybridHardwareFailure();
    } else if (gameId === 'm2_g1') {
      svgContent = this.drawAuthNDecisionGrid();
    } else if (gameId === 'm2_g2') {
      if (stepIdx === 0) svgContent = this.drawMFASMS();
      else if (stepIdx === 1) svgContent = this.drawMFAFIDO();
      else if (stepIdx === 2) svgContent = this.drawMFAPushFatigue();
      else if (stepIdx === 3) svgContent = this.drawMFATOTP();
      else if (stepIdx === 4) svgContent = this.drawMFALegacy();
    } else if (gameId === 'm2_g3') {
      svgContent = this.drawPAMSortingTimeline();
    } else if (gameId === 'm2_g4') {
      if (stepIdx === 0) svgContent = this.drawZTEncryption();
      else if (stepIdx === 1) svgContent = this.drawZTMicroseg();
      else if (stepIdx === 2) svgContent = this.drawZTDeviceHealth();
      else if (stepIdx === 3) svgContent = this.drawZTAttestation();
      else if (stepIdx === 4) svgContent = this.drawZTSessionRevoke();
    } else if (gameId === 'm2_g5') {
      if (stepIdx === 0) svgContent = this.drawGovAccessReview();
      else if (stepIdx === 1) svgContent = this.drawGovLifecycle();
      else if (stepIdx === 2) svgContent = this.drawGovSoD();
      else if (stepIdx === 3) svgContent = this.drawGovHRSync();
      else if (stepIdx === 4) svgContent = this.drawGovAuditWORM();
    } else if (gameId === 'm3_g1') {
      if (stepIdx === 0) svgContent = this.drawM3VPCSubnets();
      else if (stepIdx === 1) svgContent = this.drawM3TransitGateway();
      else if (stepIdx === 2) svgContent = this.drawM3BastionIAP();
      else if (stepIdx === 3) svgContent = this.drawM3PrivateLink();
      else if (stepIdx === 4) svgContent = this.drawM3FlowLogs();
    } else if (gameId === 'm3_g2') {
      svgContent = this.drawM3NSGvsWAFScale();
    } else if (gameId === 'm3_g3') {
      svgContent = this.drawM3WAFConsole();
    } else if (gameId === 'm3_g4') {
      if (stepIdx === 0) svgContent = this.drawM3DDoSScrubbing();
      else if (stepIdx === 1) svgContent = this.drawM3L7DDoS();
      else if (stepIdx === 2) svgContent = this.drawM3OriginShield();
      else if (stepIdx === 3) svgContent = this.drawM3SYNFlood();
      else if (stepIdx === 4) svgContent = this.drawM3DDoSCost();
    } else if (gameId === 'm4_g1') {
      svgContent = this.drawM4RestTransitScale();
    } else if (gameId === 'm4_g2') {
      if (stepIdx === 0) svgContent = this.drawM4ConfComputing();
      else if (stepIdx === 1) svgContent = this.drawM4Homomorphic();
      else if (stepIdx === 2) svgContent = this.drawM4Attestation();
      else if (stepIdx === 3) svgContent = this.drawM4HardwareEnclave();
      else if (stepIdx === 4) svgContent = this.drawM4MemoryEncryption();
    } else if (gameId === 'm4_g3') {
      svgContent = this.drawM4KeyRotationTimeline();
    } else if (gameId === 'm4_g4') {
      if (stepIdx === 0) svgContent = this.drawM4CMKKeyVault();
      else if (stepIdx === 1) svgContent = this.drawM4EnvelopeEncryption();
      else if (stepIdx === 2) svgContent = this.drawM4HSMModule();
      else if (stepIdx === 3) svgContent = this.drawM4VaultFirewall();
      else if (stepIdx === 4) svgContent = this.drawM4PurgeProtection();
    } else if (gameId === 'm5_g1') {
      svgContent = this.drawM5MisconfigDashboard();
    } else if (gameId === 'm5_g2') {
      svgContent = this.drawM5IdentityAttackCards(stepIdx);
    } else if (gameId === 'm5_g3') {
      svgContent = this.drawM5IncidentPipeline();
    } else if (gameId === 'm5_g4') {
      if (stepIdx === 0) svgContent = this.drawM5SSRFMetadata();
      else if (stepIdx === 1) svgContent = this.drawM5SubdomainTakeover();
      else if (stepIdx === 2) svgContent = this.drawM5Cryptojacking();
      else if (stepIdx === 3) svgContent = this.drawM5BackupRansomware();
      else if (stepIdx === 4) svgContent = this.drawM5DataExfiltration();
    }

    container.innerHTML = svgContent;
  }

  wrapSVG(innerContent) {
    return `<svg class="diagram-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="none"/>
      ${innerContent}
    </svg>`;
  }

  // ==================== SVGs FOR IAAS (m1_g1) ====================
  drawIaaSOSPatching() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let patchStateHTML = `
      <rect x="90" y="190" width="320" height="60" rx="8" fill="rgba(231, 76, 60, 0.06)" stroke="#e74c3c" stroke-dasharray="4,4" stroke-width="2"/>
      <text x="110" y="225" font-family="sans-serif" font-size="13" fill="#e74c3c" font-weight="bold">VULNERABLE KERNEL VERSION (Unpatched)</text>
    `;

    if (resolved) {
      if (correct) {
        patchStateHTML = `
          <rect x="90" y="190" width="320" height="60" rx="8" fill="rgba(46, 204, 113, 0.06)" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
          <text x="110" y="225" font-family="sans-serif" font-size="13" fill="#2ecc71" font-weight="bold">GUEST OS SECURED (Patched: Linux 6.1)</text>
        `;
      } else {
        patchStateHTML = `
          <rect x="90" y="190" width="320" height="60" rx="8" fill="rgba(231, 76, 60, 0.12)" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
          <text x="110" y="225" font-family="sans-serif" font-size="13" fill="#e74c3c" font-weight="bold">EXPLOITED: OS vulnerability active!</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="50" y="100" width="400" height="300" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="50" y="100" width="400" height="50" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="80" cy="125" r="6" fill="#e74c3c"/>
      <circle cx="100" cy="125" r="6" fill="#f2a900"/>
      <circle cx="120" cy="125" r="6" fill="#2ecc71"/>
      <text x="150" y="130" font-family="sans-serif" font-size="14" fill="#0a1c2a" font-weight="bold">Virtual Machine Guest OS</text>
      
      ${patchStateHTML}
      
      <line x1="250" y1="360" x2="250" y2="280" stroke="#0056b3" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-slow"/>
      <polygon points="250,270 244,285 256,285" fill="#0056b3"/>
      <rect x="150" y="340" width="200" height="40" rx="20" fill="#0056b3"/>
      <text x="250" y="364" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">Customer Patch Deployment</text>
    `);
  }

  drawIaaSFirewall() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let pathColor = "#e74c3c";
    let badgeHTML = `
      <rect x="220" y="140" width="220" height="60" rx="8" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="2"/>
      <text x="330" y="165" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">PORT 3306 OPEN TO 0.0.0.0/0</text>
      <text x="330" y="185" font-family="sans-serif" font-size="11" fill="#485c70" text-anchor="middle">Inbound security rule check failed</text>
    `;

    if (resolved) {
      if (correct) {
        pathColor = "#2ecc71";
        badgeHTML = `
          <rect x="220" y="140" width="220" height="60" rx="8" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
          <text x="330" y="165" font-family="sans-serif" font-size="12" fill="#2ecc71" font-weight="bold" text-anchor="middle">PORT 3306 SECURED & CLOSED</text>
          <text x="330" y="185" font-family="sans-serif" font-size="11" fill="#485c70" text-anchor="middle">Restricted to corporate IPs</text>
        `;
      } else {
        badgeHTML = `
          <rect x="220" y="140" width="220" height="60" rx="8" fill="rgba(231, 76, 60, 0.15)" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
          <text x="330" y="165" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">DATABASE BREACHED</text>
          <text x="330" y="185" font-family="sans-serif" font-size="11" fill="#e74c3c" text-anchor="middle">Port compromised by external source</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="50" y="80" width="120" height="60" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="110" y="115" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Public Internet</text>
      
      <rect x="330" y="240" width="120" height="180" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="350" y="280" width="80" height="30" rx="4" fill="#0056b3" opacity="0.1"/>
      <text x="390" y="300" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">MySQL DB</text>
      
      <path d="M 170,110 L 390,110 L 390,240" fill="none" stroke="${pathColor}" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-fast"/>
      ${badgeHTML}
    `);
  }

  drawIaaSStorage() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let lockBadge = `
      <rect x="160" y="250" width="180" height="80" rx="8" fill="rgba(231, 76, 60, 0.05)" stroke="#e74c3c" stroke-width="2"/>
      <text x="250" y="285" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">UNENCRYPTED STORAGE</text>
      <text x="250" y="305" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">No KMS Key Active</text>
    `;

    if (resolved) {
      if (correct) {
        lockBadge = `
          <rect x="160" y="250" width="180" height="80" rx="8" fill="#ffffff" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
          <text x="250" y="285" font-family="sans-serif" font-size="12" fill="#2ecc71" font-weight="bold" text-anchor="middle">AES-256 ENCRYPTED</text>
          <text x="250" y="305" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">Customer KMS Key Active</text>
        `;
      } else {
        lockBadge = `
          <rect x="160" y="250" width="180" height="80" rx="8" fill="rgba(231, 76, 60, 0.12)" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
          <text x="250" y="285" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">PLAIN DATA EXPOSED</text>
          <text x="250" y="305" font-family="sans-serif" font-size="10" fill="#e74c3c" text-anchor="middle">Compliance check failed</text>
        `;
      }
    }

    return this.wrapSVG(`
      <ellipse cx="250" cy="150" rx="100" ry="40" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <path d="M 150,150 L 150,290 A 100,40 0 0,0 350,290 L 350,150" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <ellipse cx="250" cy="290" rx="100" ry="40" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="200" font-family="sans-serif" font-size="14" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Cloud Drive Volume</text>
      ${lockBadge}
    `);
  }

  drawIaaSDDoS() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let flowColor = "#e74c3c";
    let badgeText = "DDoS Flood Attack Active";
    let badgeClass = "glow-danger";

    if (resolved) {
      if (correct) {
        flowColor = "#00b5e2";
        badgeText = "DDoS Mitigated at Cloud Edge";
        badgeClass = "glow-success";
      } else {
        flowColor = "#cbd5e1";
        badgeText = "Core Switch Offline (Overloaded)";
        badgeClass = "glow-danger";
      }
    }

    const bgBadge = flowColor === "#00b5e2" ? "#2ecc71" : "#e74c3c";

    return this.wrapSVG(`
      <rect x="180" y="100" width="140" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="145" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Provider Core Switch</text>
      
      <line x1="50" y1="260" x2="190" y2="170" stroke="${flowColor}" stroke-width="4" stroke-dasharray="5,3" class="animate-dash-fast"/>
      <line x1="250" y1="320" x2="250" y2="180" stroke="${flowColor}" stroke-width="4" stroke-dasharray="5,3" class="animate-dash-fast"/>
      <line x1="450" y1="260" x2="310" y2="170" stroke="${flowColor}" stroke-width="4" stroke-dasharray="5,3" class="animate-dash-fast"/>
      
      <rect x="100" y="240" width="300" height="50" rx="25" fill="${bgBadge}" class="${badgeClass}"/>
      <text x="250" y="270" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">${badgeText.toUpperCase()}</text>
    `);
  }

  drawIaaSHypervisor() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let traceHTML = `
      <path d="M 145,180 L 145,260 L 355,260 L 355,180" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-fast"/>
      <text x="250" y="245" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">Cross-VM RAM Leakage</text>
    `;

    if (resolved) {
      if (correct) {
        traceHTML = `
          <rect x="190" y="235" width="120" height="50" rx="6" fill="#ffffff" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
          <text x="250" y="265" font-family="sans-serif" font-size="10" fill="#2ecc71" font-weight="bold" text-anchor="middle">Tenant Isolation Verified</text>
        `;
      } else {
        traceHTML = `
          <path d="M 145,180 L 145,260 L 355,260 L 355,180" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-fast"/>
          <rect x="190" y="235" width="120" height="50" rx="6" fill="#ffffff" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
          <text x="250" y="265" font-family="sans-serif" font-size="10" fill="#e74c3c" font-weight="bold" text-anchor="middle">Breakout Compromise</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="50" y="260" width="400" height="120" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="325" font-family="sans-serif" font-size="15" fill="#0056b3" font-weight="bold" text-anchor="middle">Physical Host Hypervisor Layer</text>
      
      <rect x="80" y="80" width="130" height="100" rx="8" fill="#ffffff" stroke="#e74c3c" stroke-width="2"/>
      <text x="145" y="135" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">Tenant A (Attacker)</text>
      
      <rect x="290" y="80" width="130" height="100" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="355" y="135" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Tenant B (Target)</text>
      
      ${traceHTML}
    `);
  }

  // ==================== SAAS PROGRAM STEPS (m1_g3) ====================
  drawSaaSCRM() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let pathHTML = `
      <path d="M 200,145 L 365,145 L 365,220" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-fast"/>
      <rect x="190" y="170" width="160" height="40" rx="6" fill="#ffffff" stroke="#cbd5e1"/>
      <text x="270" y="194" font-family="sans-serif" font-size="10" fill="#e74c3c" font-weight="bold" text-anchor="middle">Credentials active (No offboarding)</text>
    `;

    if (resolved) {
      if (correct) {
        pathHTML = `
          <path d="M 200,145 L 260,145" fill="none" stroke="#cbd5e1" stroke-width="2"/>
          <text x="270" y="150" font-family="sans-serif" font-size="18" text-anchor="middle">✂️</text>
          <rect x="235" y="180" width="160" height="35" rx="6" fill="#ffffff" stroke="#2ecc71" stroke-width="2"/>
          <text x="315" y="202" font-family="sans-serif" font-size="10" fill="#2ecc71" font-weight="bold" text-anchor="middle">Account disabled automatically</text>
        `;
      } else {
        pathHTML = `
          <path d="M 200,145 L 365,145 L 365,220" fill="none" stroke="#e74c3c" stroke-width="4" stroke-dasharray="4,2" class="animate-dash-fast"/>
          <rect x="210" y="170" width="170" height="40" rx="6" fill="#e74c3c" class="glow-danger"/>
          <text x="295" y="194" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">Ex-employee downloaded CRM logs</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="70" y="100" width="130" height="90" rx="8" fill="#ffffff" stroke="#e74c3c" stroke-width="2"/>
      <text x="135" y="145" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">Discharged Employee</text>
      
      <rect x="300" y="220" width="130" height="90" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="365" y="265" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">SaaS CRM portal</text>
      ${pathHTML}
    `);
  }

  drawSaaSSharing() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let alertHTML = `
      <rect x="100" y="280" width="300" height="60" rx="8" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
      <text x="250" y="305" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">Anonymous Access Link Enabled</text>
      <text x="250" y="325" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">Anyone with link can read salary logs</text>
    `;

    if (resolved) {
      if (correct) {
        alertHTML = `
          <rect x="100" y="280" width="300" height="60" rx="8" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
          <text x="250" y="305" font-family="sans-serif" font-size="12" fill="#2ecc71" font-weight="bold" text-anchor="middle">Sharing restricted to Internal Org</text>
          <text x="250" y="325" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">Anonymous links disabled by policy</text>
        `;
      } else {
        alertHTML = `
          <rect x="100" y="280" width="300" height="60" rx="8" fill="#e74c3c" class="glow-danger"/>
          <text x="250" y="305" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">CONFIDENTIAL DATA LEAKED</text>
          <text x="250" y="325" font-family="sans-serif" font-size="10" fill="#ffffff" text-anchor="middle">Budget details accessed externally</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="180" y="100" width="140" height="140" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="210" y="130" width="80" height="60" rx="4" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2"/>
      <line x1="225" y1="150" x2="275" y2="150" stroke="#2ecc71"/>
      <line x1="225" y1="170" x2="275" y2="170" stroke="#2ecc71"/>
      <text x="250" y="220" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Budget.xlsx</text>
      ${alertHTML}
    `);
  }

  drawSaaSVendorDB() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let statusHTML = `
      <rect x="180" y="320" width="140" height="40" rx="6" fill="#e74c3c" class="glow-danger"/>
      <text x="250" y="344" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">Database Vulnerable</text>
    `;

    if (resolved) {
      if (correct) {
        statusHTML = `
          <rect x="180" y="320" width="140" height="40" rx="6" fill="#2ecc71" class="glow-success"/>
          <text x="250" y="344" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">Security patch verified</text>
        `;
      } else {
        statusHTML = `
          <rect x="180" y="320" width="140" height="40" rx="6" fill="#e74c3c" class="glow-danger"/>
          <text x="250" y="344" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">DATA EXFILTRATED</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="80" y="100" width="340" height="280" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="80" y="100" width="340" height="50" rx="12" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="110" y="130" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold">SaaS Vendor Multi-Tenant DB</text>

      <ellipse cx="250" cy="200" rx="70" ry="25" fill="#f8fafc" stroke="#cbd5e1"/>
      <ellipse cx="250" cy="240" rx="70" ry="25" fill="#f8fafc" stroke="#cbd5e1"/>
      <ellipse cx="250" cy="280" rx="70" ry="25" fill="#f8fafc" stroke="#e74c3c" stroke-width="2"/>
      ${statusHTML}
    `);
  }

  drawSaaSMFA() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let mfaHTML = `
      <rect x="175" y="200" width="150" height="50" rx="6" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-dasharray="4,4"/>
      <text x="250" y="225" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">MFA Status: DISABLED</text>
    `;

    if (resolved) {
      if (correct) {
        mfaHTML = `
          <rect x="175" y="200" width="150" height="50" rx="6" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2"/>
          <text x="250" y="225" font-family="sans-serif" font-size="12" fill="#2ecc71" font-weight="bold" text-anchor="middle">MFA Status: ENFORCED</text>
        `;
      } else {
        mfaHTML = `
          <rect x="175" y="200" width="150" height="50" rx="6" fill="#e74c3c" class="glow-danger"/>
          <text x="250" y="228" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">ACCOUNT COMPROMISED</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="150" y="100" width="200" height="280" rx="15" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="175" y="140" width="150" height="40" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="250" y="165" font-family="sans-serif" font-size="12" fill="#7d93a8" text-anchor="middle">Password: *********</text>
      ${mfaHTML}
    `);
  }

  drawSaaSPhysicalSecurity() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let alertHTML = `
      <rect x="130" y="310" width="240" height="40" rx="6" fill="#0056b3" opacity="0.1"/>
      <text x="250" y="334" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">Cloud Datacenter: secure perimeter</text>
    `;

    if (resolved && !correct) {
      alertHTML = `
        <rect x="130" y="310" width="240" height="40" rx="6" fill="#e74c3c" class="glow-danger"/>
        <text x="250" y="334" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">PHYSICAL TRESPASS ATTEMPT</text>
      `;
    }

    return this.wrapSVG(`
      <rect x="80" y="100" width="340" height="280" rx="10" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <rect x="140" y="160" width="220" height="120" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
      <circle cx="250" cy="200" r="24" fill="#0056b3" opacity="0.1"/>
      <text x="250" y="208" font-family="sans-serif" font-size="24" text-anchor="middle">🏢</text>
      ${alertHTML}
    `);
  }

  // ==================== HYBRID COMPONENT SVGS (m1_g5) ====================
  drawHybridVPN() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let pathHTML = `
      <path d="M 170,200 L 330,200" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-fast"/>
      <circle cx="250" cy="200" r="20" fill="#ffffff" stroke="#e74c3c" stroke-width="2"/>
      <text x="250" y="205" font-family="sans-serif" font-size="18" text-anchor="middle">❌</text>
    `;

    if (resolved && correct) {
      pathHTML = `
        <path d="M 170,200 L 330,200" fill="none" stroke="#2ecc71" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-slow"/>
        <circle cx="250" cy="200" r="20" fill="#ffffff" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
        <text x="250" y="205" font-family="sans-serif" font-size="14" text-anchor="middle">🔒</text>
      `;
    }

    return this.wrapSVG(`
      <rect x="50" y="160" width="120" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="110" y="205" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Local Office</text>
      
      <rect x="330" y="160" width="120" height="80" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="390" y="205" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Cloud Tenant</text>
      ${pathHTML}
      <rect x="120" y="285" width="260" height="40" rx="8" fill="${resolved && correct ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)'}" stroke="${resolved && correct ? '#2ecc71' : '#e74c3c'}" stroke-width="2"/>
      <text x="250" y="310" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'VPN TUNNEL UP (PSK Matched)' : 'VPN TUNNEL DOWN (PSK Mismatch)'}
      </text>
    `);
  }

  drawHybridADSync() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let syncColor = "#cbd5e1";
    let syncClass = "";
    
    if (resolved && correct) {
      syncColor = "#2ecc71";
      syncClass = "animate-dash-slow";
    }

    return this.wrapSVG(`
      <circle cx="150" cy="180" r="40" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="150" y="184" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Local AD</text>
      
      <circle cx="350" cy="180" r="40" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="350" y="184" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Cloud AD</text>
      
      <path d="M 200,165 Q 250,150 300,165" fill="none" stroke="${syncColor}" stroke-dasharray="5,3" stroke-width="2" class="${syncClass}"/>
      <path d="M 300,195 Q 250,210 200,195" fill="none" stroke="${syncColor}" stroke-dasharray="5,3" stroke-width="2" class="${syncClass}"/>
      
      <rect x="150" y="260" width="200" height="40" rx="6" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" class="${resolved && correct ? 'glow-success' : 'glow-danger'}"/>
      <text x="250" y="284" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'Directory Synchronization Sync Active' : 'AD Sync Mismatched Creds'}
      </text>
    `);
  }

  drawHybridFiberCut() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let pathHTML = `
      <line x1="50" y1="200" x2="450" y2="200" stroke="#cbd5e1" stroke-width="4"/>
      <circle cx="250" cy="200" r="28" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="208" font-family="sans-serif" font-size="22" text-anchor="middle">⛏️</text>
    `;

    if (resolved && correct) {
      pathHTML = `
        <line x1="50" y1="180" x2="450" y2="180" stroke="#2ecc71" stroke-width="4" stroke-dasharray="6,4" class="animate-dash-slow"/>
        <line x1="50" y1="220" x2="450" y2="220" stroke="#2ecc71" stroke-width="4" stroke-dasharray="6,4" class="animate-dash-slow"/>
        <circle cx="250" cy="200" r="24" fill="#ffffff" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
        <text x="250" y="205" font-family="sans-serif" font-size="12" fill="#2ecc71" font-weight="bold" text-anchor="middle">BACKUP OK</text>
      `;
    }

    return this.wrapSVG(`
      ${pathHTML}
      <rect x="150" y="270" width="200" height="50" rx="8" fill="${resolved && correct ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)'}" stroke="${resolved && correct ? '#2ecc71' : '#e74c3c'}" stroke-width="2"/>
      <text x="250" y="300" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'Redundant Fiber loop Active' : 'Primary Fiber Trunk Line Cut'}
      </text>
    `);
  }

  drawHybridAPIGateway() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let statusText = "No Rate Limit: gateway overloaded";
    let strokeColor = "#e74c3c";

    if (resolved && correct) {
      statusText = "Rate Limiting Enforced (HTTP 429)";
      strokeColor = "#0056b3";
    }

    return this.wrapSVG(`
      <rect x="180" y="160" width="140" height="80" rx="10" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="250" y="205" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Hybrid API Gateway</text>
      
      <line x1="50" y1="200" x2="180" y2="200" stroke="${strokeColor}" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
      <line x1="50" y1="170" x2="180" y2="185" stroke="${strokeColor}" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
      
      <rect x="100" y="280" width="300" height="50" rx="8" fill="${resolved && correct ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)'}" stroke="${resolved && correct ? '#2ecc71' : '#e74c3c'}" stroke-width="2"/>
      <text x="250" y="310" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" font-weight="bold" text-anchor="middle">${statusText}</text>
    `);
  }

  drawHybridHardwareFailure() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let sparkHTML = `<circle cx="250" cy="220" r="28" fill="#ffffff" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
      <text x="250" y="228" font-family="sans-serif" font-size="24" text-anchor="middle">💥</text>`;

    if (resolved && correct) {
      sparkHTML = `
        <circle cx="250" cy="220" r="28" fill="#ffffff" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
        <text x="250" y="225" font-family="sans-serif" font-size="12" fill="#2ecc71" font-weight="bold" text-anchor="middle">BACKUP</text>
      `;
    }

    return this.wrapSVG(`
      <rect x="80" y="100" width="340" height="280" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="100" y1="140" x2="200" y2="140" stroke="#cbd5e1" stroke-width="2"/>
      ${sparkHTML}
      <rect x="130" y="310" width="240" height="40" rx="6" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" opacity="0.1"/>
      <text x="250" y="334" font-family="sans-serif" font-size="11" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'On-Prem Failover Successful' : 'Local hardware failure'}
      </text>
    `);
  }

  // ==================== MFA SWIPER SCREENS ====================
  drawMFASMS() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let phoneAlertHTML = `
      <rect x="190" y="225" width="120" height="50" rx="6" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c"/>
      <text x="200" y="245" font-family="sans-serif" font-size="9" fill="#e74c3c" font-weight="bold">IT Support: "Please</text>
      <text x="200" y="260" font-family="sans-serif" font-size="9" fill="#e74c3c" font-weight="bold">forward code now."</text>
    `;

    if (resolved) {
      if (correct) {
        phoneAlertHTML = `
          <rect x="180" y="225" width="140" height="50" rx="6" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2"/>
          <text x="250" y="254" font-family="sans-serif" font-size="10" fill="#2ecc71" font-weight="bold" text-anchor="middle">SMS REQUEST IGNORED</text>
        `;
      } else {
        phoneAlertHTML = `
          <rect x="180" y="225" width="140" height="50" rx="6" fill="#e74c3c" class="glow-danger"/>
          <text x="250" y="254" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">CODE EXPOSED: HIJACKED</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="160" y="80" width="180" height="320" rx="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
      <rect x="180" y="140" width="140" height="220" rx="6" fill="#f8fafc" stroke="#e74c3c" stroke-width="2"/>
      
      <rect x="190" y="160" width="120" height="50" rx="6" fill="#0056b3" opacity="0.1"/>
      <text x="200" y="180" font-family="sans-serif" font-size="10" fill="#0056b3">SMS OTP code:</text>
      <text x="200" y="196" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold">Code: 489212</text>
      ${phoneAlertHTML}
    `);
  }

  drawMFAFIDO() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let statusHTML = `
      <rect x="110" y="80" width="260" height="45" rx="6" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
      <text x="240" y="106" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">FIDO2 Cryptographic Challenge Signature</text>
    `;

    if (resolved && !correct) {
      statusHTML = `
        <rect x="110" y="80" width="260" height="45" rx="6" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="2"/>
        <text x="240" y="106" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">Authentication Signature Failure</text>
      `;
    }

    return this.wrapSVG(`
      <rect x="90" y="140" width="220" height="140" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <line x1="60" y1="280" x2="340" y2="280" stroke="#cbd5e1" stroke-width="6"/>
      
      <rect x="330" y="220" width="50" height="25" rx="4" fill="#ffffff" stroke="#2ecc71" stroke-width="2"/>
      <circle cx="365" cy="232" r="5" fill="#2ecc71" class="animate-pulse-node"/>
      ${statusHTML}
    `);
  }

  drawMFAPushFatigue() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let alertHTML = `
      <rect x="150" y="320" width="200" height="40" rx="6" fill="#e74c3c" class="glow-danger"/>
      <text x="250" y="344" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">MFA Push Fatigue attack</text>
    `;

    if (resolved) {
      if (correct) {
        alertHTML = `
          <rect x="150" y="320" width="200" height="40" rx="6" fill="#2ecc71" class="glow-success"/>
          <text x="250" y="344" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">PUSH FLOOD MUTED</text>
        `;
      } else {
        alertHTML = `
          <rect x="150" y="320" width="200" height="40" rx="6" fill="#e74c3c"/>
          <text x="250" y="344" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">LOGIN BYPASSED (Fatigued)</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="160" y="80" width="180" height="320" rx="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
      
      <rect x="175" y="130" width="150" height="50" rx="6" fill="rgba(231, 76, 60, 0.06)" stroke="#e74c3c" stroke-width="2"/>
      <text x="185" y="150" font-family="sans-serif" font-size="10" fill="#e74c3c" font-weight="bold">Approve Login? (2:30 AM)</text>
      
      <rect x="175" y="160" width="150" height="50" rx="6" fill="rgba(231, 76, 60, 0.06)" stroke="#e74c3c" stroke-width="2"/>
      <text x="185" y="180" font-family="sans-serif" font-size="10" fill="#e74c3c" font-weight="bold">Approve Login? (2:31 AM)</text>
      ${alertHTML}
    `);
  }

  drawMFATOTP() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let circleColor = "#00b5e2";

    if (resolved && !correct) {
      circleColor = "#e74c3c";
    }

    return this.wrapSVG(`
      <rect x="160" y="80" width="180" height="320" rx="20" fill="#ffffff" stroke="#cbd5e1" stroke-width="3"/>
      <text x="250" y="150" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">HCLTech Portal</text>
      <text x="250" y="185" font-family="sans-serif" font-size="24" fill="#0a1c2a" font-weight="bold" text-anchor="middle">682 910</text>
      
      <circle cx="250" cy="240" r="20" fill="none" stroke="${circleColor}" stroke-width="4"/>
      <path d="M 250,220 A 20,20 0 0,1 270,240" fill="none" stroke="#cbd5e1" stroke-width="4"/>
      <text x="250" y="295" font-family="sans-serif" font-size="11" fill="#7d93a8" text-anchor="middle">Offline TOTP validation</text>
    `);
  }

  drawMFALegacy() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let alertHTML = `
      <rect x="130" y="280" width="240" height="50" rx="8" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="2"/>
      <text x="250" y="310" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">SMTP Basic Auth (No MFA)</text>
    `;

    if (resolved) {
      if (correct) {
        alertHTML = `
          <rect x="130" y="280" width="240" height="50" rx="8" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
          <text x="250" y="310" font-family="sans-serif" font-size="12" fill="#2ecc71" font-weight="bold" text-anchor="middle">LEGACY AUTH BLOCKED</text>
        `;
      } else {
        alertHTML = `
          <rect x="130" y="280" width="240" height="50" rx="8" fill="#e74c3c" class="glow-danger"/>
          <text x="250" y="310" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">LOGIN COMPROMISED (Basic)</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="100" y="140" width="300" height="220" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="140" y="190" font-family="sans-serif" font-size="12" fill="#0a1c2a">Username: admin</text>
      <text x="140" y="220" font-family="sans-serif" font-size="12" fill="#0a1c2a">Password: *************</text>
      <line x1="120" y1="250" x2="380" y2="250" stroke="#e74c3c" stroke-width="2"/>
      ${alertHTML}
    `);
  }

  // ==================== ZERO TRUST SVGS ====================
  drawZTEncryption() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let alertHTML = `
      <line x1="170" y1="200" x2="330" y2="200" stroke="#e74c3c" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-fast"/>
      <rect x="180" y="240" width="140" height="40" rx="6" fill="#e74c3c" class="glow-danger"/>
      <text x="250" y="264" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">Cleartext Internal Link</text>
    `;

    if (resolved) {
      if (correct) {
        alertHTML = `
          <line x1="170" y1="200" x2="330" y2="200" stroke="#2ecc71" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-slow"/>
          <rect x="180" y="240" width="140" height="40" rx="6" fill="#2ecc71" class="glow-success"/>
          <text x="250" y="264" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">TLS 1.3 Encrypted Link</text>
        `;
      } else {
        alertHTML = `
          <line x1="170" y1="200" x2="330" y2="200" stroke="#e74c3c" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-fast"/>
          <rect x="160" y="240" width="180" height="40" rx="6" fill="#e74c3c" class="glow-danger"/>
          <text x="250" y="264" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">SNIFFED: Cleartext Data Exposed</text>
        `;
      }
    }

    return this.wrapSVG(`
      <rect x="60" y="160" width="110" height="90" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="115" y="210" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Server A</text>
      
      <rect x="330" y="160" width="110" height="90" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="385" y="210" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Server B</text>
      ${alertHTML}
    `);
  }

  drawZTMicroseg() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let borderStyle = "#cbd5e1";
    let label = "Microsegmentation Check";
    let bgColor = "none";

    if (resolved) {
      if (correct) {
        borderStyle = "#2ecc71";
        label = "Microsegmentation Active";
        bgColor = "rgba(46, 204, 113, 0.03)";
      } else {
        borderStyle = "#e74c3c";
        label = "Lateral Movement allowed";
        bgColor = "rgba(231, 76, 60, 0.03)";
      }
    }

    return this.wrapSVG(`
      <rect x="80" y="100" width="140" height="120" rx="10" fill="${bgColor}" stroke="${borderStyle}" stroke-dasharray="6,4" stroke-width="2"/>
      <rect x="100" y="120" width="100" height="50" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="150" y="150" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">App Zone A</text>
      
      <rect x="280" y="100" width="140" height="120" rx="10" fill="${bgColor}" stroke="${borderStyle}" stroke-dasharray="6,4" stroke-width="2"/>
      <rect x="300" y="120" width="100" height="50" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="350" y="150" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">App Zone B</text>
      
      <circle cx="250" cy="160" r="16" fill="#ffffff" stroke="${borderStyle}" stroke-width="2"/>
      <text x="250" y="165" font-family="sans-serif" font-size="14" text-anchor="middle">${resolved && correct ? '🔒' : '🔓'}</text>
      
      <rect x="110" y="280" width="280" height="50" rx="8" fill="${borderStyle}" opacity="0.1"/>
      <text x="250" y="310" font-family="sans-serif" font-size="12" fill="${borderStyle}" font-weight="bold" text-anchor="middle">${label}</text>
    `);
  }

  drawZTDeviceHealth() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    const statusText = resolved && correct ? 'ACCESS GRANTED: Compliant Device' : (resolved && !correct ? 'ACCESS BLOCKED: Evaluation Failed' : 'Conditional Access Evaluation...');
    const statusColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3');
    const statusClass = resolved && correct ? 'glow-success' : (resolved && !correct ? 'glow-danger' : '');

    const items = [
      { label: 'Endpoint Firewall', icon: resolved ? '\u2714' : '?', color: resolved ? '#2ecc71' : '#7d93a8' },
      { label: 'OS Patch Level', icon: resolved && !correct ? '\u2718' : (resolved ? '\u2714' : '?'), color: resolved && !correct ? '#e74c3c' : (resolved ? '#2ecc71' : '#7d93a8') },
      { label: 'Disk Encryption', icon: resolved ? '\u2714' : '?', color: resolved ? '#2ecc71' : '#7d93a8' },
    ];

    const rows = items.map((item, i) => `
      <rect x="90" y="${155 + i*65}" width="320" height="50" rx="6" fill="#f8fafc" stroke="${item.color === '#7d93a8' ? '#e2e8f0' : item.color + '44'}" stroke-width="1.5"/>
      <text x="115" y="${183 + i*65}" font-family="sans-serif" font-size="13" fill="${item.color}" font-weight="bold">${item.icon}</text>
      <text x="140" y="${183 + i*65}" font-family="sans-serif" font-size="12" fill="#334155" font-weight="600">${item.label}</text>
      <text x="390" y="${183 + i*65}" font-family="sans-serif" font-size="11" fill="${item.color}" font-weight="bold" text-anchor="middle">${item.color === '#7d93a8' ? 'CHECKING...' : (item.icon === '\u2714' ? 'PASS' : 'FAIL')}</text>
    `).join('');

    return this.wrapSVG(`
      <rect x="80" y="80" width="340" height="55" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="113" font-family="sans-serif" font-size="14" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Device Compliance Check</text>
      ${rows}
      <rect x="90" y="360" width="320" height="45" rx="8" fill="rgba(0,86,179,0.04)" stroke="${statusColor}" stroke-width="1.5" class="${statusClass}"/>
      <text x="250" y="388" font-family="sans-serif" font-size="11" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>
    `);
  }

  drawZTAttestation() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let syncText = "Attestation Token Sync";
    let strokeColor = "#00b5e2";

    if (resolved && !correct) {
      syncText = "Attestation Rejected (Code 403)";
      strokeColor = "#e74c3c";
    }

    return this.wrapSVG(`
      <rect x="60" y="180" width="130" height="80" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="330" y="140" width="120" height="160" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="390" y="200" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Zero Trust Broker</text>
      
      <path d="M 190,220 L 330,220" fill="none" stroke="${strokeColor}" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-slow"/>
      <rect x="160" y="250" width="180" height="40" rx="6" fill="${strokeColor}" opacity="0.1"/>
      <text x="250" y="274" font-family="sans-serif" font-size="10" fill="${strokeColor}" font-weight="bold" text-anchor="middle">${syncText}</text>
    `);
  }

  drawZTSessionRevoke() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let connectionHTML = `
      <path d="M 130,180 L 350,180" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-fast"/>
      <circle cx="240" cy="180" r="20" fill="#ffffff" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
      <text x="240" y="185" font-family="sans-serif" font-size="14" text-anchor="middle">❌</text>
    `;

    if (resolved && !correct) {
      connectionHTML = `
        <path d="M 130,180 L 350,180" fill="none" stroke="#e74c3c" stroke-width="4" class="glow-danger"/>
        <text x="240" y="170" font-family="sans-serif" font-size="10" fill="#e74c3c" font-weight="bold" text-anchor="middle">DATA DUMP ACTIVE</text>
      `;
    }

    return this.wrapSVG(`
      <circle cx="100" cy="180" r="30" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <circle cx="380" cy="180" r="30" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="380" y="184" font-family="sans-serif" font-size="12" fill="#ffffff" text-anchor="middle">DB</text>
      ${connectionHTML}
      <rect x="110" y="260" width="280" height="50" rx="8" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="2"/>
      <text x="250" y="290" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">
        ${resolved && !correct ? 'Attack Active: Session remains unmonitored' : 'Continuous Risk scan: Active'}
      </text>
    `);
  }

  // ==================== OTHER DYNAMIC TEMPLATE RENDERINGS ====================
  drawGovAccessReview() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    return this.wrapSVG(`
      <rect x="80" y="100" width="340" height="280" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="80" y="100" width="340" height="50" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="110" y="130" font-family="sans-serif" font-size="14" fill="#0a1c2a" font-weight="bold">Manager Access Review Card</text>
      <text x="110" y="195" font-family="sans-serif" font-size="13" fill="#0a1c2a">[✔] Developer - Revoke database admin</text>
      <text x="110" y="235" font-family="sans-serif" font-size="13" fill="#0a1c2a">[✔] Analyst - Approve marketing access</text>
      <text x="110" y="275" font-family="sans-serif" font-size="13" fill="${resolved && !correct ? '#e74c3c' : '#0a1c2a'}">
        ${resolved && !correct ? '[✘] Ex-Staff - Account left active!' : '[✔] Ex-Staff - Account disabled'}
      </text>
      <rect x="140" y="310" width="220" height="40" rx="6" fill="${resolved && correct ? '#2ecc71' : '#0056b3'}" opacity="0.1"/>
      <text x="250" y="334" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : '#0056b3'}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'Orphaned Access Cleared' : 'Roster Review Attestation'}
      </text>
    `);
  }

  drawGovLifecycle() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    return this.wrapSVG(`
      <rect x="80" y="140" width="140" height="120" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="150" y="195" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Old Role: Dev</text>
      <text x="150" y="225" font-family="sans-serif" font-size="11" fill="#e74c3c" text-anchor="middle">Perms: Standing DB Owner</text>
      
      <rect x="280" y="140" width="140" height="120" rx="8" fill="#ffffff" stroke="${resolved && correct ? '#2ecc71' : '#0056b3'}" stroke-width="2"/>
      <text x="350" y="195" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">New Role: Mktg</text>
      <text x="350" y="225" font-family="sans-serif" font-size="11" fill="${resolved && !correct ? '#e74c3c' : '#2ecc71'}" text-anchor="middle">
        ${resolved && !correct ? 'Perms: Accumulation / DB retained' : 'Perms: Restricted Analytics'}
      </text>
      
      <path d="M 220,200 L 280,200" stroke="#00b5e2" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-slow"/>
      <text x="250" y="250" font-family="sans-serif" font-size="12" fill="#00b5e2" font-weight="bold" text-anchor="middle">Role Mutation</text>
    `);
  }

  drawGovSoD() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    return this.wrapSVG(`
      <rect x="80" y="100" width="340" height="280" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="150" font-family="sans-serif" font-size="15" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Disbursement Invoice</text>
      
      <rect x="100" y="180" width="140" height="60" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="170" y="215" font-family="sans-serif" font-size="11" fill="#485c70" text-anchor="middle">Creator: Alice (Dev)</text>
      
      <rect x="260" y="180" width="140" height="60" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="330" y="215" font-family="sans-serif" font-size="11" fill="#485c70" text-anchor="middle">
        ${resolved && !correct ? 'Approver: Alice (Dev)' : 'Approver: Bob (Mgr)'}
      </text>
      
      <rect x="100" y="280" width="300" height="50" rx="8" fill="${resolved && correct ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)'}" stroke="${resolved && correct ? '#2ecc71' : '#e74c3c'}" stroke-width="2"/>
      <text x="250" y="310" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'Invoice verified (Segregation check passed)' : 'Vulnerable: Creator cannot approve payments'}
      </text>
    `);
  }

  drawGovHRSync() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    return this.wrapSVG(`
      <rect x="50" y="160" width="120" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="110" y="205" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">HR Database</text>
      
      <rect x="330" y="160" width="120" height="80" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="390" y="205" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Directory Sync</text>
      
      <path d="M 170,200 L 330,200" fill="none" stroke="${resolved && correct ? '#2ecc71' : '#e74c3c'}" stroke-width="3" stroke-dasharray="6,4" class="animate-dash-slow"/>
      <rect x="150" y="280" width="200" height="50" rx="8" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" opacity="0.1"/>
      <text x="250" y="310" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'AD accounts terminated by Sync' : 'Lifecycle Sync Agent failure'}
      </text>
    `);
  }

  drawGovAuditWORM() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    return this.wrapSVG(`
      <rect x="100" y="100" width="300" height="280" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="140" font-family="sans-serif" font-size="15" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Immutable Audit Logs</text>
      
      <text x="130" y="195" font-family="sans-serif" font-size="12" fill="#485c70">12:00:00 - User Alice authenticated</text>
      <text x="130" y="225" font-family="sans-serif" font-size="12" fill="${resolved && !correct ? '#e74c3c' : '#485c70'}">
        ${resolved && !correct ? '12:02:15 - [DELETED] Log entry modified!' : '12:02:15 - Port 3306 config toggled'}
      </text>
      <text x="130" y="255" font-family="sans-serif" font-size="12" fill="#485c70">12:03:00 - Session attestation token sync</text>
      
      <rect x="120" y="300" width="260" height="50" rx="8" fill="${resolved && correct ? 'rgba(46,204,113,0.08)' : 'rgba(231,76,60,0.08)'}" stroke="${resolved && correct ? '#2ecc71' : '#e74c3c'}" stroke-width="2"/>
      <text x="250" y="324" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : '#e74c3c'}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'Locked: logs Immutable' : 'Audit logs compromised'}
      </text>
    `);
  }

  drawPaaSDashboard() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;
    const allOn = ['toggle_https','toggle_cors','toggle_secrets','toggle_basicauth','toggle_ratelimit'].every(k => this.toggleStates[k] === true);

    const borderColor = resolved ? (correct ? '#2ecc71' : '#e74c3c') : (allOn ? '#2ecc71' : '#0056b3');
    const statusText = resolved ? (correct ? 'CONFIGURATION VERIFIED SECURE' : 'CONFIGURATION REJECTED') : (allOn ? 'ALL CONTROLS ENABLED' : 'Configure Security Controls');
    const statusColor = resolved ? (correct ? '#2ecc71' : '#e74c3c') : (allOn ? '#2ecc71' : '#0056b3');

    return this.wrapSVG(`
      <!-- PaaS App Server Architecture -->
      <rect x="30" y="30" width="440" height="440" rx="12" fill="#ffffff" stroke="${borderColor}" stroke-width="2"/>
      <rect x="30" y="30" width="440" height="55" rx="12" fill="#f8fafc" stroke="${borderColor}" stroke-width="2"/>
      <text x="250" y="63" font-family="sans-serif" font-size="14" fill="#0a1c2a" font-weight="bold" text-anchor="middle">PaaS Application Server</text>

      <!-- Internet / Client -->
      <rect x="175" y="105" width="150" height="45" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="133" font-family="sans-serif" font-size="12" fill="#485c70" font-weight="bold" text-anchor="middle">Client Browser</text>

      <!-- Arrow down -->
      <line x1="250" y1="150" x2="250" y2="185" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="250,192 244,180 256,180" fill="#cbd5e1"/>

      <!-- App Layer -->
      <rect x="100" y="195" width="300" height="60" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="250" y="225" font-family="sans-serif" font-size="13" fill="#0056b3" font-weight="bold" text-anchor="middle">Web Application Layer</text>
      <text x="250" y="242" font-family="sans-serif" font-size="10" fill="#7d93a8" text-anchor="middle">Auth &#x2022; API Rate Control &#x2022; CORS &#x2022; TLS</text>

      <!-- Arrow down -->
      <line x1="250" y1="255" x2="250" y2="285" stroke="#cbd5e1" stroke-width="2"/>
      <polygon points="250,292 244,280 256,280" fill="#cbd5e1"/>

      <!-- Secrets / Key Vault -->
      <rect x="340" y="300" width="110" height="50" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="395" y="330" font-family="sans-serif" font-size="11" fill="#485c70" font-weight="bold" text-anchor="middle">Secrets Store</text>
      <line x1="340" y1="325" x2="320" y2="325" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4,3"/>

      <!-- Database Layer -->
      <rect x="100" y="295" width="210" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="205" y="325" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Database Layer</text>
      <text x="205" y="342" font-family="sans-serif" font-size="10" fill="#7d93a8" text-anchor="middle">Credentials &#x2022; Encryption &#x2022; Access</text>

      <!-- Status banner -->
      <rect x="80" y="390" width="340" height="50" rx="8" fill="rgba(0,86,179,0.04)" stroke="${statusColor}" stroke-width="1.5" class="${resolved && correct ? 'glow-success' : (resolved && !correct ? 'glow-danger' : '')}"/>
      <text x="250" y="420" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>
    `);
  }

  drawSharedResponsibilityScale() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let leftCount = 0;
    let rightCount = 0;
    Object.values(this.dragPlacements).forEach(val => {
      if (val === 'left') leftCount++;
      if (val === 'right') rightCount++;
    });

    const diff = leftCount - rightCount;
    let tiltAngle = diff * 5; 
    tiltAngle = Math.max(-20, Math.min(20, tiltAngle));

    let statusText = "Shared Responsibility Scale";
    let statusColor = "#0056b3";
    if (resolved) {
      if (correct) {
        statusText = "Correct Responsibility Mapping!";
        statusColor = "#2ecc71";
      } else {
        statusText = "Incorrect Placement Identified";
        statusColor = "#e74c3c";
      }
    } else if (leftCount + rightCount > 0) {
      statusText = `Duties Placed: ${leftCount} Customer / ${rightCount} Provider`;
    }

    const rad = (tiltAngle * Math.PI) / 180;
    const xL = 250 - 120 * Math.cos(rad);
    const yL = 180 - 120 * Math.sin(rad);
    const xR = 250 + 120 * Math.cos(rad);
    const yR = 180 + 120 * Math.sin(rad);

    const panYL = yL + 85;
    const panYR = yR + 85;

    let leftWeights = '';
    for (let i = 0; i < leftCount; i++) {
      leftWeights += `<rect x="${xL - 12 + (i * 6) - (leftCount * 3)}" y="${panYL - 18}" width="12" height="12" rx="2" fill="#0056b3" stroke="#ffffff" stroke-width="1"/>`;
    }
    let rightWeights = '';
    for (let i = 0; i < rightCount; i++) {
      rightWeights += `<rect x="${xR - 12 + (i * 6) - (rightCount * 3)}" y="${panYR - 18}" width="12" height="12" rx="2" fill="#00b5e2" stroke="#ffffff" stroke-width="1"/>`;
    }

    return this.wrapSVG(`
      <!-- Title box -->
      <rect x="50" y="40" width="400" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="72" font-family="sans-serif" font-size="14" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>

      <!-- Center Pillar -->
      <rect x="244" y="180" width="12" height="200" fill="#cbd5e1" rx="2"/>
      <path d="M 220,380 L 280,380" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
      <circle cx="250" cy="180" r="8" fill="#485c70"/>

      <!-- Tilting Beam -->
      <line x1="${xL}" y1="${yL}" x2="${xR}" y2="${yR}" stroke="#485c70" stroke-width="5" stroke-linecap="round"/>

      <!-- Left Pan strings and base -->
      <line x1="${xL}" y1="${yL}" x2="${xL - 25}" y2="${panYL}" stroke="#7d93a8" stroke-width="1.5"/>
      <line x1="${xL}" y1="${yL}" x2="${xL + 25}" y2="${panYL}" stroke="#7d93a8" stroke-width="1.5"/>
      <path d="M ${xL - 35},${panYL} L ${xL + 35},${panYL}" stroke="#485c70" stroke-width="4" stroke-linecap="round"/>
      <path d="M ${xL - 30},${panYL} A 30,10 0 0,0 ${xL + 30},${panYL}" fill="rgba(0, 86, 179, 0.08)" stroke="#485c70" stroke-width="1.5"/>
      ${leftWeights}
      <text x="${xL}" y="${panYL + 20}" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">Customer</text>

      <!-- Right Pan strings and base -->
      <line x1="${xR}" y1="${yR}" x2="${xR - 25}" y2="${panYR}" stroke="#7d93a8" stroke-width="1.5"/>
      <line x1="${xR}" y1="${yR}" x2="${xR + 25}" y2="${panYR}" stroke="#7d93a8" stroke-width="1.5"/>
      <path d="M ${xR - 35},${panYR} L ${xR + 35},${panYR}" stroke="#485c70" stroke-width="4" stroke-linecap="round"/>
      <path d="M ${xR - 30},${panYR} A 30,10 0 0,0 ${xR + 30},${panYR}" fill="rgba(0, 181, 226, 0.08)" stroke="#485c70" stroke-width="1.5"/>
      ${rightWeights}
      <text x="${xR}" y="${panYR + 20}" font-family="sans-serif" font-size="11" fill="#00b5e2" font-weight="bold" text-anchor="middle">Provider</text>

      ${resolved && correct ? `
        <circle cx="250" cy="180" r="24" fill="#2ecc71" class="glow-success"/>
        <text x="250" y="186" font-family="sans-serif" font-size="16" fill="#ffffff" font-weight="bold" text-anchor="middle">✔</text>
      ` : ''}
      ${resolved && !correct ? `
        <circle cx="250" cy="180" r="24" fill="#e74c3c" class="glow-danger"/>
        <text x="250" y="186" font-family="sans-serif" font-size="16" fill="#ffffff" font-weight="bold" text-anchor="middle">✘</text>
      ` : ''}
    `);
  }

  drawAuthNDecisionGrid() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let authnCount = 0;
    let authzCount = 0;
    Object.values(this.dragPlacements).forEach(val => {
      if (val === 'left') authnCount++;
      if (val === 'right') authzCount++;
    });

    let statusText = "Identity Lifecycle Gateways";
    let statusColor = "#0056b3";
    if (resolved) {
      if (correct) {
        statusText = "Secure Access Authorization Verified!";
        statusColor = "#2ecc71";
      } else {
        statusText = "Insecure Mapping: AuthN vs AuthZ Mismatch";
        statusColor = "#e74c3c";
      }
    }

    return this.wrapSVG(`
      <!-- Title Box -->
      <rect x="40" y="45" width="420" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="77" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>

      <!-- AuthN Gateway Panel (Left) -->
      <rect x="50" y="130" width="170" height="250" rx="10" fill="#ffffff" stroke="${resolved && !correct ? '#e74c3c' : '#0056b3'}" stroke-width="2"/>
      <rect x="50" y="130" width="170" height="40" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="135" y="155" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">Authentication (AuthN)</text>
      <text x="135" y="188" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">WHO ARE YOU?</text>

      <!-- Nodes inside AuthN -->
      <circle cx="135" cy="225" r="14" fill="${authnCount >= 1 ? '#0056b3' : '#cbd5e1'}"/>
      <text x="135" y="229" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">ID</text>

      <circle cx="135" cy="275" r="14" fill="${authnCount >= 2 ? '#0056b3' : '#cbd5e1'}"/>
      <text x="135" y="279" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">MFA</text>

      <circle cx="135" cy="325" r="14" fill="${authnCount >= 3 ? '#0056b3' : '#cbd5e1'}"/>
      <text x="135" y="329" font-family="sans-serif" font-size="11" fill="#ffffff" font-weight="bold" text-anchor="middle">BIO</text>

      <!-- AuthZ Gateway Panel (Right) -->
      <rect x="280" y="130" width="170" height="250" rx="10" fill="#ffffff" stroke="${resolved && !correct ? '#e74c3c' : '#00b5e2'}" stroke-width="2"/>
      <rect x="280" y="130" width="170" height="40" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="365" y="155" font-family="sans-serif" font-size="12" fill="#00b5e2" font-weight="bold" text-anchor="middle">Authorization (AuthZ)</text>
      <text x="365" y="188" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">WHAT CAN YOU DO?</text>

      <!-- Nodes inside AuthZ -->
      <circle cx="365" cy="225" r="14" fill="${authzCount >= 1 ? '#00b5e2' : '#cbd5e1'}"/>
      <text x="365" y="229" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">ROLE</text>

      <circle cx="365" cy="275" r="14" fill="${authzCount >= 2 ? '#00b5e2' : '#cbd5e1'}"/>
      <text x="365" y="279" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">SCOPE</text>

      <circle cx="365" cy="325" r="14" fill="${authzCount >= 3 ? '#00b5e2' : '#cbd5e1'}"/>
      <text x="365" y="329" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">RULE</text>

      <!-- Bridge between them -->
      <path d="M 220,255 L 280,255" fill="none" stroke="${resolved && correct ? '#2ecc71' : '#cbd5e1'}" stroke-dasharray="4,4" stroke-width="3" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>

      ${resolved && correct ? `
        <rect x="180" y="405" width="140" height="40" rx="6" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
        <text x="250" y="429" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">ACCESS GRANTED</text>
      ` : ''}

      ${resolved && !correct ? `
        <rect x="180" y="405" width="140" height="40" rx="6" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
        <text x="250" y="429" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">ACCESS DENIED</text>
      ` : ''}
    `);
  }

  drawPAMSortingTimeline() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    const labels = {
      'jit_step_request': 'Request JIT',
      'jit_step_approve': 'Review/Approve',
      'jit_step_token': 'Inject Token',
      'jit_step_audit': 'Audit Keystrokes',
      'jit_step_expire': 'Auto Expire'
    };

    let statusText = "PAM JIT Session Pipeline";
    let statusColor = "#0056b3";
    if (resolved) {
      if (correct) {
        statusText = "Secure PAM Workflow Verified!";
        statusColor = "#2ecc71";
      } else {
        statusText = "Workflow Pipeline Out of Order";
        statusColor = "#e74c3c";
      }
    }

    let nodeHTML = '';
    const startY = 120;
    const spacingY = 70;
    const x = 250;

    for (let i = 0; i < 5; i++) {
      const step = this.sortingOrder[i];
      if (!step) continue;
      const isCorrectSlot = step.correctIndex === i;

      let nodeColor = "#0056b3"; 
      if (resolved) {
        nodeColor = isCorrectSlot ? "#2ecc71" : "#e74c3c";
      }

      if (i < 4) {
        nodeHTML += `
          <line x1="${x}" y1="${startY + i * spacingY + 20}" x2="${x}" y2="${startY + (i + 1) * spacingY - 20}" 
                stroke="${resolved && correct ? '#2ecc71' : '#cbd5e1'}" stroke-width="3" 
                stroke-dasharray="${resolved && correct ? '6,4' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
          <polygon points="${x},${startY + (i + 1) * spacingY - 20} ${x - 5},${startY + (i + 1) * spacingY - 28} ${x + 5},${startY + (i + 1) * spacingY - 28}" 
                   fill="${resolved && correct ? '#2ecc71' : '#cbd5e1'}"/>
        `;
      }

      nodeHTML += `
        <rect x="130" y="${startY + i * spacingY - 20}" width="240" height="40" rx="8" fill="#ffffff" stroke="${nodeColor}" stroke-width="2"/>
        <text x="250" y="${startY + i * spacingY + 5}" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">
          ${labels[step.id] || step.text}
        </text>
        ${resolved ? `
          <circle cx="110" cy="${startY + i * spacingY}" r="10" fill="${nodeColor}"/>
          <text x="110" y="${startY + i * spacingY + 3.5}" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">
            ${isCorrectSlot ? '✔' : '✖'}
          </text>
        ` : ''}
      `;
    }

    return this.wrapSVG(`
      <!-- Title Box -->
      <rect x="40" y="30" width="420" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="62" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>
      ${nodeHTML}
    `);
  }

  // ==================== SVGs FOR MODULE 3 (Network Security) ====================
  drawM3VPCSubnets() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    const subnetALabel = resolved ? 'Public Subnet (10.0.1.0/24)' : 'Subnet A';
    const subnetBLabel = resolved ? 'Private Subnet (10.0.2.0/24)' : 'Subnet B';
    const nodeALabel = resolved ? 'Web Server' : 'App Node';
    const nodeBLabel = resolved ? 'Database' : 'Data Node';
    const subnetAColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#00b5e2');
    const subnetBColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');
    const statusText = resolved && correct ? 'NETWORK ISOLATION CORRECT' : (resolved && !correct ? 'SUBNET DESIGN INCORRECT' : 'Evaluate Subnet Architecture');
    const statusColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3');

    return this.wrapSVG(`
      <rect x="30" y="50" width="440" height="400" rx="10" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="50" y="78" font-family="sans-serif" font-size="14" fill="#0056b3" font-weight="bold">Cloud VPC Network Design</text>

      <!-- Subnet A -->
      <rect x="50" y="100" width="390" height="120" rx="8" fill="rgba(0,181,226,0.03)" stroke="${subnetAColor}" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="70" y="122" font-family="sans-serif" font-size="12" fill="${subnetAColor}" font-weight="bold">${subnetALabel}</text>
      <rect x="70" y="138" width="100" height="55" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="120" y="170" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">${nodeALabel}</text>
      ${resolved ? `<rect x="200" y="138" width="110" height="55" rx="6" fill="#f8fafc" stroke="${subnetAColor}" stroke-width="1.5"/><text x="255" y="170" font-family="sans-serif" font-size="11" fill="${subnetAColor}" font-weight="bold" text-anchor="middle">Internet GW</text>` : `<rect x="200" y="148" width="100" height="35" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,3"/><text x="250" y="170" font-family="sans-serif" font-size="11" fill="#7d93a8" text-anchor="middle">Internet Access?</text>`}

      <!-- Subnet B -->
      <rect x="50" y="240" width="390" height="130" rx="8" fill="rgba(203,213,225,0.05)" stroke="${subnetBColor}" stroke-width="2"/>
      <text x="70" y="262" font-family="sans-serif" font-size="12" fill="${subnetBColor}" font-weight="bold">${subnetBLabel}</text>
      <rect x="70" y="278" width="100" height="55" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="120" y="310" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">${nodeBLabel}</text>
      ${resolved && correct ? `<rect x="200" y="278" width="215" height="55" rx="6" fill="rgba(46,204,113,0.06)" stroke="#2ecc71" stroke-width="1.5" class="glow-success"/><text x="307" y="305" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">ISOLATED: No Internet Route</text>` : (resolved && !correct ? `<rect x="200" y="278" width="215" height="55" rx="6" fill="rgba(231,76,60,0.06)" stroke="#e74c3c" stroke-width="1.5" class="glow-danger"/><text x="307" y="305" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">EXPOSED: Internet Route Active</text>` : `<rect x="200" y="288" width="215" height="35" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4,3"/><text x="307" y="310" font-family="sans-serif" font-size="11" fill="#7d93a8" text-anchor="middle">Should this subnet be isolated?</text>`)}

      <!-- Status -->
      <rect x="80" y="395" width="340" height="40" rx="8" fill="rgba(0,86,179,0.04)" stroke="${statusColor}" stroke-width="1.5"/>
      <text x="250" y="420" font-family="sans-serif" font-size="12" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>
    `);
  }

  drawM3TransitGateway() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let hubBorder = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3');
    let lineStroke = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

    return this.wrapSVG(`
      <!-- Spoke VPCs -->
      <rect x="40" y="80" width="100" height="55" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="90" y="113" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Spoke VPC A</text>

      <rect x="360" y="80" width="100" height="55" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="410" y="113" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Spoke VPC B</text>

      <rect x="40" y="320" width="100" height="55" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="90" y="353" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Spoke VPC C</text>

      <rect x="360" y="320" width="100" height="55" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="410" y="353" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Spoke VPC D</text>

      <!-- Central Hub / Router -->
      <circle cx="250" cy="225" r="40" fill="#ffffff" stroke="${hubBorder}" stroke-width="3" class="${resolved && correct ? 'glow-success' : (resolved && !correct ? 'glow-danger' : '')}"/>
      <text x="250" y="229" font-family="sans-serif" font-size="11" fill="${hubBorder}" font-weight="bold" text-anchor="middle">Transit GW</text>

      <!-- Connections -->
      <line x1="140" y1="107" x2="215" y2="195" stroke="${lineStroke}" stroke-width="2.5" stroke-dasharray="${resolved && correct ? '5,3' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
      <line x1="360" y1="107" x2="285" y2="195" stroke="${lineStroke}" stroke-width="2.5" stroke-dasharray="${resolved && correct ? '5,3' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
      <line x1="140" y1="347" x2="215" y2="255" stroke="${lineStroke}" stroke-width="2.5" stroke-dasharray="${resolved && correct ? '5,3' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
      <line x1="360" y1="347" x2="285" y2="255" stroke="${lineStroke}" stroke-width="2.5" stroke-dasharray="${resolved && correct ? '5,3' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>

      <!-- Feedback Banner -->
      <rect x="60" y="410" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="440" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'HUB-SPOKE TOPOLOGY SECURED' : (resolved && !correct ? 'INEFFICIENT FULL MESH PEERING MESH' : 'Configure Spoke VPC Routing Model')}
      </text>
    `);
  }

  drawM3BastionIAP() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let gatewayColor = resolved && correct ? '#2ecc71' : '#cbd5e1';
    let pathColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

    return this.wrapSVG(`
      <!-- User Laptop -->
      <rect x="40" y="200" width="90" height="50" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="85" y="230" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Admin Laptop</text>

      <!-- Private Database -->
      <rect x="370" y="200" width="90" height="55" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="415" y="233" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Private DB</text>

      <!-- Hardened checkpoint -->
      <rect x="200" y="180" width="100" height="90" rx="8" fill="#ffffff" stroke="${gatewayColor}" stroke-width="3" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="250" y="215" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Identity-Aware</text>
      <text x="250" y="232" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Proxy / Bastion</text>
      <text x="250" y="258" font-family="sans-serif" font-size="14" text-anchor="middle">${resolved && correct ? '🔒' : '🛡'}</text>

      <!-- Connections -->
      ${resolved && !correct ? `
        <!-- Direct SSH connection -->
        <path d="M 130,225 L 370,225" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
        <rect x="150" y="110" width="200" height="45" rx="6" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="1.5" class="glow-danger"/>
        <text x="250" y="136" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">VULNERABLE: SSH OPEN TO WAN</text>
      ` : `
        <path d="M 130,225 L 200,225" fill="none" stroke="${pathColor}" stroke-width="2.5" stroke-dasharray="${resolved && correct ? '5,3' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
        <path d="M 300,225 L 370,225" fill="none" stroke="${pathColor}" stroke-width="2.5" stroke-dasharray="${resolved && correct ? '5,3' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
      `}

      <!-- Status Footer -->
      <rect x="80" y="380" width="340" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'TUNNEL AUTHENTICATED VIA IAP' : (resolved && !correct ? 'DB EXPOSED VIA PUBLIC IP' : 'Awaiting Access Configuration')}
      </text>
    `);
  }

  drawM3PrivateLink() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let linkColor = resolved && correct ? '#2ecc71' : '#cbd5e1';
    let pathColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

    return this.wrapSVG(`
      <!-- VPC Container -->
      <rect x="40" y="90" width="180" height="250" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="130" y="115" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">Customer VPC</text>

      <!-- Private Endpoint Interface -->
      <circle cx="130" cy="220" r="28" fill="#ffffff" stroke="${linkColor}" stroke-width="2" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="130" y="215" font-family="sans-serif" font-size="10" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Private</text>
      <text x="130" y="230" font-family="sans-serif" font-size="10" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Endpoint</text>

      <!-- Managed Cloud Service -->
      <rect x="320" y="150" width="140" height="120" rx="8" fill="#ffffff" stroke="#00b5e2" stroke-width="2"/>
      <text x="390" y="185" font-family="sans-serif" font-size="12" fill="#00b5e2" font-weight="bold" text-anchor="middle">Cloud Service</text>
      <text x="390" y="215" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">(e.g. Object Storage / DB)</text>

      <!-- Routing path -->
      <line x1="158" y1="220" x2="320" y2="220" stroke="${pathColor}" stroke-width="3" stroke-dasharray="${resolved ? '5,3' : 'none'}" class="${resolved ? 'animate-dash-slow' : ''}"/>
      
      <!-- Public Network Cloud -->
      ${resolved && !correct ? `
        <ellipse cx="250" cy="330" rx="45" ry="25" fill="#ffffff" stroke="#e74c3c" stroke-width="2"/>
        <text x="250" y="334" font-family="sans-serif" font-size="10" fill="#e74c3c" font-weight="bold" text-anchor="middle">Public Internet</text>
        <path d="M 130,248 L 210,320 L 320,240" fill="none" stroke="#e74c3c" stroke-width="2" stroke-dasharray="4,4"/>
      ` : ''}

      <!-- Status Info -->
      <rect x="70" y="375" width="360" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="405" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'TRAFFIC SECURED INSIDE PRIVATE NETWORK' : (resolved && !correct ? 'RISK: DATA TRAVERSING PUBLIC INTERNET' : 'Determine Service Connection Route')}
      </text>
    `);
  }

  drawM3FlowLogs() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let auditText = resolved && correct ? 'TRAFFIC FLOW LOGGING ACTIVE' : (resolved && !correct ? 'LOG DATA BYPASSED (EXFILTRATION BLINDSPOT)' : 'FLOW LOG MONITORING DISABLED');
    let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

    return this.wrapSVG(`
      <!-- Interface NIC -->
      <rect x="60" y="80" width="130" height="70" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="125" y="115" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">VPC Network NIC</text>
      
      <!-- Flow Record Console -->
      <rect x="60" y="180" width="380" height="150" rx="8" fill="#0a1c2a" stroke="${themeColor}" stroke-width="2"/>
      <text x="80" y="210" font-family="monospace" font-size="10" fill="#2ecc71">2 10.0.1.4 198.51.100.12 443 ACCEPT</text>
      <text x="80" y="235" font-family="monospace" font-size="10" fill="#2ecc71">2 10.0.1.4 203.0.113.82 22 REJECT</text>
      <text x="80" y="260" font-family="monospace" font-size="10" fill="${resolved && !correct ? '#e74c3c' : '#2ecc71'}">
        ${resolved && !correct ? 'CRITICAL: LOGGING TIMEOUT EXCEEDED' : '2 10.0.2.10 198.51.100.12 1433 ACCEPT'}
      </text>
      
      <!-- Logger collector icon -->
      <circle cx="370" cy="115" r="22" fill="#ffffff" stroke="${themeColor}" stroke-width="2" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="370" y="120" font-family="sans-serif" font-size="14" text-anchor="middle">📁</text>

      <line x1="190" y1="115" x2="348" y2="115" stroke="${themeColor}" stroke-width="2.5" stroke-dasharray="5,3" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>

      <!-- Output status -->
      <rect x="60" y="360" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="390" font-family="sans-serif" font-size="12" fill="${themeColor}" font-weight="bold" text-anchor="middle">${auditText}</text>
    `);
  }

  drawM3NSGvsWAFScale() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let leftCount = 0;
    let rightCount = 0;
    Object.values(this.dragPlacements).forEach(val => {
      if (val === 'left') leftCount++;
      if (val === 'right') rightCount++;
    });

    const diff = leftCount - rightCount;
    let tiltAngle = diff * 5; 
    tiltAngle = Math.max(-20, Math.min(20, tiltAngle));

    let statusText = "Network Security Groups vs WAF";
    let statusColor = "#0056b3";
    if (resolved) {
      if (correct) {
        statusText = "Correct Firewall Classifications!";
        statusColor = "#2ecc71";
      } else {
        statusText = "Misclassified Firewall Boundaries";
        statusColor = "#e74c3c";
      }
    }

    const rad = (tiltAngle * Math.PI) / 180;
    const xL = 250 - 120 * Math.cos(rad);
    const yL = 180 - 120 * Math.sin(rad);
    const xR = 250 + 120 * Math.cos(rad);
    const yR = 180 + 120 * Math.sin(rad);

    const panYL = yL + 85;
    const panYR = yR + 85;

    let leftWeights = '';
    for (let i = 0; i < leftCount; i++) {
      leftWeights += `<circle cx="${xL + (i * 8) - (leftCount * 4)}" cy="${panYL - 12}" r="6" fill="#0056b3" stroke="#ffffff" stroke-width="1"/>`;
    }
    let rightWeights = '';
    for (let i = 0; i < rightCount; i++) {
      rightWeights += `<circle cx="${xR + (i * 8) - (rightCount * 4)}" cy="${panYR - 12}" r="6" fill="#00b5e2" stroke="#ffffff" stroke-width="1"/>`;
    }

    return this.wrapSVG(`
      <rect x="50" y="40" width="400" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="72" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>

      <rect x="244" y="180" width="12" height="200" fill="#cbd5e1" rx="2"/>
      <path d="M 220,380 L 280,380" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
      <circle cx="250" cy="180" r="8" fill="#485c70"/>

      <line x1="${xL}" y1="${yL}" x2="${xR}" y2="${yR}" stroke="#485c70" stroke-width="5" stroke-linecap="round"/>

      <!-- NSG Pan -->
      <line x1="${xL}" y1="${yL}" x2="${xL - 25}" y2="${panYL}" stroke="#7d93a8" stroke-width="1.5"/>
      <line x1="${xL}" y1="${yL}" x2="${xL + 25}" y2="${panYL}" stroke="#7d93a8" stroke-width="1.5"/>
      <path d="M ${xL - 35},${panYL} L ${xL + 35},${panYL}" stroke="#485c70" stroke-width="4" stroke-linecap="round"/>
      ${leftWeights}
      <text x="${xL}" y="${panYL + 20}" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">Layer 3/4 (NSG)</text>

      <!-- WAF Pan -->
      <line x1="${xR}" y1="${yR}" x2="${xR - 25}" y2="${panYR}" stroke="#7d93a8" stroke-width="1.5"/>
      <line x1="${xR}" y1="${yR}" x2="${xR + 25}" y2="${panYR}" stroke="#7d93a8" stroke-width="1.5"/>
      <path d="M ${xR - 35},${panYR} L ${xR + 35},${panYR}" stroke="#485c70" stroke-width="4" stroke-linecap="round"/>
      ${rightWeights}
      <text x="${xR}" y="${panYR + 20}" font-family="sans-serif" font-size="11" fill="#00b5e2" font-weight="bold" text-anchor="middle">Layer 7 (WAF)</text>

      ${resolved && correct ? `
        <circle cx="250" cy="180" r="20" fill="#2ecc71" class="glow-success"/>
        <text x="250" y="185" font-family="sans-serif" font-size="14" fill="#ffffff" font-weight="bold" text-anchor="middle">✔</text>
      ` : ''}
      ${resolved && !correct ? `
        <circle cx="250" cy="180" r="20" fill="#e74c3c" class="glow-danger"/>
        <text x="250" y="185" font-family="sans-serif" font-size="14" fill="#ffffff" font-weight="bold" text-anchor="middle">✘</text>
      ` : ''}
    `);
  }

  drawM3WAFConsole() {
    const sqli = this.toggleStates['toggle_sqli'] === true;
    const xss = this.toggleStates['toggle_xss'] === true;
    const owasp = this.toggleStates['toggle_owasp'] === true;
    const geoblock = this.toggleStates['toggle_geoblock'] === true;
    const bot = this.toggleStates['toggle_botcontrol'] === true;

    return this.wrapSVG(`
      <rect x="30" y="30" width="440" height="440" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="30" y="30" width="440" height="60" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="68" font-family="sans-serif" font-size="15" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Web Application Firewall Rules</text>

      <!-- Row 1: SQLi -->
      <rect x="50" y="110" width="400" height="55" rx="6" fill="#f8fafc" stroke="${sqli ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="142" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">SQLi Protection</text>
      <circle cx="340" cy="138" r="8" fill="${sqli ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="142" font-family="sans-serif" font-size="11" fill="${sqli ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${sqli ? 'BLOCKING SQLi' : 'BYPASS ACTIVE'}
      </text>

      <!-- Row 2: XSS -->
      <rect x="50" y="180" width="400" height="55" rx="6" fill="#f8fafc" stroke="${xss ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="212" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">XSS Auditing</text>
      <circle cx="340" cy="208" r="8" fill="${xss ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="212" font-family="sans-serif" font-size="11" fill="${xss ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${xss ? 'SCRUBBING SCRIPTS' : 'BYPASS ACTIVE'}
      </text>

      <!-- Row 3: OWASP -->
      <rect x="50" y="250" width="400" height="55" rx="6" fill="#f8fafc" stroke="${owasp ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="282" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">OWASP Core Rule Set</text>
      <circle cx="340" cy="278" r="8" fill="${owasp ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="282" font-family="sans-serif" font-size="11" fill="${owasp ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${owasp ? 'CRS FORCE ACTIVE' : 'LEGACY MODE'}
      </text>

      <!-- Row 4: Geo-blocking -->
      <rect x="50" y="320" width="400" height="55" rx="6" fill="#f8fafc" stroke="${geoblock ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="352" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">Geographic Restrictions</text>
      <circle cx="340" cy="348" r="8" fill="${geoblock ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="352" font-family="sans-serif" font-size="11" fill="${geoblock ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${geoblock ? 'FILTERING GLOBAL IPs' : 'OPEN WORLDWIDE'}
      </text>

      <!-- Row 5: Bot Control -->
      <rect x="50" y="390" width="400" height="55" rx="6" fill="#f8fafc" stroke="${bot ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="422" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">Bot Rate Limiting</text>
      <circle cx="340" cy="418" r="8" fill="${bot ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="422" font-family="sans-serif" font-size="11" fill="${bot ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${bot ? 'BOT SHIELD ACTIVE' : 'UNLIMITED SCRAPE'}
      </text>
    `);
  }

  drawM3DDoSScrubbing() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let pathColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

    return this.wrapSVG(`
      <!-- Botnet attacker -->
      <rect x="40" y="100" width="100" height="60" rx="6" fill="rgba(231,76,60,0.05)" stroke="#e74c3c" stroke-width="2"/>
      <text x="90" y="135" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">Volumetric DDoS</text>

      <!-- Scrubbing Center -->
      <rect x="200" y="180" width="100" height="90" rx="8" fill="#ffffff" stroke="${resolved && correct ? '#2ecc71' : '#cbd5e1'}" stroke-width="3" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="250" y="215" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Scrubbing</text>
      <text x="250" y="230" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Center</text>
      <text x="250" y="255" font-family="sans-serif" font-size="12" text-anchor="middle">${resolved && correct ? '🧼' : '⚡'}</text>

      <!-- Target App Server -->
      <rect x="360" y="100" width="100" height="60" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="410" y="135" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">App Origin</text>

      <!-- Traffic Lines -->
      <path d="M 140,130 L 200,210" fill="none" stroke="#e74c3c" stroke-width="3.5" stroke-dasharray="4,4" class="animate-dash-fast"/>
      
      ${resolved && correct ? `
        <!-- Clean traffic line -->
        <path d="M 300,225 L 360,145" fill="none" stroke="#2ecc71" stroke-width="3" stroke-dasharray="5,3" class="animate-dash-slow"/>
        <text x="330" y="170" font-family="sans-serif" font-size="10" fill="#2ecc71" font-weight="bold">Clean Traffic</text>
      ` : `
        <path d="M 140,130 C 250,90 310,95 360,130" fill="none" stroke="${pathColor}" stroke-width="3"/>
      `}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'DDoS ABSORBED BY SCRUBBING EDGE' : (resolved && !correct ? 'ORIGIN OVERWHELMED BY EXPLOIT' : 'Mitigate Volumetric Infrastructure Spike')}
      </text>
    `);
  }

  drawM3L7DDoS() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let cdnColor = resolved && correct ? '#2ecc71' : '#cbd5e1';

    return this.wrapSVG(`
      <!-- Rapid Reload Attackers -->
      <rect x="40" y="90" width="110" height="60" rx="6" fill="#ffffff" stroke="#e74c3c" stroke-width="2"/>
      <text x="95" y="125" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">HTTP Flood Bots</text>

      <!-- CDN Edge -->
      <rect x="200" y="170" width="100" height="90" rx="8" fill="#ffffff" stroke="${cdnColor}" stroke-width="3" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="250" y="205" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">CDN / WAF Edge</text>
      <text x="250" y="222" font-family="sans-serif" font-size="10" fill="#7d93a8" text-anchor="middle">Rate Limiting</text>
      <text x="250" y="248" font-family="sans-serif" font-size="12" text-anchor="middle">${resolved && correct ? '🛑' : '⏳'}</text>

      <!-- App Origin -->
      <rect x="350" y="90" width="110" height="60" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="405" y="125" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Origin Server</text>

      <!-- Traffic routing -->
      <path d="M 150,120 L 200,200" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
      
      ${resolved && correct ? `
        <path d="M 220,260 L 140,310" fill="none" stroke="#e74c3c" stroke-width="2"/>
        <text x="145" y="335" font-family="sans-serif" font-size="9" fill="#e74c3c" font-weight="bold">Drop: HTTP 429 Limit</text>
        <path d="M 300,215 L 350,135" fill="none" stroke="#2ecc71" stroke-width="2"/>
      ` : `
        <path d="M 150,120 L 350,120" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="4,2" class="animate-dash-fast"/>
        <!-- Overload indicator -->
        <rect x="360" y="170" width="90" height="40" rx="4" fill="rgba(231,76,60,0.1)" stroke="#e74c3c" stroke-width="1"/>
        <text x="405" y="194" font-family="sans-serif" font-size="10" fill="#e74c3c" font-weight="bold" text-anchor="middle">CPU LOAD 100%</text>
      `}

      <!-- Status Info -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'L7 DDoS BLOCKED BY RATE LIMITS' : (resolved && !correct ? 'ORIGIN OVERWHELMED BY HTTP FLOOD' : 'Mitigate Layer 7 HTTP Reload Flood')}
      </text>
    `);
  }

  drawM3OriginShield() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let shieldBorder = resolved && correct ? '#2ecc71' : '#cbd5e1';

    return this.wrapSVG(`
      <!-- Public Attacker -->
      <rect x="40" y="100" width="100" height="60" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="90" y="135" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">Public Client</text>

      <!-- CDN Proxy -->
      <rect x="200" y="100" width="100" height="60" rx="6" fill="#ffffff" stroke="#00b5e2" stroke-width="2"/>
      <text x="250" y="135" font-family="sans-serif" font-size="12" fill="#00b5e2" font-weight="bold" text-anchor="middle">CDN Edge</text>

      <!-- Target App Origin -->
      <rect x="360" y="100" width="100" height="60" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="410" y="135" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Origin Server</text>

      <!-- Routing path -->
      <line x1="140" y1="130" x2="200" y2="130" stroke="#7d93a8" stroke-width="2"/>
      <line x1="300" y1="130" x2="360" y2="130" stroke="#00b5e2" stroke-width="2"/>

      <!-- Origin Shield checkpoint block -->
      <rect x="150" y="210" width="200" height="85" rx="8" fill="#ffffff" stroke="${shieldBorder}" stroke-width="3" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="250" y="240" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">CDN IP Access Whitelist</text>
      <text x="250" y="270" font-family="sans-serif" font-size="11" fill="#7d93a8" text-anchor="middle">
        ${resolved && correct ? '🔒 Active: Only CDN IPs permitted' : '⚠ Ingress rules unconfigured'}
      </text>

      <!-- Direct bypass path -->
      ${resolved && !correct ? `
        <path d="M 90,160 L 90,320 L 410,320 L 410,160" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
        <text x="250" y="340" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">DIRECT BYPASS ATTACK ON ORIGIN IP</text>
      ` : ''}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'ORIGIN IP HIDDEN BEHIND CDN SHIELD' : (resolved && !correct ? 'ORIGIN COMPROMISED BY DIRECT BYPASS' : 'Configure Origin IP Protection')}
      </text>
    `);
  }

  drawM3SYNFlood() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let statusText = resolved && correct ? 'SYN PROXY ACTIVE (HANDSHAKE COMPLETED AT EDGE)' : (resolved && !correct ? 'SYSTEM OVERLOAD: TCP HANDSHAKE BUFFER FULL' : 'TCP SYN FLOOD VULNERABILITY AUDIT');
    let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

    return this.wrapSVG(`
      <!-- Attacker bot -->
      <circle cx="80" cy="150" r="30" fill="rgba(231,76,60,0.05)" stroke="#e74c3c" stroke-width="2"/>
      <text x="80" y="154" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">SYN Flood</text>

      <!-- App Server -->
      <rect x="340" y="110" width="110" height="80" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="395" y="145" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">App Server</text>
      <text x="395" y="165" font-family="monospace" font-size="9" fill="#7d93a8" text-anchor="middle">TCP Port 80</text>

      <!-- Flow details -->
      <path d="M 110,150 L 340,150" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
      
      ${resolved && correct ? `
        <!-- Proxy Shield -->
        <rect x="180" y="120" width="100" height="60" rx="6" fill="#ffffff" stroke="#2ecc71" stroke-width="2.5" class="glow-success"/>
        <text x="230" y="145" font-family="sans-serif" font-size="10" fill="#2ecc71" font-weight="bold" text-anchor="middle">SYN Cookie</text>
        <text x="230" y="160" font-family="sans-serif" font-size="9" fill="#7d93a8" text-anchor="middle">Proxy Validation</text>
      ` : ''}

      ${resolved && !correct ? `
        <!-- Buffer status box -->
        <rect x="180" y="220" width="180" height="50" rx="6" fill="rgba(231,76,60,0.1)" stroke="#e74c3c" stroke-width="1" class="glow-danger"/>
        <text x="270" y="250" font-family="monospace" font-size="10" fill="#e74c3c" font-weight="bold" text-anchor="middle">BACKLOG QUEUE OVERFLOW</text>
      ` : ''}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="11" fill="${themeColor}" font-weight="bold" text-anchor="middle">${statusText}</text>
    `);
  }

  drawM3DDoSCost() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let chartColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

    return this.wrapSVG(`
      <!-- Chart Area -->
      <rect x="60" y="80" width="380" height="240" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <!-- Graph Axes -->
      <line x1="90" y1="280" x2="410" y2="280" stroke="#485c70" stroke-width="2"/>
      <line x1="90" y1="100" x2="90" y2="280" stroke="#485c70" stroke-width="2"/>
      <text x="250" y="298" font-family="sans-serif" font-size="10" fill="#7d93a8" text-anchor="middle">Attack Duration</text>
      
      <!-- Plot Path -->
      ${resolved && correct ? `
        <!-- Protected cost curve (remains flat/credit) -->
        <path d="M 90,240 L 180,240 L 270,240 L 410,240" fill="none" stroke="#2ecc71" stroke-width="4.5" class="glow-success"/>
        <rect x="180" y="130" width="160" height="55" rx="6" fill="#ffffff" stroke="#2ecc71" stroke-width="1.5" class="glow-success"/>
        <text x="260" y="152" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">DDoS COST GUARANTEE</text>
        <text x="260" y="172" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">Scaling credit applied</text>
      ` : `
        <!-- Escalating cost curve -->
        <path d="M 90,250 Q 230,220 410,110" fill="none" stroke="${chartColor}" stroke-width="4.5"/>
        <text x="350" y="140" font-family="sans-serif" font-size="11" fill="${chartColor}" font-weight="bold">Inflated Billing</text>
      `}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'BILLING SURGE PROTECTION SHIELD ACTIVE' : (resolved && !correct ? 'RISK: UNRESTRICTED AUTO-SCALING CHARGES' : 'Evaluate SLA Billing Guarantees')}
      </text>
    `);
  }

  // ==================== SVGs FOR MODULE 4 (Data Security: Encryption) ====================
  drawM4RestTransitScale() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let leftCount = 0;
    let rightCount = 0;
    Object.values(this.dragPlacements).forEach(val => {
      if (val === 'left') leftCount++;
      if (val === 'right') rightCount++;
    });

    const diff = leftCount - rightCount;
    let tiltAngle = diff * 5; 
    tiltAngle = Math.max(-20, Math.min(20, tiltAngle));

    let statusText = "Encryption At Rest vs In Transit";
    let statusColor = "#0056b3";
    if (resolved) {
      if (correct) {
        statusText = "Correct Cryptographic Placements!";
        statusColor = "#2ecc71";
      } else {
        statusText = "Misallocated Encryption Boundaries";
        statusColor = "#e74c3c";
      }
    }

    const rad = (tiltAngle * Math.PI) / 180;
    const xL = 250 - 120 * Math.cos(rad);
    const yL = 180 - 120 * Math.sin(rad);
    const xR = 250 + 120 * Math.cos(rad);
    const yR = 180 + 120 * Math.sin(rad);

    const panYL = yL + 85;
    const panYR = yR + 85;

    let leftWeights = '';
    for (let i = 0; i < leftCount; i++) {
      leftWeights += `<rect x="${xL + (i * 7) - (leftCount * 3.5) - 4}" y="${panYL - 10}" width="8" height="8" fill="#0056b3" stroke="#ffffff"/>`;
    }
    let rightWeights = '';
    for (let i = 0; i < rightCount; i++) {
      rightWeights += `<rect x="${xR + (i * 7) - (rightCount * 3.5) - 4}" y="${panYR - 10}" width="8" height="8" fill="#00b5e2" stroke="#ffffff"/>`;
    }

    return this.wrapSVG(`
      <rect x="50" y="40" width="400" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="72" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>

      <rect x="244" y="180" width="12" height="200" fill="#cbd5e1" rx="2"/>
      <path d="M 220,380 L 280,380" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
      <circle cx="250" cy="180" r="8" fill="#485c70"/>

      <line x1="${xL}" y1="${yL}" x2="${xR}" y2="${yR}" stroke="#485c70" stroke-width="5" stroke-linecap="round"/>

      <!-- At Rest Pan -->
      <line x1="${xL}" y1="${yL}" x2="${xL - 25}" y2="${panYL}" stroke="#7d93a8" stroke-width="1.5"/>
      <line x1="${xL}" y1="${yL}" x2="${xL + 25}" y2="${panYL}" stroke="#7d93a8" stroke-width="1.5"/>
      <path d="M ${xL - 35},${panYL} L ${xL + 35},${panYL}" stroke="#485c70" stroke-width="4" stroke-linecap="round"/>
      ${leftWeights}
      <text x="${xL}" y="${panYL + 20}" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">Data At Rest</text>

      <!-- In Transit Pan -->
      <line x1="${xR}" y1="${yR}" x2="${xR - 25}" y2="${panYR}" stroke="#7d93a8" stroke-width="1.5"/>
      <line x1="${xR}" y1="${yR}" x2="${xR + 25}" y2="${panYR}" stroke="#7d93a8" stroke-width="1.5"/>
      <path d="M ${xR - 35},${panYR} L ${xR + 35},${panYR}" stroke="#485c70" stroke-width="4" stroke-linecap="round"/>
      ${rightWeights}
      <text x="${xR}" y="${panYR + 20}" font-family="sans-serif" font-size="11" fill="#00b5e2" font-weight="bold" text-anchor="middle">Data In Transit</text>

      ${resolved && correct ? `
        <circle cx="250" cy="180" r="20" fill="#2ecc71" class="glow-success"/>
        <text x="250" y="185" font-family="sans-serif" font-size="14" fill="#ffffff" font-weight="bold" text-anchor="middle">✔</text>
      ` : ''}
      ${resolved && !correct ? `
        <circle cx="250" cy="180" r="20" fill="#e74c3c" class="glow-danger"/>
        <text x="250" y="185" font-family="sans-serif" font-size="14" fill="#ffffff" font-weight="bold" text-anchor="middle">✘</text>
      ` : ''}
    `);
  }

  drawM4ConfComputing() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let enclaveStroke = resolved && correct ? '#2ecc71' : '#cbd5e1';

    return this.wrapSVG(`
      <!-- CPU Box -->
      <rect x="50" y="100" width="160" height="150" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2.5"/>
      <text x="130" y="130" font-family="sans-serif" font-size="13" fill="#0056b3" font-weight="bold" text-anchor="middle">CPU Processor</text>

      <!-- RAM Box -->
      <rect x="290" y="100" width="160" height="150" rx="8" fill="#ffffff" stroke="#00b5e2" stroke-width="2.5"/>
      <text x="370" y="130" font-family="sans-serif" font-size="13" fill="#00b5e2" font-weight="bold" text-anchor="middle">System RAM</text>

      <!-- Secured RAM Enclave boundary -->
      <rect x="310" y="150" width="120" height="85" rx="6" fill="rgba(0,181,226,0.03)" stroke="${enclaveStroke}" stroke-width="2.5" stroke-dasharray="${resolved && correct ? 'none' : '4,4'}"/>
      <text x="370" y="180" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Isolated Enclave</text>
      <text x="370" y="210" font-family="sans-serif" font-size="12" text-anchor="middle">${resolved && correct ? '🔒' : '🔓'}</text>

      <!-- Interconnect Bus line -->
      <path d="M 210,180 L 290,180" fill="none" stroke="${resolved && correct ? '#2ecc71' : '#cbd5e1'}" stroke-width="3" stroke-dasharray="5,3"/>

      <!-- Unauthorized inspector -->
      ${resolved && !correct ? `
        <rect x="150" y="280" width="200" height="60" rx="6" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
        <text x="250" y="305" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">ADMIN RAM DUMP EXPOSURE</text>
        <text x="250" y="325" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">Plaintext keys visible in memory dumps</text>
      ` : `
        <rect x="150" y="280" width="200" height="60" rx="6" fill="${resolved && correct ? 'rgba(46, 204, 113, 0.08)' : '#f8fafc'}" stroke="${resolved && correct ? '#2ecc71' : '#cbd5e1'}" stroke-width="1.5"/>
        <text x="250" y="315" font-family="sans-serif" font-size="11" fill="${resolved && correct ? '#2ecc71' : '#7d93a8'}" font-weight="bold" text-anchor="middle">
          ${resolved && correct ? 'ENCRYPTED AT RUNTIME IN RAM' : 'Audit Data-in-Use Enclaves'}
        </text>
      `}

      <!-- Status Footer -->
      <rect x="60" y="375" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="405" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'CONFIDENTIAL COMPUTING ACTIVE' : (resolved && !correct ? 'RISK: HYPERVISOR MEMORY COMPROMISE' : 'Evaluate RAM Workload Protections')}
      </text>
    `);
  }

  drawM4Homomorphic() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let flowColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

    return this.wrapSVG(`
      <!-- Ciphertext Input -->
      <rect x="40" y="100" width="120" height="80" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="100" y="130" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Encrypted Input</text>
      <text x="100" y="155" font-family="monospace" font-size="9" fill="#00b5e2" text-anchor="middle">[0x8F9A4E2B...]</text>

      <!-- Processing Engine -->
      <rect x="200" y="200" width="100" height="80" rx="8" fill="#ffffff" stroke="${flowColor}" stroke-width="3" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="250" y="235" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">FHE Compute</text>
      <text x="250" y="255" font-family="monospace" font-size="9" fill="#7d93a8" text-anchor="middle">f(x) on Cipher</text>

      <!-- Ciphertext Output -->
      <rect x="340" y="100" width="120" height="80" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="400" y="130" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Encrypted Result</text>
      <text x="400" y="155" font-family="monospace" font-size="9" fill="#00b5e2" text-anchor="middle">[0x3D7C91E5...]</text>

      <!-- Connections -->
      <path d="M 160,140 L 200,220" fill="none" stroke="${flowColor}" stroke-width="2.5" stroke-dasharray="5,3" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
      <path d="M 300,220 L 340,140" fill="none" stroke="${flowColor}" stroke-width="2.5" stroke-dasharray="5,3" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>

      ${resolved && !correct ? `
        <!-- Decryption alert -->
        <rect x="130" y="300" width="240" height="50" rx="6" fill="rgba(231, 76, 60, 0.08)" stroke="#e74c3c" stroke-width="1.5" class="glow-danger"/>
        <text x="250" y="325" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">DECRYPTION DETECTED IN CLOUD</text>
        <text x="250" y="342" font-family="sans-serif" font-size="9" fill="#485c70" text-anchor="middle">Plaintext leaked during analytical step</text>
      ` : ''}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'HOMOMORPHIC COMPUTATION: ZERO DECRYPTION' : (resolved && !correct ? 'RISK: PLAINTEXT DECRYPTION EXPOSURE' : 'Verify Analytical Processing Encryption')}
      </text>
    `);
  }

  drawM4Attestation() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let certColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

    return this.wrapSVG(`
      <!-- Verifier Service -->
      <rect x="40" y="100" width="130" height="70" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="105" y="135" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Attestation Client</text>

      <!-- Target Secure Enclave -->
      <rect x="330" y="100" width="130" height="70" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="395" y="135" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Secure Enclave</text>

      <!-- Certificate Signature Token -->
      <rect x="185" y="190" width="130" height="100" rx="8" fill="#ffffff" stroke="${certColor}" stroke-width="3" class="${resolved && correct ? 'glow-success' : (resolved && !correct ? 'glow-danger' : '')}"/>
      <text x="250" y="218" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Hardware Proof</text>
      <text x="250" y="235" font-family="monospace" font-size="9" fill="#7d93a8" text-anchor="middle">SHA-256 Hash</text>
      <text x="250" y="270" font-family="sans-serif" font-size="18" text-anchor="middle">${resolved && correct ? '✔ Verified' : (resolved && !correct ? '✖ Tampered' : '🔑 Auditing')}</text>

      <!-- Communication paths -->
      <path d="M 105,170 C 130,220 180,220 185,220" fill="none" stroke="${certColor}" stroke-width="2" stroke-dasharray="4,4"/>
      <path d="M 330,135 L 315,190" fill="none" stroke="#cbd5e1" stroke-width="2"/>

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'ATTESTATION CRYPTOGRAPHIC SIGNATURE OK' : (resolved && !correct ? 'INTEGRITY DRIFT: BOOT STATE CORRUPTED' : 'Validate Enclave Attestation Report')}
      </text>
    `);
  }

  drawM4HardwareEnclave() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let ringColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

    return this.wrapSVG(`
      <!-- CPU Subsystem -->
      <rect x="50" y="80" width="400" height="260" rx="10" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="250" y="110" font-family="sans-serif" font-size="15" fill="#0056b3" font-weight="bold" text-anchor="middle">Physical CPU Cores</text>

      <!-- CPU Core A -->
      <rect x="70" y="140" width="160" height="160" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="150" y="165" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Core 0 (Standard OS)</text>
      <circle cx="150" cy="220" r="25" fill="#ffffff" stroke="#7d93a8" stroke-width="1.5"/>
      <text x="150" y="225" font-family="monospace" font-size="11" fill="#7d93a8" text-anchor="middle">Ring 0</text>

      <!-- CPU Core B -->
      <rect x="270" y="140" width="160" height="160" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="350" y="165" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Core 1 (Isolated Enclave)</text>
      <circle cx="350" cy="220" r="30" fill="#ffffff" stroke="${ringColor}" stroke-width="3" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="350" y="225" font-family="sans-serif" font-size="12" text-anchor="middle">${resolved && correct ? '🔒' : '🛡'}</text>

      <!-- Access block status -->
      <rect x="90" y="370" width="320" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="400" font-family="sans-serif" font-size="11" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'INTEL SGX SECURE REGISTERS SHIELDED' : (resolved && !correct ? 'VULNERABLE: CROSS-CORE INSPECTION DETECTED' : 'Verify Hardware Cryptographic Bounds')}
      </text>
    `);
  }

  drawM4MemoryEncryption() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let busColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

    return this.wrapSVG(`
      <!-- CPU Core -->
      <rect x="50" y="150" width="110" height="90" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="105" y="195" font-family="sans-serif" font-size="13" fill="#0056b3" font-weight="bold" text-anchor="middle">CPU Core</text>
      <text x="105" y="215" font-family="sans-serif" font-size="9" fill="#7d93a8" text-anchor="middle">Key Gen Node</text>

      <!-- RAM DIMM -->
      <rect x="340" y="110" width="110" height="170" rx="8" fill="#ffffff" stroke="#00b5e2" stroke-width="2"/>
      <text x="395" y="140" font-family="sans-serif" font-size="13" fill="#00b5e2" font-weight="bold" text-anchor="middle">RAM DIMM</text>
      <line x1="360" y1="180" x2="430" y2="180" stroke="#cbd5e1" stroke-width="1.5"/>
      <line x1="360" y1="210" x2="430" y2="210" stroke="#cbd5e1" stroke-width="1.5"/>

      <!-- Interconnect bus -->
      <path d="M 160,195 L 340,195" fill="none" stroke="${busColor}" stroke-width="4.5" stroke-dasharray="${resolved && correct ? '6,4' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
      
      <!-- Attacker sniffing the bus -->
      ${resolved && !correct ? `
        <circle cx="250" cy="245" r="20" fill="#ffffff" stroke="#e74c3c" stroke-width="2"/>
        <text x="250" y="250" font-family="sans-serif" font-size="14" text-anchor="middle">🕵️</text>
        <path d="M 250,225 L 250,195" fill="none" stroke="#e74c3c" stroke-width="2"/>
        <text x="250" y="290" font-family="sans-serif" font-size="9" fill="#e74c3c" font-weight="bold" text-anchor="middle">BUS SNOOPING DETECTED: PLAINTEXT RAM READ</text>
      ` : ''}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'TOTAL MEMORY ENCRYPTION ACTIVE' : (resolved && !correct ? 'BUS EXPOSED: HARDWARE RAM SNIFFER ACTIVE' : 'Verify Memory Bus Cryptography')}
      </text>
    `);
  }

  drawM4KeyRotationTimeline() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    const labels = {
      'key_step_create': 'Create Key Version',
      'key_step_alias': 'Update Key Alias',
      'key_step_encrypt': 'Encrypt New Entries',
      'key_step_retain': 'Retain Legacy Key',
      'key_step_archive': 'Archive Legacy Key'
    };

    let statusText = "KMS Key Rotation Pipeline";
    let statusColor = "#0056b3";
    if (resolved) {
      if (correct) {
        statusText = "Secure KMS Workflow Verified!";
        statusColor = "#2ecc71";
      } else {
        statusText = "Key Rotation Order Mismatched";
        statusColor = "#e74c3c";
      }
    }

    let nodeHTML = '';
    const startY = 120;
    const spacingY = 70;
    const x = 250;

    for (let i = 0; i < 5; i++) {
      const step = this.sortingOrder[i];
      if (!step) continue;
      const isCorrectSlot = step.correctIndex === i;

      let nodeColor = "#0056b3"; 
      if (resolved) {
        nodeColor = isCorrectSlot ? "#2ecc71" : "#e74c3c";
      }

      if (i < 4) {
        nodeHTML += `
          <line x1="${x}" y1="${startY + i * spacingY + 20}" x2="${x}" y2="${startY + (i + 1) * spacingY - 20}" 
                stroke="${resolved && correct ? '#2ecc71' : '#cbd5e1'}" stroke-width="3" 
                stroke-dasharray="${resolved && correct ? '6,4' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
          <polygon points="${x},${startY + (i + 1) * spacingY - 20} ${x - 5},${startY + (i + 1) * spacingY - 28} ${x + 5},${startY + (i + 1) * spacingY - 28}" 
                   fill="${resolved && correct ? '#2ecc71' : '#cbd5e1'}"/>
        `;
      }

      nodeHTML += `
        <rect x="120" y="${startY + i * spacingY - 20}" width="260" height="40" rx="8" fill="#ffffff" stroke="${nodeColor}" stroke-width="2"/>
        <text x="250" y="${startY + i * spacingY + 5}" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">
          ${labels[step.id] || step.text}
        </text>
        ${resolved ? `
          <circle cx="100" cy="${startY + i * spacingY}" r="10" fill="${nodeColor}"/>
          <text x="100" y="${startY + i * spacingY + 3.5}" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">
            ${isCorrectSlot ? '✔' : '✖'}
          </text>
        ` : ''}
      `;
    }

    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="62" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>
      ${nodeHTML}
    `);
  }

  drawM4CMKKeyVault() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let keyBorder = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3');

    return this.wrapSVG(`
      <!-- Key Vault -->
      <rect x="40" y="100" width="160" height="240" rx="8" fill="#ffffff" stroke="${keyBorder}" stroke-width="2"/>
      <text x="120" y="130" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Key Vault (KMS)</text>
      <circle cx="120" cy="200" r="28" fill="#ffffff" stroke="${keyBorder}" stroke-width="2" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="120" y="206" font-family="sans-serif" font-size="20" text-anchor="middle">${resolved && correct ? '🔑' : '🛡'}</text>
      <text x="120" y="260" font-family="sans-serif" font-size="10" fill="#485c70" text-anchor="middle">Customer Controlled</text>

      <!-- Cloud Database -->
      <rect x="300" y="140" width="160" height="150" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="380" y="175" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Cloud Database</text>
      <text x="380" y="210" font-family="monospace" font-size="9" fill="#00b5e2" text-anchor="middle">[Encrypted Storage]</text>

      <!-- Key sharing path -->
      <path d="M 148,200 Q 230,170 300,200" fill="none" stroke="${resolved && correct ? '#2ecc71' : '#cbd5e1'}" stroke-width="2.5" stroke-dasharray="5,3" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>

      <!-- Control switches -->
      ${resolved && correct ? `
        <rect x="180" y="300" width="140" height="40" rx="6" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="1.5" class="glow-success"/>
        <text x="250" y="324" font-family="sans-serif" font-size="10" fill="#2ecc71" font-weight="bold" text-anchor="middle">REVOKE RIGHTS ACTIVE</text>
      ` : `
        <rect x="180" y="300" width="140" height="40" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="250" y="324" font-family="sans-serif" font-size="10" fill="#7d93a8" text-anchor="middle">Verify CMK Rights</text>
      `}

      <!-- Status Footer -->
      <rect x="60" y="375" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="405" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'CUSTOMER MANAGED KEY ACTIVE' : (resolved && !correct ? 'PROVIDER OWNED KEY: UNILATERAL ACCESS' : 'Verify Key Management Ownership')}
      </text>
    `);
  }

  drawM4EnvelopeEncryption() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let envelopeColor = resolved && correct ? '#2ecc71' : '#cbd5e1';

    return this.wrapSVG(`
      <!-- Database Layer -->
      <rect x="40" y="90" width="140" height="230" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="110" y="115" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Local DB Engine</text>

      <!-- Local DEK (Data Encryption Key) -->
      <rect x="60" y="145" width="100" height="45" rx="4" fill="#ffffff" stroke="${envelopeColor}" stroke-width="2"/>
      <text x="110" y="172" font-family="monospace" font-size="10" fill="#00b5e2" font-weight="bold" text-anchor="middle">Data Key (DEK)</text>

      <!-- KMS Key Vault -->
      <rect x="320" y="120" width="140" height="150" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="390" y="145" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">KMS Master (KEK)</text>
      <circle cx="390" cy="205" r="22" fill="#ffffff" stroke="#0056b3" stroke-width="1.5"/>
      <text x="390" y="210" font-family="sans-serif" font-size="14" text-anchor="middle">🔑</text>

      <!-- Envelope boundary -->
      <rect x="50" y="210" width="120" height="90" rx="6" fill="rgba(46,204,113,0.03)" stroke="${envelopeColor}" stroke-width="2" stroke-dasharray="${resolved && correct ? 'none' : '4,4'}"/>
      <text x="110" y="235" font-family="sans-serif" font-size="10" fill="#485c70" font-weight="bold" text-anchor="middle">Encrypted DEK</text>
      <text x="110" y="270" font-family="sans-serif" font-size="20" text-anchor="middle">${resolved && correct ? '✉️' : '⚠'}</text>

      <!-- Network arrow -->
      ${resolved && !correct ? `
        <line x1="180" y1="170" x2="320" y2="170" stroke="#e74c3c" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
        <text x="250" y="160" font-family="sans-serif" font-size="8" fill="#e74c3c" font-weight="bold" text-anchor="middle">KMS API LATENCY OVERLOAD</text>
      ` : `
        <line x1="180" y1="200" x2="320" y2="200" stroke="${envelopeColor}" stroke-width="2"/>
      `}

      <!-- Status Footer -->
      <rect x="60" y="375" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="405" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'ENVELOPE ENCRYPTION ACTIVE' : (resolved && !correct ? 'RISK: WAN OVERHEAD FOR ROW DECRYPTS' : 'Verify Envelope Key Architecture')}
      </text>
    `);
  }

  drawM4HSMModule() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let boxBorder = resolved && correct ? '#2ecc71' : '#cbd5e1';

    return this.wrapSVG(`
      <!-- Hardened HSM Container -->
      <rect x="60" y="90" width="380" height="240" rx="10" fill="#ffffff" stroke="${resolved && correct ? '#2ecc71' : '#0056b3'}" stroke-width="3.5" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="250" y="125" font-family="sans-serif" font-size="15" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Hardware Security Module (HSM)</text>

      <!-- FIPS 140-2 Level 3 cage -->
      <rect x="100" y="160" width="300" height="130" rx="6" fill="rgba(0,86,179,0.03)" stroke="${boxBorder}" stroke-width="2" stroke-dasharray="8,4"/>
      
      <!-- Key nodes inside -->
      <circle cx="160" cy="225" r="22" fill="#ffffff" stroke="${boxBorder}" stroke-width="2"/>
      <text x="160" y="230" font-family="sans-serif" font-size="14" text-anchor="middle">🔑</text>

      <circle cx="250" cy="225" r="22" fill="#ffffff" stroke="${boxBorder}" stroke-width="2"/>
      <text x="250" y="230" font-family="sans-serif" font-size="14" text-anchor="middle">🔑</text>

      <circle cx="340" cy="225" r="22" fill="#ffffff" stroke="${boxBorder}" stroke-width="2"/>
      <text x="340" y="230" font-family="sans-serif" font-size="14" text-anchor="middle">🔑</text>

      <!-- Secure banner -->
      <rect x="90" y="370" width="320" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="400" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'FIPS 140-2 LEVEL 3 HARDWARE ACTIVE' : (resolved && !correct ? 'SOFTWARE STORAGE DEPRECATED' : 'Verify Key Storage Security Levels')}
      </text>
    `);
  }

  drawM4VaultFirewall() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let firewallColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

    return this.wrapSVG(`
      <!-- Approved subnet -->
      <rect x="40" y="100" width="130" height="60" rx="6" fill="#ffffff" stroke="#2ecc71" stroke-width="1.5"/>
      <text x="105" y="135" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">App Subnet</text>

      <!-- Unapproved internet client -->
      <rect x="40" y="220" width="130" height="60" rx="6" fill="rgba(231,76,60,0.05)" stroke="#e74c3c" stroke-width="1.5"/>
      <text x="105" y="255" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">Public Internet</text>

      <!-- Key Vault -->
      <rect x="330" y="140" width="130" height="120" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="395" y="180" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Key Vault</text>
      <text x="395" y="210" font-family="sans-serif" font-size="14" text-anchor="middle">🛡</text>

      <!-- Firewall Wall -->
      <rect x="230" y="90" width="15" height="220" fill="${firewallColor}"/>

      <!-- Connection path A -->
      <path d="M 170,130 L 230,130 M 245,130 L 330,170" fill="none" stroke="#2ecc71" stroke-width="2.5" stroke-dasharray="4,4" class="animate-dash-slow"/>

      <!-- Connection path B -->
      ${resolved && correct ? `
        <path d="M 170,250 L 230,250" fill="none" stroke="#e74c3c" stroke-width="2"/>
        <circle cx="230" cy="250" r="10" fill="#e74c3c"/>
        <text x="230" y="253.5" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="bold" text-anchor="middle">✖</text>
      ` : `
        <path d="M 170,250 L 330,220" fill="none" stroke="${resolved && !correct ? '#e74c3c' : '#7d93a8'}" stroke-dasharray="4,4" class="animate-dash-fast"/>
      `}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'ENDPOINT IP RESTRICTIONS ACTIVE' : (resolved && !correct ? 'VAULT EXPOSED: SERVICE FIREWALL DISABLE' : 'Configure Resource Access Firewall')}
      </text>
    `);
  }

  drawM4PurgeProtection() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let trashColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

    return this.wrapSVG(`
      <!-- Vault Symbol -->
      <circle cx="130" cy="200" r="40" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="130" y="206" font-family="sans-serif" font-size="20" text-anchor="middle">🛡</text>
      <text x="130" y="270" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">Key Vault</text>

      <!-- Deletion path -->
      <path d="M 170,200 L 310,200" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5,3" class="animate-dash-slow"/>
      <text x="240" y="185" font-family="sans-serif" font-size="10" fill="#e74c3c" font-weight="bold" text-anchor="middle">Delete Request</text>

      <!-- Soft Deleted quarantine Bin -->
      <rect x="320" y="140" width="120" height="120" rx="6" fill="#ffffff" stroke="${trashColor}" stroke-width="3" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="380" y="170" font-family="sans-serif" font-size="10" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Quarantine Bin</text>
      <text x="380" y="205" font-family="sans-serif" font-size="24" text-anchor="middle">🗑️</text>
      <text x="380" y="240" font-family="sans-serif" font-size="9" fill="${trashColor}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'Purge Locked' : (resolved && !correct ? 'Purge Allowed' : 'Pending status')}
      </text>

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'SOFT-DELETE & PURGE PROTECTION ACTIVE' : (resolved && !correct ? 'RISK: PERMANENT KEY ERASURE EXPOSED' : 'Verify Key Vault Delete Protections')}
      </text>
    `);
  }

  // ==================== SVGs FOR MODULE 5 (Threat Awareness: Cloud Threats) ====================
  drawM5MisconfigDashboard() {
    const s3public = this.toggleStates['toggle_s3public'] === true;
    const sshanywhere = this.toggleStates['toggle_sshanywhere'] === true;
    const defaultcreds = this.toggleStates['toggle_defaultcreds'] === true;
    const auditlogging = this.toggleStates['toggle_auditlogging'] === true;
    const orphankeys = this.toggleStates['toggle_orphankeys'] === true;

    return this.wrapSVG(`
      <rect x="30" y="30" width="440" height="440" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="30" y="30" width="440" height="60" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="68" font-family="sans-serif" font-size="15" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Cloud Misconfiguration Audit</text>

      <!-- Row 1: S3 Public -->
      <rect x="50" y="110" width="400" height="55" rx="6" fill="#f8fafc" stroke="${s3public ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="142" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">Public Object Storage</text>
      <circle cx="340" cy="138" r="8" fill="${s3public ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="142" font-family="sans-serif" font-size="11" fill="${s3public ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${s3public ? 'BLOCKED PUBLIC' : 'OPEN PUBLIC BUCKET'}
      </text>

      <!-- Row 2: SSH/RDP -->
      <rect x="50" y="180" width="400" height="55" rx="6" fill="#f8fafc" stroke="${sshanywhere ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="212" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">Admin SSH / RDP Ports</text>
      <circle cx="340" cy="208" r="8" fill="${sshanywhere ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="212" font-family="sans-serif" font-size="11" fill="${sshanywhere ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${sshanywhere ? 'RESTRICTED TO VPN' : 'OPEN TO THE WAN (0.0.0.0)'}
      </text>

      <!-- Row 3: Default Creds -->
      <rect x="50" y="250" width="400" height="55" rx="6" fill="#f8fafc" stroke="${defaultcreds ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="282" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">Root DB Credentials</text>
      <circle cx="340" cy="278" r="8" fill="${defaultcreds ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="282" font-family="sans-serif" font-size="11" fill="${defaultcreds ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${defaultcreds ? 'ROTATED & STRONG' : 'DEFAULT PASSWORD ACTIVE'}
      </text>

      <!-- Row 4: Audit Logging -->
      <rect x="50" y="320" width="400" height="55" rx="6" fill="#f8fafc" stroke="${auditlogging ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="352" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">Infrastructure Log Auditing</text>
      <circle cx="340" cy="348" r="8" fill="${auditlogging ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="352" font-family="sans-serif" font-size="11" fill="${auditlogging ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${auditlogging ? 'LOGGER ACTIVE' : 'LOGS TURNED OFF'}
      </text>

      <!-- Row 5: Orphan Keys -->
      <rect x="50" y="390" width="400" height="55" rx="6" fill="#f8fafc" stroke="${orphankeys ? '#2ecc71' : '#e74c3c'}" stroke-width="1.5"/>
      <text x="70" y="422" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">Developer API Keys</text>
      <circle cx="340" cy="418" r="8" fill="${orphankeys ? '#2ecc71' : '#e74c3c'}"/>
      <text x="360" y="422" font-family="sans-serif" font-size="11" fill="${orphankeys ? '#2ecc71' : '#e74c3c'}" font-weight="bold">
        ${orphankeys ? 'EXPIRED INACTIVE' : 'ORPHAN KEY ACTIVE (>90d)'}
      </text>
    `);
  }

  drawM5IdentityAttackCards(stepIdx) {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    if (stepIdx === 0) {
      let keyDisplay = resolved && correct ? 'aws_access_key = [REDACTED_SECRET]' : 'aws_access_key = AKIAIOSFODNN7EXAMPLE';
      let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

      return this.wrapSVG(`
        <rect x="50" y="80" width="400" height="300" rx="8" fill="#ffffff" stroke="#0a1c2a" stroke-width="2"/>
        <rect x="50" y="80" width="400" height="40" rx="8" fill="#0a1c2a"/>
        <text x="70" y="105" font-family="monospace" font-size="12" fill="#ffffff">github.com / public_repo / config.py</text>
        
        <rect x="70" y="140" width="360" height="150" rx="6" fill="#f8fafc" stroke="${themeColor}" stroke-width="2"/>
        <text x="90" y="175" font-family="monospace" font-size="11" fill="#485c70"># Configuration variables</text>
        <text x="90" y="200" font-family="monospace" font-size="11" fill="#0a1c2a">${keyDisplay}</text>
        <text x="90" y="225" font-family="monospace" font-size="11" fill="#485c70">aws_region = us-east-1</text>

        ${resolved && !correct ? `
          <rect x="130" y="310" width="240" height="45" rx="6" fill="rgba(231,76,60,0.08)" stroke="#e74c3c" stroke-width="1.5" class="glow-danger"/>
          <text x="250" y="336" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">API KEYS LEAKED TO WAN CRAWLERS</text>
        ` : ''}

        <rect x="50" y="400" width="400" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="250" y="430" font-family="sans-serif" font-size="12" fill="${themeColor}" font-weight="bold" text-anchor="middle">
          ${resolved && correct ? 'SECURE: SECRETS SCRUBBED FROM PUBLIC VCs' : (resolved && !correct ? 'VULNERABLE: SECRET COMMITTED IN REPO' : 'Identify Public Key Leak Risk')}
        </text>
      `);
    } else if (stepIdx === 1) {
      let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

      return this.wrapSVG(`
        <rect x="50" y="100" width="130" height="150" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
        <text x="115" y="130" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">App Instance</text>

        <rect x="320" y="100" width="130" height="150" rx="6" fill="#ffffff" stroke="#00b5e2" stroke-width="2"/>
        <text x="385" y="130" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">IMDS Service</text>
        <text x="385" y="150" font-family="monospace" font-size="9" fill="#7d93a8" text-anchor="middle">169.254.169.254</text>

        ${resolved && correct ? `
          <path d="M 180,160 L 320,160" fill="none" stroke="#2ecc71" stroke-width="2.5" stroke-dasharray="5,3" class="animate-dash-slow"/>
          <text x="250" y="152" font-family="monospace" font-size="9" fill="#2ecc71" font-weight="bold" text-anchor="middle">PUT Token Req (Secure)</text>
          
          <path d="M 320,200 L 180,200" fill="none" stroke="#2ecc71" stroke-width="2.5" stroke-dasharray="5,3" class="animate-dash-slow"/>
          <text x="250" y="192" font-family="monospace" font-size="9" fill="#2ecc71" font-weight="bold" text-anchor="middle">Session Token Issued</text>
        ` : `
          <path d="M 180,180 L 320,180" fill="none" stroke="${themeColor}" stroke-width="2.5" stroke-dasharray="5,3" class="animate-dash-fast"/>
          <text x="250" y="172" font-family="monospace" font-size="9" fill="${themeColor}" font-weight="bold" text-anchor="middle">GET /metadata/credentials</text>
        `}

        <rect x="50" y="400" width="400" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="250" y="430" font-family="sans-serif" font-size="12" fill="${themeColor}" font-weight="bold" text-anchor="middle">
          ${resolved && correct ? 'SECURE: IMDSv2 SESSION ENFORCED' : (resolved && !correct ? 'VULNERABLE: IMDSv1 EXPOSES ROLES TO SSRF' : 'Awaiting Metadata API configuration')}
        </text>
      `);
    } else if (stepIdx === 2) {
      let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

      return this.wrapSVG(`
        <rect x="90" y="100" width="320" height="200" rx="6" fill="#f8fafc" stroke="#485c70" stroke-width="3"/>
        <rect x="90" y="100" width="320" height="20" fill="#485c70"/>
        
        <rect x="235" y="300" width="30" height="60" fill="#cbd5e1"/>
        <path d="M 200,360 L 300,360" stroke="#cbd5e1" stroke-width="6" stroke-linecap="round"/>

        ${resolved && correct ? `
          <circle cx="250" cy="200" r="30" fill="rgba(46, 204, 113, 0.08)" stroke="#2ecc71" stroke-width="2" class="glow-success"/>
          <text x="250" y="206" font-family="sans-serif" font-size="14" fill="#2ecc71" font-weight="bold" text-anchor="middle">CLEAN SCREEN</text>
        ` : `
          <rect x="180" y="160" width="140" height="90" fill="#ffeb3b" stroke="#e0ca00" stroke-width="1.5"/>
          <text x="250" y="195" font-family="monospace" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">DB PASSWORD</text>
          <text x="250" y="220" font-family="monospace" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">Admin2026!</text>
        `}

        <rect x="50" y="400" width="400" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="250" y="430" font-family="sans-serif" font-size="12" fill="${themeColor}" font-weight="bold" text-anchor="middle">
          ${resolved && correct ? 'SECURE: NO PHYSICALLY EXPOSED CREDS' : (resolved && !correct ? 'VULNERABLE: PASSWORD ON STICKY NOTE' : 'Analyze Desk Security Layout')}
        </text>
      `);
    } else if (stepIdx === 3) {
      let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

      return this.wrapSVG(`
        <circle cx="150" cy="180" r="45" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
        <text x="150" y="185" font-family="sans-serif" font-size="13" fill="#0056b3" font-weight="bold" text-anchor="middle">IAM Provider</text>

        <rect x="290" y="130" width="160" height="100" rx="8" fill="#ffffff" stroke="${themeColor}" stroke-width="2.5" class="${resolved && correct ? 'glow-success' : ''}"/>
        <text x="370" y="160" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Expiring Token</text>
        <text x="370" y="185" font-family="monospace" font-size="10" fill="#00b5e2" text-anchor="middle">Expires: 60 mins</text>
        <text x="370" y="212" font-family="sans-serif" font-size="14" text-anchor="middle">${resolved && correct ? '✔ Active' : '⚠ Testing'}</text>

        <path d="M 195,180 L 290,180" fill="none" stroke="${themeColor}" stroke-width="3" stroke-dasharray="5,3" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>

        <rect x="50" y="400" width="400" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="250" y="430" font-family="sans-serif" font-size="12" fill="${themeColor}" font-weight="bold" text-anchor="middle">
          ${resolved && correct ? 'SECURE: TEMPORARY IAM ROLE ROLES ENFORCED' : (resolved && !correct ? 'VULNERABLE: INSECURE KEY PROFILE' : 'Verify IAM Credential Lifetime')}
        </text>
      `);
    } else {
      let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

      return this.wrapSVG(`
        <rect x="60" y="100" width="380" height="200" rx="8" fill="#ffffff" stroke="${themeColor}" stroke-width="2"/>
        <rect x="60" y="100" width="380" height="40" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
        <text x="80" y="125" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold">AWS IAM Console / Developer API Key</text>

        <text x="80" y="180" font-family="monospace" font-size="11" fill="#485c70">Key ID: AKIA239840213...</text>
        <text x="80" y="210" font-family="monospace" font-size="11" fill="#485c70">Creation: 2024-01-12</text>
        
        ${resolved && correct ? `
          <rect x="80" y="235" width="200" height="35" rx="4" fill="rgba(46,204,113,0.08)" stroke="#2ecc71" stroke-width="1"/>
          <text x="180" y="257" font-family="sans-serif" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">90-Day Expiry Enforced</text>
        ` : `
          <rect x="80" y="235" width="200" height="35" rx="4" fill="rgba(231,76,60,0.08)" stroke="#e74c3c" stroke-width="1"/>
          <text x="180" y="257" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">EXPIRY: NEVER</text>
        `}

        <rect x="50" y="400" width="400" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="250" y="430" font-family="sans-serif" font-size="12" fill="${themeColor}" font-weight="bold" text-anchor="middle">
          ${resolved && correct ? 'SECURE: EXPIRED INACTIVE KEYS CLEARED' : (resolved && !correct ? 'VULNERABLE: PERSISTENT NON-EXPIRING KEYS' : 'Audit API Key Expiration Policies')}
        </text>
      `);
    }
  }

  drawM5IncidentPipeline() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    const labels = {
      'ir_step_detect': 'Detect Anomaly',
      'ir_step_contain': 'Contain Scope',
      'ir_step_investigate': 'Investigate Logs',
      'ir_step_remediate': 'Remediate Gap',
      'ir_step_post': 'Post-Incident Audit'
    };

    let statusText = "Incident Response Pipeline";
    let statusColor = "#0056b3";
    if (resolved) {
      if (correct) {
        statusText = "Incident Pipeline Aligned Correctly!";
        statusColor = "#2ecc71";
      } else {
        statusText = "IR Sequence Out of Order";
        statusColor = "#e74c3c";
      }
    }

    let nodeHTML = '';
    const startY = 120;
    const spacingY = 70;
    const x = 250;

    for (let i = 0; i < 5; i++) {
      const step = this.sortingOrder[i];
      if (!step) continue;
      const isCorrectSlot = step.correctIndex === i;

      let nodeColor = "#0056b3"; 
      if (resolved) {
        nodeColor = isCorrectSlot ? "#2ecc71" : "#e74c3c";
      }

      if (i < 4) {
        nodeHTML += `
          <line x1="${x}" y1="${startY + i * spacingY + 20}" x2="${x}" y2="${startY + (i + 1) * spacingY - 20}" 
                stroke="${resolved && correct ? '#2ecc71' : '#cbd5e1'}" stroke-width="3" 
                stroke-dasharray="${resolved && correct ? '6,4' : 'none'}" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>
          <polygon points="${x},${startY + (i + 1) * spacingY - 20} ${x - 5},${startY + (i + 1) * spacingY - 28} ${x + 5},${startY + (i + 1) * spacingY - 28}" 
                   fill="${resolved && correct ? '#2ecc71' : '#cbd5e1'}"/>
        `;
      }

      nodeHTML += `
        <rect x="120" y="${startY + i * spacingY - 20}" width="260" height="40" rx="8" fill="#ffffff" stroke="${nodeColor}" stroke-width="2"/>
        <text x="250" y="${startY + i * spacingY + 5}" font-family="sans-serif" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">
          ${labels[step.id] || step.text}
        </text>
        ${resolved ? `
          <circle cx="100" cy="${startY + i * spacingY}" r="10" fill="${nodeColor}"/>
          <text x="100" y="${startY + i * spacingY + 3.5}" font-family="sans-serif" font-size="10" fill="#ffffff" font-weight="bold" text-anchor="middle">
            ${isCorrectSlot ? '✔' : '✖'}
          </text>
        ` : ''}
      `;
    }

    return this.wrapSVG(`
      <rect x="40" y="30" width="420" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <text x="250" y="62" font-family="sans-serif" font-size="13" fill="${statusColor}" font-weight="bold" text-anchor="middle">${statusText}</text>
      ${nodeHTML}
    `);
  }

  drawM5SSRFMetadata() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let targetText = resolved && correct ? 'SSRF METADATA ACCESS BLOCKED (IMDSv2 Enforced)' : (resolved && !correct ? 'BREACH: METADATA EXFILTRATED (IMDSv1 Ingress Allowed)' : 'Awaiting SSRF Hardening Check');
    let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

    return this.wrapSVG(`
      <!-- Attacker host -->
      <circle cx="80" cy="150" r="30" fill="rgba(231,76,60,0.05)" stroke="#e74c3c" stroke-width="2"/>
      <text x="80" y="154" font-family="sans-serif" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">Attacker</text>

      <!-- Web App -->
      <rect x="190" y="110" width="100" height="80" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
      <text x="240" y="150" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Web App</text>
      <text x="240" y="170" font-family="sans-serif" font-size="8" fill="#e74c3c" text-anchor="middle">(SSRF Vulnerable)</text>

      <!-- Metadata Endpoint -->
      <rect x="360" y="110" width="100" height="80" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="410" y="145" font-family="sans-serif" font-size="11" fill="#0056b3" font-weight="bold" text-anchor="middle">Metadata API</text>
      <text x="410" y="165" font-family="monospace" font-size="8" fill="#7d93a8" text-anchor="middle">169.254.169.254</text>

      <!-- Connection path A -->
      <path d="M 110,150 L 190,150" fill="none" stroke="#e74c3c" stroke-width="2.5" stroke-dasharray="4,4" class="animate-dash-fast"/>
      
      <!-- Connection path B -->
      ${resolved && correct ? `
        <path d="M 290,150 L 360,150" fill="none" stroke="#2ecc71" stroke-width="3" stroke-dasharray="5,3" class="animate-dash-slow"/>
        <circle cx="325" cy="150" r="10" fill="#2ecc71"/>
        <text x="325" y="153.5" font-family="sans-serif" font-size="9" fill="#ffffff" font-weight="bold" text-anchor="middle">🔒</text>
      ` : `
        <path d="M 290,150 L 360,150" fill="none" stroke="${resolved && !correct ? '#e74c3c' : '#7d93a8'}" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
      `}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="11" fill="${themeColor}" font-weight="bold" text-anchor="middle">${targetText}</text>
    `);
  }

  drawM5SubdomainTakeover() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let targetText = resolved && correct ? 'HANGING CNAME DELETED (DNS TAKE-OVER BLOCKED)' : (resolved && !correct ? 'BREACH: SUBDOMAIN hijacked BY THIRD PARTY' : 'Audit DNS hanging CNAME links');
    let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3');

    return this.wrapSVG(`
      <!-- Corporate DNS -->
      <rect x="40" y="100" width="130" height="90" rx="6" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="105" y="135" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">Corporate DNS</text>
      <text x="105" y="160" font-family="monospace" font-size="9" fill="#7d93a8" text-anchor="middle">app.company.com</text>

      <!-- Target Cloud App (Decommissioned) -->
      <rect x="330" y="100" width="130" height="90" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4,4"/>
      <text x="395" y="135" font-family="sans-serif" font-size="11" fill="#7d93a8" font-weight="bold" text-anchor="middle">Cloud App Space</text>
      <text x="395" y="160" font-family="sans-serif" font-size="10" fill="#e74c3c" text-anchor="middle">[Decommissioned]</text>

      ${resolved && correct ? `
        <path d="M 170,145 L 330,145" fill="none" stroke="#2ecc71" stroke-width="2" stroke-dasharray="2,2"/>
        <text x="250" y="135" font-family="sans-serif" font-size="10" fill="#2ecc71" font-weight="bold" text-anchor="middle">✂ CNAME Removed</text>
      ` : `
        <path d="M 170,145 L 330,145" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="4,4" class="animate-dash-fast"/>
      `}

      ${resolved && !correct ? `
        <rect x="180" y="240" width="140" height="80" rx="6" fill="rgba(231,76,60,0.08)" stroke="#e74c3c" stroke-width="2" class="glow-danger"/>
        <text x="250" y="270" font-family="sans-serif" font-size="12" fill="#e74c3c" font-weight="bold" text-anchor="middle">Attacker Host</text>
        <text x="250" y="295" font-family="monospace" font-size="8" fill="#e74c3c" text-anchor="middle">Registers hanging app</text>
        <path d="M 395,190 L 250,240" fill="none" stroke="#e74c3c" stroke-width="2"/>
      ` : ''}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="11" fill="${themeColor}" font-weight="bold" text-anchor="middle">${targetText}</text>
    `);
  }

  drawM5Cryptojacking() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let statusText = resolved && correct ? 'REGISTRY HARMONY (UNALTERED CONTAINER IMMUTABILITY)' : (resolved && !correct ? 'BREACH: CONTAINER TAINTED WITH MONERO MINER' : 'Verify Container Registry integrity');
    let themeColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3');

    return this.wrapSVG(`
      <rect x="50" y="90" width="160" height="240" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="130" y="125" font-family="sans-serif" font-size="12" fill="#0056b3" font-weight="bold" text-anchor="middle">Container Registry</text>
      
      <rect x="70" y="160" width="120" height="50" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="130" y="190" font-family="monospace" font-size="11" fill="#0a1c2a" font-weight="bold" text-anchor="middle">app_img:latest</text>

      <rect x="290" y="130" width="160" height="150" rx="8" fill="#ffffff" stroke="${themeColor}" stroke-width="2.5"/>
      <text x="370" y="160" font-family="sans-serif" font-size="12" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Pod VM Cluster</text>
      
      ${resolved && !correct ? `
        <rect x="310" y="190" width="120" height="30" rx="4" fill="rgba(231,76,60,0.1)" stroke="#e74c3c"/>
        <text x="370" y="210" font-family="monospace" font-size="11" fill="#e74c3c" font-weight="bold" text-anchor="middle">CPU LOAD: 100%</text>
        <text x="370" y="235" font-family="sans-serif" font-size="14" text-anchor="middle">⛏ ⛏ ⛏</text>
      ` : `
        <rect x="310" y="190" width="120" height="30" rx="4" fill="rgba(46,204,113,0.1)" stroke="#2ecc71"/>
        <text x="370" y="210" font-family="monospace" font-size="11" fill="#2ecc71" font-weight="bold" text-anchor="middle">CPU LOAD: 8%</text>
      `}

      <path d="M 210,185 L 290,185" fill="none" stroke="${themeColor}" stroke-width="2.5" stroke-dasharray="5,3" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="11" fill="${themeColor}" font-weight="bold" text-anchor="middle">${statusText}</text>
    `);
  }

  drawM5BackupRansomware() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let backupColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#cbd5e1');

    return this.wrapSVG(`
      <rect x="40" y="120" width="140" height="150" rx="8" fill="#ffffff" stroke="#0056b3" stroke-width="2"/>
      <text x="110" y="150" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Active database</text>
      <text x="110" y="200" font-family="sans-serif" font-size="28" text-anchor="middle">📁</text>

      <rect x="320" y="120" width="140" height="150" rx="8" fill="#ffffff" stroke="${backupColor}" stroke-width="3" class="${resolved && correct ? 'glow-success' : ''}"/>
      <text x="390" y="150" font-family="sans-serif" font-size="13" fill="#0a1c2a" font-weight="bold" text-anchor="middle">Backup WORM</text>
      <text x="390" y="200" font-family="sans-serif" font-size="28" text-anchor="middle">${resolved && correct ? '🔒' : (resolved && !correct ? '💀' : '📂')}</text>

      <path d="M 180,195 L 320,195" fill="none" stroke="${backupColor}" stroke-width="3" stroke-dasharray="5,3" class="${resolved && correct ? 'animate-dash-slow' : ''}"/>

      ${resolved && correct ? `
        <rect x="150" y="300" width="200" height="40" rx="4" fill="rgba(46,204,113,0.08)" stroke="#2ecc71" stroke-width="1"/>
        <text x="250" y="324" font-family="sans-serif" font-size="10" fill="#2ecc71" font-weight="bold" text-anchor="middle">IMMUTABLE RETENTION ACTIVE</text>
      ` : ''}

      <!-- Status Footer -->
      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'BACKUPS SECURED VIA WORM LOCK' : (resolved && !correct ? 'BACKUPS ENCRYPTED BY RANSOMWARE' : 'Verify backup write protections')}
      </text>
    `);
  }

  drawM5DataExfiltration() {
    const resolved = this.isCurrentStepResolved;
    const correct = this.isCurrentStepCorrect;

    let chartColor = resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#7d93a8');

    return this.wrapSVG(`
      <rect x="60" y="80" width="380" height="240" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <line x1="90" y1="280" x2="410" y2="280" stroke="#485c70" stroke-width="2"/>
      <line x1="90" y1="100" x2="90" y2="280" stroke="#485c70" stroke-width="2"/>
      <text x="250" y="298" font-family="sans-serif" font-size="10" fill="#7d93a8" text-anchor="middle">Egress Timeline</text>
      
      ${resolved && correct ? `
        <path d="M 90,260 L 180,260 L 250,120 L 320,260 L 410,260" fill="none" stroke="#2ecc71" stroke-width="4.5" class="glow-success"/>
        <circle cx="250" cy="120" r="14" fill="#2ecc71" class="glow-success"/>
        <text x="250" y="125" font-family="sans-serif" font-size="12" fill="#ffffff" font-weight="bold" text-anchor="middle">!</text>
        <rect x="180" y="150" width="140" height="40" rx="4" fill="#ffffff" stroke="#2ecc71" stroke-width="1"/>
        <text x="250" y="174" font-family="sans-serif" font-size="9" fill="#2ecc71" font-weight="bold" text-anchor="middle">Egress Anomaly Detected</text>
      ` : `
        <path d="M 90,270 L 180,270 L 270,110 L 350,110 L 410,110" fill="none" stroke="${chartColor}" stroke-width="4.5"/>
        <text x="320" y="140" font-family="sans-serif" font-size="10" fill="${chartColor}" font-weight="bold">Silent Leakage (50TB)</text>
      `}

      <rect x="60" y="380" width="380" height="50" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
      <text x="250" y="410" font-family="sans-serif" font-size="12" fill="${resolved && correct ? '#2ecc71' : (resolved && !correct ? '#e74c3c' : '#0056b3')}" font-weight="bold" text-anchor="middle">
        ${resolved && correct ? 'EGRESS METRIC ALERTS ACTIVE' : (resolved && !correct ? 'RISK: UNMONITORED EGRESS DATA LEAK' : 'Verify Egress Data Volume Monitors')}
      </text>
    `);
  }
}



