# Open8086

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/8086%20Instructions-116%2F116%20Passed-brightgreen.svg" alt="116/116 Instructions Passed">
  <img src="https://img.shields.io/badge/Lab%20Experiments-20%20Preloaded-orange.svg" alt="20 Preloaded Lab Experiments">
  <img src="https://img.shields.io/badge/Dependencies-0%20(Vanilla%20JS)-success.svg" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Cross Platform">
</p>

<p align="center">
  <b>A zero-dependency, open-source 8086 microprocessor emulator, assembler, and interactive university lab suite.</b><br>
  <i>Runs natively in any modern web browser with zero installation. Built for students, educators, and low-level programming enthusiasts.</i>
</p>

---

## Features

Open8086 provides an accessible, fully client-side 8086 development and debugging environment:

- **100% Client-Side and Offline**: Runs directly in the browser with zero downloads, build steps, or runtime dependencies. Works entirely offline.
- **Complete 116 Instruction Set**: Implements all 116 original Intel 8086 instructions, verified against automated test suites.
- **Step Back (Time-Travel Debugging)**: Step backward through previous execution states with full register, flag, and memory restoration.
- **Preloaded University Lab Suite**: 20 preloaded, executable assembly programs covering standard computer architecture coursework (arithmetic, addressing modes, array searches, sorting, and interrupts).
- **Hardware Controls and Inspection**:
  - **Processor Flags**: Real-time inspection and toggle for `CF`, `PF`, `AF`, `ZF`, `SF`, `TF`, `IF`, `DF`, and `OF`.
  - **Registers Table**: Live 16-bit and 8-bit split registers (`AX`, `BX`, `CX`, `DX`, pointers, and segment registers) with inline editing in Hex, Decimal, or Binary.
- **1MB Memory Hex Dump**: Physical address space visualization (`Segment * 16 + Offset`) with live read/write access highlighting and inline byte editing.
- **Stack Inspector**: Tracks runtime stack usage from `SS:SP` with active pointer indicators.
- **Virtual DOS Screen**: 80x25 terminal supporting DOS `INT 21h` services (character I/O, string display, buffered input) and BIOS `INT 10h` / `INT 16h` video and keyboard interrupts.
- **Searchable Instruction Reference**: Built-in instruction documentation with operand rules, algorithms, flag impact, and one-click code insertion.
- **Themes**: Dark, Light, Retro Windows XP, and Phosphor CRT Screen styles.

---

## Quick Start

### Option 1: Live Deployment
Open the live web app directly at:
**[https://open-8086.vercel.app](https://open-8086.vercel.app)**

### Option 2: Direct Browser Use (Offline)
No server, internet access, or Node.js required. Clone or download the repository and open `index.html` in any web browser:
```bash
git clone https://github.com/avm1234567/Open8086.git
# Double-click index.html or open it in your browser
```

### Option 3: Local Server
To share across a local network or lab subnet, start the built-in HTTP server:
```bash
npm start
# Server runs at http://localhost:8086
```

### Option 4: Desktop App Mode (Windows)
Run `launch.bat` or `Open8086.vbs` to launch Open8086 in an application window.

---

## Preloaded University Lab Experiments

Open8086 includes 20 pre-configured assembly programs designed for university microprocessor lab curricula. Select any experiment from the **Lab Experiments** tab to load and assemble it:

<details>
<summary><b>View all 20 preloaded experiments</b></summary>

### Experiment 1: Addition and Subtraction across Addressing Modes
- **1a.** Addition of two 8-bit numbers (Register, Immediate, Direct, Indirect addressing)
- **1b.** Addition of two 16-bit numbers (Register, Immediate, Direct, Indirect addressing)
- **1c.** Addition of two 32-bit numbers (`ADD` and `ADC` multi-precision arithmetic)
- **1d.** Subtraction of two 8-bit numbers (Register, Immediate, Direct, Indirect addressing)
- **1e.** Subtraction of two 16-bit numbers (Register, Immediate, Direct, Indirect addressing)
- **1f.** Subtraction of two 32-bit numbers (`SUB` and `SBB` multi-precision arithmetic)

### Experiment 2: Multiplication and Division across Addressing Modes
- **2a.** Multiplication of two 8-bit numbers (`AL * op -> AX`)
- **2b.** Multiplication of two 16-bit numbers (`AX * op -> DX:AX`)
- **2c.** Division of 32-bit by 16-bit numbers (`DX:AX / op -> AX quot, DX rem`)
- **2d.** Division of 16-bit by 8-bit numbers (`AX / op -> AL quot, AH rem`)

### Experiment 3: Array Operations
- **3a.** Find largest element in an array
- **3b.** Find smallest element in an array
- **3c.** Find the range of an array (`Range = Max - Min`)
- **3d.** Find smallest number in a signed array (using signed conditional jump `JL`)
- **3e.** Count odd and even elements in an array (`TEST AL, 01h`)
- **3f.** Separate positive and negative numbers into two distinct memory buffers

### Experiment 4: Sorting and Array Manipulation
- **4a.** Bubble Sort in ascending order
- **4b.** Bubble Sort in descending order
- **4c.** Reverse the order of array elements (in-place two-pointer swap)

### General Demonstration:
- **Hello World**: DOS `INT 21h` string output (AH=09h).
</details>

---

## Supported Instructions

All 116 standard 8086 instructions are supported:

```text
AAA, AAD, AAM, AAS, ADC, ADD, AND, CALL, CBW, CLC, CLD, CLI, CMC, CMP,
CMPSB, CMPSW, CWD, DAA, DAS, DEC, DIV, ESC, HLT, IDIV, IMUL, IN, INC,
INT, INTO, IRET, JA, JAE, JB, JBE, JC, JCXZ, JE, JG, JGE, JL, JLE,
JMP, JNA, JNAE, JNB, JNBE, JNC, JNE, JNG, JNGE, JNL, JNLE, JNO, JNP,
JNS, JNZ, JO, JP, JPE, JPO, JS, JZ, LAHF, LDS, LEA, LES, LOCK, LODSB,
LODSW, LOOP, LOOPE, LOOPNE, LOOPNZ, LOOPZ, MOV, MOVSB, MOVSW, MUL,
NEG, NOP, NOT, OR, OUT, POP, POPA, POPF, PUSH, PUSHA, PUSHF, RCL,
RCR, REP, REPE, REPNE, REPNZ, REPZ, RET, RETF, ROL, ROR, SAHF, SAL,
SAR, SBB, SCASB, SCASW, SHL, SHR, STC, STD, STI, STOSB, STOSW, SUB,
TEST, WAIT, XCHG, XLATB, XOR
```

---

## Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`F8`** | **Step** | Execute the next instruction |
| **`F5`** | **Run / Pause** | Toggle continuous CPU execution |
| **`Ctrl + Z`** | **Step Back** | Revert CPU, registers, and memory to the previous instruction state |
| **`Ctrl + Enter`** | **Assemble & Run** | Re-assemble source code and start execution |
| **`Ctrl + S`** | **Save** | Download active source code as a `.asm` file |
| **`Gutter Click`** | **Breakpoint** | Click any line number to toggle execution breakpoint |

---

## Architecture Overview

1. **CPU Engine (`js/cpu.js`)**:
   - 16-bit general registers: `AX`, `BX`, `CX`, `DX`.
   - 8-bit registers: `AH`/`AL`, `BH`/`BL`, `CH`/`CL`, `DH`/`DL`.
   - Pointers & Indexes: `SP`, `BP`, `SI`, `DI`, `IP`.
   - Segment Registers: `CS`, `DS`, `SS`, `ES`.
   - Flags: `CF`, `PF`, `AF`, `ZF`, `SF`, `TF`, `IF`, `DF`, `OF`.
   - Per-step register and memory write snapshots for Step Back (Undo).

2. **Memory Subsystem (`js/memory.js`)**:
   - 1 Megabyte physical address space (`Segment * 16 + Offset`).
   - Read and write tracking for UI highlight visualization.
   - Per-write logging hook for reversible memory undo.

3. **Assembler (`js/assembler.js`)**:
   - Directives: `ORG`, `DB`, `DW`, `DD`, `DUP`, `EQU`, `OFFSET`, `PTR`.
   - Addressing modes: Immediate, Register, Direct (`[addr]`), Indirect (`[BX]`, `[SI]`, `[DI]`, `[BP]`), Based Relative (`[BX+SI+disp]`, `[BP+DI+disp]`).
   - Line mapping for active execution highlighting in the code editor.
   - Comprehensive operand type, count, and addressing mode validation.

4. **Interrupt Controller (`js/interrupts.js`)**:
   - `INT 21h`: AH=01h (character input with echo), AH=02h (character output), AH=09h (display string), AH=0Ah (buffered input), AH=2Ah/2Ch (date/time), AH=4Ch (terminate with return code).
   - `INT 10h`: Video services (AH=00h, 02h, 03h, 06h, 0Eh).
   - `INT 16h`: Keyboard input services (AH=00h, 01h).
   - `INT 20h`: Program termination.
   - `INT 03h`: Software breakpoint.

5. **Terminal (`js/terminal.js`)**:
   - 80x25 character grid terminal with cursor emulation and input handling.

---

## Testing

Run the automated test suite locally:
```bash
npm test
```

Individual test modules:
```bash
npm run test:instructions   # Tests all 116 instructions
npm run test:experiments    # Tests all 20 lab experiments
npm run test:correctness    # Tests algorithmic outputs
npm run test:audit          # Tests operand rules & edge cases
npm run test:search         # Tests reference search relevance
```

---

## Contributing

Contributions and issue reports are welcome. Please refer to [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on code style and pull request procedures.

---

## License

This project is licensed under the [MIT License](LICENSE).
