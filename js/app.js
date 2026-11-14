// Main Application Coordinator for Open8086
class App {
  constructor() {
    this.memory = new Memory();
    this.cpu = new CPU(this.memory);
    this.assembler = new Assembler();
    this.terminal = null;
    this.ui = null;

    this.isRunning = false;
    this.runTimer = null;
    this.stepDelay = 50; // ms
    this.instMap = {};   // IP -> instruction object
  }

  init() {
    // 1. Initialize Terminal
    const termContainer = document.getElementById("terminal-container");
    this.terminal = new Terminal(termContainer);

    // 2. Initialize Interrupts
    const intController = new InterruptController(this.cpu, this.terminal);
    this.cpu.setInterruptController(intController);

    // 3. Initialize UI Controller
    this.ui = new UIController(this.cpu, this.memory, this.assembler, this.terminal);

    // 4. Bind Toolbar & Buttons
    this.bindControls();

    // 5. Load default template or Experiment 1a into Editor
    if (typeof LAB_EXPERIMENTS !== "undefined" && LAB_EXPERIMENTS.length > 0) {
      this.ui.el.editorTextarea.value = LAB_EXPERIMENTS[0].code;
      this.ui.updateEditorLineNumbers();
      this.assembleCurrentCode();
    }

    // 6. Bind global shortcuts
    this.bindShortcuts();

    console.log("Open8086 initialized successfully!");
  }

  assembleCurrentCode() {
    const code = this.ui.el.editorTextarea.value;
    const res = this.assembler.assemble(code);

    const errorContainer = document.getElementById("assembler-errors");
    if (!res.success) {
      this.ui.setStatus(`Assembly Failed: ${res.errors.length} error(s)`, true);
      if (errorContainer) {
        errorContainer.style.display = "block";
        errorContainer.innerHTML = res.errors.map(e => `
          <div class="err-row">
            <span class="err-line">Line ${e.line}:</span> ${e.message}
          </div>
        `).join("");
      }
      return false;
    }

    if (errorContainer) {
      errorContainer.style.display = "none";
      errorContainer.innerHTML = "";
    }

    // Reset CPU & Memory with startIP
    this.pause();
    this.memory.reset();
    this.cpu.reset(res.startIP);

    // Load assembled data into memory
    for (let dw of res.dataWrites) {
      this.memory.loadBuffer(0x0700, dw.offset, dw.bytes);
    }

    // Build fast lookup map for instructions by IP
    this.instMap = {};
    for (let inst of res.instructions) {
      this.instMap[inst.ip] = inst;
    }

    // Update UI panels
    this.ui.renderSymbolTable();
    this.ui.updateAllViews();
    this.ui.setStatus(`Assembled successfully! ${res.instructions.length} instruction(s) ready.`);

    return true;
  }

  step() {
    if (this.cpu.halted) {
      this.pause();
      this.ui.setStatus("CPU Halted. Reset or Assemble to re-run.");
      return false;
    }

    const ip = this.cpu.getReg16("IP");
    const inst = this.instMap[ip];

    if (!inst) {
      this.cpu.halted = true;
      this.pause();
      this.ui.setStatus(`No instruction at IP: 0x${ip.toString(16).toUpperCase()}`);
      return false;
    }

    const res = this.cpu.executeInstruction(inst);
    this.ui.updateAllViews();

    if (res === "WAITING_FOR_INPUT") {
      this.pause();
      this.ui.setStatus("Waiting for console keyboard input...");
      this.cpu.interruptController.inputCallback = () => {
        this.ui.updateAllViews();
        if (this.isRunning) this.run();
      };
      return false;
    }

    if (this.cpu.halted) {
      this.pause();
      this.ui.setStatus("Execution Completed (HLT / INT 20h / INT 21h/4Ch)");
      return false;
    }

    // Check breakpoint on next line
    const nextIP = this.cpu.getReg16("IP");
    const nextLine = this.assembler.lineMap[nextIP];
    if (nextLine && this.cpu.breakpoints.has(nextLine)) {
      this.pause();
      this.ui.setStatus(`Hit Breakpoint at Line ${nextLine}!`);
      return false;
    }

    return true;
  }

  run() {
    if (this.cpu.halted) {
      this.assembleCurrentCode();
    }

    this.isRunning = true;
    this.updateRunButton();
    this.ui.setStatus("Running...");

    const executeCycle = () => {
      if (!this.isRunning) return;

      const continueExec = this.step();
      if (!continueExec) {
        this.pause();
        return;
      }

      if (this.stepDelay === 0) {
        // Fast batch execution (up to 500 instructions per frame)
        let count = 0;
        while (count < 500 && this.isRunning && !this.cpu.halted) {
          const ok = this.step();
          if (!ok) break;
          count++;
        }
        if (this.isRunning && !this.cpu.halted) {
          this.runTimer = requestAnimationFrame(executeCycle);
        }
      } else {
        this.runTimer = setTimeout(executeCycle, this.stepDelay);
      }
    };

    executeCycle();
  }

  pause() {
    this.isRunning = false;
    if (this.runTimer) {
      clearTimeout(this.runTimer);
      cancelAnimationFrame(this.runTimer);
      this.runTimer = null;
    }
    this.updateRunButton();
  }

  stepBack() {
    this.pause();
    if (this.cpu.history.length === 0) {
      this.ui.setStatus("No earlier states in history to undo.");
      return;
    }
    const prevState = this.cpu.history.pop();
    this.cpu.restoreState(prevState);
    this.ui.updateAllViews();
    this.ui.setStatus("Stepped Back (Undo)");
  }

  reset() {
    this.pause();
    this.assembleCurrentCode();
    if (this.terminal) this.terminal.clear();
    this.ui.setStatus("Reset CPU and Memory to initial state.");
  }

  updateRunButton() {
    const btn = document.getElementById("btn-run");
    if (!btn) return;
    if (this.isRunning) {
      btn.innerHTML = `<span class="icon">⏸</span> Pause`;
      btn.classList.add("btn-warning");
    } else {
      btn.innerHTML = `<span class="icon">▶</span> Run`;
      btn.classList.remove("btn-warning");
    }
  }

  bindControls() {
    // Toolbar buttons
    document.getElementById("btn-assemble")?.addEventListener("click", () => this.assembleCurrentCode());
    document.getElementById("btn-run")?.addEventListener("click", () => {
      if (this.isRunning) this.pause();
      else this.run();
    });
    document.getElementById("btn-step")?.addEventListener("click", () => {
      this.pause();
      this.step();
    });
    document.getElementById("btn-step-back")?.addEventListener("click", () => this.stepBack());
    document.getElementById("btn-reset")?.addEventListener("click", () => this.reset());

    // Execution speed slider
    const speedSlider = document.getElementById("speed-slider");
    const speedLabel = document.getElementById("speed-label");
    if (speedSlider) {
      speedSlider.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        this.stepDelay = val;
        if (speedLabel) speedLabel.textContent = val === 0 ? "Max" : `${val}ms`;
      });
    }

    // Register format toggle
    const formatSelect = document.getElementById("reg-format-select");
    if (formatSelect) {
      formatSelect.addEventListener("change", (e) => {
        this.ui.regFormat = e.target.value;
        this.ui.renderRegisters();
      });
    }

    // Memory Jump address input
    const memGoBtn = document.getElementById("btn-mem-go");
    if (memGoBtn && this.ui.el.memAddressInput) {
      memGoBtn.addEventListener("click", () => {
        const text = this.ui.el.memAddressInput.value.trim();
        let seg = 0x0700;
        let offset = 0x0100;

        if (text.includes(":")) {
          const parts = text.split(":");
          seg = parseInt(parts[0], 16) || 0;
          offset = parseInt(parts[1], 16) || 0;
        } else {
          // Check if it's a known symbol
          const sym = this.assembler.symbols[text.toUpperCase()] || this.assembler.labels[text.toUpperCase()];
          if (sym) {
            offset = typeof sym === "object" ? sym.offset : sym;
          } else {
            offset = parseInt(text, 16) || 0;
          }
        }
        this.ui.renderMemory(seg, offset);
      });
    }

    // Memory Quick Jump buttons
    document.getElementById("btn-jump-csip")?.addEventListener("click", () => {
      this.ui.renderMemory(this.cpu.getReg16("CS"), this.cpu.getReg16("IP"));
    });
    document.getElementById("btn-jump-ds")?.addEventListener("click", () => {
      this.ui.renderMemory(this.cpu.getReg16("DS"), 0x0000);
    });
    document.getElementById("btn-jump-sssp")?.addEventListener("click", () => {
      this.ui.renderMemory(this.cpu.getReg16("SS"), this.cpu.getReg16("SP"));
    });

    // Theme selector
    const themeSelect = document.getElementById("theme-select");
    if (themeSelect) {
      themeSelect.addEventListener("change", (e) => {
        document.body.className = `theme-${e.target.value}`;
        localStorage.setItem("emu8086_theme", e.target.value);
      });
      const saved = localStorage.getItem("emu8086_theme") || "dark";
      themeSelect.value = saved;
      document.body.className = `theme-${saved}`;
    }

    // Tabs switching
    const tabBtns = document.querySelectorAll(".tab-btn");
    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        tabBtns.forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-tab");
        const pane = document.getElementById(targetId);
        if (pane) pane.classList.add("active");
      });
    });

    // Instruction Search filter
    if (this.ui.el.instructionSearch) {
      this.ui.el.instructionSearch.addEventListener("input", () => {
        this.ui.renderInstructionReference();
      });
    }

    // Editor input sync & scroll tracking
    if (this.ui.el.editorTextarea) {
      this.ui.el.editorTextarea.addEventListener("input", () => {
        this.ui.updateEditorLineNumbers();
        this.ui.updateHighlightPosition();
      });
      this.ui.el.editorTextarea.addEventListener("scroll", () => {
        if (this.ui.el.lineNumbers) {
          this.ui.el.lineNumbers.scrollTop = this.ui.el.editorTextarea.scrollTop;
        }
        this.ui.updateHighlightPosition();
      });
    }

    // New, Open, Save, Share buttons
    document.getElementById("btn-new")?.addEventListener("click", () => {
      if (confirm("Create new COM template? Any unsaved edits will be cleared.")) {
        this.ui.el.editorTextarea.value = `ORG 100h\n\n; Write your 8086 assembly code here\n\nMOV AX, 1234h\n\nHLT\n`;
        this.ui.updateEditorLineNumbers();
        this.assembleCurrentCode();
      }
    });

    document.getElementById("btn-open")?.addEventListener("click", () => {
      const fileInput = document.getElementById("file-input");
      if (fileInput) fileInput.click();
    });

    document.getElementById("file-input")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          this.ui.el.editorTextarea.value = evt.target.result;
          this.ui.updateEditorLineNumbers();
          this.assembleCurrentCode();
        };
        reader.readAsText(file);
      }
    });

    document.getElementById("btn-save")?.addEventListener("click", () => {
      const blob = new Blob([this.ui.el.editorTextarea.value], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "program.asm";
      a.click();
    });

    document.getElementById("btn-share")?.addEventListener("click", () => {
      const text = this.ui.el.editorTextarea.value;
      navigator.clipboard.writeText(text).then(() => {
        alert("Assembly code copied to clipboard! You can share it directly or distribute the app folder with everyone.");
      });
    });
  }

  bindShortcuts() {
    window.addEventListener("keydown", (e) => {
      // Don't intercept when typing in text inputs (except editor shortcuts)
      if (e.target.tagName === "INPUT" && e.target.type === "text") return;

      if (e.key === "F8") {
        e.preventDefault();
        this.pause();
        this.step();
      } else if (e.key === "F5") {
        e.preventDefault();
        if (this.isRunning) this.pause();
        else this.run();
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        this.assembleCurrentCode();
        this.run();
      } else if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        document.getElementById("btn-save")?.click();
      } else if (e.ctrlKey && e.key === "z" && document.activeElement !== this.ui.el.editorTextarea) {
        e.preventDefault();
        this.stepBack();
      }
    });
  }
}

// Global bootstrap
window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
  window.app.init();
});
