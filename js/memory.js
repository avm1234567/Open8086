// 8086 Memory System (1 Megabyte Physical Memory)
class Memory {
  constructor(size = 1024 * 1024) {
    this.size = size;
    this.ram = new Uint8Array(size);
    this.lastReads = new Set();
    this.lastWrites = new Set();
  }

  reset() {
    this.ram.fill(0);
    this.lastReads.clear();
    this.lastWrites.clear();
  }

  clearAccessTracking() {
    this.lastReads.clear();
    this.lastWrites.clear();
  }

  toPhysical(segment, offset) {
    return ((segment << 4) + (offset & 0xFFFF)) & 0xFFFFF; // 20-bit address
  }

  readByte(physAddr) {
    const addr = physAddr & (this.size - 1);
    this.lastReads.add(addr);
    return this.ram[addr];
  }

  writeByte(physAddr, value) {
    const addr = physAddr & (this.size - 1);
    this.ram[addr] = value & 0xFF;
    this.lastWrites.add(addr);
  }

  readWord(physAddr) {
    const low = this.readByte(physAddr);
    const high = this.readByte(physAddr + 1);
    return (high << 8) | low;
  }

  writeWord(physAddr, value) {
    this.writeByte(physAddr, value & 0xFF);
    this.writeByte(physAddr + 1, (value >> 8) & 0xFF);
  }

  readDword(physAddr) {
    const low = this.readWord(physAddr);
    const high = this.readWord(physAddr + 2);
    return ((high << 16) | low) >>> 0;
  }

  writeDword(physAddr, value) {
    this.writeWord(physAddr, value & 0xFFFF);
    this.writeWord(physAddr + 2, (value >>> 16) & 0xFFFF);
  }

  readByteSeg(seg, offset) {
    return this.readByte(this.toPhysical(seg, offset));
  }

  writeByteSeg(seg, offset, value) {
    this.writeByte(this.toPhysical(seg, offset), value);
  }

  readWordSeg(seg, offset) {
    return this.readWord(this.toPhysical(seg, offset));
  }

  writeWordSeg(seg, offset, value) {
    this.writeWord(this.toPhysical(seg, offset), value);
  }

  // Load a buffer into memory at segment:offset
  loadBuffer(seg, offset, buffer) {
    let p = this.toPhysical(seg, offset);
    for (let i = 0; i < buffer.length; i++) {
      this.ram[(p + i) & (this.size - 1)] = buffer[i];
    }
  }

  // Read a $-terminated string from memory (DOS INT 21h AH=09h)
  readDosString(seg, offset, maxLen = 1000) {
    let str = "";
    let p = this.toPhysical(seg, offset);
    for (let i = 0; i < maxLen; i++) {
      const b = this.ram[(p + i) & (this.size - 1)];
      if (b === 0x24) break; // '$' character in ASCII
      str += String.fromCharCode(b);
    }
    return str;
  }
}

if (typeof module !== "undefined") {
  module.exports = Memory;
}
