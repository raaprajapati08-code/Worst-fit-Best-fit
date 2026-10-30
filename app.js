/**
 * MemVitals - Memory Allocation Lab Engine
 * Algorithms: Best-Fit, Worst-Fit, First-Fit & Side-by-Side Dual Comparison
 * Author: Antigravity for Rashi Prajapati & Tvisha Rajgor (SLA Stage 3 OS)
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // Presets Data
  // ==========================================
  const PRESETS = {
    'sla-benchmark': {
      name: 'TC1: SLA 3 Academic Benchmark',
      blocks: [100, 300, 500, 200, 600],
      processes: [212, 417, 112, 426],
      description: 'The standard benchmark from the SLA Stage 3 evaluation. Best-Fit accommodates all 4 processes (68.65% utilization), whereas Worst-Fit leaves P4 (426 KB) unallocated because large blocks were fragmented early.'
    },
    'worst-fit-failure': {
      name: 'TC2: P4 Too Large for Worst-Fit',
      blocks: [150, 350, 450, 200, 500],
      processes: [220, 300, 180, 420],
      description: 'Demonstrates a scenario where Worst-Fit breaks the largest 500 KB block early, leaving insufficient contiguous space for subsequent 420 KB request.'
    },
    'fragmentation-demo': {
      name: 'TC3: External Fragmentation Gap',
      blocks: [120, 200, 180, 220],
      processes: [110, 190, 170, 210, 150],
      description: 'Multiple small leftovers accumulate across blocks. Even though total free memory exceeds 150 KB, no single partition can fit the final request.'
    },
    'best-fit-sliver': {
      name: 'TC4: Best-Fit Sliver Drawback',
      blocks: [105, 500, 200],
      processes: [100, 450],
      description: 'Best-Fit assigns P1 (100 KB) to Block 1 (105 KB), leaving an unusable 5 KB sliver (external fragmentation).'
    },
    'custom': {
      name: 'TC5: Custom Input Configuration',
      blocks: [100, 200, 300, 400],
      processes: [150, 250, 350],
      description: 'User-defined custom memory blocks and processes.'
    }
  };

  // Color generator for processes
  const PROCESS_COLORS = [
    { bg: 'linear-gradient(135deg, #635BFF, #7A72FF)', badge: '#635BFF' },
    { bg: 'linear-gradient(135deg, #0EA5E9, #38BDF8)', badge: '#0EA5E9' },
    { bg: 'linear-gradient(135deg, #EC4899, #F472B6)', badge: '#EC4899' },
    { bg: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', badge: '#8B5CF6' },
    { bg: 'linear-gradient(135deg, #10B981, #34D399)', badge: '#10B981' },
    { bg: 'linear-gradient(135deg, #F59E0B, #FBBF24)', badge: '#F59E0B' },
    { bg: 'linear-gradient(135deg, #14B8A6, #2DD4BF)', badge: '#14B8A6' },
    { bg: 'linear-gradient(135deg, #F43F5E, #FB7185)', badge: '#F43F5E' }
  ];

  // ==========================================
  // Application State
  // ==========================================
  const state = {
    blocks: [...PRESETS['sla-benchmark'].blocks],
    processes: [...PRESETS['sla-benchmark'].processes],
    activeStrategy: 'best-fit', // 'best-fit', 'worst-fit', 'first-fit', 'compare'
    activePresetKey: 'sla-benchmark',
    currentStep: 0, // 0 means not started, up to processes.length
    isAutoPlaying: false,
    playTimer: null,
    playSpeed: 900,
    tableFilter: 'all',
    searchQuery: '',
    // Stepper snapshots for step backward/forward
    snapshots: []
  };

  // ==========================================
  // DOM Elements
  // ==========================================
  // KPI Elements
  const kpiTotalMem = document.getElementById('kpi-total-memory');
  const kpiBlockCount = document.getElementById('kpi-block-count');
  const kpiUtilization = document.getElementById('kpi-utilization');
  const kpiAllocatedKb = document.getElementById('kpi-allocated-kb');
  const kpiSuccessRate = document.getElementById('kpi-success-rate');
  const kpiSuccessPct = document.getElementById('kpi-success-pct');
  const kpiFragmentation = document.getElementById('kpi-fragmentation');
  const kpiRemainingSpace = document.getElementById('kpi-remaining-space');

  // Strategy Banner Elements
  const strategyTitle = document.getElementById('strategy-title');
  const strategyDesc = document.getElementById('strategy-description');
  const strategyIcon = document.getElementById('strategy-icon');
  const presetSelect = document.getElementById('scenario-preset-select');

  // Containers
  const singleView = document.getElementById('single-strategy-view');
  const compareView = document.getElementById('comparison-mode-view');
  const blocksListContainer = document.getElementById('blocks-list-container');
  const processesListContainer = document.getElementById('processes-list-container');
  const memoryTracksContainer = document.getElementById('memory-tracks-container');
  const allocationTableBody = document.getElementById('allocation-table-body');
  const badgeBlocksCount = document.getElementById('badge-blocks-count');
  const badgeProcessesCount = document.getElementById('badge-processes-count');

  // Tracer & Playback
  const tracerMessage = document.getElementById('tracer-message');
  const tracerStatusBadge = document.getElementById('tracer-status-badge');
  const playbackStepBadge = document.getElementById('playback-step-badge');
  const btnPlaybackToggle = document.getElementById('btn-playback-toggle');
  const iconPlayState = document.getElementById('icon-play-state');
  const textPlayState = document.getElementById('text-play-state');
  const btnStepNext = document.getElementById('btn-step-next');
  const btnStepPrev = document.getElementById('btn-step-prev');
  const btnResetSim = document.getElementById('btn-reset-sim');
  const simSpeedSlider = document.getElementById('sim-speed');

  // Quick Action Buttons
  const btnQuickRun = document.getElementById('btn-quick-run');
  const btnQuickStep = document.getElementById('btn-quick-step');
  const btnQuickReset = document.getElementById('btn-quick-reset');
  const btnQuickBenchmark = document.getElementById('btn-quick-benchmark');

  // Forms
  const formAddBlock = document.getElementById('form-add-block');
  const inputBlockSize = document.getElementById('input-block-size');
  const formAddProcess = document.getElementById('form-add-process');
  const inputProcessSize = document.getElementById('input-process-size');

  // Modals
  const modalCCode = document.getElementById('modal-c-code');
  const btnViewCCode = document.getElementById('btn-view-c-code');
  const btnCloseCModal = document.getElementById('btn-close-c-modal');
  const btnDoneCCode = document.getElementById('btn-done-c-code');
  const btnCopyCCode = document.getElementById('btn-copy-c-code');

  const modalReport = document.getElementById('modal-report');
  const btnExportReport = document.getElementById('btn-export-report');
  const btnCloseReportModal = document.getElementById('btn-close-report-modal');
  const btnCloseReportBtn = document.getElementById('btn-close-report-btn');
  const btnPrintReport = document.getElementById('btn-print-report');
  const reportDynamicContent = document.getElementById('report-dynamic-content');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // ==========================================
  // Core Allocation Algorithms Engine
  // ==========================================

  /**
   * Computes step-by-step memory allocation snapshots for any strategy.
   * Returns an array of snapshots: index 0 = initial state, index i = after process i evaluated.
   */
  function computeSimulationSnapshots(strategyName, initialBlocks, processSizes) {
    const snapshots = [];
    
    // Initial Snapshot (Step 0)
    let currentBlocks = initialBlocks.map((size, index) => ({
      id: index + 1,
      initialSize: size,
      remainingSize: size,
      allocations: [] // { pid: 'P1', size: 212, color: ... }
    }));

    let currentProcesses = processSizes.map((size, index) => ({
      id: `P${index + 1}`,
      index: index,
      size: size,
      allocatedBlockId: null,
      remainingInBlock: null,
      status: 'pending', // 'pending', 'allocated', 'failed'
      log: 'Waiting for allocation...'
    }));

    snapshots.push({
      step: 0,
      activeProcessIndex: null,
      evaluatedBlockId: null,
      message: 'Simulation ready. Initial free partitions configured.',
      blocks: JSON.parse(JSON.stringify(currentBlocks)),
      processes: JSON.parse(JSON.stringify(currentProcesses))
    });

    // Step through each process
    for (let i = 0; i < processSizes.length; i++) {
      const pSize = processSizes[i];
      const pid = `P${i + 1}`;
      let chosenBlockIndex = -1;
      let stepExplanation = '';

      if (strategyName === 'best-fit') {
        // Best-Fit: Smallest suitable block
        for (let j = 0; j < currentBlocks.length; j++) {
          if (currentBlocks[j].remainingSize >= pSize) {
            if (chosenBlockIndex === -1 || currentBlocks[j].remainingSize < currentBlocks[chosenBlockIndex].remainingSize) {
              chosenBlockIndex = j;
            }
          }
        }
        if (chosenBlockIndex !== -1) {
          stepExplanation = `Best-Fit: Evaluated all partitions. Selected Block ${chosenBlockIndex + 1} (${currentBlocks[chosenBlockIndex].remainingSize} KB) as the smallest partition fitting ${pid} (${pSize} KB).`;
        } else {
          stepExplanation = `Best-Fit: No partition has ≥ ${pSize} KB available. ${pid} cannot be accommodated.`;
        }

      } else if (strategyName === 'worst-fit') {
        // Worst-Fit: Largest suitable block
        for (let j = 0; j < currentBlocks.length; j++) {
          if (currentBlocks[j].remainingSize >= pSize) {
            if (chosenBlockIndex === -1 || currentBlocks[j].remainingSize > currentBlocks[chosenBlockIndex].remainingSize) {
              chosenBlockIndex = j;
            }
          }
        }
        if (chosenBlockIndex !== -1) {
          stepExplanation = `Worst-Fit: Evaluated all partitions. Selected Block ${chosenBlockIndex + 1} (${currentBlocks[chosenBlockIndex].remainingSize} KB) as the largest partition fitting ${pid} (${pSize} KB).`;
        } else {
          stepExplanation = `Worst-Fit: No remaining partition is large enough for ${pid} (${pSize} KB).`;
        }

      } else if (strategyName === 'first-fit') {
        // First-Fit: First suitable block from beginning
        for (let j = 0; j < currentBlocks.length; j++) {
          if (currentBlocks[j].remainingSize >= pSize) {
            chosenBlockIndex = j;
            break;
          }
        }
        if (chosenBlockIndex !== -1) {
          stepExplanation = `First-Fit: Scanned from Block 1. Selected Block ${chosenBlockIndex + 1} (${currentBlocks[chosenBlockIndex].remainingSize} KB) as first partition fitting ${pid} (${pSize} KB).`;
        } else {
          stepExplanation = `First-Fit: Scanned all blocks, none had ≥ ${pSize} KB. ${pid} not allocated.`;
        }
      }

      // Execute Allocation or Mark Failed
      if (chosenBlockIndex !== -1) {
        currentBlocks[chosenBlockIndex].remainingSize -= pSize;
        currentBlocks[chosenBlockIndex].allocations.push({
          pid: pid,
          size: pSize,
          color: PROCESS_COLORS[i % PROCESS_COLORS.length].bg
        });

        currentProcesses[i].allocatedBlockId = currentBlocks[chosenBlockIndex].id;
        currentProcesses[i].remainingInBlock = currentBlocks[chosenBlockIndex].remainingSize;
        currentProcesses[i].status = 'allocated';
        currentProcesses[i].log = `Allocated to Block ${chosenBlockIndex + 1}. Remaining space: ${currentBlocks[chosenBlockIndex].remainingSize} KB.`;
      } else {
        currentProcesses[i].allocatedBlockId = null;
        currentProcesses[i].remainingInBlock = null;
        currentProcesses[i].status = 'failed';
        currentProcesses[i].log = `Not allocated (Contiguous space insufficient).`;
      }

      snapshots.push({
        step: i + 1,
        activeProcessIndex: i,
        evaluatedBlockId: chosenBlockIndex !== -1 ? currentBlocks[chosenBlockIndex].id : null,
        message: stepExplanation,
        blocks: JSON.parse(JSON.stringify(currentBlocks)),
        processes: JSON.parse(JSON.stringify(currentProcesses))
      });
    }

    return snapshots;
  }

  // ==========================================
  // Metrics & Vitals Calculation
  // ==========================================
  function calculateMetrics(snapshot) {
    const totalMemory = snapshot.blocks.reduce((acc, b) => acc + b.initialSize, 0);
    const allocatedMemory = snapshot.processes
      .filter(p => p.status === 'allocated')
      .reduce((acc, p) => acc + p.size, 0);
    
    const remainingFreeSpace = totalMemory - allocatedMemory;
    const utilizationPct = totalMemory > 0 ? ((allocatedMemory / totalMemory) * 100).toFixed(2) : 0;
    
    const allocatedCount = snapshot.processes.filter(p => p.status === 'allocated').length;
    const totalProcesses = snapshot.processes.length;
    const successPct = totalProcesses > 0 ? Math.round((allocatedCount / totalProcesses) * 100) : 0;

    // External Fragmentation:
    // If there is any unallocated process, any remaining space in free partitions that is
    // smaller than what that unallocated process needed contributes to external fragmentation.
    const unallocatedProcesses = snapshot.processes.filter(p => p.status === 'failed');
    let externalFrag = 0;
    if (unallocatedProcesses.length > 0) {
      // Find smallest unallocated process size
      const minUnallocSize = Math.min(...unallocatedProcesses.map(p => p.size));
      // Sum free fragments smaller than minUnallocSize
      externalFrag = snapshot.blocks
        .filter(b => b.remainingSize > 0 && b.remainingSize < minUnallocSize)
        .reduce((acc, b) => acc + b.remainingSize, 0);
    }

    return {
      totalMemory,
      allocatedMemory,
      remainingFreeSpace,
      utilizationPct,
      allocatedCount,
      totalProcesses,
      successPct,
      externalFrag,
      unallocatedMemory: snapshot.processes
        .filter(p => p.status === 'failed')
        .reduce((acc, p) => acc + p.size, 0)
    };
  }

  // ==========================================
  // Render Functions
  // ==========================================

  // Refresh and prepare all simulation snapshots
  function recomputeSimulation() {
    state.snapshots = computeSimulationSnapshots(
      state.activeStrategy === 'compare' ? 'best-fit' : state.activeStrategy,
      state.blocks,
      state.processes
    );

    // Keep currentStep within bounds
    if (state.currentStep > state.processes.length) {
      state.currentStep = state.processes.length;
    }
  }

  // Render Left Panel: Configured Blocks & Processes List
  function renderConfigPanels() {
    badgeBlocksCount.textContent = `${state.blocks.length} Blocks`;
    badgeProcessesCount.textContent = `${state.processes.length} Processes`;

    // Render Blocks
    blocksListContainer.innerHTML = '';
    state.blocks.forEach((size, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-info">
          <span class="item-tag">B${idx + 1}</span>
          <span class="item-size">${size}</span>
          <span class="item-size-unit">KB</span>
        </div>
        <div class="item-actions">
          <button class="btn-remove-item" data-block-idx="${idx}" title="Remove Block">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
          </button>
        </div>
      `;
      blocksListContainer.appendChild(row);
    });

    // Render Processes
    processesListContainer.innerHTML = '';
    state.processes.forEach((size, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-info">
          <span class="item-tag" style="background:#EEECFF; color:#635BFF;">P${idx + 1}</span>
          <span class="item-size">${size}</span>
          <span class="item-size-unit">KB</span>
        </div>
        <div class="item-actions">
          <button class="btn-remove-item" data-process-idx="${idx}" title="Remove Process">
            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
          </button>
        </div>
      `;
      processesListContainer.appendChild(row);
    });

    // Attach trash buttons event listeners
    blocksListContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-block-idx'), 10);
        if (state.blocks.length <= 1) {
          showToast('At least 1 memory block is required.', 'error');
          return;
        }
        state.blocks.splice(idx, 1);
        recomputeSimulation();
        updateUI();
        showToast(`Removed Block ${idx + 1}`, 'info');
      });
    });

    processesListContainer.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-process-idx'), 10);
        if (state.processes.length <= 1) {
          showToast('At least 1 process is required.', 'error');
          return;
        }
        state.processes.splice(idx, 1);
        recomputeSimulation();
        updateUI();
        showToast(`Removed Process P${idx + 1}`, 'info');
      });
    });

    lucide.createIcons({ root: blocksListContainer });
    lucide.createIcons({ root: processesListContainer });
  }

  // Render Top Strategy Banner Info
  function renderStrategyBanner() {
    if (state.activeStrategy === 'best-fit') {
      strategyTitle.textContent = 'Best-Fit Allocation Strategy';
      strategyDesc.innerHTML = 'Searches all free memory blocks and selects the <strong>smallest suitable block</strong> that accommodates the process, preserving larger blocks for subsequent big processes.';
      strategyIcon.innerHTML = '<i data-lucide="check-circle-2"></i>';
    } else if (state.activeStrategy === 'worst-fit') {
      strategyTitle.textContent = 'Worst-Fit Allocation Strategy';
      strategyDesc.innerHTML = 'Searches all free memory blocks and selects the <strong>largest suitable block</strong>, leaving a large remaining fragment that may accommodate other requests.';
      strategyIcon.innerHTML = '<i data-lucide="maximize-2"></i>';
    } else if (state.activeStrategy === 'first-fit') {
      strategyTitle.textContent = 'First-Fit Allocation Strategy';
      strategyDesc.innerHTML = 'Scans memory partitions from the beginning and allocates the <strong>first partition</strong> that is large enough, minimizing search overhead.';
      strategyIcon.innerHTML = '<i data-lucide="arrow-right-circle"></i>';
    } else if (state.activeStrategy === 'compare') {
      strategyTitle.textContent = 'Side-by-Side Strategy Evaluation (Best-Fit vs Worst-Fit)';
      strategyDesc.innerHTML = 'Direct dual comparison using identical initial memory blocks and process requests, highlighting utilization and fragmentation differences.';
      strategyIcon.innerHTML = '<i data-lucide="columns-2"></i>';
    }
    lucide.createIcons({ root: strategyIcon });
  }

  // Render Vitals KPI Cards
  function renderKPIs(metrics) {
    kpiTotalMem.innerHTML = `${metrics.totalMemory.toLocaleString()} <small style="font-size: 0.9rem; font-weight:600;">KB</small>`;
    kpiBlockCount.textContent = `${state.blocks.length}`;

    kpiUtilization.textContent = `${metrics.utilizationPct}%`;
    kpiAllocatedKb.textContent = `${metrics.allocatedMemory.toLocaleString()} KB Used`;

    kpiSuccessRate.textContent = `${metrics.allocatedCount} / ${metrics.totalProcesses}`;
    kpiSuccessPct.textContent = `${metrics.successPct}% Accommodated`;

    kpiFragmentation.innerHTML = `${metrics.externalFrag.toLocaleString()} <small style="font-size: 0.9rem; font-weight:600;">KB</small>`;
    kpiRemainingSpace.textContent = `${metrics.remainingFreeSpace.toLocaleString()} KB`;
  }

  // Render Visual RAM Memory Partition Bars
  function renderRAMVisualizer(snapshot) {
    memoryTracksContainer.innerHTML = '';

    snapshot.blocks.forEach((block, bIdx) => {
      const isEvaluating = snapshot.evaluatedBlockId === block.id;
      const trackCard = document.createElement('div');
      trackCard.className = `block-track-card ${isEvaluating ? 'chosen-block' : ''}`;

      // Calculate width percentages of segments
      let segmentsHtml = '';
      let allocatedTotal = 0;

      block.allocations.forEach(alloc => {
        allocatedTotal += alloc.size;
        const widthPct = ((alloc.size / block.initialSize) * 100).toFixed(1);
        segmentsHtml += `
          <div 
            class="ram-segment process-allocated" 
            style="width: ${widthPct}%; background: ${alloc.color};"
            title="${alloc.pid}: ${alloc.size} KB allocated"
          >
            <span>${alloc.pid} (${alloc.size} KB)</span>
          </div>
        `;
      });

      // Remaining Free Space segment
      const freePct = ((block.remainingSize / block.initialSize) * 100).toFixed(1);
      if (block.remainingSize > 0) {
        segmentsHtml += `
          <div 
            class="ram-segment free-space" 
            style="width: ${freePct}%;"
            title="Free: ${block.remainingSize} KB"
          >
            <span>${block.remainingSize} KB Free</span>
          </div>
        `;
      }

      trackCard.innerHTML = `
        <div class="block-meta-row">
          <div class="block-name-box">
            <span class="block-badge">Block ${block.id}</span>
            <span class="block-capacity">${block.initialSize} KB Total</span>
          </div>
          <span class="block-status-badge ${block.remainingSize === 0 ? 'badge-neutral' : 'badge-success'}">
            ${block.remainingSize} KB Available
          </span>
        </div>
        <div class="ram-bar-container">
          ${segmentsHtml}
        </div>
      `;

      memoryTracksContainer.appendChild(trackCard);
    });
  }

  // Render Process Allocation Table with Filter & Search
  function renderTable(snapshot) {
    allocationTableBody.innerHTML = '';
    const query = state.searchQuery.toLowerCase().trim();

    const filteredProcesses = snapshot.processes.filter(p => {
      // Filter status
      if (state.tableFilter === 'allocated' && p.status !== 'allocated') return false;
      if (state.tableFilter === 'unallocated' && p.status !== 'failed') return false;

      // Search query
      if (query) {
        const matchesPid = p.id.toLowerCase().includes(query);
        const matchesSize = p.size.toString().includes(query);
        const matchesBlock = p.allocatedBlockId ? `block ${p.allocatedBlockId}`.toLowerCase().includes(query) : false;
        return matchesPid || matchesSize || matchesBlock;
      }

      return true;
    });

    if (filteredProcesses.length === 0) {
      allocationTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">
            No matching processes found.
          </td>
        </tr>
      `;
      return;
    }

    filteredProcesses.forEach(proc => {
      const tr = document.createElement('tr');
      let statusBadge = '';
      let blockText = '-';
      let blockInitial = '-';
      let remainingText = '-';

      if (proc.status === 'allocated') {
        statusBadge = '<span class="badge badge-success"><i data-lucide="check" style="width:12px;height:12px;"></i> Allocated</span>';
        blockText = `<strong>Block ${proc.allocatedBlockId}</strong>`;
        const parentBlock = snapshot.blocks.find(b => b.id === proc.allocatedBlockId);
        blockInitial = parentBlock ? `${parentBlock.initialSize} KB` : '-';
        remainingText = `${proc.remainingInBlock} KB`;
      } else if (proc.status === 'failed') {
        statusBadge = '<span class="badge badge-error"><i data-lucide="x" style="width:12px;height:12px;"></i> Not Allocated</span>';
        blockText = '<span style="color:var(--text-muted);">No suitable block</span>';
      } else {
        statusBadge = '<span class="badge badge-neutral"><i data-lucide="clock" style="width:12px;height:12px;"></i> Pending</span>';
      }

      tr.innerHTML = `
        <td><strong style="color:var(--accent-primary); font-family: 'JetBrains Mono';">${proc.id}</strong></td>
        <td><strong>${proc.size} KB</strong></td>
        <td>${blockText}</td>
        <td>${blockInitial}</td>
        <td>${remainingText}</td>
        <td>${statusBadge}</td>
      `;

      allocationTableBody.appendChild(tr);
    });

    lucide.createIcons({ root: allocationTableBody });
  }

  // Render Side-by-Side Dual Comparison Mode
  function renderComparisonMode() {
    const bestSnapshots = computeSimulationSnapshots('best-fit', state.blocks, state.processes);
    const worstSnapshots = computeSimulationSnapshots('worst-fit', state.blocks, state.processes);

    const bestFinal = bestSnapshots[bestSnapshots.length - 1];
    const worstFinal = worstSnapshots[worstSnapshots.length - 1];

    const bestMetrics = calculateMetrics(bestFinal);
    const worstMetrics = calculateMetrics(worstFinal);

    // Update Badges
    document.getElementById('comp-best-badge').textContent = `${bestMetrics.allocatedCount} / ${bestMetrics.totalProcesses} Allocated (${bestMetrics.utilizationPct}%)`;
    document.getElementById('comp-worst-badge').textContent = `${worstMetrics.allocatedCount} / ${worstMetrics.totalProcesses} Allocated (${worstMetrics.utilizationPct}%)`;

    // Render RAM Tracks for Best-Fit
    renderMiniRamTracks(bestFinal, document.getElementById('comp-best-ram-tracks'));
    // Render RAM Tracks for Worst-Fit
    renderMiniRamTracks(worstFinal, document.getElementById('comp-worst-ram-tracks'));

    // Render Mini Tables
    renderMiniTable(bestFinal, document.getElementById('comp-best-table-body'));
    renderMiniTable(worstFinal, document.getElementById('comp-worst-table-body'));

    // Render Comparison Summary Matrix Table (from SLA Stage 3)
    const matrixTbody = document.getElementById('matrix-table-body');
    matrixTbody.innerHTML = `
      <tr>
        <td class="metric-name">Selection Rule</td>
        <td>Smallest partition that fits</td>
        <td>Largest partition that fits</td>
        <td><span class="badge badge-neutral">Algorithmic Basis</span></td>
      </tr>
      <tr>
        <td class="metric-name">Processes Allocated</td>
        <td><strong>${bestMetrics.allocatedCount}</strong> out of ${bestMetrics.totalProcesses}</td>
        <td><strong>${worstMetrics.allocatedCount}</strong> out of ${worstMetrics.totalProcesses}</td>
        <td>${bestMetrics.allocatedCount >= worstMetrics.allocatedCount ? '<span class="badge badge-success">Best-Fit Advantage</span>' : '<span class="badge badge-warning">Worst-Fit Advantage</span>'}</td>
      </tr>
      <tr>
        <td class="metric-name">Successfully Allocated Process Memory</td>
        <td><strong>${bestMetrics.allocatedMemory.toLocaleString()} KB</strong></td>
        <td><strong>${worstMetrics.allocatedMemory.toLocaleString()} KB</strong></td>
        <td>Diff: ${Math.abs(bestMetrics.allocatedMemory - worstMetrics.allocatedMemory)} KB</td>
      </tr>
      <tr>
        <td class="metric-name">Process-Memory Utilization Rate</td>
        <td><strong style="color:var(--status-success);">${bestMetrics.utilizationPct}%</strong></td>
        <td><strong style="color:var(--accent-primary);">${worstMetrics.utilizationPct}%</strong></td>
        <td>${bestMetrics.utilizationPct >= worstMetrics.utilizationPct ? 'Best-Fit achieved higher utilization' : 'Worst-Fit achieved higher utilization'}</td>
      </tr>
      <tr>
        <td class="metric-name">Unallocated Process Memory</td>
        <td>${bestMetrics.unallocatedMemory > 0 ? `${bestMetrics.unallocatedMemory} KB` : '0 KB (All Fit)'}</td>
        <td>${worstMetrics.unallocatedMemory > 0 ? `${worstMetrics.unallocatedMemory} KB` : '0 KB (All Fit)'}</td>
        <td>${worstMetrics.unallocatedMemory > 0 ? '<span class="badge badge-error">Request Rejected</span>' : '<span class="badge badge-success">Fully Accommodated</span>'}</td>
      </tr>
      <tr>
        <td class="metric-name">Total Remaining Free Memory</td>
        <td>${bestMetrics.remainingFreeSpace.toLocaleString()} KB</td>
        <td>${worstMetrics.remainingFreeSpace.toLocaleString()} KB</td>
        <td>Sum of all free partition segments</td>
      </tr>
    `;
  }

  function renderMiniRamTracks(snapshot, container) {
    container.innerHTML = '';
    snapshot.blocks.forEach(block => {
      let segmentsHtml = '';
      block.allocations.forEach(alloc => {
        const widthPct = ((alloc.size / block.initialSize) * 100).toFixed(1);
        segmentsHtml += `
          <div class="ram-segment process-allocated" style="width: ${widthPct}%; background: ${alloc.color}; font-size:0.7rem;">
            ${alloc.pid} (${alloc.size}K)
          </div>
        `;
      });
      if (block.remainingSize > 0) {
        const freePct = ((block.remainingSize / block.initialSize) * 100).toFixed(1);
        segmentsHtml += `
          <div class="ram-segment free-space" style="width: ${freePct}%; font-size:0.7rem;">
            ${block.remainingSize}K
          </div>
        `;
      }
      const div = document.createElement('div');
      div.className = 'block-track-card';
      div.style.padding = '8px 12px';
      div.innerHTML = `
        <div class="block-meta-row" style="font-size:0.75rem;">
          <strong>Block ${block.id} (${block.initialSize} KB)</strong>
          <span>${block.remainingSize} KB Free</span>
        </div>
        <div class="ram-bar-container" style="height: 30px;">
          ${segmentsHtml}
        </div>
      `;
      container.appendChild(div);
    });
  }

  function renderMiniTable(snapshot, tbody) {
    tbody.innerHTML = '';
    snapshot.processes.forEach(proc => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${proc.id}</strong></td>
        <td>${proc.size} KB</td>
        <td>${proc.allocatedBlockId ? `Block ${proc.allocatedBlockId}` : '<span style="color:var(--text-muted);">-</span>'}</td>
        <td>${proc.remainingInBlock !== null ? `${proc.remainingInBlock} KB` : '-'}</td>
        <td>${proc.status === 'allocated' ? '<span class="badge badge-success">Allocated</span>' : '<span class="badge badge-error">Failed</span>'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // ==========================================
  // Master UI Update
  // ==========================================
  function updateUI() {
    renderConfigPanels();
    renderStrategyBanner();

    if (state.activeStrategy === 'compare') {
      singleView.style.display = 'none';
      compareView.style.display = 'grid';
      renderComparisonMode();
      // Update KPIs to show Best-Fit by default in compare
      const bestFinal = computeSimulationSnapshots('best-fit', state.blocks, state.processes);
      renderKPIs(calculateMetrics(bestFinal[bestFinal.length - 1]));
      return;
    }

    singleView.style.display = 'grid';
    compareView.style.display = 'none';

    // Active Snapshot based on currentStep
    const currentSnapshot = state.snapshots[state.currentStep] || state.snapshots[0];
    const metrics = calculateMetrics(currentSnapshot);

    renderKPIs(metrics);
    renderRAMVisualizer(currentSnapshot);
    renderTable(currentSnapshot);

    // Update Tracer
    tracerMessage.textContent = currentSnapshot.message;
    if (state.currentStep === 0) {
      tracerStatusBadge.textContent = 'Ready';
      tracerStatusBadge.className = 'badge badge-neutral';
    } else if (state.currentStep === state.processes.length) {
      tracerStatusBadge.textContent = 'Completed';
      tracerStatusBadge.className = 'badge badge-success';
    } else {
      tracerStatusBadge.textContent = `P${state.currentStep} Evaluated`;
      tracerStatusBadge.className = 'badge badge-warning';
    }

    // Update Stepper Bar status
    playbackStepBadge.innerHTML = `
      <i data-lucide="clock" style="width:15px;height:15px; color:var(--accent-primary);"></i>
      <span>Step ${state.currentStep} of ${state.processes.length}</span>
    `;

    lucide.createIcons({ root: playbackStepBadge });
    lucide.createIcons({ root: document.querySelector('.vitals-grid') });
  }

  // ==========================================
  // Playback & Stepper Logic
  // ==========================================
  function stepForward() {
    if (state.currentStep < state.processes.length) {
      state.currentStep++;
      updateUI();
      return true;
    } else {
      pausePlayback();
      showToast('All processes in queue evaluated.', 'info');
      return false;
    }
  }

  function stepBackward() {
    if (state.currentStep > 0) {
      state.currentStep--;
      updateUI();
    }
  }

  function resetSimulation() {
    pausePlayback();
    state.currentStep = 0;
    recomputeSimulation();
    updateUI();
    showToast('Simulation reset to initial memory state.', 'info');
  }

  function simulateAll() {
    pausePlayback();
    state.currentStep = state.processes.length;
    updateUI();
    showToast('Executed full allocation pass.', 'success');
  }

  function startPlayback() {
    if (state.currentStep >= state.processes.length) {
      state.currentStep = 0;
    }
    state.isAutoPlaying = true;
    textPlayState.textContent = 'Pause';
    iconPlayState.setAttribute('data-lucide', 'pause');
    lucide.createIcons({ root: btnPlaybackToggle });

    state.playTimer = setInterval(() => {
      const canContinue = stepForward();
      if (!canContinue) {
        pausePlayback();
      }
    }, state.playSpeed);
  }

  function pausePlayback() {
    state.isAutoPlaying = false;
    if (state.playTimer) {
      clearInterval(state.playTimer);
      state.playTimer = null;
    }
    textPlayState.textContent = 'Auto Play';
    iconPlayState.setAttribute('data-lucide', 'play');
    lucide.createIcons({ root: btnPlaybackToggle });
  }

  // ==========================================
  // Toast Helper
  // ==========================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}" class="toast-icon"></i>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    lucide.createIcons({ root: toast });

    // Animate in
    setTimeout(() => toast.classList.add('show'), 20);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ==========================================
  // Event Listeners
  // ==========================================

  // Strategy Tabs Switcher
  document.querySelectorAll('.nav-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      pausePlayback();
      document.querySelectorAll('.nav-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeStrategy = tab.getAttribute('data-strategy');
      state.currentStep = 0;
      recomputeSimulation();
      updateUI();
    });
  });

  // Presets Selector
  presetSelect.addEventListener('change', (e) => {
    pausePlayback();
    const key = e.target.value;
    state.activePresetKey = key;
    if (PRESETS[key]) {
      state.blocks = [...PRESETS[key].blocks];
      state.processes = [...PRESETS[key].processes];
      state.currentStep = 0;
      recomputeSimulation();
      updateUI();
      showToast(`Loaded: ${PRESETS[key].name}`, 'success');
    }
  });

  // Stepper Controls
  btnStepNext.addEventListener('click', () => {
    pausePlayback();
    stepForward();
  });

  btnStepPrev.addEventListener('click', () => {
    pausePlayback();
    stepBackward();
  });

  btnPlaybackToggle.addEventListener('click', () => {
    if (state.isAutoPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  });

  btnResetSim.addEventListener('click', resetSimulation);

  simSpeedSlider.addEventListener('input', (e) => {
    state.playSpeed = parseInt(e.target.value, 10);
    if (state.isAutoPlaying) {
      pausePlayback();
      startPlayback();
    }
  });

  // Quick Action Buttons
  btnQuickRun.addEventListener('click', simulateAll);
  btnQuickStep.addEventListener('click', () => {
    pausePlayback();
    stepForward();
  });
  btnQuickReset.addEventListener('click', resetSimulation);
  btnQuickBenchmark.addEventListener('click', () => {
    presetSelect.value = 'sla-benchmark';
    presetSelect.dispatchEvent(new Event('change'));
  });

  // Add Block Form
  formAddBlock.addEventListener('submit', (e) => {
    e.preventDefault();
    const size = parseInt(inputBlockSize.value, 10);
    if (isNaN(size) || size <= 0) {
      showToast('Block size must be greater than 0 KB.', 'error');
      return;
    }
    if (size > 10000) {
      showToast('Block size exceeds 10,000 KB limit.', 'error');
      return;
    }
    if (state.blocks.length >= 25) {
      showToast('Maximum 25 memory blocks supported.', 'error');
      return;
    }

    state.blocks.push(size);
    inputBlockSize.value = '';
    recomputeSimulation();
    updateUI();
    showToast(`Added Block ${state.blocks.length} (${size} KB)`, 'success');
  });

  // Add Process Form
  formAddProcess.addEventListener('submit', (e) => {
    e.preventDefault();
    const size = parseInt(inputProcessSize.value, 10);
    if (isNaN(size) || size <= 0) {
      showToast('Process memory must be greater than 0 KB.', 'error');
      return;
    }
    if (size > 10000) {
      showToast('Process size exceeds 10,000 KB limit.', 'error');
      return;
    }
    if (state.processes.length >= 25) {
      showToast('Maximum 25 processes supported.', 'error');
      return;
    }

    state.processes.push(size);
    inputProcessSize.value = '';
    recomputeSimulation();
    updateUI();
    showToast(`Added Process P${state.processes.length} (${size} KB)`, 'success');
  });

  // Table Filter Buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.tableFilter = btn.getAttribute('data-filter');
      const snap = state.snapshots[state.currentStep] || state.snapshots[0];
      renderTable(snap);
    });
  });

  // Table Search Input
  document.getElementById('search-processes').addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    const snap = state.snapshots[state.currentStep] || state.snapshots[0];
    renderTable(snap);
  });

  // ==========================================
  // Modals Management
  // ==========================================

  // C Code Modal
  btnViewCCode.addEventListener('click', () => {
    modalCCode.classList.add('active');
  });
  btnCloseCModal.addEventListener('click', () => modalCCode.classList.remove('active'));
  btnDoneCCode.addEventListener('click', () => modalCCode.classList.remove('active'));

  btnCopyCCode.addEventListener('click', () => {
    const code = document.getElementById('c-code-content').innerText;
    navigator.clipboard.writeText(code).then(() => {
      showToast('C source code copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy code.', 'error');
    });
  });

  // SLA Report Modal
  btnExportReport.addEventListener('click', () => {
    generateSLAReportContent();
    modalReport.classList.add('active');
  });
  btnCloseReportModal.addEventListener('click', () => modalReport.classList.remove('active'));
  btnCloseReportBtn.addEventListener('click', () => modalReport.classList.remove('active'));

  btnPrintReport.addEventListener('click', () => {
    window.print();
  });

  function generateSLAReportContent() {
    const bestSnapshots = computeSimulationSnapshots('best-fit', state.blocks, state.processes);
    const worstSnapshots = computeSimulationSnapshots('worst-fit', state.blocks, state.processes);
    const bestMetrics = calculateMetrics(bestSnapshots[bestSnapshots.length - 1]);
    const worstMetrics = calculateMetrics(worstSnapshots[worstSnapshots.length - 1]);

    reportDynamicContent.innerHTML = `
      <div style="background:var(--bg-secondary); padding:14px; border-radius:12px; border:1px solid var(--border-subtle);">
        <strong>Problem Definition:</strong> Memory allocation evaluation comparing Best-Fit and Worst-Fit algorithms under variable-size memory partitioning.<br>
        <strong>Initial Blocks (${state.blocks.length}):</strong> ${state.blocks.join(', ')} KB (Total: ${bestMetrics.totalMemory.toLocaleString()} KB)<br>
        <strong>Processes (${state.processes.length}):</strong> ${state.processes.map((s, i) => `P${i+1}=${s}KB`).join(', ')} (Total: ${state.processes.reduce((a,b)=>a+b,0).toLocaleString()} KB)
      </div>

      <h5 style="font-size: 0.95rem; font-weight:700; color:var(--text-header); margin-top:8px;">Evaluation Outcome:</h5>
      <table class="styled-table" style="font-size:0.8rem;">
        <thead>
          <tr>
            <th>Measure</th>
            <th>Best-Fit</th>
            <th>Worst-Fit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Processes Allocated</td>
            <td><strong>${bestMetrics.allocatedCount} / ${bestMetrics.totalProcesses}</strong></td>
            <td><strong>${worstMetrics.allocatedCount} / ${worstMetrics.totalProcesses}</strong></td>
          </tr>
          <tr>
            <td>Allocated Process Memory</td>
            <td>${bestMetrics.allocatedMemory} KB</td>
            <td>${worstMetrics.allocatedMemory} KB</td>
          </tr>
          <tr>
            <td>Memory Utilization Rate</td>
            <td><strong>${bestMetrics.utilizationPct}%</strong></td>
            <td><strong>${worstMetrics.utilizationPct}%</strong></td>
          </tr>
          <tr>
            <td>Unallocated Memory</td>
            <td>${bestMetrics.unallocatedMemory} KB</td>
            <td>${worstMetrics.unallocatedMemory} KB</td>
          </tr>
          <tr>
            <td>Remaining Free Space</td>
            <td>${bestMetrics.remainingFreeSpace} KB</td>
            <td>${worstMetrics.remainingFreeSpace} KB</td>
          </tr>
        </tbody>
      </table>

      <div style="font-size:0.8rem; color:var(--text-sub); line-height:1.5;">
        <strong>Academic Conclusion:</strong> The simulation demonstrates that the memory allocation policy dictates contiguous partition fragmentation. 
        Best-Fit isolates larger partitions by filling the tightest fitting blocks first, allowing higher process accommodation in this workload.
      </div>
    `;
  }

  // Close modals on clicking overlay backdrop
  [modalCCode, modalReport].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // ==========================================
  // Initialization
  // ==========================================
  recomputeSimulation();
  updateUI();
  lucide.createIcons();
});
