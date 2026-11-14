# Contributing to EMU8086 PRO

Thank you for your interest in contributing to **EMU8086 PRO**! Our mission is to provide an open, modern, zero-dependency, and cross-platform alternative to legacy `emu8086` for students, engineers, and educators worldwide.

---

## 🛠️ Development Philosophy

- **Zero External Runtime Dependencies**: The core web app runs in any modern browser directly by opening `index.html`. Do not introduce required npm packages, bundlers, or heavy transpilations for the core runtime.
- **Pure 8086 Fidelity**: Emulate actual 8086 register behaviors, segment arithmetic (`Segment * 16 + Offset`), flags (`CF`, `ZF`, `SF`, `OF`, `PF`, `AF`, `IF`, `DF`), and BIOS/DOS interrupts.
- **Accessible & Educational**: Clear UI indicators, real-time memory & register visualizations, and helpful error messages for university coursework.

---

## 🚀 Getting Started

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/<your-username>/emu8086-pro.git
   cd emu8086-pro
   ```

2. **Run Locally**:
   - Simply double-click `index.html` in your file explorer, OR
   - Run via Node.js server:
     ```bash
     npm start
     # Open http://localhost:8086 in your browser
     ```

3. **Run the Test Suite**:
   ```bash
   npm test
   ```
   This will execute:
   - All 116 instructions verification (`tools/test_all_116_instructions.js`)
   - All 20 syllabus lab experiments (`tools/test_experiments.js`)
   - Algorithmic correctness verification (`tools/verify_correctness.js`)

---

## 📁 Repository Structure

```
emu8086-pro/
├── index.html                 # Main web IDE & emulator interface
├── server.js                  # Zero-dependency local Node.js static server
├── launch.bat                 # Windows standalone app-mode launcher
├── EMU8086-Pro.vbs            # Silent Windows desktop window launcher
├── css/
│   └── style.css              # Dark, Light, Retro XP, and CRT themes
├── js/
│   ├── memory.js              # 1MB 8086 physical memory model
│   ├── cpu.js                 # 8086 CPU execution engine (116 instructions)
│   ├── assembler.js           # Two-pass 8086 assembler & line mapper
│   ├── interrupts.js          # BIOS (INT 10h, 16h) & DOS (INT 21h, 20h)
│   ├── terminal.js            # Virtual DOS screen & keyboard simulation
│   ├── instructions_data.js   # Documentation & flag reference for all 116 ops
│   ├── experiments_data.js    # Preloaded university syllabus lab solutions
│   ├── ui.js                  # UI event handlers, editors, inspectors
│   └── app.js                 # App initialization & keyboard shortcuts
├── tools/
│   ├── test_all_116_instructions.js  # 116 instruction test suite
│   ├── test_experiments.js           # Lab experiment suite
│   ├── verify_correctness.js         # Algorithmic output checker
│   └── check_cpu_coverage.js         # CPU instruction coverage audit
└── .github/
    └── workflows/             # CI and GitHub Pages deployment actions
```

---

## 🧪 Adding or Modifying Instructions

If you are improving instruction behavior:
1. Ensure both 8-bit and 16-bit register/memory variants are supported in [js/cpu.js](js/cpu.js).
2. Ensure flags (`CF`, `ZF`, `SF`, `OF`, `PF`, `AF`) are updated according to standard Intel 8086 specifications.
3. Add a test case snippet to [tools/test_all_116_instructions.js](tools/test_all_116_instructions.js).
4. Run `npm test` and verify that all 116 tests pass with 0 errors.

---

## 🤝 Submitting a Pull Request

1. Create a feature branch:
   ```bash
   git checkout -b feature/my-cool-feature
   ```
2. Make your changes and run `npm test`.
3. Commit with descriptive messages (e.g., `feat: add INT 21h AH=07h direct char input without echo`).
4. Push to your fork and submit a Pull Request.

---

## 📄 License
By contributing to EMU8086 PRO, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
