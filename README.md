# 🚀 Open8086

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT">
  <img src="https://img.shields.io/badge/8086%20Instructions-116%2F116%20Passed-brightgreen.svg" alt="116/116 Instructions Passed">
  <img src="https://img.shields.io/badge/Lab%20Experiments-20%20Preloaded-orange.svg" alt="20 Preloaded Lab Experiments">
  <img src="https://img.shields.io/badge/Dependencies-0%20(Pure%20Vanilla%20JS)-success.svg" alt="Zero Dependencies">
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Cross Platform">
</p>

<p align="center">
  <b>A modern, zero-dependency, open-source 8086 microprocessor emulator, two-pass assembler, and interactive university lab suite.</b><br>
  <i>Runs natively in any browser with zero installation — built for students, educators, and assembly enthusiasts.</i>
</p>

---

## ✨ Features & Highlights

Open8086 brings a fast, accessible, and intuitive 8086 development experience to the modern web:

- 🌐 **100% Client-Side & Offline**: Runs entirely in the browser with zero downloads, zero installations, and zero external runtime dependencies.
- 🧠 **Complete 116 Instruction Set**: Implements all 116 original 8086 instructions, thoroughly verified with automated test suites.
- ⏪ **Step Back / Time-Travel Debugging**: Made a wrong jump or stepped past a branch? Hit `Ctrl+Z` to reverse the CPU state and step backward in time.
- 🧪 **Preloaded University Lab Suite**: 20 complete, tested programs covering standard computer architecture coursework (arithmetic across addressing modes, array search, sorting, and interrupts).
- 🎛️ **Live Hardware Controls**:
  - **All 9 Processor Flags**: Inspect and toggle `CF`, `PF`, `AF`, `ZF`, `SF`, `TF`, `IF`, `DF`, and `OF` with a single click.
  - **Interactive Registers**: Live 16-bit and 8-bit split registers (`AX`, `BX`, `CX`, `DX`, pointers, and segments) with real-time editing in Hex, Decimal, or Binary.
- 🔍 **Interactive 1MB Memory Hex Dump**: Full address space visualization (`Segment * 16 + Offset`) with live read/write access highlighting and inline byte editing.
- 🥞 **Visual Stack Inspector**: Live tracking of the runtime stack from `SS:SP` upward with active `SP` and `BP` pointer indicators.
- 🖥️ **Virtual DOS Screen**: 80x25 terminal supporting DOS `INT 21h` (character I/O, string display, buffered input, termination) and BIOS `INT 10h` / `INT 16h` screen and keyboard services.
- 📖 **Built-in Searchable Documentation**: Browse instructions with descriptions, operand signatures, algorithms, flag impact tables, and 1-click code insertion.
- 🎨 **Multiple Themes**: Modern Dark, Clean Light, Classic Windows XP Retro style, and Vintage Green Phosphor CRT Screen.

---

## 🏃 Quick Start

### 🌟 Option 1: Instant Browser (Recommended)
No server, no internet connection, and no Node.js required. Simply open:
```
index.html
```
in any modern web browser (Chrome, Edge, Firefox, Brave, Safari).

### Option 2: Local Server (For Sharing on Wi-Fi / LAN)
Run the built-in zero-dependency Node.js server to share with classmates over your local network:
```bash
npm start
# Server starts at http://localhost:8086
```

### Option 3: Standalone App Window (Windows)
Double-click `launch.bat` or `Open8086.vbs` to launch Open8086 in a clean, borderless app window.

### Option 4: Live GitHub Pages
Deployable to GitHub Pages in one click via GitHub Actions (`.github/workflows/deploy-pages.yml`).

---

## 🧪 Preloaded University Lab Experiments

Open8086 includes 20 preloaded, well-documented programs aligned with university microprocessor laboratory curricula. Click **"Load into Editor & Assemble"** under the **Lab Experiments** tab to load any program:

<details>
<summary><b>View All 20 Preloaded Lab Programs</b></summary>

### Experiment No. 1: Addition & Subtraction using Different Addressing Modes
- **1a.** Addition of two 8-bit numbers (Register, Immediate, Direct, Indirect addressing)
- **1b.** Addition of two 16-bit numbers (Register, Immediate, Direct, Indirect addressing)
- **1c.** Addition of two 32-bit numbers (`ADD` and `ADC` multi-precision arithmetic)
- **1d.** Subtraction of two 8-bit numbers (Register, Immediate, Direct, Indirect addressing)
- **1e.** Subtraction of two 16-bit numbers (Register, Immediate, Direct, Indirect addressing)
- **1f.** Subtraction of two 32-bit numbers (`SUB` and `SBB` multi-precision arithmetic)

### Experiment No. 2: Multiplication & Division using Different Addressing Modes
- **2a.** Multiplication of two 8-bit numbers (`AL * op -> AX`)
- **2b.** Multiplication of two 16-bit numbers (`AX * op -> DX:AX`)
- **2c.** Division of 32-bit by 16-bit numbers (`DX:AX / op -> AX quot, DX rem`)
- **2d.** Division of 16-bit by 8-bit numbers (`AX / op -> AL quot, AH rem`)

### Experiment No. 3: Array Operations
- **3a.** Find largest element in an array
- **3b.** Find smallest element in an array
- **3c.** Find the range of an array (`Range = Max - Min`)
- **3d.** Find the smallest number in a signed array (using signed `JL` jump)
- **3e.** Count odd and even elements in an array (`TEST AL, 01h`)
- **3f.** Separate positive and negative numbers into two distinct memory buffers

### Experiment No. 4: Sorting & Array Manipulation
- **4a.** Bubble Sort in ascending order
- **4b.** Bubble Sort in descending order
- **4c.** Reverse the order of array elements (in-place two-pointer swap)

### Bonus Demo:
- **Hello World**: DOS `INT 21h` (AH=09h string display).
</details>

---

## 🧠 Complete 116 Instruction Set

All 116 standard 8086 instructions are fully implemented and verified:

```
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

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`F8`** | **Step** | Execute the next instruction |
| **`F5`** | **Run / Pause** | Toggle continuous CPU execution |
| **`Ctrl + Z`** | **Step Back** | Revert CPU & registers to the previous instruction state |
| **`Ctrl + Enter`** | **Assemble & Run** | Re-assemble code and begin execution |
| **`Ctrl + S`** | **Save** | Download active source as a `.asm` file |
| **`Gutter Click`** | **Breakpoint** | Click any line number to toggle execution breakpoint |

---

## 🖥️ Architecture & Subsystems

1. **CPU Engine (`js/cpu.js`)**:
   - 16-bit general registers: `AX`, `BX`, `CX`, `DX`.
   - 8-bit split registers: `AH`/`AL`, `BH`/`BL`, `CH`/`CL`, `DH`/`DL`.
   - Pointers & Indexes: `SP`, `BP`, `SI`, `DI`, `IP`.
   - Segment Registers: `CS`, `DS`, `SS`, `ES`.
   - Flags: All 9 active 8086 flags (`CF`, `PF`, `AF`, `ZF`, `SF`, `TF`, `IF`, `DF`, `OF`).
   - Execution history stack for Step Back / Undo.

2. **Memory Model (`js/memory.js`)**:
   - 1 Megabyte physical address space (`Segment * 16 + Offset`).
   - Read & write access tracking for live UI visualization.

3. **Two-Pass Assembler (`js/assembler.js`)**:
   - Directives: `ORG`, `DB`, `DW`, `DD`, `DUP`, `EQU`, `OFFSET`, `PTR`.
   - Addressing modes: Immediate, Register, Direct (`[num]`), Indirect (`[BX]`, `[SI]`, `[DI]`, `[BP]`), Based Relative (`[BX+SI]`, `[BP+DI+4]`).
   - Synchronized line mapping for editor execution pointer.

4. **BIOS & DOS Interrupts (`js/interrupts.js`)**:
   - `INT 21h`: AH=01h (read char), AH=02h (write char), AH=09h (write string), AH=0Ah (buffered input), AH=4Ch (exit).
   - `INT 10h`: AH=00h (set mode), AH=02h (set cursor), AH=06h (clear screen), AH=0Eh (teletype output).
   - `INT 16h`: AH=00h (read keystroke), AH=01h (check keystroke).
   - `INT 20h`: Terminate program.
   - `INT 3`: Breakpoint interrupt.

5. **Virtual DOS Terminal (`js/terminal.js`)**:
   - 80x25 character screen with blinking cursor and interactive keyboard buffer.

---

## 🧪 Automated Testing

Run the automated test suite locally:
```bash
npm test
```

Or run individual test modules:
```bash
npm run test:instructions   # Verifies all 116 instructions
npm run test:experiments    # Tests all 20 lab programs
npm run test:correctness    # Verifies array algorithms & mathematical results
npm run test:coverage       # Checks CPU instruction implementation coverage
```

---

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome!
Please review [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, modify, and distribute for educational and personal use.
