// 8086 Assembler with Single-Pass AST and Exact IP Resolution
class Assembler {
  constructor() {
    this.labels = {};      // labelName -> offset
    this.symbols = {};     // varName -> { offset, type, size, totalBytes, bytes, line }
    this.constants = {};   // constName -> value
    this.errors = [];
    this.warnings = [];
    this.instructions = [];
    this.lineMap = [];
    this.sourceLines = [];
  }

  stripComment(line) {
    let inQuote = false;
    let quoteChar = "";
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === "'" || c === '"') {
        if (!inQuote) {
          inQuote = true;
          quoteChar = c;
        } else if (c === quoteChar) {
          inQuote = false;
        }
      } else if (c === ";" && !inQuote) {
        return line.substring(0, i);
      }
    }
    return line;
  }

  parseNumber(token) {
    if (token === undefined || token === null) return NaN;
    token = token.toString().trim();
    if ((token.startsWith("'") && token.endsWith("'")) || (token.startsWith('"') && token.endsWith('"'))) {
      if (token.length === 3) return token.charCodeAt(1);
      if (token.length === 4) return (token.charCodeAt(1) << 8) | token.charCodeAt(2);
    }

    const lower = token.toLowerCase();
    // In 8086 assembly, hex numbers ending with 'h' must start with a decimal digit (0-9)
    // so they do not collide with labels like DADH or registers like AH
    if (lower.endsWith("h") && /^[+-]?[0-9][0-9a-f]*h$/i.test(lower)) {
      let h = lower.slice(0, -1);
      if (h.startsWith("+")) h = h.slice(1);
      const isNeg = h.startsWith("-");
      if (isNeg) h = h.slice(1);
      const val = parseInt(h, 16);
      return isNeg ? -val : val;
    }
    if (lower.startsWith("0x") && /^0x[0-9a-f]+$/i.test(lower)) return parseInt(lower, 16);
    if (lower.endsWith("b") && /^[01]+b$/i.test(lower)) return parseInt(lower.slice(0, -1), 2);
    if ((lower.endsWith("o") || lower.endsWith("q")) && /^[0-7]+[oq]$/i.test(lower)) return parseInt(lower.slice(0, -1), 8);

    if (/^[+-]?[0-9]+d?$/i.test(lower)) {
      let dStr = lower;
      if (dStr.endsWith("d")) dStr = dStr.slice(0, -1);
      return parseInt(dStr, 10);
    }

    return NaN;
  }

  splitOperands(str) {
    const parts = [];
    let current = "";
    let inQuotes = false;
    let quoteChar = "";
    let inBrackets = false;

    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if ((c === "'" || c === '"') && !inBrackets) {
        if (!inQuotes) {
          inQuotes = true;
          quoteChar = c;
        } else if (c === quoteChar) {
          inQuotes = false;
        }
        current += c;
      } else if (c === "[" && !inQuotes) {
        inBrackets = true;
        current += c;
      } else if (c === "]" && !inQuotes) {
        inBrackets = false;
        current += c;
      } else if (c === "," && !inQuotes && !inBrackets) {
        parts.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    if (current.trim().length > 0) {
      parts.push(current.trim());
    }
    return parts;
  }

  parseOperand(opStr) {
    opStr = opStr.trim();
    if (!opStr) return null;

    let explicitSize = null;
    const ptrMatch = /^(BYTE|WORD|DWORD)\s+PTR\s+(.*)$/i.exec(opStr);
    if (ptrMatch) {
      const type = ptrMatch[1].toUpperCase();
      explicitSize = (type === "BYTE") ? 1 : (type === "WORD" ? 2 : 4);
      opStr = ptrMatch[2].trim();
    }

    let segOverride = null;
    const segMatch = /^(CS|DS|SS|ES):(.*)$/i.exec(opStr);
    if (segMatch) {
      segOverride = segMatch[1].toUpperCase();
      opStr = segMatch[2].trim();
    }

    const offsetMatch = /^OFFSET\s+(.*)$/i.exec(opStr);
    if (offsetMatch) {
      return {
        type: "imm",
        val: 0,
        isOffset: true,
        symbol: offsetMatch[1].trim(),
        size: 2
      };
    }

    const regUpper = opStr.toUpperCase();
    const isReg16 = ["AX", "BX", "CX", "DX", "SI", "DI", "BP", "SP", "CS", "DS", "SS", "ES", "IP"].includes(regUpper);
    const isReg8 = ["AL", "AH", "BL", "BH", "CL", "CH", "DL", "DH"].includes(regUpper);
    if (isReg16 || isReg8) {
      return {
        type: "reg",
        name: regUpper,
        size: isReg16 ? 2 : 1
      };
    }

    let memInner = null;
    let baseVar = null;

    // Support MASM separate brackets syntax like [BX][SI] or array[BX][SI]
    let normalizedOp = opStr.replace(/\]\s*\[/g, " + ");

    const indexedVarMatch = /^([A-Z_][A-Z0-9_]*)\[(.*)\]$/i.exec(normalizedOp);
    if (indexedVarMatch) {
      baseVar = indexedVarMatch[1];
      memInner = indexedVarMatch[2];
    } else if (normalizedOp.startsWith("[") && normalizedOp.endsWith("]")) {
      memInner = normalizedOp.slice(1, -1).trim();
    }

    if (memInner !== null) {
      // Check for inside-bracket segment override like [ES:BX] or [CS:100h]
      const innerSegMatch = /^(CS|DS|SS|ES):(.*)$/i.exec(memInner);
      if (innerSegMatch) {
        if (!segOverride) segOverride = innerSegMatch[1].toUpperCase();
        memInner = innerSegMatch[2].trim();
      }

      let expr = memInner;
      if (baseVar) expr = baseVar + " + " + expr;

      const tokens = expr.replace(/-/g, " + -").split("+").map(t => t.trim()).filter(Boolean);
      let baseReg = null;
      let indexReg = null;
      let disp = 0;
      let symRef = null;

      for (let t of tokens) {
        const u = t.toUpperCase();
        if (["BX", "BP"].includes(u)) {
          baseReg = u;
        } else if (["SI", "DI"].includes(u)) {
          indexReg = u;
        } else {
          const num = this.parseNumber(t);
          if (!isNaN(num)) {
            disp += num;
          } else {
            symRef = t;
          }
        }
      }

      return {
        type: "mem",
        seg: segOverride,
        baseReg,
        indexReg,
        disp,
        symbol: symRef,
        isStack: (baseReg === "BP"),
        size: explicitSize
      };
    }

    const num = this.parseNumber(opStr);
    if (!isNaN(num)) {
      return {
        type: "imm",
        val: num,
        size: explicitSize || (num > 0xFF || num < -128 ? 2 : 1)
      };
    }

    if (this.constants[opStr.toUpperCase()] !== undefined) {
      const cVal = this.constants[opStr.toUpperCase()];
      return {
        type: "imm",
        val: cVal,
        size: explicitSize || (cVal > 0xFF ? 2 : 1)
      };
    }

    return {
      type: "symbol",
      name: opStr,
      size: explicitSize
    };
  }

  parseDataDeclaration(type, dataStr) {
    const bytes = [];
    const sizePerElem = (type === "DB") ? 1 : (type === "DW" ? 2 : 4);
    const operands = this.splitOperands(dataStr);

    for (let op of operands) {
      const dupMatch = /^(\d+)\s+DUP\s*\((.*)\)$/i.exec(op);
      if (dupMatch) {
        const count = parseInt(dupMatch[1], 10);
        const valStr = dupMatch[2].trim();
        const innerVal = valStr === "?" ? 0 : (this.parseNumber(valStr) || 0);

        for (let k = 0; k < count; k++) {
          if (sizePerElem === 1) {
            bytes.push(innerVal & 0xFF);
          } else if (sizePerElem === 2) {
            bytes.push(innerVal & 0xFF);
            bytes.push((innerVal >> 8) & 0xFF);
          } else {
            bytes.push(innerVal & 0xFF);
            bytes.push((innerVal >> 8) & 0xFF);
            bytes.push((innerVal >> 16) & 0xFF);
            bytes.push((innerVal >> 24) & 0xFF);
          }
        }
        continue;
      }

      if ((op.startsWith("'") && op.endsWith("'")) || (op.startsWith('"') && op.endsWith('"'))) {
        const s = op.slice(1, -1);
        for (let c = 0; c < s.length; c++) {
          bytes.push(s.charCodeAt(c) & 0xFF);
        }
        continue;
      }

      const n = this.parseNumber(op);
      if (!isNaN(n)) {
        if (sizePerElem === 1) {
          bytes.push(n & 0xFF);
        } else if (sizePerElem === 2) {
          bytes.push(n & 0xFF);
          bytes.push((n >> 8) & 0xFF);
        } else {
          bytes.push(n & 0xFF);
          bytes.push((n >> 8) & 0xFF);
          bytes.push((n >> 16) & 0xFF);
          bytes.push((n >> 24) & 0xFF);
        }
      } else {
        for (let s = 0; s < sizePerElem; s++) bytes.push(0);
      }
    }

    return bytes;
  }

  // Calculate instruction byte size
  calcInstSize(mnemonic, ops) {
    const noOpMnemonics = [
      "HLT", "NOP", "CLC", "STC", "CMC", "CLD", "STD", "CLI", "STI",
      "CBW", "CWD", "AAA", "AAS", "AAM", "AAD", "DAA", "DAS",
      "PUSHA", "POPA", "PUSHF", "POPF", "LAHF", "SAHF", "XLAT", "XLATB",
      "MOVSB", "MOVSW", "LODSB", "LODSW", "STOSB", "STOSW",
      "CMPSB", "CMPSW", "SCASB", "SCASW", "RET", "RETF", "IRET", "INTO"
    ];
    if (noOpMnemonics.includes(mnemonic) && ops.length === 0) return 1;
    if (mnemonic.startsWith("J") || mnemonic.startsWith("LOOP")) return 2;
    if (ops.some(o => o.type === "mem")) return 3;
    if (ops.some(o => o.type === "imm" && o.size === 2)) return 3;
    return 2;
  }

  assemble(sourceText) {
    this.labels = {};
    this.symbols = {};
    this.constants = {};
    this.errors = [];
    this.warnings = [];
    this.instructions = [];
    this.lineMap = [];
    this.sourceLines = sourceText.split(/\r?\n/);

    const initialDataBytes = [];
    const rawItems = [];

    // Pre-pass: Collect EQU constants first so they can be used anywhere
    for (let line of this.sourceLines) {
      let l = this.stripComment(line).trim();
      const equMatch = /^([A-Z_][A-Z0-9_]*)\s+EQU\s+(.*)$/i.exec(l);
      if (equMatch) {
        const name = equMatch[1].toUpperCase();
        const val = this.parseNumber(equMatch[2].trim());
        this.constants[name] = isNaN(val) ? 0 : val;
      }
    }

    const VALID_MNEMONICS = new Set([
      "AAA", "AAD", "AAM", "AAS", "ADC", "ADD", "AND", "CALL", "CBW",
      "CLC", "CLD", "CLI", "CMC", "CMP", "CMPSB", "CMPSW", "CWD", "DAA",
      "DAS", "DEC", "DIV", "ESC", "HLT", "IDIV", "IMUL", "IN", "INC",
      "INT", "INTO", "IRET", "JA", "JAE", "JB", "JBE", "JC", "JCXZ",
      "JE", "JG", "JGE", "JL", "JLE", "JMP", "JNA", "JNAE", "JNB",
      "JNBE", "JNC", "JNE", "JNG", "JNGE", "JNL", "JNLE", "JNO", "JNP",
      "JNS", "JNZ", "JO", "JP", "JPE", "JPO", "JS", "JZ", "LAHF",
      "LDS", "LEA", "LES", "LOCK", "LODSB", "LODSW", "LOOP", "LOOPE",
      "LOOPNE", "LOOPNZ", "LOOPZ", "MOV", "MOVSB", "MOVSW", "MUL", "NEG",
      "NOP", "NOT", "OR", "OUT", "POP", "POPA", "POPF", "PUSH", "PUSHA",
      "PUSHF", "RCL", "RCR", "REP", "REPE", "REPNE", "REPNZ", "REPZ",
      "RET", "RETF", "ROL", "ROR", "SAHF", "SAL", "SAR", "SBB", "SCASB",
      "SCASW", "SHL", "SHR", "STC", "STD", "STI", "STOSB", "STOSW",
      "SUB", "TEST", "WAIT", "XCHG", "XLAT", "XLATB", "XOR"
    ]);

    // Step 1: Parse AST structure of lines
    let currentIP = 0x0100;

    for (let lineIdx = 0; lineIdx < this.sourceLines.length; lineIdx++) {
      const lineNum = lineIdx + 1;
      let line = this.stripComment(this.sourceLines[lineIdx]).trim();
      if (!line) continue;

      if (/^([A-Z_][A-Z0-9_]*)\s+EQU/i.test(line)) continue;

      const orgMatch = /^ORG\s+([0-9A-F]+H?)$/i.exec(line);
      if (orgMatch) {
        const addr = this.parseNumber(orgMatch[1]);
        if (!isNaN(addr)) currentIP = addr & 0xFFFF;
        continue;
      }

      if (/^(INCLUDE|ASSUME|DATA\s+SEGMENT|CODE\s+SEGMENT|STACK\s+SEGMENT|ENDS|END|PROC|ENDP)/i.test(line)) {
        continue;
      }

      // Check Data Declarations
      // Supports "var_name DB/DW/DD ...", "var_name: DB/DW/DD ...", and anonymous "DB/DW/DD ..."
      const labeledDataMatch = /^([A-Z_][A-Z0-9_]*):?\s+(DB|DW|DD)\s+(.*)$/i.exec(line);
      const anonDataMatch = /^(DB|DW|DD)\s+(.*)$/i.exec(line);

      if (labeledDataMatch || anonDataMatch) {
        const varName = labeledDataMatch ? labeledDataMatch[1].toUpperCase() : null;
        const type = (labeledDataMatch ? labeledDataMatch[2] : anonDataMatch[1]).toUpperCase();
        const rest = labeledDataMatch ? labeledDataMatch[3] : anonDataMatch[2];
        const bytes = this.parseDataDeclaration(type, rest);

        if (varName) {
          this.symbols[varName] = {
            name: varName,
            offset: currentIP,
            type: type,
            size: type === "DB" ? 1 : (type === "DW" ? 2 : 4),
            totalBytes: bytes.length,
            bytes: bytes,
            line: lineNum
          };
        }

        initialDataBytes.push({ offset: currentIP, bytes });
        currentIP = (currentIP + bytes.length) & 0xFFFF;
        continue;
      }

      // Check for Label prefix
      let restOfLine = line;
      const labelColonMatch = /^([A-Z_][A-Z0-9_]*):(.*)$/i.exec(line);
      if (labelColonMatch) {
        const labelName = labelColonMatch[1].toUpperCase();
        this.labels[labelName] = currentIP; // Exact IP of following instruction!
        restOfLine = labelColonMatch[2].trim();
        if (!restOfLine) continue;
      }

      // Parse instruction
      let prefix = null;
      const prefixMatch = /^(REP|REPE|REPZ|REPNE|REPNZ)\s+(.*)$/i.exec(restOfLine);
      if (prefixMatch) {
        prefix = prefixMatch[1].toUpperCase();
        restOfLine = prefixMatch[2].trim();
      }

      const spaceIdx = restOfLine.search(/\s/);
      let mnemonic = "";
      let operandStr = "";

      if (spaceIdx === -1) {
        mnemonic = restOfLine.toUpperCase();
      } else {
        mnemonic = restOfLine.substring(0, spaceIdx).toUpperCase();
        operandStr = restOfLine.substring(spaceIdx + 1).trim();
      }

      if (!VALID_MNEMONICS.has(mnemonic)) {
        this.errors.push({ line: lineNum, message: `Unknown instruction mnemonic: "${mnemonic}"` });
      }

      const rawOperands = operandStr ? this.splitOperands(operandStr) : [];
      const parsedOps = rawOperands.map(op => this.parseOperand(op));
      const size = this.calcInstSize(mnemonic, parsedOps);

      rawItems.push({
        ip: currentIP,
        line: lineNum,
        prefix,
        mnemonic,
        operands: parsedOps,
        raw: restOfLine,
        size
      });

      this.lineMap[currentIP] = lineNum;
      currentIP = (currentIP + size) & 0xFFFF;
    }

    // Step 2: Resolve symbols in operands
    for (let inst of rawItems) {
      for (let op of inst.operands) {
        if (!op) continue;

        if (op.type === "symbol") {
          const symUpper = op.name.toUpperCase();
          if (this.labels[symUpper] !== undefined) {
            op.targetIP = this.labels[symUpper];
            op.type = "label";
          } else if (this.symbols[symUpper] !== undefined) {
            const sInfo = this.symbols[symUpper];
            op.type = "mem";
            op.disp = sInfo.offset;
            op.size = op.size || sInfo.size;
          } else if (this.constants[symUpper] !== undefined) {
            op.type = "imm";
            op.val = this.constants[symUpper];
          } else {
            this.errors.push({ line: inst.line, message: `Undefined symbol or label: ${op.name}` });
          }
        } else if (op.type === "mem" && op.symbol) {
          const symUpper = op.symbol.toUpperCase();
          if (this.symbols[symUpper] !== undefined) {
            const sInfo = this.symbols[symUpper];
            op.disp += sInfo.offset;
            if (!op.size) op.size = sInfo.size;
          } else if (this.labels[symUpper] !== undefined) {
            op.disp += this.labels[symUpper];
          }
        } else if (op.isOffset && op.symbol) {
          const symUpper = op.symbol.toUpperCase();
          if (this.symbols[symUpper] !== undefined) {
            op.val = this.symbols[symUpper].offset;
          } else if (this.labels[symUpper] !== undefined) {
            op.val = this.labels[symUpper];
          }
        }
      }
    }

    // Step 3: Validate instruction operands and addressing modes
    const segRegs = ["CS", "DS", "SS", "ES"];
    const reg8List = ["AL", "AH", "BL", "BH", "CL", "CH", "DL", "DH"];

    for (let inst of rawItems) {
      const m = inst.mnemonic;
      const ops = inst.operands;

      // 1. MUL operand validation: register or memory only, NO immediate operand allowed
      if (m === "MUL") {
        if (ops.length !== 1) {
          this.errors.push({ line: inst.line, message: `MUL expects exactly 1 operand (register or memory), received ${ops.length}.` });
        } else if (ops[0].type === "imm") {
          this.errors.push({
            line: inst.line,
            message: `Immediate operand not allowed for MUL (e.g. MUL 03H is invalid on 8086). Use a register or memory operand instead (e.g. MOV BL, 03H followed by MUL BL).`
          });
        }
      }

      // 2. IMUL, DIV, IDIV single-operand validation: register or memory only
      if ((m === "DIV" || m === "IDIV") && ops.length > 0) {
        if (ops.length !== 1) {
          this.errors.push({ line: inst.line, message: `${m} expects exactly 1 operand, received ${ops.length}.` });
        } else if (ops[0].type === "imm") {
          this.errors.push({ line: inst.line, message: `Immediate operand not allowed for ${m}. Operand must be a register or memory location.` });
        }
      }
      if (m === "IMUL" && ops.length === 1 && ops[0].type === "imm") {
        this.errors.push({ line: inst.line, message: `Immediate operand not allowed for single-operand IMUL. Operand must be a register or memory location.` });
      }

      // 3. INC, DEC, NOT, NEG operand validation: requires register or memory
      if (["INC", "DEC", "NOT", "NEG"].includes(m)) {
        if (ops.length !== 1) {
          this.errors.push({ line: inst.line, message: `${m} expects exactly 1 operand, received ${ops.length}.` });
        } else if (ops[0].type === "imm") {
          this.errors.push({ line: inst.line, message: `Immediate operand not allowed for ${m}. Operand must be a register or memory location.` });
        }
      }

      // 4. POP operand validation
      if (m === "POP") {
        if (ops.length !== 1) {
          this.errors.push({ line: inst.line, message: `POP expects exactly 1 operand, received ${ops.length}.` });
        } else if (ops[0].type === "imm") {
          this.errors.push({ line: inst.line, message: `Immediate operand not allowed for POP.` });
        } else if (ops[0].type === "reg") {
          if (ops[0].name === "CS") {
            this.errors.push({ line: inst.line, message: `POP CS is illegal on 8086 (CS cannot be modified directly with POP).` });
          } else if (reg8List.includes(ops[0].name)) {
            this.errors.push({ line: inst.line, message: `Cannot POP 8-bit register ${ops[0].name} on 8086. Stack operations require 16-bit operand.` });
          }
        }
      }

      // 5. PUSH operand validation
      if (m === "PUSH" && ops.length === 1 && ops[0].type === "reg") {
        if (reg8List.includes(ops[0].name)) {
          this.errors.push({ line: inst.line, message: `Cannot PUSH 8-bit register ${ops[0].name} on 8086. Stack operations require 16-bit operand.` });
        }
      }

      // 6. Two-operand instructions where destination cannot be immediate
      const twoOpDestInsts = ["MOV", "XCHG", "ADD", "ADC", "SUB", "SBB", "AND", "OR", "XOR", "LEA", "LDS", "LES"];
      if (twoOpDestInsts.includes(m)) {
        if (ops.length !== 2) {
          this.errors.push({ line: inst.line, message: `${m} expects 2 operands, received ${ops.length}.` });
        } else if (ops[0].type === "imm") {
          this.errors.push({ line: inst.line, message: `Destination operand cannot be an immediate value for ${m}.` });
        }
      }

      // 7. Memory-to-memory operations rejection
      if (["MOV", "XCHG", "ADD", "ADC", "SUB", "SBB", "CMP", "AND", "OR", "XOR", "TEST"].includes(m) && ops.length === 2) {
        if (ops[0].type === "mem" && ops[1].type === "mem") {
          this.errors.push({ line: inst.line, message: `Memory-to-memory operations not permitted on 8086 for ${m}.` });
        }
      }

      // 8. Segment register rules
      if (m === "MOV" && ops.length === 2) {
        const dest = ops[0];
        const src = ops[1];
        if (dest.type === "reg" && dest.name === "CS") {
          this.errors.push({ line: inst.line, message: `CS register cannot be destination of MOV.` });
        } else if (dest.type === "reg" && segRegs.includes(dest.name)) {
          if (src.type === "imm") {
            this.errors.push({ line: inst.line, message: `Cannot MOV immediate value into segment register ${dest.name} directly. Move into a general register first.` });
          } else if (src.type === "reg" && segRegs.includes(src.name)) {
            this.errors.push({ line: inst.line, message: `Cannot MOV directly between two segment registers.` });
          }
        }
      } else if (!["MOV", "PUSH", "POP"].includes(m)) {
        for (let op of ops) {
          if (op && op.type === "reg" && segRegs.includes(op.name)) {
            this.errors.push({ line: inst.line, message: `Segment register ${op.name} cannot be used with arithmetic/logic instruction ${m}.` });
          }
        }
      }

      // 9. LEA, LDS, LES source must be memory
      if (["LEA", "LDS", "LES"].includes(m) && ops.length === 2) {
        if (ops[1].type !== "mem") {
          this.errors.push({ line: inst.line, message: `${m} source operand must be a memory reference.` });
        }
      }

      // 10. Operand size mismatch between two registers
      if (ops.length >= 2 && ops[0].type === "reg" && ops[1].type === "reg") {
        const is0_8 = reg8List.includes(ops[0].name);
        const is1_8 = reg8List.includes(ops[1].name);
        if (is0_8 !== is1_8) {
          this.errors.push({ line: inst.line, message: `Operand size mismatch: cannot mix 8-bit register and 16-bit register.` });
        }
      }

      // 11. Shift / Rotate count register must be CL
      if (["SHL", "SHR", "SAL", "SAR", "ROL", "ROR", "RCL", "RCR"].includes(m) && ops.length === 2) {
        if (ops[1].type === "reg" && ops[1].name !== "CL") {
          this.errors.push({ line: inst.line, message: `Shift/rotate count register must be CL.` });
        }
      }
    }

    this.instructions = rawItems;

    return {
      success: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      instructions: rawItems,
      symbols: this.symbols,
      labels: this.labels,
      dataWrites: initialDataBytes,
      startIP: rawItems.length > 0 ? rawItems[0].ip : 0x0100
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = Assembler;
}
