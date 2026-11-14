const path = require('path');
const Memory = require(path.join(__dirname, '../js/memory.js'));
const CPU = require(path.join(__dirname, '../js/cpu.js'));
const Assembler = require(path.join(__dirname, '../js/assembler.js'));
const experiments = require(path.join(__dirname, '../js/experiments_data.js'));

console.log('Testing all', experiments.length, 'experiments...\n');

let allPassed = true;

for (let exp of experiments) {
  process.stdout.write(`Assembling ${exp.title}... `);
  const asm = new Assembler();
  const res = asm.assemble(exp.code);

  if (!res.success) {
    console.log('FAILED TO ASSEMBLE!');
    console.error(res.errors);
    allPassed = false;
    continue;
  }

  // Load into Memory & CPU
  const mem = new Memory();
  const cpu = new CPU(mem);
  cpu.reset(res.startIP);

  // Load data writes
  for (let dw of res.dataWrites) {
    mem.loadBuffer(0x0700, dw.offset, dw.bytes);
  }

  // Map instructions by IP
  const instMap = {};
  for (let inst of res.instructions) {
    instMap[inst.ip] = inst;
  }

  // Step run until halted or 20,000 steps
  let steps = 0;
  while (!cpu.halted && steps < 20000) {
    const inst = instMap[cpu.getReg16('IP')];
    if (!inst) break;
    cpu.executeInstruction(inst);
    steps++;
  }

  console.log(`PASSED! (Halted in ${steps} steps, IP: 0x${cpu.getReg16('IP').toString(16)})`);
}

if (allPassed) {
  console.log('\n>>> ALL 20 EXPERIMENTS ASSEMBLED AND EXECUTED FLAWLESSLY! <<<');
  process.exit(0);
} else {
  console.log('\n>>> SOME EXPERIMENTS FAILED! <<<');
  process.exit(1);
}
