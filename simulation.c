/*
 * Department of Computer Engineering
 * Operating Systems (CMCOR2PC202)
 * Self-Learning Activity Stage 3: Memory Management (Best-Fit vs Worst-Fit)
 * Submitted by: Rashi Prajapati (Roll 45) & Tvisha Rajgor (Roll 47)
 */

#include <stdio.h>
#define MAX 100

void bestFit(int blocks[], int m, int process[], int n) {
    int i, j, best;
    int freeBlock[MAX];
    for (i = 0; i < m; i++) freeBlock[i] = blocks[i];

    printf("\n========================================\n");
    printf("        BEST-FIT ALLOCATION RESULTS     \n");
    printf("========================================\n");
    printf("%-10s %-12s %-12s %-15s\n", "Process", "Required", "Block No", "Remaining");
    printf("----------------------------------------\n");

    int allocatedCount = 0;
    int allocatedMem = 0;

    for (i = 0; i < n; i++) {
        best = -1;
        for (j = 0; j < m; j++) {
            if (freeBlock[j] >= process[i] && (best == -1 || freeBlock[j] < freeBlock[best])) {
                best = j;
            }
        }
        if (best != -1) {
            freeBlock[best] -= process[i];
            allocatedCount++;
            allocatedMem += process[i];
            printf("P%-9d %-12d Block %-6d %-15d\n", i + 1, process[i], best + 1, freeBlock[best]);
        } else {
            printf("P%-9d %-12d %-12s %-15s\n", i + 1, process[i], "Not Alloc", "-");
        }
    }
    printf("----------------------------------------\n");
    printf("Allocated: %d/%d processes (%d KB)\n\n", allocatedCount, n, allocatedMem);
}

void worstFit(int blocks[], int m, int process[], int n) {
    int i, j, worst;
    int freeBlock[MAX];
    for (i = 0; i < m; i++) freeBlock[i] = blocks[i];

    printf("\n========================================\n");
    printf("        WORST-FIT ALLOCATION RESULTS    \n");
    printf("========================================\n");
    printf("%-10s %-12s %-12s %-15s\n", "Process", "Required", "Block No", "Remaining");
    printf("----------------------------------------\n");

    int allocatedCount = 0;
    int allocatedMem = 0;

    for (i = 0; i < n; i++) {
        worst = -1;
        for (j = 0; j < m; j++) {
            if (freeBlock[j] >= process[i] && (worst == -1 || freeBlock[j] > freeBlock[worst])) {
                worst = j;
            }
        }
        if (worst != -1) {
            freeBlock[worst] -= process[i];
            allocatedCount++;
            allocatedMem += process[i];
            printf("P%-9d %-12d Block %-6d %-15d\n", i + 1, process[i], worst + 1, freeBlock[worst]);
        } else {
            printf("P%-9d %-12d %-12s %-15s\n", i + 1, process[i], "Not Alloc", "-");
        }
    }
    printf("----------------------------------------\n");
    printf("Allocated: %d/%d processes (%d KB)\n\n", allocatedCount, n, allocatedMem);
}

int main(void) {
    int blocks[MAX], process[MAX];
    int m, n, i, choice;

    printf("==================================================\n");
    printf("   MEMORY MANAGEMENT SIMULATION (SLA STAGE 3)     \n");
    printf("==================================================\n");

    printf("Enter number of memory blocks (1-100): ");
    if (scanf("%d", &m) != 1 || m < 1 || m > MAX) {
        printf("Error: Invalid number of memory blocks.\n");
        return 1;
    }

    for (i = 0; i < m; i++) {
        printf("  Enter size of block %d in KB: ", i + 1);
        if (scanf("%d", &blocks[i]) != 1 || blocks[i] <= 0) {
            printf("Error: Invalid block size.\n");
            return 1;
        }
    }

    printf("\nEnter number of processes (1-100): ");
    if (scanf("%d", &n) != 1 || n < 1 || n > MAX) {
        printf("Error: Invalid number of processes.\n");
        return 1;
    }

    for (i = 0; i < n; i++) {
        printf("  Enter memory required by P%d in KB: ", i + 1);
        if (scanf("%d", &process[i]) != 1 || process[i] <= 0) {
            printf("Error: Invalid process size.\n");
            return 1;
        }
    }

    printf("\nChoose allocation algorithm:\n");
    printf("  1. Best-Fit\n");
    printf("  2. Worst-Fit\n");
    printf("  3. Compare Both\n");
    printf("Enter choice (1-3): ");
    if (scanf("%d", &choice) != 1 || choice < 1 || choice > 3) {
        printf("Error: Invalid menu choice.\n");
        return 1;
    }

    if (choice == 1) {
        bestFit(blocks, m, process, n);
    } else if (choice == 2) {
        worstFit(blocks, m, process, n);
    } else {
        bestFit(blocks, m, process, n);
        worstFit(blocks, m, process, n);
    }

    return 0;
}
