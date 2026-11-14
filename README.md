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
  <i>Built to replace outdated, proprietary 16-bit software and give students, educators, and engineers a fast, beautiful, and reliable 8086 playground.</i>
</p>

---

## ⚡ Why Open8086? (Taking Down Legacy emu8086)

For over two decades, engineering universities have relied on abandoned 2005-era `emu8086` software that requires DOSBox emulators, crashes on modern 64-bit Windows, lacks high-DPI scaling, and triggers false-positive antivirus warnings.

**Open8086 fixes everything:**

| Feature | Legacy emu8086 (2005) | 🚀 Open8086 (Modern) |
| :--- | :---: | :---: |
| **Platform Support** | Windows only (needs DOSBox/Wine on Linux/Mac) | **Any Browser (Windows, macOS, Linux, ChromeOS, iOS, Android)** |
| **Installation** | Requires installer & admin privileges | **Zero install! Just open `index.html`** |
| **Antivirus Issues** | Unsigned 16/32-bit binaries trigger false alarms | **100% clean, zero false alarms** |
| **Instruction Set** | Incomplete & undocumented quirks | **All 116 instructions verified with automated tests** |
| **Undo / Step Back** | ❌ Not available | **✅ Step Back (`Ctrl+Z`) reverses CPU state** |
| **Preloaded Labs** | ❌ None | **✅ 20 complete syllabus experiments preloaded** |
| **Memory Inspector** | Clunky separate window | **Live 1MB Hex Dump with read/write access highlighting** |
| **Flag Toggling** | Read-only indicators | **Click any flag (`CF`, `ZF`, `SF`, etc.) to toggle live!** |
| **Register Editing** | Multi-step dialog | **Click any register to edit in Hex, Dec, or Binary** |
| **Themes** | Grey Windows 98 / XP only | **Modern Dark, Clean Light, Retro XP, Green CRT Phosphor** |
| **Dependencies** | Proprietary closed-source DLLs | **100% Pure Vanilla JS, HTML5, CSS3 (0 dependencies)** |

---

## 🏃 Quick Start (Run Anywhere in Seconds)

### 🌟 Option 1: Instant Browser (Recommended)
No server, no internet, and no Node.js required. Simply double-click:
```
index.html
```
The entire emulator and assembler run locally in Chrome, Edge, Firefox, Brave, or Safari!

### Option 2: Local Server (For Sharing on Wi-Fi / LAN)
Run the zero-dependency Node.js server to share with lab classmates:
```bash
npm start
# Server starts at http://localhost:8086
```

### Option 3: Native App Window on Windows
Double-click `launch.bat` or `Open8086.vbs` to launch as a borderless standalone desktop window.

### Option 4: Deploy Instantly to GitHub Pages
1. Push this repository to GitHub.
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Build and deployment > Source**, choose **GitHub Actions** (a workflow is already included in `.github/workflows/deploy-pages.yml`).
4. Your emulator is instantly live on `https://<username>.github.io/<repo>/`!

---

## 🧪 Preloaded University Lab Experiments (Experiments 1 to 4)

Built-in with full source code, register tracking, and step-by-step documentation for standard microprocessor laboratory coursework:

<details>
<summary><b>View All 20 Preloaded Lab Experiments</b></summary>

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
- **Hello World**: DOS `INT 21h` (AH=09h string output).
</details>

---

## 🧠 Complete 116 Instruction Set Reference

All 116 original 8086 instructions are fully implemented, verified, and browsable directly inside the app:

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

Click the **116 Instruction Reference** tab to search by name or category, inspect operand signatures, view flag influence tables, and insert pre-formatted syntax snippets into the editor with one click.

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

## 🖥️ Virtual Hardware & Subsystems

1. **CPU Engine (`js/cpu.js`)**:
   - 16-bit general registers: `AX`, `BX`, `CX`, `DX`.
   - 8-bit split access: `AH`/`AL`, `BH`/`BL`, `CH`/`CL`, `DH`/`DL`.
   - Pointers & Indexes: `SP`, `BP`, `SI`, `DI`, `IP`.
   - Segment Registers: `CS`, `DS`, `SS`, `ES`.
   - Flags Register (9 active flags): `CF`, `PF`, `AF`, `ZF`, `SF`, `TF`, `IF`, `DF`, `OF`.
   - Full execution history stack for Step Back / Undo.

2. **Memory Subsystem (`js/memory.js`)**:
   - 1 Megabyte physical address space (`Segment * 16 + Offset`).
   - Read & write access tracking for real-time visualization.
   - String buffer reading (`$` terminated strings).

3. **Two-Pass Assembler (`js/assembler.js`)**:
   - Directives: `ORG`, `DB`, `DW`, `DD`, `DUP`, `EQU`, `OFFSET`, `PTR`.
   - Addressing modes: Immediate, Register, Direct (`[num]`), Indirect (`[BX]`, `[SI]`, `[DI]`, `[BP]`), Based Relative (`[BX+si]`, `[BP+di+4]`).
   - Source code to IP line mapping for synchronized cursor stepping.

4. **BIOS / DOS Interrupts (`js/interrupts.js`)**:
   - `INT 21h`: AH=01h (read char), AH=02h (write char), AH=09h (write string), AH=0Ah (buffered input), AH=4Ch (exit).
   - `INT 10h`: AH=00h (set mode), AH=02h (set cursor), AH=06h (clear screen), AH=0Eh (teletype output).
   - `INT 16h`: AH=00h (read keystroke), AH=01h (check keystroke).
   - `INT 20h`: Terminate program.
   - `INT 3`: Breakpoint interrupt.

5. **Virtual DOS Screen (`js/terminal.js`)**:
   - 80x25 character screen with flashing cursor and interactive keyboard buffer.

---

## 🧪 Automated Testing

Run the full automated test suite locally:
```bash
npm test
```

Or run individual test modules:
```bash
npm run test:instructions   # Tests all 116 instructions
npm run test:experiments    # Tests all 20 lab programs
npm run test:correctness    # Verifies array algorithms & math results
npm run test:coverage       # Checks CPU implementation coverage
```

---

## 🤝 Contributing

Contributions, bug reports, and pull requests are welcome!
Please check out [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before getting started.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use, modify, and distribute for educational and commercial purposes.
