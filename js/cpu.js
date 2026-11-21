// 8086 CPU Core Emulation Engine
class CPU {
  constructor(memory) {
    this.memory = memory;
    this.interruptController = null;

    // 16-bit Registers
    this.regs = {
      AX: 0, BX: 0, CX: 0, DX: 0,
      SI: 0, DI: 0, BP: 0, SP: 0xFFFE,
      IP: 0x0100,
      CS: 0x0700, DS: 0x0700, SS: 0x0700, ES: 0x0700
    };

    // Flags: CF, PF, AF, ZF, SF, TF, IF, DF, OF
    this.flags = {
      CF: 0, PF: 0, AF: 0, ZF: 0,
      SF: 0, TF: 0, IF: 1, DF: 0, OF: 0
    };

    this.halted = false;
    this.isPaused = false;
    this.stepCount = 0;
    this.cycleCount = 0;

    // Execution history for Step Back (Undo step)
    this.history = [];
    this.maxHistory = 100;

    // Memory write tracking for Step Back (Undo)
    this.currentStepMemWrites = [];
    this.isRecordingMem = true;
    if (this.memory) {
      this.memory.onWrite = (addr, oldVal) => {
        if (this.isRecordingMem) {
          this.currentStepMemWrites.push({ addr, oldVal });
        }
      };
    }

    // Breakpoints set of source line numbers
    this.breakpoints = new Set();
  }

  setInterruptController(ctrl) {
    this.interruptController = ctrl;
  }

  reset(defaultIP = 0x0100, defaultCS = 0x0700) {
    this.regs.AX = 0;
    this.regs.BX = 0;
    this.regs.CX = 0;
    this.regs.DX = 0;
    this.regs.SI = 0;
    this.regs.DI = 0;
    this.regs.BP = 0;
    this.regs.SP = 0xFFFE;
    this.regs.IP = defaultIP;
    this.regs.CS = defaultCS;
    this.regs.DS = defaultCS;
    this.regs.SS = defaultCS;
    this.regs.ES = defaultCS;

    this.flags = {
      CF: 0, PF: 0, AF: 0, ZF: 0,
      SF: 0, TF: 0, IF: 1, DF: 0, OF: 0
    };

    this.halted = false;
    this.isPaused = false;
    this.stepCount = 0;
    this.cycleCount = 0;
    this.history = [];
    this.currentStepMemWrites = [];
    this.memory.clearAccessTracking();
  }

  // Snapshot CPU state for Undo / Step Back
  saveState() {
    return {
      regs: { ...this.regs },
      flags: { ...this.flags },
      halted: this.halted,
      stepCount: this.stepCount,
      cycleCount: this.cycleCount,
      memWrites: []
    };
  }

  restoreState(state) {
    this.regs = { ...state.regs };
    this.flags = { ...state.flags };
    this.halted = state.halted;
    this.stepCount = state.stepCount;
    this.cycleCount = state.cycleCount;

    // Undo memory writes performed during this step (in reverse order)
    if (state.memWrites && state.memWrites.length > 0 && this.memory) {
      this.isRecordingMem = false;
      for (let i = state.memWrites.length - 1; i >= 0; i--) {
        const w = state.memWrites[i];
        this.memory.ram[w.addr] = w.oldVal;
      }
      this.isRecordingMem = true;
    }
  }

  // --- Register Accessors ---
  getReg16(name) {
    return this.regs[name.toUpperCase()] & 0xFFFF;
  }

  setReg16(name, val) {
    this.regs[name.toUpperCase()] = val & 0xFFFF;
  }

  getReg8(name) {
    const reg = name.toUpperCase();
    switch (reg) {
      case "AL": return this.regs.AX & 0xFF;
      case "AH": return (this.regs.AX >> 8) & 0xFF;
      case "BL": return this.regs.BX & 0xFF;
      case "BH": return (this.regs.BX >> 8) & 0xFF;
      case "CL": return this.regs.CX & 0xFF;
      case "CH": return (this.regs.CX >> 8) & 0xFF;
      case "DL": return this.regs.DX & 0xFF;
      case "DH": return (this.regs.DX >> 8) & 0xFF;
      default: return 0;
    }
  }

  setReg8(name, val) {
    const v = val & 0xFF;
    const reg = name.toUpperCase();
    switch (reg) {
      case "AL": this.regs.AX = (this.regs.AX & 0xFF00) | v; break;
      case "AH": this.regs.AX = (this.regs.AX & 0x00FF) | (v << 8); break;
      case "BL": this.regs.BX = (this.regs.BX & 0xFF00) | v; break;
      case "BH": this.regs.BX = (this.regs.BX & 0x00FF) | (v << 8); break;
      case "CL": this.regs.CX = (this.regs.CX & 0xFF00) | v; break;
      case "CH": this.regs.CX = (this.regs.CX & 0x00FF) | (v << 8); break;
      case "DL": this.regs.DX = (this.regs.DX & 0xFF00) | v; break;
      case "DH": this.regs.DX = (this.regs.DX & 0x00FF) | (v << 8); break;
    }
  }

  isReg16(name) {
    return ["AX", "BX", "CX", "DX", "SI", "DI", "BP", "SP", "CS", "DS", "SS", "ES", "IP"].includes(name.toUpperCase());
  }

  isReg8(name) {
    return ["AL", "AH", "BL", "BH", "CL", "CH", "DL", "DH"].includes(name.toUpperCase());
  }

  isSegReg(name) {
    return ["CS", "DS", "SS", "ES"].includes(name.toUpperCase());
  }

  getFlag(name) {
    return this.flags[name.toUpperCase()] ? 1 : 0;
  }

  setFlag(name, val) {
    this.flags[name.toUpperCase()] = val ? 1 : 0;
  }

  getFlagsRegister() {
    let f = 0x0002; // Bit 1 is always 1
    if (this.flags.CF) f |= 0x0001;
    if (this.flags.PF) f |= 0x0004;
    if (this.flags.AF) f |= 0x0010;
    if (this.flags.ZF) f |= 0x0040;
    if (this.flags.SF) f |= 0x0080;
    if (this.flags.TF) f |= 0x0100;
    if (this.flags.IF) f |= 0x0200;
    if (this.flags.DF) f |= 0x0400;
    if (this.flags.OF) f |= 0x0800;
    return f;
  }

  setFlagsRegister(val) {
    this.flags.CF = (val & 0x0001) ? 1 : 0;
    this.flags.PF = (val & 0x0004) ? 1 : 0;
    this.flags.AF = (val & 0x0010) ? 1 : 0;
    this.flags.ZF = (val & 0x0040) ? 1 : 0;
    this.flags.SF = (val & 0x0080) ? 1 : 0;
    this.flags.TF = (val & 0x0100) ? 1 : 0;
    this.flags.IF = (val & 0x0200) ? 1 : 0;
    this.flags.DF = (val & 0x0400) ? 1 : 0;
    this.flags.OF = (val & 0x0800) ? 1 : 0;
  }

  // --- Stack Operations ---
  push(val16) {
    this.regs.SP = (this.regs.SP - 2) & 0xFFFF;
    this.memory.writeWordSeg(this.regs.SS, this.regs.SP, val16);
  }

  pop() {
    const val = this.memory.readWordSeg(this.regs.SS, this.regs.SP);
    this.regs.SP = (this.regs.SP + 2) & 0xFFFF;
    return val;
  }

  // --- Flag Helpers ---
  calcParity(val8) {
    let p = 0;
    let v = val8 & 0xFF;
    while (v > 0) {
      if (v & 1) p++;
      v >>= 1;
    }
    return (p % 2 === 0) ? 1 : 0;
  }

  updateAddFlags(res, op1, op2, is16Bit = false, carry = 0) {
    const mask = is16Bit ? 0xFFFF : 0xFF;
    const signBit = is16Bit ? 0x8000 : 0x80;
    const carryBit = is16Bit ? 0x10000 : 0x100;

    const r = res & mask;
    this.flags.CF = (res >= carryBit || res < 0) ? 1 : 0;
    this.flags.ZF = (r === 0) ? 1 : 0;
    this.flags.SF = (r & signBit) ? 1 : 0;
    this.flags.PF = this.calcParity(r & 0xFF);
    this.flags.AF = (((op1 ^ op2 ^ res) & 0x10) !== 0) ? 1 : 0;

    // Signed overflow: s1 + s2 + carry outside valid signed range
    const s1 = is16Bit ? (op1 & 0x8000 ? op1 - 0x10000 : op1) : (op1 & 0x80 ? op1 - 0x100 : op1);
    const s2 = is16Bit ? (op2 & 0x8000 ? op2 - 0x10000 : op2) : (op2 & 0x80 ? op2 - 0x100 : op2);
    const sSum = s1 + s2 + carry;
    const minVal = is16Bit ? -32768 : -128;
    const maxVal = is16Bit ? 32767 : 127;
    this.flags.OF = (sSum < minVal || sSum > maxVal) ? 1 : 0;

    return r;
  }

  updateSubFlags(op1, op2, is16Bit = false, borrow = 0) {
    const mask = is16Bit ? 0xFFFF : 0xFF;
    const signBit = is16Bit ? 0x8000 : 0x80;

    const diff = op1 - op2 - borrow;
    const r = diff & mask;

    this.flags.CF = (op1 < (op2 + borrow)) ? 1 : 0;
    this.flags.ZF = (r === 0) ? 1 : 0;
    this.flags.SF = (r & signBit) ? 1 : 0;
    this.flags.PF = this.calcParity(r & 0xFF);
    this.flags.AF = (((op1 ^ op2 ^ diff) & 0x10) !== 0) ? 1 : 0;

    // Signed overflow: s1 - s2 - borrow outside valid signed range
    const s1 = is16Bit ? (op1 & 0x8000 ? op1 - 0x10000 : op1) : (op1 & 0x80 ? op1 - 0x100 : op1);
    const s2 = is16Bit ? (op2 & 0x8000 ? op2 - 0x10000 : op2) : (op2 & 0x80 ? op2 - 0x100 : op2);
    const sDiff = s1 - s2 - borrow;
    const minVal = is16Bit ? -32768 : -128;
    const maxVal = is16Bit ? 32767 : 127;
    this.flags.OF = (sDiff < minVal || sDiff > maxVal) ? 1 : 0;

    return r;
  }

  updateLogicFlags(res, is16Bit = false) {
    const mask = is16Bit ? 0xFFFF : 0xFF;
    const signBit = is16Bit ? 0x8000 : 0x80;
    const r = res & mask;

    this.flags.CF = 0;
    this.flags.OF = 0;
    this.flags.ZF = (r === 0) ? 1 : 0;
    this.flags.SF = (r & signBit) ? 1 : 0;
    this.flags.PF = this.calcParity(r & 0xFF);
    this.flags.AF = 0; // Undefined on logic, typically 0

    return r;
  }

  // --- Operand Evaluation & Assignment ---
  // Resolves an operand object into its current value
  evalOperand(op, defaultSize = 2) {
    if (op.type === "reg") {
      if (this.isReg16(op.name)) {
        return { val: this.getReg16(op.name), size: 2 };
      } else {
        return { val: this.getReg8(op.name), size: 1 };
      }
    } else if (op.type === "imm") {
      return { val: op.val, size: op.size || defaultSize };
    } else if (op.type === "mem") {
      const seg = op.seg ? this.getReg16(op.seg) : (op.isStack ? this.getReg16("SS") : this.getReg16("DS"));
      const offset = this.evalMemoryOffset(op);
      const size = op.size || defaultSize;
      let val = 0;
      if (size === 1) {
        val = this.memory.readByteSeg(seg, offset);
      } else if (size === 2) {
        val = this.memory.readWordSeg(seg, offset);
      } else if (size === 4) {
        val = this.memory.readDword(this.memory.toPhysical(seg, offset));
      }
      return { val, size, seg, offset };
    }
    return { val: 0, size: 2 };
  }

  // Assigns a value back to a destination operand
  assignOperand(op, val, size = 2) {
    if (op.type === "reg") {
      if (this.isReg16(op.name)) {
        this.setReg16(op.name, val & 0xFFFF);
      } else {
        this.setReg8(op.name, val & 0xFF);
      }
    } else if (op.type === "mem") {
      const seg = op.seg ? this.getReg16(op.seg) : (op.isStack ? this.getReg16("SS") : this.getReg16("DS"));
      const offset = this.evalMemoryOffset(op);
      const s = op.size || size;
      if (s === 1) {
        this.memory.writeByteSeg(seg, offset, val & 0xFF);
      } else if (s === 2) {
        this.memory.writeWordSeg(seg, offset, val & 0xFFFF);
      } else if (s === 4) {
        this.memory.writeDword(this.memory.toPhysical(seg, offset), val >>> 0);
      }
    }
  }

  evalMemoryOffset(op) {
    let offset = op.disp || 0;
    if (op.baseReg) offset += this.getReg16(op.baseReg);
    if (op.indexReg) offset += this.getReg16(op.indexReg);
    return offset & 0xFFFF;
  }

  // Execute a single disassembled instruction object
  executeInstruction(inst) {
    if (this.halted) return false;

    // Snapshot state for undo
    if (this.history.length >= this.maxHistory) this.history.shift();
    const state = this.saveState();
    this.history.push(state);

    this.currentStepMemWrites = [];
    this.isRecordingMem = true;

    this.memory.clearAccessTracking();
    this.stepCount++;
    this.cycleCount += (inst.cycles || 4);

    const mnemonic = inst.mnemonic.toUpperCase();
    const ops = inst.operands || [];

    // Advance IP by instruction size before executing (so jumps can modify it)
    this.regs.IP = (this.regs.IP + (inst.size || 2)) & 0xFFFF;

    switch (mnemonic) {
      // ------------------------------------
      // DATA TRANSFER INSTRUCTIONS
      // ------------------------------------
      case "MOV": {
        const dest = ops[0];
        const src = ops[1];
        // Determine size based on dest or src
        let s = dest.size || src.size || (dest.type === "reg" && this.isReg8(dest.name) ? 1 : 2);
        const { val } = this.evalOperand(src, s);
        this.assignOperand(dest, val, s);
        break;
      }

      case "XCHG": {
        const op1 = ops[0];
        const op2 = ops[1];
        const s = op1.size || op2.size || (op1.type === "reg" && this.isReg8(op1.name) ? 1 : 2);
        const v1 = this.evalOperand(op1, s).val;
        const v2 = this.evalOperand(op2, s).val;
        this.assignOperand(op1, v2, s);
        this.assignOperand(op2, v1, s);
        break;
      }

      case "PUSH": {
        const op = ops[0];
        let val = 0;
        if (op.type === "reg") {
          val = this.getReg16(op.name);
        } else if (op.type === "imm") {
          val = op.val & 0xFFFF;
        } else {
          val = this.evalOperand(op, 2).val;
        }
        this.push(val);
        break;
      }

      case "POP": {
        const dest = ops[0];
        const val = this.pop();
        this.assignOperand(dest, val, 2);
        break;
      }

      case "PUSHA": {
        const sp = this.regs.SP;
        this.push(this.regs.AX);
        this.push(this.regs.CX);
        this.push(this.regs.DX);
        this.push(this.regs.BX);
        this.push(sp);
        this.push(this.regs.BP);
        this.push(this.regs.SI);
        this.push(this.regs.DI);
        break;
      }

      case "POPA": {
        this.regs.DI = this.pop();
        this.regs.SI = this.pop();
        this.regs.BP = this.pop();
        this.pop(); // Discard pushed SP
        this.regs.BX = this.pop();
        this.regs.DX = this.pop();
        this.regs.CX = this.pop();
        this.regs.AX = this.pop();
        break;
      }

      case "PUSHF": {
        this.push(this.getFlagsRegister());
        break;
      }

      case "POPF": {
        this.setFlagsRegister(this.pop());
        break;
      }

      case "LAHF": {
        const flagsLow = this.getFlagsRegister() & 0xFF;
        this.setReg8("AH", flagsLow);
        break;
      }

      case "SAHF": {
        const ah = this.getReg8("AH");
        const curr = this.getFlagsRegister() & 0xFF00;
        this.setFlagsRegister(curr | ah);
        break;
      }

      case "XLAT":
      case "XLATB": {
        const bx = this.getReg16("BX");
        const al = this.getReg8("AL");
        const segName = (ops[0] && ops[0].seg) ? ops[0].seg : "DS";
        const seg = this.getReg16(segName);
        const val = this.memory.readByteSeg(seg, (bx + al) & 0xFFFF);
        this.setReg8("AL", val);
        break;
      }

      case "LEA": {
        const dest = ops[0];
        const src = ops[1];
        const offset = this.evalMemoryOffset(src);
        this.assignOperand(dest, offset, 2);
        break;
      }

      case "LDS": {
        const reg = ops[0];
        const mem = ops[1];
        const seg = mem.seg ? this.getReg16(mem.seg) : (mem.isStack ? this.getReg16("SS") : this.getReg16("DS"));
        const offset = this.evalMemoryOffset(mem);
        const wordOffset = this.memory.readWordSeg(seg, offset);
        const wordSeg = this.memory.readWordSeg(seg, offset + 2);
        this.setReg16(reg.name, wordOffset);
        this.setReg16("DS", wordSeg);
        break;
      }

      case "LES": {
        const reg = ops[0];
        const mem = ops[1];
        const seg = mem.seg ? this.getReg16(mem.seg) : (mem.isStack ? this.getReg16("SS") : this.getReg16("DS"));
        const offset = this.evalMemoryOffset(mem);
        const wordOffset = this.memory.readWordSeg(seg, offset);
        const wordSeg = this.memory.readWordSeg(seg, offset + 2);
        this.setReg16(reg.name, wordOffset);
        this.setReg16("ES", wordSeg);
        break;
      }

      case "IN": {
        const dest = ops[0];
        // Port simulation: returns 0 or simulated values
        this.assignOperand(dest, 0, dest.name === "AL" ? 1 : 2);
        break;
      }

      case "OUT": {
        // Output port simulation
        break;
      }

      // ------------------------------------
      // ARITHMETIC INSTRUCTIONS
      // ------------------------------------
      case "ADD": {
        const dest = ops[0];
        const src = ops[1];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const op1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const op2 = this.evalOperand(src, is16 ? 2 : 1).val;
        const res = this.updateAddFlags(op1 + op2, op1, op2, is16);
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "ADC": {
        const dest = ops[0];
        const src = ops[1];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const op1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const op2 = this.evalOperand(src, is16 ? 2 : 1).val;
        const cf = this.flags.CF ? 1 : 0;
        const res = this.updateAddFlags(op1 + op2 + cf, op1, op2, is16, cf);
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "SUB": {
        const dest = ops[0];
        const src = ops[1];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const op1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const op2 = this.evalOperand(src, is16 ? 2 : 1).val;
        const res = this.updateSubFlags(op1, op2, is16, 0);
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "SBB": {
        const dest = ops[0];
        const src = ops[1];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const op1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const op2 = this.evalOperand(src, is16 ? 2 : 1).val;
        const cf = this.flags.CF ? 1 : 0;
        const res = this.updateSubFlags(op1, op2, is16, cf);
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "CMP": {
        const op1 = ops[0];
        const op2 = ops[1];
        const is16 = op1.size === 2 || (op1.type === "reg" && this.isReg16(op1.name));
        const v1 = this.evalOperand(op1, is16 ? 2 : 1).val;
        const v2 = this.evalOperand(op2, is16 ? 2 : 1).val;
        this.updateSubFlags(v1, v2, is16);
        break;
      }

      case "INC": {
        const dest = ops[0];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const op1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const savedCF = this.flags.CF; // INC preserves CF!
        const res = this.updateAddFlags(op1 + 1, op1, 1, is16);
        this.flags.CF = savedCF;
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "DEC": {
        const dest = ops[0];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const op1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const savedCF = this.flags.CF; // DEC preserves CF!
        const res = this.updateSubFlags(op1, 1, is16);
        this.flags.CF = savedCF;
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "NEG": {
        const dest = ops[0];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const op1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const res = this.updateSubFlags(0, op1, is16);
        this.flags.CF = (op1 !== 0) ? 1 : 0;
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "MUL": {
        const src = ops[0];
        if (!src || src.type === "imm") {
          if (this.interruptController) this.interruptController.terminal.writeSystem("[Illegal instruction: MUL with immediate operand]");
          this.halted = true;
          break;
        }
        const is16 = src.size === 2 || (src.type === "reg" && this.isReg16(src.name));
        if (is16) {
          const ax = this.getReg16("AX");
          const v = this.evalOperand(src, 2).val;
          const prod = (ax * v) >>> 0;
          this.setReg16("AX", prod & 0xFFFF);
          this.setReg16("DX", (prod >>> 16) & 0xFFFF);
          const hasHigh = (prod >>> 16) !== 0;
          this.flags.CF = hasHigh ? 1 : 0;
          this.flags.OF = hasHigh ? 1 : 0;
        } else {
          const al = this.getReg8("AL");
          const v = this.evalOperand(src, 1).val;
          const prod = al * v;
          this.setReg16("AX", prod & 0xFFFF);
          const hasHigh = (prod >> 8) !== 0;
          this.flags.CF = hasHigh ? 1 : 0;
          this.flags.OF = hasHigh ? 1 : 0;
        }
        break;
      }

      case "IMUL": {
        const src = ops[0];
        if (!src || src.type === "imm") {
          if (this.interruptController) this.interruptController.terminal.writeSystem("[Illegal instruction: IMUL with immediate operand]");
          this.halted = true;
          break;
        }
        const is16 = src.size === 2 || (src.type === "reg" && this.isReg16(src.name));
        if (is16) {
          let ax = this.getReg16("AX");
          if (ax & 0x8000) ax -= 0x10000;
          let v = this.evalOperand(src, 2).val;
          if (v & 0x8000) v -= 0x10000;
          const prod = ax * v;
          this.setReg16("AX", prod & 0xFFFF);
          this.setReg16("DX", (prod >> 16) & 0xFFFF);
          const fitsInWord = prod >= -32768 && prod <= 32767;
          this.flags.CF = fitsInWord ? 0 : 1;
          this.flags.OF = fitsInWord ? 0 : 1;
        } else {
          let al = this.getReg8("AL");
          if (al & 0x80) al -= 0x100;
          let v = this.evalOperand(src, 1).val;
          if (v & 0x80) v -= 0x100;
          const prod = al * v;
          this.setReg16("AX", prod & 0xFFFF);
          const fitsInByte = prod >= -128 && prod <= 127;
          this.flags.CF = fitsInByte ? 0 : 1;
          this.flags.OF = fitsInByte ? 0 : 1;
        }
        break;
      }

      case "DIV": {
        const src = ops[0];
        if (!src || src.type === "imm") {
          if (this.interruptController) this.interruptController.terminal.writeSystem("[Illegal instruction: DIV with immediate operand]");
          this.halted = true;
          break;
        }
        const is16 = src.size === 2 || (src.type === "reg" && this.isReg16(src.name));
        const divisor = this.evalOperand(src, is16 ? 2 : 1).val;
        if (divisor === 0) {
          if (this.interruptController) this.interruptController.terminal.writeSystem("[Divide by zero exception!]");
          this.halted = true;
          break;
        }
        if (is16) {
          const dividend = ((this.getReg16("DX") << 16) | this.getReg16("AX")) >>> 0;
          const quot = Math.floor(dividend / divisor);
          const rem = dividend % divisor;
          if (quot > 0xFFFF) {
            if (this.interruptController) this.interruptController.terminal.writeSystem("[Divide overflow exception!]");
            this.halted = true;
            break;
          }
          this.setReg16("AX", quot & 0xFFFF);
          this.setReg16("DX", rem & 0xFFFF);
        } else {
          const dividend = this.getReg16("AX");
          const quot = Math.floor(dividend / divisor);
          const rem = dividend % divisor;
          if (quot > 0xFF) {
            if (this.interruptController) this.interruptController.terminal.writeSystem("[Divide overflow exception!]");
            this.halted = true;
            break;
          }
          this.setReg8("AL", quot & 0xFF);
          this.setReg8("AH", rem & 0xFF);
        }
        break;
      }

      case "IDIV": {
        const src = ops[0];
        if (!src || src.type === "imm") {
          if (this.interruptController) this.interruptController.terminal.writeSystem("[Illegal instruction: IDIV with immediate operand]");
          this.halted = true;
          break;
        }
        const is16 = src.size === 2 || (src.type === "reg" && this.isReg16(src.name));
        let divisor = this.evalOperand(src, is16 ? 2 : 1).val;
        if (is16 && (divisor & 0x8000)) divisor -= 0x10000;
        if (!is16 && (divisor & 0x80)) divisor -= 0x100;
        if (divisor === 0) {
          if (this.interruptController) this.interruptController.terminal.writeSystem("[Divide by zero exception!]");
          this.halted = true;
          break;
        }
        if (is16) {
          let dividend = ((this.getReg16("DX") << 16) | this.getReg16("AX"));
          const quot = Math.trunc(dividend / divisor);
          const rem = dividend % divisor;
          if (quot < -32768 || quot > 32767) {
            if (this.interruptController) this.interruptController.terminal.writeSystem("[Divide overflow exception!]");
            this.halted = true;
            break;
          }
          this.setReg16("AX", quot & 0xFFFF);
          this.setReg16("DX", rem & 0xFFFF);
        } else {
          let dividend = this.getReg16("AX");
          if (dividend & 0x8000) dividend -= 0x10000;
          const quot = Math.trunc(dividend / divisor);
          const rem = dividend % divisor;
          if (quot < -128 || quot > 127) {
            if (this.interruptController) this.interruptController.terminal.writeSystem("[Divide overflow exception!]");
            this.halted = true;
            break;
          }
          this.setReg8("AL", quot & 0xFF);
          this.setReg8("AH", rem & 0xFF);
        }
        break;
      }

      case "CBW": {
        const al = this.getReg8("AL");
        this.setReg8("AH", (al & 0x80) ? 0xFF : 0x00);
        break;
      }

      case "CWD": {
        const ax = this.getReg16("AX");
        this.setReg16("DX", (ax & 0x8000) ? 0xFFFF : 0x0000);
        break;
      }

      case "AAA": {
        let al = this.getReg8("AL");
        let ah = this.getReg8("AH");
        if ((al & 0x0F) > 9 || this.flags.AF === 1) {
          al = (al + 6) & 0xFF;
          ah = (ah + 1) & 0xFF;
          this.flags.AF = 1;
          this.flags.CF = 1;
        } else {
          this.flags.AF = 0;
          this.flags.CF = 0;
        }
        al &= 0x0F;
        this.setReg8("AL", al);
        this.setReg8("AH", ah);
        break;
      }

      case "AAS": {
        let al = this.getReg8("AL");
        let ah = this.getReg8("AH");
        if ((al & 0x0F) > 9 || this.flags.AF === 1) {
          al = (al - 6) & 0xFF;
          ah = (ah - 1) & 0xFF;
          this.flags.AF = 1;
          this.flags.CF = 1;
        } else {
          this.flags.AF = 0;
          this.flags.CF = 0;
        }
        al &= 0x0F;
        this.setReg8("AL", al);
        this.setReg8("AH", ah);
        break;
      }

      case "AAM": {
        const base = (ops[0] && ops[0].val !== undefined) ? ops[0].val : 10;
        if (base === 0) {
          if (this.interruptController) this.interruptController.terminal.writeSystem("[Divide by zero exception!]");
          this.halted = true;
          break;
        }
        let al = this.getReg8("AL");
        const ah = Math.floor(al / base);
        al = al % base;
        this.setReg8("AH", ah);
        this.setReg8("AL", al);
        this.flags.ZF = (al === 0) ? 1 : 0;
        this.flags.SF = (al & 0x80) ? 1 : 0;
        this.flags.PF = this.calcParity(al);
        break;
      }

      case "AAD": {
        const base = (ops[0] && ops[0].val !== undefined) ? ops[0].val : 10;
        const ah = this.getReg8("AH");
        const al = this.getReg8("AL");
        const res = (ah * base + al) & 0xFF;
        this.setReg8("AL", res);
        this.setReg8("AH", 0);
        this.flags.ZF = (res === 0) ? 1 : 0;
        this.flags.SF = (res & 0x80) ? 1 : 0;
        this.flags.PF = this.calcParity(res);
        break;
      }

      case "DAA": {
        let al = this.getReg8("AL");
        const oldAL = al;
        const oldCF = this.flags.CF;
        let newCF = 0;

        if ((al & 0x0F) > 9 || this.flags.AF === 1) {
          al = (al + 6) & 0xFF;
          this.flags.AF = 1;
        } else {
          this.flags.AF = 0;
        }

        if (oldAL > 0x99 || oldCF === 1) {
          al = (al + 0x60) & 0xFF;
          newCF = 1;
        } else {
          newCF = 0;
        }

        this.flags.CF = newCF;
        this.setReg8("AL", al);
        this.flags.ZF = (al === 0) ? 1 : 0;
        this.flags.SF = (al & 0x80) ? 1 : 0;
        this.flags.PF = this.calcParity(al);
        break;
      }

      case "DAS": {
        let al = this.getReg8("AL");
        const oldAL = al;
        const oldCF = this.flags.CF;
        let newCF = 0;

        if ((al & 0x0F) > 9 || this.flags.AF === 1) {
          al = (al - 6) & 0xFF;
          this.flags.AF = 1;
        } else {
          this.flags.AF = 0;
        }

        if (oldAL > 0x99 || oldCF === 1) {
          al = (al - 0x60) & 0xFF;
          newCF = 1;
        } else {
          newCF = 0;
        }

        this.flags.CF = newCF;
        this.setReg8("AL", al);
        this.flags.ZF = (al === 0) ? 1 : 0;
        this.flags.SF = (al & 0x80) ? 1 : 0;
        this.flags.PF = this.calcParity(al);
        break;
      }

      // ------------------------------------
      // LOGIC INSTRUCTIONS
      // ------------------------------------
      case "AND": {
        const dest = ops[0];
        const src = ops[1];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const v1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const v2 = this.evalOperand(src, is16 ? 2 : 1).val;
        const res = this.updateLogicFlags(v1 & v2, is16);
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "OR": {
        const dest = ops[0];
        const src = ops[1];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const v1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const v2 = this.evalOperand(src, is16 ? 2 : 1).val;
        const res = this.updateLogicFlags(v1 | v2, is16);
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "XOR": {
        const dest = ops[0];
        const src = ops[1];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const v1 = this.evalOperand(dest, is16 ? 2 : 1).val;
        const v2 = this.evalOperand(src, is16 ? 2 : 1).val;
        const res = this.updateLogicFlags(v1 ^ v2, is16);
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "NOT": {
        const dest = ops[0];
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        const v = this.evalOperand(dest, is16 ? 2 : 1).val;
        const res = (~v) & (is16 ? 0xFFFF : 0xFF);
        this.assignOperand(dest, res, is16 ? 2 : 1);
        break;
      }

      case "TEST": {
        const op1 = ops[0];
        const op2 = ops[1];
        const is16 = op1.size === 2 || (op1.type === "reg" && this.isReg16(op1.name));
        const v1 = this.evalOperand(op1, is16 ? 2 : 1).val;
        const v2 = this.evalOperand(op2, is16 ? 2 : 1).val;
        this.updateLogicFlags(v1 & v2, is16);
        break;
      }

      // ------------------------------------
      // SHIFTS AND ROTATES
      // ------------------------------------
      case "SHL":
      case "SAL": {
        const dest = ops[0];
        const countOp = ops[1] || { type: "imm", val: 1 };
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        let val = this.evalOperand(dest, is16 ? 2 : 1).val;
        const count = (countOp.type === "reg" ? this.getReg8("CL") : countOp.val) & 0x1F;
        const mask = is16 ? 0xFFFF : 0xFF;
        const signBit = is16 ? 0x8000 : 0x80;

        for (let i = 0; i < count; i++) {
          this.flags.CF = (val & signBit) ? 1 : 0;
          val = (val << 1) & mask;
        }
        if (count === 1) {
          this.flags.OF = ((val & signBit) ? 1 : 0) ^ this.flags.CF;
        }
        if (count > 0) {
          this.flags.ZF = (val === 0) ? 1 : 0;
          this.flags.SF = (val & signBit) ? 1 : 0;
          this.flags.PF = this.calcParity(val & 0xFF);
        }
        this.assignOperand(dest, val, is16 ? 2 : 1);
        break;
      }

      case "SHR": {
        const dest = ops[0];
        const countOp = ops[1] || { type: "imm", val: 1 };
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        let val = this.evalOperand(dest, is16 ? 2 : 1).val;
        const count = (countOp.type === "reg" ? this.getReg8("CL") : countOp.val) & 0x1F;
        const signBit = is16 ? 0x8000 : 0x80;
        const originalSign = (val & signBit) ? 1 : 0;

        for (let i = 0; i < count; i++) {
          this.flags.CF = val & 1;
          val = val >>> 1;
        }
        if (count === 1) {
          this.flags.OF = originalSign;
        }
        if (count > 0) {
          this.flags.ZF = (val === 0) ? 1 : 0;
          this.flags.SF = (val & signBit) ? 1 : 0;
          this.flags.PF = this.calcParity(val & 0xFF);
        }
        this.assignOperand(dest, val, is16 ? 2 : 1);
        break;
      }

      case "SAR": {
        const dest = ops[0];
        const countOp = ops[1] || { type: "imm", val: 1 };
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        let val = this.evalOperand(dest, is16 ? 2 : 1).val;
        const count = (countOp.type === "reg" ? this.getReg8("CL") : countOp.val) & 0x1F;
        const signBit = is16 ? 0x8000 : 0x80;
        const isNeg = (val & signBit) !== 0;

        for (let i = 0; i < count; i++) {
          this.flags.CF = val & 1;
          val = val >>> 1;
          if (isNeg) val |= signBit;
        }
        if (count === 1) this.flags.OF = 0;
        if (count > 0) {
          this.flags.ZF = (val === 0) ? 1 : 0;
          this.flags.SF = (val & signBit) ? 1 : 0;
          this.flags.PF = this.calcParity(val & 0xFF);
        }
        this.assignOperand(dest, val, is16 ? 2 : 1);
        break;
      }

      case "ROL": {
        const dest = ops[0];
        const countOp = ops[1] || { type: "imm", val: 1 };
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        let val = this.evalOperand(dest, is16 ? 2 : 1).val;
        const count = (countOp.type === "reg" ? this.getReg8("CL") : countOp.val) & 0x1F;
        const signBit = is16 ? 0x8000 : 0x80;
        const mask = is16 ? 0xFFFF : 0xFF;

        for (let i = 0; i < count; i++) {
          const bit = (val & signBit) ? 1 : 0;
          val = ((val << 1) | bit) & mask;
          this.flags.CF = bit;
        }
        if (count === 1) {
          this.flags.OF = ((val & signBit) ? 1 : 0) ^ this.flags.CF;
        }
        this.assignOperand(dest, val, is16 ? 2 : 1);
        break;
      }

      case "ROR": {
        const dest = ops[0];
        const countOp = ops[1] || { type: "imm", val: 1 };
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        let val = this.evalOperand(dest, is16 ? 2 : 1).val;
        const count = (countOp.type === "reg" ? this.getReg8("CL") : countOp.val) & 0x1F;
        const signBit = is16 ? 0x8000 : 0x80;

        for (let i = 0; i < count; i++) {
          const bit = val & 1;
          val = (val >>> 1) | (bit ? signBit : 0);
          this.flags.CF = bit;
        }
        if (count === 1) {
          const bit1 = (val & signBit) ? 1 : 0;
          const bit2 = (val & (signBit >> 1)) ? 1 : 0;
          this.flags.OF = bit1 ^ bit2;
        }
        this.assignOperand(dest, val, is16 ? 2 : 1);
        break;
      }

      case "RCL": {
        const dest = ops[0];
        const countOp = ops[1] || { type: "imm", val: 1 };
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        let val = this.evalOperand(dest, is16 ? 2 : 1).val;
        const count = (countOp.type === "reg" ? this.getReg8("CL") : countOp.val) & 0x1F;
        const signBit = is16 ? 0x8000 : 0x80;
        const mask = is16 ? 0xFFFF : 0xFF;

        for (let i = 0; i < count; i++) {
          const newCF = (val & signBit) ? 1 : 0;
          val = ((val << 1) | this.flags.CF) & mask;
          this.flags.CF = newCF;
        }
        if (count === 1) {
          this.flags.OF = ((val & signBit) ? 1 : 0) ^ this.flags.CF;
        }
        this.assignOperand(dest, val, is16 ? 2 : 1);
        break;
      }

      case "RCR": {
        const dest = ops[0];
        const countOp = ops[1] || { type: "imm", val: 1 };
        const is16 = dest.size === 2 || (dest.type === "reg" && this.isReg16(dest.name));
        let val = this.evalOperand(dest, is16 ? 2 : 1).val;
        const count = (countOp.type === "reg" ? this.getReg8("CL") : countOp.val) & 0x1F;
        const signBit = is16 ? 0x8000 : 0x80;

        for (let i = 0; i < count; i++) {
          const newCF = val & 1;
          val = (val >>> 1) | (this.flags.CF ? signBit : 0);
          this.flags.CF = newCF;
        }
        if (count === 1) {
          const bit1 = (val & signBit) ? 1 : 0;
          const bit2 = (val & (signBit >> 1)) ? 1 : 0;
          this.flags.OF = bit1 ^ bit2;
        }
        this.assignOperand(dest, val, is16 ? 2 : 1);
        break;
      }

      // ------------------------------------
      // STRING PREFIXES & INSTRUCTIONS (with REP support)
      // ------------------------------------
      case "REP":
      case "REPE":
      case "REPZ":
      case "REPNE":
      case "REPNZ": {
        // String repeat prefixes: handled automatically when paired with string instructions.
        // If encountered as standalone instruction, behaves as no-op prefix.
        break;
      }

      case "MOVSB":
      case "MOVSW":
      case "LODSB":
      case "LODSW":
      case "STOSB":
      case "STOSW":
      case "CMPSB":
      case "CMPSW":
      case "SCASB":
      case "SCASW": {
        const isWord = mnemonic.endsWith("W");
        const step = isWord ? 2 : 1;
        const dir = this.flags.DF ? -step : step;
        const rep = inst.prefix ? inst.prefix.toUpperCase() : null;

        const executeSingle = () => {
          const ds = this.getReg16("DS");
          const es = this.getReg16("ES");
          const si = this.getReg16("SI");
          const di = this.getReg16("DI");

          switch (mnemonic) {
            case "MOVSB":
              this.memory.writeByteSeg(es, di, this.memory.readByteSeg(ds, si));
              this.regs.SI = (si + dir) & 0xFFFF;
              this.regs.DI = (di + dir) & 0xFFFF;
              break;
            case "MOVSW":
              this.memory.writeWordSeg(es, di, this.memory.readWordSeg(ds, si));
              this.regs.SI = (si + dir) & 0xFFFF;
              this.regs.DI = (di + dir) & 0xFFFF;
              break;
            case "LODSB":
              this.setReg8("AL", this.memory.readByteSeg(ds, si));
              this.regs.SI = (si + dir) & 0xFFFF;
              break;
            case "LODSW":
              this.setReg16("AX", this.memory.readWordSeg(ds, si));
              this.regs.SI = (si + dir) & 0xFFFF;
              break;
            case "STOSB":
              this.memory.writeByteSeg(es, di, this.getReg8("AL"));
              this.regs.DI = (di + dir) & 0xFFFF;
              break;
            case "STOSW":
              this.memory.writeWordSeg(es, di, this.getReg16("AX"));
              this.regs.DI = (di + dir) & 0xFFFF;
              break;
            case "CMPSB": {
              const b1 = this.memory.readByteSeg(ds, si);
              const b2 = this.memory.readByteSeg(es, di);
              this.updateSubFlags(b1, b2, false);
              this.regs.SI = (si + dir) & 0xFFFF;
              this.regs.DI = (di + dir) & 0xFFFF;
              break;
            }
            case "CMPSW": {
              const w1 = this.memory.readWordSeg(ds, si);
              const w2 = this.memory.readWordSeg(es, di);
              this.updateSubFlags(w1, w2, true);
              this.regs.SI = (si + dir) & 0xFFFF;
              this.regs.DI = (di + dir) & 0xFFFF;
              break;
            }
            case "SCASB": {
              const b = this.memory.readByteSeg(es, di);
              this.updateSubFlags(this.getReg8("AL"), b, false);
              this.regs.DI = (di + dir) & 0xFFFF;
              break;
            }
            case "SCASW": {
              const w = this.memory.readWordSeg(es, di);
              this.updateSubFlags(this.getReg16("AX"), w, true);
              this.regs.DI = (di + dir) & 0xFFFF;
              break;
            }
          }
        };

        if (rep === "REP") {
          while (this.regs.CX > 0) {
            executeSingle();
            this.regs.CX = (this.regs.CX - 1) & 0xFFFF;
          }
        } else if (rep === "REPE" || rep === "REPZ") {
          while (this.regs.CX > 0) {
            executeSingle();
            this.regs.CX = (this.regs.CX - 1) & 0xFFFF;
            if (this.flags.ZF === 0) break;
          }
        } else if (rep === "REPNE" || rep === "REPNZ") {
          while (this.regs.CX > 0) {
            executeSingle();
            this.regs.CX = (this.regs.CX - 1) & 0xFFFF;
            if (this.flags.ZF === 1) break;
          }
        } else {
          executeSingle();
        }
        break;
      }

      // ------------------------------------
      // CONTROL TRANSFER INSTRUCTIONS
      // ------------------------------------
      case "JMP": {
        const target = ops[0].targetIP !== undefined ? ops[0].targetIP : ops[0].val;
        this.regs.IP = target & 0xFFFF;
        break;
      }

      case "JE":
      case "JZ": {
        if (this.flags.ZF === 1) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JNE":
      case "JNZ": {
        if (this.flags.ZF === 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JC":
      case "JB":
      case "JNAE": {
        if (this.flags.CF === 1) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JNC":
      case "JNB":
      case "JAE": {
        if (this.flags.CF === 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JA":
      case "JNBE": {
        if (this.flags.CF === 0 && this.flags.ZF === 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JBE":
      case "JNA": {
        if (this.flags.CF === 1 || this.flags.ZF === 1) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JL":
      case "JNGE": {
        if (this.flags.SF !== this.flags.OF) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JGE":
      case "JNL": {
        if (this.flags.SF === this.flags.OF) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JLE":
      case "JNG": {
        if (this.flags.ZF === 1 || this.flags.SF !== this.flags.OF) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JG":
      case "JNLE": {
        if (this.flags.ZF === 0 && this.flags.SF === this.flags.OF) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JS": {
        if (this.flags.SF === 1) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JNS": {
        if (this.flags.SF === 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JO": {
        if (this.flags.OF === 1) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JNO": {
        if (this.flags.OF === 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JP":
      case "JPE": {
        if (this.flags.PF === 1) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JNP":
      case "JPO": {
        if (this.flags.PF === 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "JCXZ": {
        if (this.regs.CX === 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "LOOP": {
        this.regs.CX = (this.regs.CX - 1) & 0xFFFF;
        if (this.regs.CX !== 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "LOOPE":
      case "LOOPZ": {
        this.regs.CX = (this.regs.CX - 1) & 0xFFFF;
        if (this.regs.CX !== 0 && this.flags.ZF === 1) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "LOOPNE":
      case "LOOPNZ": {
        this.regs.CX = (this.regs.CX - 1) & 0xFFFF;
        if (this.regs.CX !== 0 && this.flags.ZF === 0) {
          this.regs.IP = ops[0].targetIP & 0xFFFF;
        }
        break;
      }

      case "CALL": {
        this.push(this.regs.IP);
        this.regs.IP = ops[0].targetIP & 0xFFFF;
        break;
      }

      case "RET": {
        this.regs.IP = this.pop();
        if (ops[0] && ops[0].val) {
          this.regs.SP = (this.regs.SP + ops[0].val) & 0xFFFF;
        }
        // In DOS COM programs, returning with IP == 0 indicates exit back to PSP / INT 20h
        if (this.regs.IP === 0) {
          this.halted = true;
        }
        break;
      }

      case "RETF": {
        this.regs.IP = this.pop();
        this.regs.CS = this.pop();
        if (ops[0] && ops[0].val) {
          this.regs.SP = (this.regs.SP + ops[0].val) & 0xFFFF;
        }
        break;
      }

      case "IRET": {
        this.regs.IP = this.pop();
        this.regs.CS = this.pop();
        this.setFlagsRegister(this.pop());
        break;
      }

      // ------------------------------------
      // PROCESSOR CONTROL & INTERRUPTS
      // ------------------------------------
      case "CLC": this.flags.CF = 0; break;
      case "STC": this.flags.CF = 1; break;
      case "CMC": this.flags.CF = 1 - this.flags.CF; break;
      case "CLD": this.flags.DF = 0; break;
      case "STD": this.flags.DF = 1; break;
      case "CLI": this.flags.IF = 0; break;
      case "STI": this.flags.IF = 1; break;

      case "HLT": {
        this.halted = true;
        break;
      }

      case "NOP": {
        break;
      }

      case "INT": {
        const intNum = ops[0].val;
        if (this.interruptController) {
          const cont = this.interruptController.handleInterrupt(intNum);
          if (!cont) {
            state.memWrites = this.currentStepMemWrites.slice();
            this.currentStepMemWrites = [];
            return "WAITING_FOR_INPUT";
          }
        }
        break;
      }

      case "INTO": {
        if (this.flags.OF === 1 && this.interruptController) {
          this.interruptController.handleInterrupt(4);
        }
        break;
      }

      default:
        console.warn(`Unrecognized instruction mnemonic: ${mnemonic}`);
        break;
    }

    state.memWrites = this.currentStepMemWrites.slice();
    this.currentStepMemWrites = [];

    return true;
  }
}

if (typeof module !== "undefined") {
  module.exports = CPU;
}
