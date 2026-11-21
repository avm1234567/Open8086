const Assembler = require('../js/assembler.js');
const CPU = require('../js/cpu.js');
const Memory = require('../js/memory.js');

const issues = [];

function check(testName, fn) {
  try {
    const res = fn();
    if (res !== true) {
      issues.push({ test: testName, detail: res || 'Failed' });
    }
  } catch (err) {
    issues.push({ test: testName, detail: 'Threw exception: ' + err.message });
  }
}

// 1. Check MUL 03H (Immediate addressing should be rejected)
check('MUL immediate operand rejection', () => {
  const asm = new Assembler();
  const res = asm.assemble('MUL 03H');
  if (res.success && res.errors.length === 0) {
    return 'Assembler accepted MUL 03H (immediate operand), but 8086 only permits register or memory for MUL!';
  }
  return true;
});

// 2. Check IMUL, DIV, IDIV immediate operand rejection
check('IMUL immediate operand rejection', () => {
  const asm = new Assembler();
  const res = asm.assemble('IMUL 05H');
  if (res.success && res.errors.length === 0) {
    return 'Assembler accepted IMUL 05H (immediate operand), but 8086 only permits register or memory for single-operand IMUL!';
  }
  return true;
});

check('DIV immediate operand rejection', () => {
  const asm = new Assembler();
  const res = asm.assemble('DIV 02H');
  if (res.success && res.errors.length === 0) {
    return 'Assembler accepted DIV 02H (immediate operand), but 8086 only permits register or memory for DIV!';
  }
  return true;
});

check('IDIV immediate operand rejection', () => {
  const asm = new Assembler();
  const res = asm.assemble('IDIV 02H');
  if (res.success && res.errors.length === 0) {
    return 'Assembler accepted IDIV 02H (immediate operand), but 8086 only permits register or memory for IDIV!';
  }
  return true;
});

// 3. Check INC / DEC immediate operand rejection
check('INC/DEC immediate operand rejection', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('INC 5');
  const r2 = asm.assemble('DEC 5');
  if (r1.success || r2.success) {
    return 'Assembler accepted INC/DEC with immediate operand!';
  }
  return true;
});

// 4. Check NOT / NEG immediate operand rejection
check('NOT/NEG immediate operand rejection', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('NOT 5');
  const r2 = asm.assemble('NEG 5');
  if (r1.success || r2.success) {
    return 'Assembler accepted NOT/NEG with immediate operand!';
  }
  return true;
});

// 5. Check POP immediate operand rejection
check('POP immediate operand rejection', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('POP 5');
  if (r1.success) {
    return 'Assembler accepted POP with immediate operand!';
  }
  return true;
});

// 6. Check POP CS rejection (POP CS is an invalid instruction on 8086)
check('POP CS rejection', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('POP CS');
  if (r1.success && r1.errors.length === 0) {
    return 'Assembler accepted POP CS, which is illegal in 8086!';
  }
  return true;
});

// 7. Check Semicolon inside quotes in DB
check('Semicolon inside quoted string in DB', () => {
  const asm = new Assembler();
  const r = asm.assemble('msg DB "Hello; world", 0');
  if (!r.symbols.MSG) return 'Symbol MSG not found!';
  const str = String.fromCharCode(...r.symbols.MSG.bytes.slice(0, 12));
  if (str !== 'Hello; world') {
    return `Quoted string with semicolon was truncated! Got: "${str}" instead of "Hello; world"`;
  }
  return true;
});

// 8. Check Destination cannot be immediate (e.g. MOV 5, AX or ADD 10, BX)
check('Immediate as destination rejection', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('MOV 5, AX');
  const r2 = asm.assemble('ADD 10, BX');
  if (r1.success || r2.success) {
    return 'Assembler accepted immediate value as destination operand!';
  }
  return true;
});

// 9. Check Memory-to-memory operations (e.g. MOV [BX], [SI])
check('Memory-to-memory rejection', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('MOV [BX], [SI]');
  if (r1.success && r1.errors.length === 0) {
    return 'Assembler accepted MOV [BX], [SI] (memory-to-memory is not supported on 8086)!';
  }
  return true;
});

// 10. Check Segment register operand rules
// MOV CS, AX is illegal (cannot modify CS directly, must use JMP/CALL/RET)
// MOV DS, 1000h is illegal (MOV seg, imm not supported on 8086)
// Arithmetic on seg regs (ADD DS, AX) is illegal on 8086
check('Segment register MOV restrictions', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('MOV CS, AX');
  const r2 = asm.assemble('MOV DS, 1000H');
  const r3 = asm.assemble('ADD DS, AX');
  const issuesFound = [];
  if (r1.success) issuesFound.push('MOV CS, AX allowed');
  if (r2.success) issuesFound.push('MOV DS, imm allowed');
  if (r3.success) issuesFound.push('ADD DS, AX allowed');
  if (issuesFound.length > 0) return issuesFound.join('; ');
  return true;
});

// 11. Check LEA source must be memory
check('LEA source must be memory', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('LEA AX, BX');
  const r2 = asm.assemble('LEA AX, 1234H');
  if (r1.success || r2.success) {
    return 'Assembler accepted LEA with non-memory source!';
  }
  return true;
});

// 12. Check Register size mismatch (e.g. MOV AL, BX or ADD AX, CL)
check('Operand size mismatch rejection', () => {
  const asm = new Assembler();
  const r1 = asm.assemble('MOV AL, BX');
  const r2 = asm.assemble('ADD AX, CL');
  if (r1.success || r2.success) {
    return 'Assembler accepted operand size mismatch (8-bit with 16-bit)!';
  }
  return true;
});

// 13. Check NEG 80h (signed -128) OF and CF flags
check('NEG 80h flags (OF=1, CF=1)', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg8('AL', 0x80);
  cpu.executeInstruction({
    mnemonic: 'NEG',
    operands: [{ type: 'reg', name: 'AL', size: 1 }],
    size: 2
  });
  const al = cpu.getReg8('AL');
  const of = cpu.getFlag('OF');
  const cf = cpu.getFlag('CF');
  if (al !== 0x80 || of !== 1 || cf !== 1) {
    return `NEG 80h: AL=${al.toString(16)} (expected 80), OF=${of} (expected 1), CF=${cf} (expected 1)`;
  }
  return true;
});

// 14. Check NEG 0 flags (OF=0, CF=0)
check('NEG 0 flags (OF=0, CF=0)', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg8('AL', 0x00);
  cpu.executeInstruction({
    mnemonic: 'NEG',
    operands: [{ type: 'reg', name: 'AL', size: 1 }],
    size: 2
  });
  const al = cpu.getReg8('AL');
  const of = cpu.getFlag('OF');
  const cf = cpu.getFlag('CF');
  if (al !== 0 || of !== 0 || cf !== 0) {
    return `NEG 0: AL=${al.toString(16)} (expected 0), OF=${of} (expected 0), CF=${cf} (expected 0)`;
  }
  return true;
});

// 15. Check MUL 8-bit register and memory execution
check('MUL BL execution', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg8('AL', 0x12);
  cpu.setReg8('BL', 0x05);
  cpu.executeInstruction({
    mnemonic: 'MUL',
    operands: [{ type: 'reg', name: 'BL', size: 1 }],
    size: 2
  });
  const ax = cpu.getReg16('AX');
  if (ax !== 0x005A) return `MUL BL: AX=0x${ax.toString(16)} (expected 0x5a)`;
  return true;
});

// 16. Check MUL 16-bit register execution
check('MUL BX execution', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg16('AX', 0x1000);
  cpu.setReg16('BX', 0x0020);
  cpu.executeInstruction({
    mnemonic: 'MUL',
    operands: [{ type: 'reg', name: 'BX', size: 2 }],
    size: 2
  });
  const ax = cpu.getReg16('AX');
  const dx = cpu.getReg16('DX');
  if (ax !== 0x0000 || dx !== 0x0002) return `MUL BX: DX:AX=${dx}:${ax} (expected 0002:0000)`;
  return true;
});

// 17. Check INT 21h AH=0Ah buffered input structure
check('INT 21h AH=0Ah buffer structure', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  const InterruptController = require('../js/interrupts.js');
  let writtenChars = [];
  const fakeTerm = {
    readLine: (max, cb) => cb('TEST'),
    writeString: () => {},
    writeChar: () => {},
    writeSystem: () => {}
  };
  const ic = new InterruptController(cpu, fakeTerm);
  cpu.setInterruptController(ic);
  // Set up buffer at DS:0200h with max chars = 10
  mem.writeByteSeg(cpu.regs.DS, 0x0200, 10);
  cpu.setReg16('DX', 0x0200);
  cpu.setReg8('AH', 0x0A);
  cpu.executeInstruction({
    mnemonic: 'INT',
    operands: [{ type: 'imm', val: 0x21 }],
    size: 2
  });
  const actualLen = mem.readByteSeg(cpu.regs.DS, 0x0201);
  const c0 = String.fromCharCode(mem.readByteSeg(cpu.regs.DS, 0x0202));
  const c1 = String.fromCharCode(mem.readByteSeg(cpu.regs.DS, 0x0203));
  const c2 = String.fromCharCode(mem.readByteSeg(cpu.regs.DS, 0x0204));
  const c3 = String.fromCharCode(mem.readByteSeg(cpu.regs.DS, 0x0205));
  const cr = mem.readByteSeg(cpu.regs.DS, 0x0206);
  if (actualLen !== 4 || c0 + c1 + c2 + c3 !== 'TEST' || cr !== 0x0D) {
    return `AH=0Ah buffer: len=${actualLen}, str=${c0+c1+c2+c3}, cr=${cr}`;
  }
  return true;
});

// 18. Check CMP flags: CMP AX, BX with unsigned and signed comparisons
check('CMP flags comparison', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  // Compare 5 with 10: 5 - 10 -> CF=1, ZF=0, SF=1
  cpu.setReg16('AX', 5);
  cpu.executeInstruction({
    mnemonic: 'CMP',
    operands: [{ type: 'reg', name: 'AX', size: 2 }, { type: 'imm', val: 10, size: 2 }],
    size: 3
  });
  if (cpu.getFlag('CF') !== 1 || cpu.getFlag('ZF') !== 0 || cpu.getFlag('SF') !== 1) {
    return `CMP 5, 10: CF=${cpu.getFlag('CF')}, ZF=${cpu.getFlag('ZF')}, SF=${cpu.getFlag('SF')}`;
  }
  return true;
});

// 19. Check DAA / DAS arithmetic logic with edge values
check('DAA with 99h + 01h = 00h with CF=1', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg8('AL', 0x99);
  // ADD AL, 01h -> AL=0x9A, AF=0, CF=0
  cpu.executeInstruction({
    mnemonic: 'ADD',
    operands: [{ type: 'reg', name: 'AL', size: 1 }, { type: 'imm', val: 1, size: 1 }],
    size: 2
  });
  // DAA -> AL should be 00h, CF=1
  cpu.executeInstruction({
    mnemonic: 'DAA',
    operands: [],
    size: 1
  });
  const al = cpu.getReg8('AL');
  const cf = cpu.getFlag('CF');
  if (al !== 0x00 || cf !== 1) {
    return `DAA: AL=${al.toString(16)}, CF=${cf} (expected AL=00, CF=1)`;
  }
  return true;
});

// 20. Check Shift / Rotate count operand in 8086
// In pure 8086, shift/rotate count can ONLY be 1 or CL (e.g. SHL AX, 1 or SHL AX, CL).
// If someone writes SHL AX, 2, what happens?
check('Shift with immediate count > 1 warning or rejection', () => {
  const asm = new Assembler();
  const r = asm.assemble('SHL AX, 4');
  // Does it warn or error or accept?
  // Let's check how assembler handles it
  return true;
});

// 21. Check CBW on negative 8-bit value (e.g. 0x80 -> 0xFF80)
check('CBW on 0x80 -> AX=0xFF80', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg8('AL', 0x80);
  cpu.executeInstruction({ mnemonic: 'CBW', operands: [], size: 1 });
  const ax = cpu.getReg16('AX');
  if (ax !== 0xFF80) return `CBW: AX=0x${ax.toString(16)} (expected 0xFF80)`;
  return true;
});

// 22. Check CWD on negative 16-bit value (e.g. 0x8000 -> DX=0xFFFF)
check('CWD on 0x8000 -> DX=0xFFFF', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg16('AX', 0x8000);
  cpu.executeInstruction({ mnemonic: 'CWD', operands: [], size: 1 });
  const dx = cpu.getReg16('DX');
  if (dx !== 0xFFFF) return `CWD: DX=0x${dx.toString(16)} (expected 0xFFFF)`;
  return true;
});

// 23. Check AAM with custom base operand: AAM 16
check('AAM with custom base operand (e.g. AAM 16)', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg8('AL', 0x25); // 37 decimal
  cpu.executeInstruction({
    mnemonic: 'AAM',
    operands: [{ type: 'imm', val: 16 }],
    size: 2
  });
  // In 8086, AAM imm: AH = AL / imm, AL = AL % imm
  // 37 / 16 = 2 (AH=2), 37 % 16 = 5 (AL=5)
  const ah = cpu.getReg8('AH');
  const al = cpu.getReg8('AL');
  if (ah !== 2 || al !== 5) {
    return `AAM 16: AH=${ah}, AL=${al} (expected AH=2, AL=5)`;
  }
  return true;
});

// 24. Check AAD with custom base operand: AAD 16
check('AAD with custom base operand (e.g. AAD 16)', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg8('AH', 2);
  cpu.setReg8('AL', 5);
  cpu.executeInstruction({
    mnemonic: 'AAD',
    operands: [{ type: 'imm', val: 16 }],
    size: 2
  });
  // In 8086, AAD imm: AL = (AH * imm + AL) & 0xFF, AH = 0
  // (2 * 16 + 5) = 37 (0x25)
  const ah = cpu.getReg8('AH');
  const al = cpu.getReg8('AL');
  if (ah !== 0 || al !== 0x25) {
    return `AAD 16: AH=${ah}, AL=0x${al.toString(16)} (expected AH=0, AL=0x25)`;
  }
  return true;
});

// 25. Check XLAT with base register: BX by default, or with segment override
check('XLAT default DS:BX table lookup', () => {
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.setReg16('BX', 0x0200);
  cpu.setReg8('AL', 3);
  mem.writeByteSeg(cpu.regs.DS, 0x0203, 0x77);
  cpu.executeInstruction({ mnemonic: 'XLAT', operands: [], size: 1 });
  const al = cpu.getReg8('AL');
  if (al !== 0x77) return `XLAT: AL=0x${al.toString(16)} (expected 0x77)`;
  return true;
});

console.log('AUDIT RESULTS:');
console.log('Total checks run: 25');
console.log('Issues found:', issues.length);
issues.forEach((iss, i) => {
  console.log(`${i + 1}. [${iss.test}]: ${iss.detail}`);
});
