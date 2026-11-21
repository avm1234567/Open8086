# Contributing to Open8086

Thank you for your interest in contributing to Open8086. This project aims to provide a clean, zero-dependency, open-source 8086 emulator, assembler, and educational lab environment.

---

## Development Philosophy

- **Zero External Runtime Dependencies**: The core web app runs directly in any modern browser by opening `index.html`. Do not introduce npm runtime dependencies, build toolchains, or transpilations for the core application.
- **Intel 8086 Fidelity**: Accurately emulate standard 8086 register behaviors, segmentation rules (`Segment * 16 + Offset`), status/control flags (`CF`, `PF`, `AF`, `ZF`, `SF`, `TF`, `IF`, `DF`, `OF`), and BIOS/DOS interrupts.
- **Educational Accessibility**: Prioritize clear visual feedback, accurate syntax errors, and detailed runtime introspection to support computer architecture students and educators.

---

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/avm1234567/Open8086.git
   cd Open8086
   ```

2. **Run locally**:
   - Open `index.html` directly in any web browser, or
   - Start the local HTTP server:
     ```bash
     npm start
     # Opens http://localhost:8086
     ```

3. **Run the test suite**:
   ```bash
   npm test
   ```
   This executes:
   - Full 116 instruction verification (`tools/test_all_116_instructions.js`)
   - 20 preloaded lab experiments (`tools/test_experiments.js`)
   - Algorithmic output verification (`tools/verify_correctness.js`)
   - Edge-case and operand audit suite (`tools/deep_audit.js`)
   - Reference search relevance check (`tools/test_search.js`)

---

## Repository Structure

```text
Open8086/
├── index.html                 # Main web IDE and emulator interface
├── server.js                  # Local Node.js static server
├── launch.bat                 # Windows desktop window launcher
├── Open8086.vbs               # Silent Windows application launcher
├── css/
│   └── style.css              # Dark, Light, Retro XP, and CRT theme styles
├── js/
│   ├── memory.js              # 1MB 8086 physical memory model and access tracking
│   ├── cpu.js                 # 8086 CPU execution core (116 instructions)
│   ├── assembler.js           # Two-pass assembler, line mapper, and syntax validator
│   ├── interrupts.js          # BIOS (INT 10h, 16h) and DOS (INT 21h, 20h) handlers
│   ├── terminal.js            # 80x25 character grid terminal and input buffer
│   ├── instructions_data.js   # Documentation and flag data for all 116 instructions
│   ├── experiments_data.js    # Preloaded university lab experiment solutions
│   ├── ui.js                  # UI event handlers, inspectors, and theme controls
│   └── app.js                 # Application lifecycle and keyboard shortcuts
├── tools/
│   ├── test_all_116_instructions.js  # Automated instruction test suite
│   ├── test_experiments.js           # Lab experiment execution tests
│   ├── verify_correctness.js         # Algorithmic output verification
│   ├── deep_audit.js                 # Operand rules and edge case suite
│   └── test_search.js                # Search relevance verification
└── vercel.json                # Vercel static deployment configuration
```

---

## Modifying Instructions or Assembler Rules

When contributing changes to instruction execution or assembly rules:
1. Support both 8-bit and 16-bit operand forms where applicable.
2. Ensure flags (`CF`, `ZF`, `SF`, `OF`, `PF`, `AF`) match standard Intel 8086 behavior.
3. Validate operand addressing modes (e.g. ensure instructions like `MUL`, `DIV`, `INC`, and `DEC` reject immediate operands).
4. Add or update test cases in `tools/` and verify that `npm test` passes with zero failures.

---

## Submitting Pull Requests

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit changes with clear, descriptive commit messages adhering to standard conventions:
   ```bash
   git commit -m "fix(assembler): enforce register or memory operands for MUL"
   ```
3. Verify all tests pass locally:
   ```bash
   npm test
   ```
4. Push to your branch and open a Pull Request.

---

## License

By contributing to Open8086, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
