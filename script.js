// DOM Element References
const numBlocksInput = document.getElementById('numBlocks');
const generateBlocksBtn = document.getElementById('generateBlocksBtn');
const blockInputsContainer = document.getElementById('blockInputsContainer');

const numProcessesInput = document.getElementById('numProcesses');
const generateProcessesBtn = document.getElementById('generateProcessesBtn');
const processInputsContainer = document.getElementById('processInputsContainer');

const loadSampleBtn = document.getElementById('loadSampleBtn');
const runSimulationBtn = document.getElementById('runSimulationBtn');
const resetBtn = document.getElementById('resetBtn');
const errorMessageDiv = document.getElementById('errorMessage');

const algoRadios = document.querySelectorAll('input[name="algorithm"]');
const slabConfigGroup = document.getElementById('slabConfigGroup');
const slabSizeInput = document.getElementById('slabSizeInput');

const resultsSection = document.getElementById('resultsSection');
const resultsTableBody = document.getElementById('resultsTableBody');
const colBest = document.getElementById('colBest');
const colWorst = document.getElementById('colWorst');
const colSlab = document.getElementById('colSlab');

const visualisationSection = document.getElementById('visualisationSection');
const memoryVisualContainer = document.getElementById('memoryVisualContainer');

const summarySection = document.getElementById('summarySection');
const summaryContent = document.getElementById('summaryContent');

// Initialize default input fields on page load
window.addEventListener('DOMContentLoaded', () => {
    generateBlockFields(5);
    generateProcessFields(4);
    updateAlgorithmUI();
});

// Toggle slab configuration visibility when algorithm radio changes
algoRadios.forEach(radio => {
    radio.addEventListener('change', updateAlgorithmUI);
});

function updateAlgorithmUI() {
    const selected = document.querySelector('input[name="algorithm"]:checked').value;
    if (selected === 'slab') {
        slabConfigGroup.style.display = 'flex';
    } else {
        slabConfigGroup.style.display = 'none';
    }
}

// Generate memory block input boxes
generateBlocksBtn.addEventListener('click', () => {
    const count = parseInt(numBlocksInput.value);
    if (isNaN(count) || count <= 0) {
        showError("Please enter a valid positive integer for the number of blocks.");
        return;
    }
    clearError();
    generateBlockFields(count);
});

function generateBlockFields(count) {
    blockInputsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.placeholder = `B${i+1} (KB)`;
        input.className = 'block-size-input';
        blockInputsContainer.appendChild(input);
    }
}

// Generate process input boxes
generateProcessesBtn.addEventListener('click', () => {
    const count = parseInt(numProcessesInput.value);
    if (isNaN(count) || count <= 0) {
        showError("Please enter a valid positive integer for the number of processes.");
        return;
    }
    clearError();
    generateProcessFields(count);
});

function generateProcessFields(count) {
    processInputsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.placeholder = `P${i+1} (KB)`;
        input.className = 'process-size-input';
        processInputsContainer.appendChild(input);
    }
}

// Load Sample Test Case provided in instructions
loadSampleBtn.addEventListener('click', () => {
    clearError();
    numBlocksInput.value = 5;
    generateBlockFields(5);
    const blockInputs = blockInputsContainer.querySelectorAll('.block-size-input');
    const sampleBlocks = [100, 500, 200, 300, 600];
    blockInputs.forEach((inp, idx) => inp.value = sampleBlocks[idx]);

    numProcessesInput.value = 4;
    generateProcessFields(4);
    const processInputs = processInputsContainer.querySelectorAll('.process-size-input');
    const sampleProcesses = [212, 417, 112, 426];
    processInputs.forEach((inp, idx) => inp.value = sampleProcesses[idx]);
});

// Reset Functionality
resetBtn.addEventListener('click', () => {
    clearError();
    numBlocksInput.value = 5;
    generateBlockFields(5);
    numProcessesInput.value = 4;
    generateProcessFields(4);
    slabSizeInput.value = 128;

    resultsSection.style.display = 'none';
    visualisationSection.style.display = 'none';
    summarySection.style.display = 'none';
});

// Run Simulation Controller
runSimulationBtn.addEventListener('click', () => {
    clearError();

    // 1. Collect and validate block sizes
    const blockInputElements = blockInputsContainer.querySelectorAll('.block-size-input');
    const initialBlocks = [];
    if (blockInputElements.length === 0) {
        showError("Please generate and fill memory blocks.");
        return;
    }
    for (let inp of blockInputElements) {
        const val = parseInt(inp.value);
        if (isNaN(val) || val <= 0) {
            showError("All memory block sizes must be positive numbers.");
            return;
        }
        initialBlocks.push(val);
    }

    // 2. Collect and validate process sizes
    const processInputElements = processInputsContainer.querySelectorAll('.process-size-input');
    const processes = [];
    if (processInputElements.length === 0) {
        showError("Please generate and fill process requirements.");
        return;
    }
    for (let inp of processInputElements) {
        const val = parseInt(inp.value);
        if (isNaN(val) || val <= 0) {
            showError("All process memory requirements must be positive numbers.");
            return;
        }
        processes.push(val);
    }

    // 3. Get Selected Algorithm
    const selectedAlgo = document.querySelector('input[name="algorithm"]:checked').value;

    // Adjust table headers based on algorithm choice
    colBest.style.display = (selectedAlgo === 'best' || selectedAlgo === 'compare') ? '' : 'none';
    colWorst.style.display = (selectedAlgo === 'worst' || selectedAlgo === 'compare') ? '' : 'none';
    colSlab.style.display = (selectedAlgo === 'slab' || selectedAlgo === 'compare') ? '' : 'none';

    // 4. Run simulations
    let bestResult = null;
    let worstResult = null;
    let slabResult = null;

    let slabObjSize = parseInt(slabSizeInput.value);
    if (selectedAlgo === 'slab' || selectedAlgo === 'compare') {
        if (isNaN(slabObjSize) || slabObjSize <= 0) {
            showError("Slab object size must be a valid positive number.");
            return;
        }
    }

    if (selectedAlgo === 'best' || selectedAlgo === 'compare') {
        bestResult = runDynamicAllocation(initialBlocks, processes, 'best');
    }
    if (selectedAlgo === 'worst' || selectedAlgo === 'compare') {
        worstResult = runDynamicAllocation(initialBlocks, processes, 'worst');
    }
    if (selectedAlgo === 'slab' || selectedAlgo === 'compare') {
        slabResult = runSlabAllocation(initialBlocks, processes, slabObjSize);
    }

    // 5. Render Results Table
    renderResultsTable(processes, bestResult, worstResult, slabResult, selectedAlgo);

    // 6. Render Memory Visualisation (prioritize active choice)
    const visualResult = (selectedAlgo === 'best' && bestResult) || 
                         (selectedAlgo === 'worst' && worstResult) || 
                         (selectedAlgo === 'slab' && slabResult) || 
                         bestResult || slabResult || worstResult;
    
    renderMemoryVisualisation(initialBlocks, visualResult);

    // 7. Render Performance Summary
    renderPerformanceSummary(initialBlocks, processes, visualResult);

    // Show result sections
    resultsSection.style.display = 'block';
    visualisationSection.style.display = 'block';
    summarySection.style.display = 'block';
});

// Core Dynamic Partition Allocation (Best-Fit & Worst-Fit)
function runDynamicAllocation(initialBlocks, processes, type) {
    let blocks = initialBlocks.map((size, index) => ({
        id: index + 1,
        initialSize: size,
        remainingSpace: size,
        allocatedProcesses: []
    }));

    let allocations = [];

    processes.forEach((procSize, pIdx) => {
        let pId = pIdx + 1;
        let selectedBlockIndex = -1;

        if (type === 'best') {
            let minDiff = Infinity;
            blocks.forEach((block, bIdx) => {
                if (block.remainingSpace >= procSize) {
                    let diff = block.remainingSpace - procSize;
                    if (diff < minDiff) {
                        minDiff = diff;
                        selectedBlockIndex = bIdx;
                    }
                }
            });
        } else if (type === 'worst') {
            let maxDiff = -1;
            blocks.forEach((block, bIdx) => {
                if (block.remainingSpace >= procSize) {
                    let diff = block.remainingSpace - procSize;
                    if (diff > maxDiff) {
                        maxDiff = diff;
                        selectedBlockIndex = bIdx;
                    }
                }
            });
        }

        if (selectedBlockIndex !== -1) {
            let targetBlock = blocks[selectedBlockIndex];
            targetBlock.remainingSpace -= procSize;
            targetBlock.allocatedProcesses.push({ pId: pId, size: procSize });

            allocations.push({
                pId: pId,
                processSize: procSize,
                allocated: true,
                blockId: targetBlock.id,
                remainingSpace: targetBlock.remainingSpace,
                detailText: `Block ${targetBlock.id} (Rem: ${targetBlock.remainingSpace} KB)`
            });
        } else {
            allocations.push({
                pId: pId,
                processSize: procSize,
                allocated: false,
                blockId: null,
                remainingSpace: null,
                detailText: "Not Allocated"
            });
        }
    });

    return {
        allocations: allocations,
        finalBlocks: blocks
    };
}

// Core Slab Allocator Logic
function runSlabAllocation(initialBlocks, processes, slabSize) {
    let blocks = initialBlocks.map((size, index) => {
        let totalSlots = Math.floor(size / slabSize);
        let slots = [];
        for (let s = 0; s < totalSlots; s++) {
            slots.push({ slotId: s + 1, occupied: false, processId: null });
        }
        return {
            id: index + 1,
            initialSize: size,
            slabSize: slabSize,
            slots: slots,
            allocatedProcesses: []
        };
    });

    let allocations = [];

    processes.forEach((procSize, pIdx) => {
        let pId = pIdx + 1;
        let allocatedSlotInfo = null;

        if (procSize <= slabSize) {
            for (let block of blocks) {
                let freeSlot = block.slots.find(slot => !slot.occupied);
                if (freeSlot) {
                    freeSlot.occupied = true;
                    freeSlot.processId = pId;
                    
                    block.allocatedProcesses.push({ pId: pId, size: procSize });
                    
                    allocatedSlotInfo = {
                        blockId: block.id,
                        slotId: freeSlot.slotId,
                        slotSize: slabSize
                    };
                    break;
                }
            }
        }

        if (allocatedSlotInfo) {
            let blockObj = blocks.find(b => b.id === allocatedSlotInfo.blockId);
            let freeSlotsCount = blockObj.slots.filter(s => !s.occupied).length;
            allocations.push({
                pId: pId,
                processSize: procSize,
                allocated: true,
                blockId: allocatedSlotInfo.blockId,
                remainingSpace: freeSlotsCount * slabSize,
                detailText: `Block ${allocatedSlotInfo.blockId} [Slot ${allocatedSlotInfo.slotId}]`
            });
        } else {
            allocations.push({
                pId: pId,
                processSize: procSize,
                allocated: false,
                blockId: null,
                remainingSpace: null,
                detailText: "Not Allocated"
            });
        }
    });

    let formattedFinalBlocks = blocks.map(block => {
        let occupiedCount = block.slots.filter(s => s.occupied).length;
        let freeSlotsCount = block.slots.length - occupiedCount;
        return {
            id: block.id,
            initialSize: block.initialSize,
            remainingSpace: freeSlotsCount * block.slabSize,
            allocatedProcesses: block.allocatedProcesses
        };
    });

    return {
        allocations: allocations,
        finalBlocks: formattedFinalBlocks
    };
}

// Render Results Table
function renderResultsTable(processes, bestResult, worstResult, slabResult, selectedAlgo) {
    resultsTableBody.innerHTML = '';

    processes.forEach((procSize, idx) => {
        const tr = document.createElement('tr');
        const pId = idx + 1;

        const tdId = document.createElement('td');
        tdId.textContent = `P${pId}`;
        tr.appendChild(tdId);

        const tdSize = document.createElement('td');
        tdSize.textContent = `${procSize} KB`;
        tr.appendChild(tdSize);

        if (selectedAlgo === 'best' || selectedAlgo === 'compare') {
            const tdB = document.createElement('td');
            tdB.textContent = bestResult.allocations[idx].detailText;
            tr.appendChild(tdB);
        }

        if (selectedAlgo === 'worst' || selectedAlgo === 'compare') {
            const tdW = document.createElement('td');
            tdW.textContent = worstResult.allocations[idx].detailText;
            tr.appendChild(tdW);
        }

        if (selectedAlgo === 'slab' || selectedAlgo === 'compare') {
            const tdS = document.createElement('td');
            tdS.textContent = slabResult.allocations[idx].detailText;
            tr.appendChild(tdS);
        }

        const tdStatus = document.createElement('td');
        let isAllocated = false;
        if (selectedAlgo === 'best') isAllocated = bestResult.allocations[idx].allocated;
        else if (selectedAlgo === 'worst') isAllocated = worstResult.allocations[idx].allocated;
        else if (selectedAlgo === 'slab') isAllocated = slabResult.allocations[idx].allocated;
        else isAllocated = (bestResult.allocations[idx].allocated || worstResult.allocations[idx].allocated || slabResult.allocations[idx].allocated);

        tdStatus.textContent = isAllocated ? "Allocated" : "Not Allocated";
        tdStatus.style.fontWeight = "bold";
        tdStatus.style.color = isAllocated ? "#274e13" : "#a94442";
        tr.appendChild(tdStatus);

        resultsTableBody.appendChild(tr);
    });
}

// Render Memory Visualisation
function renderMemoryVisualisation(initialBlocks, resultObj) {
    memoryVisualContainer.innerHTML = '';
    const finalBlocks = resultObj.finalBlocks;

    finalBlocks.forEach(block => {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-bar-wrapper';

        const label = document.createElement('div');
        label.className = 'block-label';
        label.textContent = `Block ${block.id} (${block.initialSize} KB)`;
        wrapper.appendChild(label);

        const bar = document.createElement('div');
        bar.className = 'block-bar';

        let totalSize = block.initialSize;

        block.allocatedProcesses.forEach(alloc => {
            const seg = document.createElement('div');
            seg.className = 'seg-allocated';
            let widthPercent = (alloc.size / totalSize) * 100;
            seg.style.width = `${Math.max(widthPercent, 8)}%`;
            seg.title = `P${alloc.pId} (${alloc.size} KB)`;
            seg.textContent = `P${alloc.pId} (${alloc.size}K)`;
            bar.appendChild(seg);
        });

        const freeSpace = block.remainingSpace;
        if (freeSpace > 0) {
            const freeSeg = document.createElement('div');
            freeSeg.className = 'seg-free';
            let widthPercent = (freeSpace / totalSize) * 100;
            freeSeg.style.width = `${Math.max(widthPercent, 5)}%`;
            freeSeg.title = `Free: ${freeSpace} KB`;
            freeSeg.textContent = `Free: ${freeSpace}K`;
            bar.appendChild(freeSeg);
        }

        wrapper.appendChild(bar);
        memoryVisualContainer.appendChild(wrapper);
    });
}

// Render Performance Summary
function renderPerformanceSummary(initialBlocks, processes, resultObj) {
    let totalMemoryAvailable = initialBlocks.reduce((acc, val) => acc + val, 0);
    
    let allocatedCount = 0;
    let notAllocatedCount = 0;
    let totalRequestedMemory = 0;
    let successfullyRequestedMemory = 0;

    processes.forEach((pSize, idx) => {
        totalRequestedMemory += pSize;
        if (resultObj.allocations[idx].allocated) {
            allocatedCount++;
            successfullyRequestedMemory += pSize;
        } else {
            notAllocatedCount++;
        }
    });

    let utilisation = totalMemoryAvailable > 0 
        ? ((successfullyRequestedMemory / totalMemoryAvailable) * 100).toFixed(2) 
        : 0;

    summaryContent.innerHTML = `
        <div class="summary-item">Successfully allocated processes: <span>${allocatedCount}</span></div>
        <div class="summary-item">Processes not allocated: <span>${notAllocatedCount}</span></div>
        <div class="summary-item">Total memory available: <span>${totalMemoryAvailable} KB</span></div>
        <div class="summary-item">Total requested process memory: <span>${totalRequestedMemory} KB</span></div>
        <div class="summary-item">Process-memory utilisation: <span>${utilisation}%</span></div>
    `;
}

function showError(msg) {
    errorMessageDiv.textContent = msg;
}

function clearError() {
    errorMessageDiv.textContent = '';
}