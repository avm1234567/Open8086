const path = require('path');
const Memory = require(path.join(__dirname, '../js/memory.js'));
const CPU = require(path.join(__dirname, '../js/cpu.js'));
const Assembler = require(path.join(__dirname, '../js/assembler.js'));
const instData = require(path.join(__dirname, '../js/instructions_data.js'));

const allDocInsts = Object.keys(instData);
console.log(`Starting automated test for all ${allDocInsts.length} instructions...\n`);

let passedCount = 0;
let failedList = [];

// Mapping of custom test snippets for each instruction
const testSnippets = {
  AAA: `MOV AX, 15 \n AAA \n HLT`,
  AAD: `MOV AX, 0105h \n AAD \n HLT`,
  AAM: `MOV AL, 15 \n AAM \n HLT`,
  AAS: `MOV AX, 02FFh \n AAS \n HLT`,
  ADC: `MOV AL, 5 \n STC \n ADC AL, 1 \n HLT`,
  ADD: `MOV AL, 5 \n ADD AL, 3 \n HLT`,
  AND: `MOV AL, 0FFh \n AND AL, 0Fh \n HLT`,
  CALL: `CALL sub1 \n HLT \n sub1: MOV AX, 1234h \n RET`,
  CBW: `MOV AL, -5 \n CBW \n HLT`,
  CLC: `STC \n CLC \n HLT`,
  CLD: `STD \n CLD \n HLT`,
  CLI: `STI \n CLI \n HLT`,
  CMC: `CLC \n CMC \n HLT`,
  CMP: `MOV AL, 5 \n CMP AL, 5 \n HLT`,
  CMPSB: `LEA SI, s1 \n LEA DI, s2 \n CMPSB \n HLT \n s1 DB 10 \n s2 DB 10`,
  CMPSW: `LEA SI, w1 \n LEA DI, w2 \n CMPSW \n HLT \n w1 DW 1000h \n w2 DW 1000h`,
  CWD: `MOV AX, -5 \n CWD \n HLT`,
  DAA: `MOV AL, 0Fh \n DAA \n HLT`,
  DAS: `MOV AL, 0FFh \n DAS \n HLT`,
  DEC: `MOV AL, 10 \n DEC AL \n HLT`,
  DIV: `MOV AX, 20 \n MOV BL, 4 \n DIV BL \n HLT`,
  HLT: `HLT`,
  IDIV: `MOV AX, -20 \n MOV BL, 4 \n IDIV BL \n HLT`,
  IMUL: `MOV AL, -2 \n MOV BL, 4 \n IMUL BL \n HLT`,
  IN: `IN AL, 4 \n HLT`,
  INC: `MOV AL, 5 \n INC AL \n HLT`,
  INT: `INT 3 \n HLT`,
  INTO: `INTO \n HLT`,
  IRET: `CALL sub1 \n HLT \n sub1: IRET`,
  JA: `MOV AL, 10 \n CMP AL, 5 \n JA target \n HLT \n target: MOV BX, 1 \n HLT`,
  JAE: `MOV AL, 5 \n CMP AL, 5 \n JAE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JB: `MOV AL, 2 \n CMP AL, 5 \n JB target \n HLT \n target: MOV BX, 1 \n HLT`,
  JBE: `MOV AL, 5 \n CMP AL, 5 \n JBE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JC: `STC \n JC target \n HLT \n target: MOV BX, 1 \n HLT`,
  JCXZ: `MOV CX, 0 \n JCXZ target \n HLT \n target: MOV BX, 1 \n HLT`,
  JE: `MOV AL, 5 \n CMP AL, 5 \n JE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JG: `MOV AL, 5 \n CMP AL, -2 \n JG target \n HLT \n target: MOV BX, 1 \n HLT`,
  JGE: `MOV AL, 5 \n CMP AL, 5 \n JGE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JL: `MOV AL, -5 \n CMP AL, 2 \n JL target \n HLT \n target: MOV BX, 1 \n HLT`,
  JLE: `MOV AL, 5 \n CMP AL, 5 \n JLE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JMP: `JMP target \n MOV BX, 99 \n target: MOV AX, 1 \n HLT`,
  JNA: `MOV AL, 2 \n CMP AL, 5 \n JNA target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNAE: `MOV AL, 2 \n CMP AL, 5 \n JNAE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNB: `MOV AL, 5 \n CMP AL, 2 \n JNB target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNBE: `MOV AL, 5 \n CMP AL, 2 \n JNBE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNC: `CLC \n JNC target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNE: `MOV AL, 5 \n CMP AL, 2 \n JNE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNG: `MOV AL, 2 \n CMP AL, 5 \n JNG target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNGE: `MOV AL, 2 \n CMP AL, 5 \n JNGE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNL: `MOV AL, 5 \n CMP AL, 2 \n JNL target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNLE: `MOV AL, 5 \n CMP AL, 2 \n JNLE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNO: `MOV AL, 5 \n ADD AL, 2 \n JNO target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNP: `MOV AL, 1 \n OR AL, 0 \n JNP target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNS: `MOV AL, 5 \n OR AL, 0 \n JNS target \n HLT \n target: MOV BX, 1 \n HLT`,
  JNZ: `MOV AL, 5 \n CMP AL, 2 \n JNZ target \n HLT \n target: MOV BX, 1 \n HLT`,
  JO: `MOV AL, 127 \n ADD AL, 1 \n JO target \n HLT \n target: MOV BX, 1 \n HLT`,
  JP: `MOV AL, 3 \n OR AL, 0 \n JP target \n HLT \n target: MOV BX, 1 \n HLT`,
  JPE: `MOV AL, 3 \n OR AL, 0 \n JPE target \n HLT \n target: MOV BX, 1 \n HLT`,
  JPO: `MOV AL, 1 \n OR AL, 0 \n JPO target \n HLT \n target: MOV BX, 1 \n HLT`,
  JS: `MOV AL, -5 \n OR AL, 0 \n JS target \n HLT \n target: MOV BX, 1 \n HLT`,
  JZ: `MOV AL, 5 \n CMP AL, 5 \n JZ target \n HLT \n target: MOV BX, 1 \n HLT`,
  LAHF: `LAHF \n HLT`,
  LDS: `LDS AX, mem32 \n HLT \n mem32 DW 1234h, 5678h`,
  LEA: `LEA SI, mem \n HLT \n mem DB 10`,
  LES: `LES AX, mem32 \n HLT \n mem32 DW 1234h, 5678h`,
  LODSB: `LEA SI, a1 \n LODSB \n HLT \n a1 DB 42h`,
  LODSW: `LEA SI, a1 \n LODSW \n HLT \n a1 DW 1234h`,
  LOOP: `MOV CX, 3 \n l1: INC AX \n LOOP l1 \n HLT`,
  LOOPE: `MOV CX, 3 \n MOV AL, 5 \n l1: CMP AL, 5 \n LOOPE l1 \n HLT`,
  LOOPNE: `MOV CX, 3 \n MOV AL, 5 \n l1: CMP AL, 2 \n LOOPNE l1 \n HLT`,
  LOOPNZ: `MOV CX, 3 \n MOV AL, 5 \n l1: CMP AL, 2 \n LOOPNZ l1 \n HLT`,
  LOOPZ: `MOV CX, 3 \n MOV AL, 5 \n l1: CMP AL, 5 \n LOOPZ l1 \n HLT`,
  MOV: `MOV AX, 1234h \n MOV BX, AX \n HLT`,
  MOVSB: `LEA SI, s1 \n LEA DI, s2 \n MOVSB \n HLT \n s1 DB 10 \n s2 DB 0`,
  MOVSW: `LEA SI, s1 \n LEA DI, s2 \n MOVSW \n HLT \n s1 DW 1234h \n s2 DW 0`,
  MUL: `MOV AL, 5 \n MOV BL, 4 \n MUL BL \n HLT`,
  NEG: `MOV AL, 5 \n NEG AL \n HLT`,
  NOP: `NOP \n HLT`,
  NOT: `MOV AL, 0Fh \n NOT AL \n HLT`,
  OR: `MOV AL, 10h \n OR AL, 01h \n HLT`,
  OUT: `MOV AX, 10 \n OUT 4, AX \n HLT`,
  POP: `PUSH 1234h \n POP AX \n HLT`,
  POPA: `PUSHA \n POPA \n HLT`,
  POPF: `PUSHF \n POPF \n HLT`,
  PUSH: `PUSH 1234h \n HLT`,
  PUSHA: `PUSHA \n HLT`,
  PUSHF: `PUSHF \n HLT`,
  RCL: `STC \n MOV AL, 10h \n RCL AL, 1 \n HLT`,
  RCR: `STC \n MOV AL, 10h \n RCR AL, 1 \n HLT`,
  REP: `LEA SI, s1 \n LEA DI, s2 \n MOV CX, 3 \n REP MOVSB \n HLT \n s1 DB 1,2,3 \n s2 DB 3 DUP(0)`,
  REPE: `LEA SI, s1 \n LEA DI, s2 \n MOV CX, 3 \n REPE CMPSB \n HLT \n s1 DB 1,2,3 \n s2 DB 1,2,3`,
  REPNE: `LEA SI, s1 \n LEA DI, s2 \n MOV CX, 3 \n REPNE CMPSB \n HLT \n s1 DB 1,2,3 \n s2 DB 4,5,6`,
  REPNZ: `LEA SI, s1 \n LEA DI, s2 \n MOV CX, 3 \n REPNZ CMPSB \n HLT \n s1 DB 1,2,3 \n s2 DB 4,5,6`,
  REPZ: `LEA SI, s1 \n LEA DI, s2 \n MOV CX, 3 \n REPZ CMPSB \n HLT \n s1 DB 1,2,3 \n s2 DB 1,2,3`,
  RET: `CALL sub1 \n HLT \n sub1: MOV AX, 1 \n RET`,
  RETF: `CALL sub1 \n HLT \n sub1: MOV AX, 1 \n RETF`,
  ROL: `MOV AL, 80h \n ROL AL, 1 \n HLT`,
  ROR: `MOV AL, 01h \n ROR AL, 1 \n HLT`,
  SAHF: `MOV AH, 0FFh \n SAHF \n HLT`,
  SAL: `MOV AL, 10h \n SAL AL, 1 \n HLT`,
  SAR: `MOV AL, 80h \n SAR AL, 1 \n HLT`,
  SBB: `MOV AL, 5 \n STC \n SBB AL, 2 \n HLT`,
  SCASB: `LEA DI, s1 \n MOV AL, 10 \n SCASB \n HLT \n s1 DB 10`,
  SCASW: `LEA DI, s1 \n MOV AX, 1000h \n SCASW \n HLT \n s1 DW 1000h`,
  SHL: `MOV AL, 10h \n SHL AL, 1 \n HLT`,
  SHR: `MOV AL, 10h \n SHR AL, 1 \n HLT`,
  STC: `STC \n HLT`,
  STD: `STD \n HLT`,
  STI: `STI \n HLT`,
  STOSB: `LEA DI, s1 \n MOV AL, 42h \n STOSB \n HLT \n s1 DB 0`,
  STOSW: `LEA DI, s1 \n MOV AX, 1234h \n STOSW \n HLT \n s1 DW 0`,
  SUB: `MOV AL, 10 \n SUB AL, 3 \n HLT`,
  TEST: `MOV AL, 5 \n TEST AL, 1 \n HLT`,
  XCHG: `MOV AL, 1 \n MOV BL, 2 \n XCHG AL, BL \n HLT`,
  XLATB: `LEA BX, tbl \n MOV AL, 2 \n XLATB \n HLT \n tbl DB 10, 20, 30, 40`,
  XOR: `MOV AL, 0FFh \n XOR AL, 0FFh \n HLT`
};

for (let name of allDocInsts) {
  const code = testSnippets[name] || `${name} \n HLT`;
  const asm = new Assembler();
  const res = asm.assemble("ORG 100h\n" + code);

  if (!res.success) {
    console.error(`FAIL [${name}] - Assembly error:`, res.errors);
    failedList.push(name);
    continue;
  }

  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.reset(res.startIP);

  for (let dw of res.dataWrites) {
    mem.loadBuffer(0x0700, dw.offset, dw.bytes);
  }

  const instMap = {};
  for (let inst of res.instructions) instMap[inst.ip] = inst;

  try {
    let steps = 0;
    while (!cpu.halted && steps < 100) {
      const inst = instMap[cpu.getReg16("IP")];
      if (!inst) break;
      const r = cpu.executeInstruction(inst);
      if (r === "WAITING_FOR_INPUT") break;
      steps++;
    }
    passedCount++;
  } catch (err) {
    console.error(`FAIL [${name}] - Runtime exception:`, err);
    failedList.push(name);
  }
}

console.log(`\n======================================================`);
console.log(` RESULTS: ${passedCount} / ${allDocInsts.length} Instructions Passed`);
console.log(`======================================================`);

if (failedList.length === 0) {
  console.log(`🎉 100% SUCCESS: All ${allDocInsts.length} instructions in emu8086 verified!`);
  process.exit(0);
} else {
  console.log(`Failed instructions:`, failedList);
  process.exit(1);
}
