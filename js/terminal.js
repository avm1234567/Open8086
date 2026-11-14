// Emulated DOS Screen & Terminal I/O
class Terminal {
  constructor(containerEl) {
    this.container = containerEl;
    this.rows = 25;
    this.cols = 80;
    this.cursorRow = 0;
    this.cursorCol = 0;
    this.screenBuffer = [];
    this.inputMode = "none"; // "none" | "char" | "line"
    this.inputBuffer = "";
    this.inputCallback = null;
    this.maxLineChars = 80;

    this.initBuffer();
    this.render();
    this.bindEvents();
  }

  initBuffer() {
    this.screenBuffer = [];
    for (let r = 0; r < this.rows; r++) {
      this.screenBuffer.push(new Array(this.cols).fill(" "));
    }
    this.cursorRow = 0;
    this.cursorCol = 0;
  }

  clear() {
    this.initBuffer();
    this.render();
  }

  setCursor(r, c) {
    this.cursorRow = Math.max(0, Math.min(this.rows - 1, r));
    this.cursorCol = Math.max(0, Math.min(this.cols - 1, c));
    this.render();
  }

  getCursor() {
    return { row: this.cursorRow, col: this.cursorCol };
  }

  scrollUp() {
    this.screenBuffer.shift();
    this.screenBuffer.push(new Array(this.cols).fill(" "));
    this.cursorRow = Math.max(0, this.cursorRow - 1);
  }

  writeChar(ch) {
    if (ch === "\r") {
      this.cursorCol = 0;
    } else if (ch === "\n") {
      this.cursorRow++;
      this.cursorCol = 0;
      if (this.cursorRow >= this.rows) {
        this.scrollUp();
      }
    } else if (ch === "\b") {
      if (this.cursorCol > 0) {
        this.cursorCol--;
        this.screenBuffer[this.cursorRow][this.cursorCol] = " ";
      }
    } else if (ch === "\t") {
      this.cursorCol = (Math.floor(this.cursorCol / 8) + 1) * 8;
      if (this.cursorCol >= this.cols) {
        this.cursorCol = 0;
        this.cursorRow++;
        if (this.cursorRow >= this.rows) this.scrollUp();
      }
    } else {
      if (this.cursorCol >= this.cols) {
        this.cursorCol = 0;
        this.cursorRow++;
        if (this.cursorRow >= this.rows) this.scrollUp();
      }
      this.screenBuffer[this.cursorRow][this.cursorCol] = ch;
      this.cursorCol++;
    }
    this.render();
  }

  writeString(str) {
    for (let i = 0; i < str.length; i++) {
      this.writeChar(str[i]);
    }
  }

  writeSystem(msg) {
    this.writeString("\r\n" + msg + "\r\n");
  }

  readChar(callback) {
    this.inputMode = "char";
    this.inputCallback = callback;
    this.render();
  }

  readLine(maxChars, callback) {
    this.inputMode = "line";
    this.maxLineChars = maxChars || 80;
    this.inputBuffer = "";
    this.inputCallback = callback;
    this.render();
  }

  bindEvents() {
    if (!this.container) return;

    window.addEventListener("keydown", (e) => {
      if (this.inputMode === "none") return;

      // When terminal is waiting for input:
      if (this.inputMode === "char") {
        if (e.key.length === 1 || e.key === "Enter") {
          e.preventDefault();
          const ch = e.key === "Enter" ? "\r" : e.key;
          this.inputMode = "none";
          const cb = this.inputCallback;
          this.inputCallback = null;
          if (cb) cb(ch);
        }
      } else if (this.inputMode === "line") {
        if (e.key === "Enter") {
          e.preventDefault();
          this.writeChar("\r");
          this.writeChar("\n");
          this.inputMode = "none";
          const line = this.inputBuffer;
          this.inputBuffer = "";
          const cb = this.inputCallback;
          this.inputCallback = null;
          if (cb) cb(line);
        } else if (e.key === "Backspace") {
          e.preventDefault();
          if (this.inputBuffer.length > 0) {
            this.inputBuffer = this.inputBuffer.slice(0, -1);
            this.writeChar("\b");
          }
        } else if (e.key.length === 1 && this.inputBuffer.length < this.maxLineChars) {
          e.preventDefault();
          this.inputBuffer += e.key;
          this.writeChar(e.key);
        }
      }
    });
  }

  render() {
    if (!this.container) return;

    let text = "";
    for (let r = 0; r < this.rows; r++) {
      let line = "";
      for (let c = 0; c < this.cols; c++) {
        if (r === this.cursorRow && c === this.cursorCol) {
          const charUnder = this.screenBuffer[r][c] || " ";
          line += `<span class="dos-cursor">${this.escapeHtml(charUnder)}</span>`;
        } else {
          line += this.escapeHtml(this.screenBuffer[r][c] || " ");
        }
      }
      text += line + "\n";
    }

    this.container.innerHTML = `<pre class="dos-screen-pre">${text}</pre>`;
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}

if (typeof module !== "undefined") {
  module.exports = Terminal;
}
