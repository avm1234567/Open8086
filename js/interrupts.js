// 8086 BIOS & DOS Interrupt System
class InterruptController {
  constructor(cpu, terminal) {
    this.cpu = cpu;
    this.terminal = terminal;
    this.isWaitingForInput = false;
    this.inputCallback = null;
  }

  setTerminal(term) {
    this.terminal = term;
  }

  handleInterrupt(intNum) {
    const cpu = this.cpu;
    const term = this.terminal;

    switch (intNum) {
      case 0x21: // DOS Interrupt
        return this.handleInt21();

      case 0x10: // BIOS Video Interrupt
        return this.handleInt10();

      case 0x16: // BIOS Keyboard Interrupt
        return this.handleInt16();

      case 0x20: // Terminate Program
        cpu.halted = true;
        if (term) term.writeSystem("[Program Terminated - INT 20h]");
        return true;

      case 0x03: // Breakpoint
        cpu.isPaused = true;
        if (term) term.writeSystem("[Breakpoint Triggered - INT 3]");
        return true;

      default:
        if (term) term.writeSystem(`[Unhandled Interrupt INT ${intNum.toString(16).toUpperCase()}h]`);
        return true;
    }
  }

  handleInt21() {
    const cpu = this.cpu;
    const term = this.terminal;
    const ah = (cpu.getReg16("AX") >> 8) & 0xFF;

    switch (ah) {
      case 0x01: { // Read character with echo -> AL
        if (term) {
          term.readChar((ch) => {
            cpu.setReg8("AL", ch.charCodeAt(0) & 0xFF);
            term.writeChar(ch);
            this.isWaitingForInput = false;
            if (this.inputCallback) this.inputCallback();
          });
          this.isWaitingForInput = true;
          return false; // Wait for input
        } else {
          cpu.setReg8("AL", 0x0D);
          return true;
        }
      }

      case 0x02: { // Write character in DL to console
        const charCode = cpu.getReg8("DL");
        const ch = String.fromCharCode(charCode);
        if (term) term.writeChar(ch);
        return true;
      }

      case 0x09: { // Write $-terminated string at DS:DX
        const ds = cpu.getReg16("DS");
        const dx = cpu.getReg16("DX");
        const str = cpu.memory.readDosString(ds, dx);
        if (term) term.writeString(str);
        return true;
      }

      case 0x0A: { // Buffered input
        const ds = cpu.getReg16("DS");
        const dx = cpu.getReg16("DX");
        const maxChars = cpu.memory.readByteSeg(ds, dx);
        if (term) {
          term.readLine(maxChars, (line) => {
            cpu.memory.writeByteSeg(ds, dx + 1, line.length);
            for (let i = 0; i < line.length; i++) {
              cpu.memory.writeByteSeg(ds, dx + 2 + i, line.charCodeAt(i));
            }
            cpu.memory.writeByteSeg(ds, dx + 2 + line.length, 0x0D); // CR
            this.isWaitingForInput = false;
            if (this.inputCallback) this.inputCallback();
          });
          this.isWaitingForInput = true;
          return false;
        }
        return true;
      }

      case 0x2A: { // Get system date -> CX=Year, DH=Month, DL=Day, AL=Day of week
        const d = new Date();
        cpu.setReg16("CX", d.getFullYear());
        cpu.setReg8("DH", d.getMonth() + 1);
        cpu.setReg8("DL", d.getDate());
        cpu.setReg8("AL", d.getDay());
        return true;
      }

      case 0x2C: { // Get system time -> CH=Hour, CL=Minute, DH=Second, DL=1/100s
        const d = new Date();
        cpu.setReg8("CH", d.getHours());
        cpu.setReg8("CL", d.getMinutes());
        cpu.setReg8("DH", d.getSeconds());
        cpu.setReg8("DL", Math.floor(d.getMilliseconds() / 10));
        return true;
      }

      case 0x4C: { // Exit program with return code in AL
        const code = cpu.getReg8("AL");
        cpu.halted = true;
        if (term) term.writeSystem(`[Program Exited with code ${code} - INT 21h/4Ch]`);
        return true;
      }

      default:
        if (term) term.writeSystem(`[Unhandled DOS Service AH=${ah.toString(16).toUpperCase()}h]`);
        return true;
    }
  }

  handleInt10() {
    const cpu = this.cpu;
    const term = this.terminal;
    const ah = cpu.getReg8("AH");

    switch (ah) {
      case 0x00: // Set video mode
        if (term) term.clear();
        return true;

      case 0x02: { // Set cursor position (DH=row, DL=col)
        const row = cpu.getReg8("DH");
        const col = cpu.getReg8("DL");
        if (term) term.setCursor(row, col);
        return true;
      }

      case 0x03: { // Get cursor position -> DH=row, DL=col
        if (term) {
          const { row, col } = term.getCursor();
          cpu.setReg8("DH", row);
          cpu.setReg8("DL", col);
        }
        return true;
      }

      case 0x06: // Scroll up / clear screen
      case 0x07: { // Scroll down
        if (term) term.clear();
        return true;
      }

      case 0x0E: { // Teletype character output (AL)
        const ch = String.fromCharCode(cpu.getReg8("AL"));
        if (term) term.writeChar(ch);
        return true;
      }

      case 0x09:
      case 0x0A: { // Write character at cursor
        const count = cpu.getReg16("CX") || 1;
        const ch = String.fromCharCode(cpu.getReg8("AL"));
        if (term) {
          for (let i = 0; i < count; i++) term.writeChar(ch);
        }
        return true;
      }

      default:
        return true;
    }
  }

  handleInt16() {
    const cpu = this.cpu;
    const term = this.terminal;
    const ah = cpu.getReg8("AH");

    if (ah === 0x00) { // Read keystroke
      if (term) {
        term.readChar((ch) => {
          const code = ch.charCodeAt(0);
          cpu.setReg8("AL", code & 0xFF);
          cpu.setReg8("AH", 0x1E); // Simulated scancode
          this.isWaitingForInput = false;
          if (this.inputCallback) this.inputCallback();
        });
        this.isWaitingForInput = true;
        return false;
      } else {
        cpu.setReg8("AL", 0x0D);
        cpu.setReg8("AH", 0x1C);
        return true;
      }
    } else if (ah === 0x01) { // Check keystroke
      cpu.setFlag("ZF", 1); // No keystroke ready
      return true;
    }
    return true;
  }
}

if (typeof module !== "undefined") {
  module.exports = InterruptController;
}
