# MemVitals — Memory Allocation Simulator (Best-Fit vs Worst-Fit)

An interactive, approachable memory management simulation web application built for the **Operating Systems (CMCOR2PC202)** Self-Learning Activity (Stage 3).

Styled with a clean, soft pastel health/vitals dashboard aesthetic (`#F4F3FF` lavender background, `#635BFF` slate purple accents, rounded 16px cards, and smooth micro-animations).

---

## 🌟 Key Features

1. **Memory Allocation Strategies:**
   - **Best-Fit:** Allocates the process to the smallest suitable free memory block.
   - **Worst-Fit:** Allocates the process to the largest suitable free memory block.
   - **First-Fit:** Allocates the process to the first free block from the start that is large enough.
   - **Compare Both (Dual View):** Runs identical initial memory blocks and process queues side-by-side to compare utilization, unallocated memory, and fragmentation.

2. **Pastel Health/Vitals Dashboard Metrics:**
   - **Total Free Memory** (KB) & Active Partitions count
   - **Memory Utilization %** & Total Process Memory Allocated
   - **Allocation Success Rate** (Count & Percentage)
   - **External Fragmentation** & Remaining Space Breakdown

3. **Step-by-Step Simulation Engine:**
   - Auto-Play with adjustable playback speed slider
   - Step Forward / Step Backward inspection
   - Live Decision Tracer explaining exactly which partition was evaluated and why it was selected or rejected

4. **Interactive Memory Partition Map:**
   - Proportional graphical RAM block segments
   - Process badges with distinctive pastel gradients
   - Hatched pattern for free memory space with live KB indicators
   - Visual highlighting of actively evaluated blocks

5. **Presets & Evaluation Test Cases:**
   - **TC1: SLA 3 Benchmark** (100, 300, 500, 200, 600 KB & P1:212, P2:417, P3:112, P4:426 KB)
   - **TC2: Worst-Fit Failure** (P4 cannot be allocated)
   - **TC3: External Fragmentation Gap**
   - **TC4: Best-Fit Sliver Drawback**
   - **TC5: Custom Input Configuration**

6. **Academic Tools:**
   - Embedded C source code viewer with copy-to-clipboard functionality
   - SLA Evaluation Report generator with printable summary matching the academic submission

---

## 🚀 How to Run

### Method 1: Local Python Server (Recommended)
Run the bundled Python server in terminal:
```bash
python server.py
```
Then open your browser at:
`http://localhost:8000/index.html`

### Method 2: Direct Browser Access
Simply double-click `index.html` to open it directly in Chrome, Edge, or Firefox.

### Method 3: Compile and Run C Program
```bash
gcc simulation.c -o simulation
./simulation
```
