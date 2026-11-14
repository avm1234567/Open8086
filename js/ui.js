// UI Controller for Open8086
class UIController {
  constructor(cpu, memory, assembler, terminal) {
    this.cpu = cpu;
    this.memory = memory;
    this.assembler = assembler;
    this.terminal = terminal;

    this.regFormat = "hex"; // "hex" | "dec" | "signed" | "bin"
    this.memSegment = 0x0700;
    this.memOffset = 0x0100;
    this.memRows = 16;
    this.prevRegs = {};
    this.activeTab = "terminal"; // "terminal" | "instructions" | "labs" | "symbols"
    this.currentExecLine = null;

    this.initDOMReferences();
    this.initPrevRegs();
    this.renderRegisters();
    this.renderFlags();
    this.renderMemory();
    this.renderStack();
    this.renderInstructionReference();
    this.renderLabExperiments();
  }

  initDOMReferences() {
    this.el = {
      editorTextarea: document.getElementById("code-editor"),
      lineNumbers: document.getElementById("line-numbers"),
      editorHighlight: document.getElementById("editor-highlight"),
      regTable: document.getElementById("registers-table"),
      flagsContainer: document.getElementById("flags-container"),
      memHexDump: document.getElementById("memory-hex-dump"),
      memAddressInput: document.getElementById("mem-address-input"),
      stackContainer: document.getElementById("stack-container"),
      statusMsg: document.getElementById("status-message"),
      cycleCounter: document.getElementById("cycle-counter"),
      stepCounter: document.getElementById("step-counter"),
      symbolTableBody: document.getElementById("symbol-table-body"),
      instructionsList: document.getElementById("instructions-list"),
      instructionSearch: document.getElementById("instruction-search"),
      instructionDetail: document.getElementById("instruction-detail"),
      labExpList: document.getElementById("lab-experiments-list"),
      labExpDetail: document.getElementById("lab-experiment-detail")
    };
  }

  initPrevRegs() {
    const list = ["AX", "BX", "CX", "DX", "SI", "DI", "BP", "SP", "IP", "CS", "DS", "SS", "ES"];
    for (let r of list) {
      this.prevRegs[r] = this.cpu.getReg16(r);
    }
  }

  setStatus(msg, isError = false) {
    if (this.el.statusMsg) {
      this.el.statusMsg.textContent = msg;
      this.el.statusMsg.className = isError ? "status-badge error" : "status-badge";
    }
  }

  formatVal(val16, format = this.regFormat, is16 = true) {
    const mask = is16 ? 0xFFFF : 0xFF;
    const v = val16 & mask;

    if (format === "hex") {
      const hexStr = v.toString(16).toUpperCase();
      return (is16 ? hexStr.padStart(4, "0") : hexStr.padStart(2, "0")) + "h";
    } else if (format === "dec") {
      return v.toString(10);
    } else if (format === "signed") {
      const signBit = is16 ? 0x8000 : 0x80;
      const sVal = (v & signBit) ? v - (is16 ? 0x10000 : 0x100) : v;
      return sVal.toString(10);
    } else if (format === "bin") {
      return v.toString(2).padStart(is16 ? 16 : 8, "0") + "b";
    }
    return v.toString(16).toUpperCase() + "h";
  }

  // --- Render Registers ---
  renderRegisters() {
    if (!this.el.regTable) return;

    const generalRegs = [
      { name: "AX", high: "AH", low: "AL" },
      { name: "BX", high: "BH", low: "BL" },
      { name: "CX", high: "CH", low: "CL" },
      { name: "DX", high: "DH", low: "DL" }
    ];

    const pointerRegs = ["SI", "DI", "BP", "SP", "IP"];
    const segRegs = ["CS", "DS", "SS", "ES"];

    let html = `
      <div class="reg-section">
        <div class="reg-section-title">General Registers</div>
        <div class="reg-grid general-grid">
    `;

    for (let g of generalRegs) {
      const val16 = this.cpu.getReg16(g.name);
      const valH = this.cpu.getReg8(g.high);
      const valL = this.cpu.getReg8(g.low);
      const changed = this.prevRegs[g.name] !== val16;

      html += `
        <div class="reg-card ${changed ? 'reg-changed' : ''}">
          <div class="reg-header">
            <span class="reg-name" title="Click to edit ${g.name}" data-reg="${g.name}">${g.name}</span>
            <span class="reg-val-16 editable-reg" data-reg="${g.name}">${this.formatVal(val16, this.regFormat, true)}</span>
          </div>
          <div class="reg-sub-bytes">
            <div class="reg-byte" title="High byte: ${g.high}">
              <span class="sub-name">${g.high}</span>
              <span class="sub-val editable-reg" data-reg="${g.high}">${this.formatVal(valH, this.regFormat, false)}</span>
            </div>
            <div class="reg-byte" title="Low byte: ${g.low}">
              <span class="sub-name">${g.low}</span>
              <span class="sub-val editable-reg" data-reg="${g.low}">${this.formatVal(valL, this.regFormat, false)}</span>
            </div>
          </div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
      <div class="reg-section">
        <div class="reg-section-title">Pointers & Indexes</div>
        <div class="reg-grid pointer-grid">
    `;

    for (let p of pointerRegs) {
      const val = this.cpu.getReg16(p);
      const changed = this.prevRegs[p] !== val;
      html += `
        <div class="reg-pill ${changed ? 'reg-changed' : ''}">
          <span class="reg-name">${p}:</span>
          <span class="reg-val editable-reg" data-reg="${p}">${this.formatVal(val, this.regFormat, true)}</span>
        </div>
      `;
    }

    html += `
        </div>
      </div>
      <div class="reg-section">
        <div class="reg-section-title">Segment Registers</div>
        <div class="reg-grid seg-grid">
    `;

    for (let s of segRegs) {
      const val = this.cpu.getReg16(s);
      const changed = this.prevRegs[s] !== val;
      html += `
        <div class="reg-pill seg-pill ${changed ? 'reg-changed' : ''}">
          <span class="reg-name">${s}:</span>
          <span class="reg-val editable-reg" data-reg="${s}">${this.formatVal(val, this.regFormat, true)}</span>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    this.el.regTable.innerHTML = html;

    // Attach click-to-edit on registers
    const editables = this.el.regTable.querySelectorAll(".editable-reg");
    editables.forEach(elem => {
      elem.addEventListener("click", () => {
        const reg = elem.getAttribute("data-reg");
        const currentVal = (this.cpu.isReg8(reg) ? this.cpu.getReg8(reg) : this.cpu.getReg16(reg)).toString(16).toUpperCase();
        const input = prompt(`Enter new hex value for ${reg}:`, currentVal);
        if (input !== null) {
          const num = parseInt(input, 16);
          if (!isNaN(num)) {
            if (this.cpu.isReg8(reg)) {
              this.cpu.setReg8(reg, num);
            } else {
              this.cpu.setReg16(reg, num);
            }
            this.updateAllViews();
          }
        }
      });
    });

    // Update prevRegs
    const allRegs = ["AX", "BX", "CX", "DX", "SI", "DI", "BP", "SP", "IP", "CS", "DS", "SS", "ES"];
    for (let r of allRegs) this.prevRegs[r] = this.cpu.getReg16(r);
  }

  // --- Render Flags ---
  renderFlags() {
    if (!this.el.flagsContainer) return;

    const flagsList = [
      { id: "CF", name: "Carry (CF)", desc: "Set when arithmetic generates an unsigned carry or borrow" },
      { id: "ZF", name: "Zero (ZF)", desc: "Set when result is equal to zero" },
      { id: "SF", name: "Sign (SF)", desc: "Set when result is negative (MSB = 1)" },
      { id: "OF", name: "Overflow (OF)", desc: "Set when signed arithmetic overflow occurs" },
      { id: "PF", name: "Parity (PF)", desc: "Set when lower 8 bits have even number of 1s" },
      { id: "AF", name: "Aux Carry (AF)", desc: "Set when carry occurs from bit 3 to bit 4 (BCD)" },
      { id: "TF", name: "Trap (TF)", desc: "Trap / Single-step flag for hardware debuggers (INT 1)" },
      { id: "IF", name: "Interrupt (IF)", desc: "Interrupt enable flag (STI / CLI)" },
      { id: "DF", name: "Direction (DF)", desc: "0 = auto-increment (CLD), 1 = auto-decrement (STD)" }
    ];

    let html = "";
    for (let f of flagsList) {
      const val = this.cpu.getFlag(f.id);
      html += `
        <div class="flag-badge ${val ? 'active' : 'inactive'}" data-flag="${f.id}" title="${f.desc}">
          <span class="flag-label">${f.id}</span>
          <span class="flag-state">${val}</span>
        </div>
      `;
    }

    this.el.flagsContainer.innerHTML = html;

    // Click to toggle flag
    const badges = this.el.flagsContainer.querySelectorAll(".flag-badge");
    badges.forEach(b => {
      b.addEventListener("click", () => {
        const flag = b.getAttribute("data-flag");
        const current = this.cpu.getFlag(flag);
        this.cpu.setFlag(flag, 1 - current);
        this.renderFlags();
      });
    });
  }

  // --- Render Memory Hex Dump ---
  renderMemory(seg = this.memSegment, offset = this.memOffset) {
    if (!this.el.memHexDump) return;
    this.memSegment = seg & 0xFFFF;
    this.memOffset = offset & 0xFFFF;

    if (this.el.memAddressInput) {
      this.el.memAddressInput.value = `${this.memSegment.toString(16).toUpperCase().padStart(4, "0")}:${this.memOffset.toString(16).toUpperCase().padStart(4, "0")}`;
    }

    let html = `
      <table class="hex-table">
        <thead>
          <tr>
            <th class="col-addr">Address</th>
            ${[...Array(16).keys()].map(i => `<th class="col-hex">${i.toString(16).toUpperCase().padStart(2, "0")}</th>`).join("")}
            <th class="col-ascii">ASCII</th>
          </tr>
        </thead>
        <tbody>
    `;

    const startPhys = this.memory.toPhysical(this.memSegment, this.memOffset);
    const reads = this.memory.lastReads;
    const writes = this.memory.lastWrites;

    for (let r = 0; r < this.memRows; r++) {
      const rowOffset = (this.memOffset + r * 16) & 0xFFFF;
      const rowPhys = (startPhys + r * 16) & 0xFFFFF;
      const addrStr = `${this.memSegment.toString(16).toUpperCase().padStart(4, "0")}:${rowOffset.toString(16).toUpperCase().padStart(4, "0")}`;

      let hexCells = "";
      let asciiCells = "";

      for (let c = 0; c < 16; c++) {
        const p = (rowPhys + c) & 0xFFFFF;
        const b = this.memory.ram[p];
        let cellClass = "hex-byte";
        if (writes.has(p)) cellClass += " cell-write";
        else if (reads.has(p)) cellClass += " cell-read";

        hexCells += `<td class="${cellClass} editable-mem" data-phys="${p}" title="Physical Addr: 0x${p.toString(16).toUpperCase()}">${b.toString(16).toUpperCase().padStart(2, "0")}</td>`;

        const asciiChar = (b >= 32 && b <= 126) ? String.fromCharCode(b) : ".";
        asciiCells += `<span class="${writes.has(p) ? 'ascii-write' : ''}">${this.escapeHtml(asciiChar)}</span>`;
      }

      html += `
        <tr>
          <td class="addr-label">${addrStr}</td>
          ${hexCells}
          <td class="ascii-col">${asciiCells}</td>
        </tr>
      `;
    }

    html += `</tbody></table>`;
    this.el.memHexDump.innerHTML = html;

    // Double-click to edit byte
    const memCells = this.el.memHexDump.querySelectorAll(".editable-mem");
    memCells.forEach(cell => {
      cell.addEventListener("dblclick", () => {
        const p = parseInt(cell.getAttribute("data-phys"), 10);
        const currHex = this.memory.ram[p].toString(16).toUpperCase().padStart(2, "0");
        const valStr = prompt(`Edit byte at physical address 0x${p.toString(16).toUpperCase()}:`, currHex);
        if (valStr !== null) {
          const val = parseInt(valStr, 16);
          if (!isNaN(val)) {
            this.memory.writeByte(p, val & 0xFF);
            this.renderMemory();
          }
        }
      });
    });
  }

  // --- Render Stack View ---
  renderStack() {
    if (!this.el.stackContainer) return;

    const ss = this.cpu.getReg16("SS");
    const sp = this.cpu.getReg16("SP");
    const bp = this.cpu.getReg16("BP");

    let html = `<div class="stack-list">`;
    // Show 8 words around SP
    for (let i = -2; i < 8; i++) {
      const curOffset = (sp + i * 2) & 0xFFFF;
      const wordVal = this.memory.readWordSeg(ss, curOffset);
      const isSP = (curOffset === sp);
      const isBP = (curOffset === bp);

      html += `
        <div class="stack-item ${isSP ? 'stack-top' : ''}">
          <div class="stack-addr">${ss.toString(16).toUpperCase().padStart(4, "0")}:${curOffset.toString(16).toUpperCase().padStart(4, "0")}</div>
          <div class="stack-val">${wordVal.toString(16).toUpperCase().padStart(4, "0")}h (${wordVal})</div>
          <div class="stack-ptr-badge">
            ${isSP ? '<span class="badge-sp">SP</span>' : ''}
            ${isBP ? '<span class="badge-bp">BP</span>' : ''}
          </div>
        </div>
      `;
    }
    html += `</div>`;
    this.el.stackContainer.innerHTML = html;
  }

  // --- Render Instruction Reference ---
  renderInstructionReference() {
    if (!this.el.instructionsList || typeof INSTRUCTION_SET === "undefined") return;

    const query = this.el.instructionSearch ? this.el.instructionSearch.value.trim().toUpperCase() : "";
    const keys = Object.keys(INSTRUCTION_SET).sort();

    let listHtml = "";
    for (let k of keys) {
      const item = INSTRUCTION_SET[k];
      if (query && !item.name.includes(query) && !item.description.toUpperCase().includes(query)) {
        continue;
      }
      listHtml += `
        <div class="inst-item" data-inst="${item.name}">
          <span class="inst-name">${item.name}</span>
          <span class="inst-cat">${item.category}</span>
        </div>
      `;
    }

    this.el.instructionsList.innerHTML = listHtml;

    // Attach click handler to load details
    const items = this.el.instructionsList.querySelectorAll(".inst-item");
    items.forEach(it => {
      it.addEventListener("click", () => {
        items.forEach(x => x.classList.remove("active"));
        it.classList.add("active");
        this.showInstructionDetail(it.getAttribute("data-inst"));
      });
    });

    if (keys.length > 0 && !this.el.instructionsList.querySelector(".inst-item.active")) {
      const first = this.el.instructionsList.querySelector(".inst-item");
      if (first) first.click();
    }
  }

  showInstructionDetail(name) {
    if (!this.el.instructionDetail || typeof INSTRUCTION_SET === "undefined") return;
    const item = INSTRUCTION_SET[name];
    if (!item) return;

    const flagsHtml = Object.keys(item.flags).length > 0
      ? `<div class="inst-flags-table">
          ${Object.entries(item.flags).map(([k, v]) => `<div class="inst-flag-cell"><b>${k}:</b> ${v}</div>`).join("")}
        </div>`
      : `<span>None</span>`;

    this.el.instructionDetail.innerHTML = `
      <div class="inst-card">
        <div class="inst-card-header">
          <h3>${item.name}</h3>
          <span class="badge-category">${item.category}</span>
        </div>
        <div class="inst-field">
          <label>Operands:</label>
          <pre class="inst-operands">${this.escapeHtml(item.operands)}</pre>
        </div>
        <div class="inst-field">
          <label>Description:</label>
          <div class="inst-desc">${this.escapeHtml(item.description)}</div>
        </div>
        <div class="inst-field">
          <label>Flags Affected:</label>
          ${flagsHtml}
        </div>
        ${item.example ? `
          <div class="inst-field">
            <label>Example Code:</label>
            <pre class="inst-example"><code>${this.escapeHtml(item.example)}</code></pre>
            <button class="btn-insert-code" data-code="${this.escapeHtml(item.example)}">Insert into Editor</button>
          </div>
        ` : ''}
      </div>
    `;

    const insertBtn = this.el.instructionDetail.querySelector(".btn-insert-code");
    if (insertBtn) {
      insertBtn.addEventListener("click", () => {
        const code = insertBtn.getAttribute("data-code");
        if (this.el.editorTextarea) {
          this.el.editorTextarea.value += "\n\n" + code;
          this.updateEditorLineNumbers();
        }
      });
    }
  }

  // --- Render Lab Experiments ---
  renderLabExperiments() {
    if (!this.el.labExpList || typeof LAB_EXPERIMENTS === "undefined") return;

    let html = "";
    let lastCat = "";

    for (let exp of LAB_EXPERIMENTS) {
      if (exp.category !== lastCat) {
        lastCat = exp.category;
        html += `<div class="lab-cat-header">${lastCat}</div>`;
      }
      html += `
        <div class="lab-item" data-id="${exp.id}">
          <span class="lab-item-title">${exp.title}</span>
        </div>
      `;
    }

    this.el.labExpList.innerHTML = html;

    const items = this.el.labExpList.querySelectorAll(".lab-item");
    items.forEach(it => {
      it.addEventListener("click", () => {
        items.forEach(x => x.classList.remove("active"));
        it.classList.add("active");
        this.showLabExperimentDetail(it.getAttribute("data-id"));
      });
    });

    if (items.length > 0) items[0].click();
  }

  showLabExperimentDetail(id) {
    if (!this.el.labExpDetail || typeof LAB_EXPERIMENTS === "undefined") return;
    const exp = LAB_EXPERIMENTS.find(e => e.id === id);
    if (!exp) return;

    this.el.labExpDetail.innerHTML = `
      <div class="lab-detail-card">
        <h3>${exp.title}</h3>
        <p class="lab-desc">${this.escapeHtml(exp.description)}</p>
        <div class="lab-actions">
          <button id="btn-load-lab-code" class="btn btn-primary">⚡ Load into Editor & Assemble</button>
        </div>
        <pre class="lab-code-preview"><code>${this.escapeHtml(exp.code)}</code></pre>
      </div>
    `;

    const loadBtn = document.getElementById("btn-load-lab-code");
    if (loadBtn) {
      loadBtn.addEventListener("click", () => {
        if (this.el.editorTextarea) {
          this.el.editorTextarea.value = exp.code;
          this.updateEditorLineNumbers();
          // Trigger assemble
          if (window.app) window.app.assembleCurrentCode();
        }
      });
    }
  }

  // --- Render Symbol Table ---
  renderSymbolTable() {
    if (!this.el.symbolTableBody) return;
    const syms = this.assembler.symbols;
    const labels = this.assembler.labels;

    let html = "";
    for (let k in syms) {
      const s = syms[k];
      html += `
        <tr>
          <td><b class="sym-name" data-offset="${s.offset}">${s.name}</b></td>
          <td><span class="badge-type">${s.type}</span></td>
          <td>0x${s.offset.toString(16).toUpperCase().padStart(4, "0")}</td>
          <td>${s.totalBytes} byte(s)</td>
          <td>Line ${s.line}</td>
        </tr>
      `;
    }

    for (let l in labels) {
      const offset = labels[l];
      html += `
        <tr>
          <td><b class="sym-label" data-offset="${offset}">${l}:</b></td>
          <td><span class="badge-type label-type">LABEL</span></td>
          <td>0x${offset.toString(16).toUpperCase().padStart(4, "0")}</td>
          <td>-</td>
          <td>-</td>
        </tr>
      `;
    }

    this.el.symbolTableBody.innerHTML = html || `<tr><td colspan="5" class="empty-table">No symbols or variables declared</td></tr>`;

    // Click symbol to jump memory view
    const symLinks = this.el.symbolTableBody.querySelectorAll(".sym-name, .sym-label");
    symLinks.forEach(elem => {
      elem.addEventListener("click", () => {
        const offset = parseInt(elem.getAttribute("data-offset"), 10);
        this.renderMemory(this.cpu.getReg16("DS"), offset);
      });
    });
  }

  // --- Editor Line Highlighting & Numbers ---
  updateEditorLineNumbers() {
    if (!this.el.editorTextarea || !this.el.lineNumbers) return;
    const lines = this.el.editorTextarea.value.split("\n");
    const count = lines.length;

    let html = "";
    for (let i = 1; i <= count; i++) {
      const isBp = this.cpu.breakpoints.has(i);
      const isCurrent = (this.currentExecLine === i);
      html += `
        <div class="line-num ${isBp ? 'has-breakpoint' : ''} ${isCurrent ? 'executing-line' : ''}" data-line="${i}">
          <span class="bp-dot"></span>
          <span class="num-text">${i}</span>
        </div>
      `;
    }
    this.el.lineNumbers.innerHTML = html;

    // Click gutter to toggle breakpoint
    const numEls = this.el.lineNumbers.querySelectorAll(".line-num");
    numEls.forEach(el => {
      el.addEventListener("click", () => {
        const line = parseInt(el.getAttribute("data-line"), 10);
        if (this.cpu.breakpoints.has(line)) {
          this.cpu.breakpoints.delete(line);
        } else {
          this.cpu.breakpoints.add(line);
        }
        this.updateEditorLineNumbers();
      });
    });
  }

  updateHighlightPosition() {
    if (!this.el.editorHighlight || !this.el.editorTextarea) return;
    const lineNum = this.currentExecLine;

    // Update gutter indicator
    const lineEls = this.el.lineNumbers ? this.el.lineNumbers.querySelectorAll(".line-num") : [];
    lineEls.forEach(el => {
      const l = parseInt(el.getAttribute("data-line"), 10);
      if (l === lineNum) {
        el.classList.add("executing-line");
      } else {
        el.classList.remove("executing-line");
      }
    });

    if (!lineNum || lineNum < 1) {
      this.el.editorHighlight.style.display = "none";
      return;
    }

    const lineHeight = 22; // Must match CSS line-height
    const paddingTop = 10; // Must match CSS padding-top
    const scrollTop = this.el.editorTextarea.scrollTop;
    const topOffset = paddingTop + (lineNum - 1) * lineHeight - scrollTop;
    const editorHeight = this.el.editorTextarea.clientHeight;

    // Check if line is within visible viewport of textarea
    if (topOffset < paddingTop - lineHeight || topOffset > editorHeight) {
      this.el.editorHighlight.style.display = "none";
    } else {
      this.el.editorHighlight.style.display = "block";
      this.el.editorHighlight.style.top = `${topOffset}px`;
      this.el.editorHighlight.style.height = `${lineHeight}px`;
      this.el.editorHighlight.innerHTML = ""; // Clean translucent background highlight, no text blocking code!
    }
  }

  highlightExecutionLine(lineNum, autoScroll = true) {
    this.currentExecLine = lineNum;
    if (!lineNum || lineNum < 1) {
      this.updateHighlightPosition();
      return;
    }

    const lineHeight = 22;
    const paddingTop = 10;
    const targetTop = paddingTop + (lineNum - 1) * lineHeight;

    if (autoScroll && this.el.editorTextarea) {
      const scrollTop = this.el.editorTextarea.scrollTop;
      const clientHeight = this.el.editorTextarea.clientHeight;
      if (targetTop < scrollTop + 30 || targetTop > scrollTop + clientHeight - 50) {
        this.el.editorTextarea.scrollTop = Math.max(0, targetTop - Math.floor(clientHeight / 3));
      }
    }

    this.updateHighlightPosition();
  }

  updateAllViews() {
    this.renderRegisters();
    this.renderFlags();
    this.renderMemory();
    this.renderStack();

    if (this.el.cycleCounter) this.el.cycleCounter.textContent = this.cpu.cycleCount;
    if (this.el.stepCounter) this.el.stepCounter.textContent = this.cpu.stepCount;

    // Highlight current line
    const ip = this.cpu.getReg16("IP");
    const line = this.assembler.lineMap[ip];
    this.highlightExecutionLine(line);
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

if (typeof module !== "undefined") {
  module.exports = UIController;
}
