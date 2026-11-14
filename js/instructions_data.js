const INSTRUCTION_SET = {
  "AAA": {
    "name": "AAA",
    "category": "Arithmetic",
    "operands": "No operands",
    "description": "ASCII Adjust after Addition.\n\r\nCorrects result in AH and AL after addition\r\nwhen working with BCD values. \n\n It works according to the following Algorithm:\r\n\n\n\r\n\r\nif low nibble of AL > 9 or AF = 1 then:\n\r\n\r\n• AL = AL + 6\n\r\n• AH = AH + 1\n\r\n• AF = 1\n\r\n• CF = 1\n\r\n\r\nelse\r\n\r\n• AF = 0\n\r\n• CF = 0\n\r\n\r\nin both cases:\n\r\nclear the high nibble of AL.\r\n\r\n\n\nExample:",
    "example": "MOV AX, 15   ; AH = 00, AL = 0Fh\r\nAAA          ; AH = 01, AL = 05\r\nRET",
    "flags": {
      "C": "r",
      "Z": "?",
      "S": "?",
      "O": "?",
      "P": "?",
      "A": "r"
    }
  },
  "AAD": {
    "name": "AAD",
    "category": "Arithmetic",
    "operands": "No operands",
    "description": "ASCII Adjust before Division.\n\r\nPrepares two BCD values for division. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• AL = (AH * 10) + AL\n\r\n• AH = 0\n\r\n\r\n\r\n\nExample:",
    "example": "MOV AX, 0105h   ; AH = 01, AL = 05\r\nAAD             ; AH = 00, AL = 0Fh (15)\r\nRET",
    "flags": {
      "C": "?",
      "Z": "r",
      "S": "r",
      "O": "?",
      "P": "r",
      "A": "?"
    }
  },
  "AAM": {
    "name": "AAM",
    "category": "Arithmetic",
    "operands": "No operands",
    "description": "ASCII Adjust after Multiplication.\n\r\nCorrects the result of multiplication of two BCD values. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• AH = AL / 10\n\r\n• AL = remainder\n\r\n\r\n\r\n\nExample:",
    "example": "MOV AL, 15   ; AL = 0Fh\r\nAAM          ; AH = 01, AL = 05\r\nRET",
    "flags": {
      "C": "?",
      "Z": "r",
      "S": "r",
      "O": "?",
      "P": "r",
      "A": "?"
    }
  },
  "AAS": {
    "name": "AAS",
    "category": "Arithmetic",
    "operands": "No operands",
    "description": "ASCII Adjust after Subtraction.\n\r\nCorrects result in AH and AL after subtraction\r\nwhen working with BCD values. \n\nAlgorithm:\n\n\r\n\r\nif low nibble of AL > 9 or AF = 1 then:\n\r\n\r\n• AL = AL - 6\n\r\n• AH = AH - 1\n\r\n• AF = 1\n\r\n• CF = 1\n\r\n\r\nelse\r\n\r\n• AF = 0\n\r\n• CF = 0\n\r\n\r\nin both cases:\n\r\nclear the high nibble of AL.\r\n\r\n\n\nExample:",
    "example": "MOV AX, 02FFh  ; AH = 02, AL = 0FFh\r\nAAS            ; AH = 01, AL = 09\r\nRET",
    "flags": {
      "C": "r",
      "Z": "?",
      "S": "?",
      "O": "?",
      "P": "?",
      "A": "r"
    }
  },
  "ADC": {
    "name": "ADC",
    "category": "Arithmetic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Add with Carry.\n\r\n\n\nAlgorithm:\n\n\r\n\r\noperand1 = operand1 + operand2 + CF\r\n\r\n\n\nExample:",
    "example": "STC        ; set CF = 1\r\nMOV AL, 5  ; AL = 5\r\nADC AL, 1  ; AL = 7\r\nRET",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "ADD": {
    "name": "ADD",
    "category": "Arithmetic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Add.\n\r\n\n\nAlgorithm:\n\n\r\n\r\noperand1 = operand1 + operand2\r\n\r\n\n\nExample:",
    "example": "MOV AL, 5   ; AL = 5\r\nADD AL, -3  ; AL = 2\r\nRET",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "AND": {
    "name": "AND",
    "category": "Logic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Logical AND between all bits of two operands. Result is stored in operand1.\n\n\r\nThese rules apply:\n\n\r\n\r\n1 AND 1 = 1\n\r\n1 AND 0 = 0\n\r\n0 AND 1 = 0\n\r\n0 AND 0 = 0\n\r\n\r\n\n\nExample:",
    "example": "MOV AL, 'a'        ; AL = 01100001b\r\nAND AL, 11011111b  ; AL = 01000001b  ('A')\r\nRET",
    "flags": {}
  },
  "CALL": {
    "name": "CALL",
    "category": "Control Transfer",
    "operands": "procedure name\n\r\n\tlabel\n\r\n\t4-byte address",
    "description": "Transfers control to procedure. Return address (IP) is pushed to\r\nstack. 4-byte address may be entered in this form:\r\n1234h:5678h, first value is a segment second\r\nvalue is an offset. If it's a far call, then code segment is pushed to stack as well.\n\r\n\n\nExample:",
    "example": "ORG 100h  ; for COM file.\r\n\r\nCALL p1\r\n\r\nADD AX, 1\r\n\r\nRET         ; return to OS.\r\n\r\np1 PROC     ; procedure declaration.\r\n    MOV AX, 1234h\r\n    RET     ; return to caller.\r\np1 ENDP",
    "flags": {}
  },
  "CBW": {
    "name": "CBW",
    "category": "Arithmetic",
    "operands": "No operands",
    "description": "Convert byte into word. \n\nAlgorithm:\r\n\n\n\r\n\r\nif high bit of AL = 1 then:\r\n\r\n• AH = 255 (0FFh)\n\r\n\r\n\n\r\nelse\r\n\r\n• AH = 0\n\r\n\r\n\r\n\nExample:",
    "example": "MOV AX, 0   ; AH = 0, AL = 0\r\nMOV AL, -5  ; AX = 000FBh (251)\r\nCBW         ; AX = 0FFFBh (-5)\r\nRET",
    "flags": {}
  },
  "CLC": {
    "name": "CLC",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "Clear Carry flag. \n\nAlgorithm:\r\n\n\n\r\n\r\nCF = 0",
    "example": "",
    "flags": {}
  },
  "CLD": {
    "name": "CLD",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "Clear Direction flag. SI and DI will be incremented by chain\r\ninstructions: CMPSB, CMPSW, LODSB, LODSW, MOVSB, MOVSW, STOSB, STOSW. \n\nAlgorithm:\r\n\n\n\r\n\r\nDF = 0",
    "example": "",
    "flags": {}
  },
  "CLI": {
    "name": "CLI",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "Clear Interrupt enable flag. This disables hardware interrupts. \n\nAlgorithm:\r\n\n\n\r\n\r\nIF = 0",
    "example": "",
    "flags": {}
  },
  "CMC": {
    "name": "CMC",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "Complement Carry flag. Inverts value of CF. \n\nAlgorithm:\r\n\n\n\r\n\r\nif CF = 1 then CF = 0\n\r\nif CF = 0 then CF = 1",
    "example": "",
    "flags": {}
  },
  "CMP": {
    "name": "CMP",
    "category": "Arithmetic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Compare.\r\n\n\nAlgorithm:\n\n\r\n\r\noperand1 - operand2\r\n\n\n\r\nresult is not stored anywhere, flags are set (OF, SF, ZF, AF, PF, CF) according\r\nto result.\r\n\r\n\n\nExample:",
    "example": "MOV AL, 5\r\nMOV BL, 5\r\nCMP AL, BL  ; AL = 5, ZF = 1 (so equal!)\r\nRET",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "CMPSB": {
    "name": "CMPSB",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Compare bytes: ES:[DI] from DS:[SI]. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• DS:[SI] - ES:[DI]\n\n\r\n• set flags according to result:\n OF, SF, ZF, AF, PF, CF\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• SI = SI + 1\n\r\n\t• DI = DI + 1\n\r\n\t\r\n\telse\r\n\t\r\n\t• SI = SI - 1\n\r\n\t• DI = DI - 1\n\r\n\t\r\n\n\r\n\r\n\r\nExample:\n\r\nopen cmpsb.asm from c:\\emu8086\\examples",
    "example": "",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "CMPSW": {
    "name": "CMPSW",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Compare words: ES:[DI] from DS:[SI]. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• DS:[SI] - ES:[DI]\n\n\r\n• set flags according to result:\n OF, SF, ZF, AF, PF, CF\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• SI = SI + 2\n\r\n\t• DI = DI + 2\n\r\n\t\r\n\telse\r\n\t\r\n\t• SI = SI - 2\n\r\n\t• DI = DI - 2\n\r\n\t\r\n\n\r\n\r\n\r\nexample:\n\r\nopen cmpsw.asm from c:\\emu8086\\examples",
    "example": "",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "CWD": {
    "name": "CWD",
    "category": "Arithmetic",
    "operands": "No operands",
    "description": "Convert Word to Double word. \n\nAlgorithm:\r\n\n\n\r\n\r\nif high bit of AX = 1 then:\r\n\r\n• DX = 65535 (0FFFFh)\n\r\n\r\n\n\r\nelse\r\n\r\n• DX = 0\n\r\n\r\n\r\n\nExample:",
    "example": "MOV DX, 0   ; DX = 0\r\nMOV AX, 0   ; AX = 0\r\nMOV AX, -5  ; DX AX = 00000h:0FFFBh\r\nCWD         ; DX AX = 0FFFFh:0FFFBh\r\nRET",
    "flags": {}
  },
  "DAA": {
    "name": "DAA",
    "category": "Arithmetic",
    "operands": "No operands",
    "description": "Decimal adjust After Addition.\n\r\nCorrects the result of addition of two packed BCD values. \n\nAlgorithm:\r\n\n\n\r\n\r\nif low nibble of AL > 9 or AF = 1 then:\n\r\n\r\n• AL = AL + 6\n\r\n• AF = 1\n\r\n\r\nif AL > 9Fh or CF = 1 then:\r\n\r\n• AL = AL + 60h\n\r\n• CF = 1\n\r\n\r\n\r\n\nExample:",
    "example": "MOV AL, 0Fh  ; AL = 0Fh (15)\r\nDAA          ; AL = 15h\r\nRET",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "DAS": {
    "name": "DAS",
    "category": "Arithmetic",
    "operands": "No operands",
    "description": "Decimal adjust After Subtraction.\n\r\nCorrects the result of subtraction of two packed BCD values. \n\nAlgorithm:\r\n\n\n\r\n\r\nif low nibble of AL > 9 or AF = 1 then:\n\r\n\r\n• AL = AL - 6\n\r\n• AF = 1\n\r\n\r\nif AL > 9Fh or CF = 1 then:\r\n\r\n• AL = AL - 60h\n\r\n• CF = 1\n\r\n\r\n\r\n\nExample:",
    "example": "MOV AL, 0FFh  ; AL = 0FFh (-1)\r\nDAS           ; AL = 99h, CF = 1\r\nRET",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "DEC": {
    "name": "DEC",
    "category": "Arithmetic",
    "operands": "REG\n\r\n\tmemory",
    "description": "Decrement.\r\n\n\nAlgorithm:\n\n\r\n\r\noperand = operand - 1\r\n\n\n\r\n\r\n\nExample:",
    "example": "MOV AL, 255  ; AL = 0FFh (255 or -1)\r\nDEC AL       ; AL = 0FEh (254 or -2)\r\nRET",
    "flags": {}
  },
  "DIV": {
    "name": "DIV",
    "category": "Arithmetic",
    "operands": "REG\n\r\n\tmemory",
    "description": "Unsigned divide.\r\n\n\nAlgorithm:\n\n\r\n \r\n\t when operand is a byte:\n\r\n\t AL = AX / operand\n\r\n\t AH = remainder (modulus)\r\n\t \r\n \r\n\r\n \r\n\twhen operand is a word:\n\r\n\tAX = (DX AX) / operand\n\r\n\tDX = remainder (modulus)\r\n\t\r\n \r\n Example:",
    "example": "MOV AX, 203   ; AX = 00CBh\r\nMOV BL, 4\r\nDIV BL        ; AL = 50 (32h), AH = 3\r\nRET",
    "flags": {
      "C": "?",
      "Z": "?",
      "S": "?",
      "O": "?",
      "P": "?",
      "A": "?"
    }
  },
  "HLT": {
    "name": "HLT",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "Halt the System.\n\n\r\n\r\n Example:",
    "example": "MOV AX, 5\r\nHLT",
    "flags": {}
  },
  "IDIV": {
    "name": "IDIV",
    "category": "Arithmetic",
    "operands": "REG\n\r\n\tmemory",
    "description": "Signed divide.\r\n\n\nAlgorithm:\n\n\r\n \r\n\t when operand is a byte:\n\r\n\t AL = AX / operand\n\r\n\t AH = remainder (modulus)\r\n\t \r\n \r\n\r\n \r\n\twhen operand is a word:\n\r\n\tAX = (DX AX) / operand\n\r\n\tDX = remainder (modulus)\r\n\t\r\n \r\n Example:",
    "example": "MOV AX, -203 ; AX = 0FF35h\r\nMOV BL, 4\r\nIDIV BL      ; AL = -50 (0CEh), AH = -3 (0FDh)\r\nRET",
    "flags": {
      "C": "?",
      "Z": "?",
      "S": "?",
      "O": "?",
      "P": "?",
      "A": "?"
    }
  },
  "IMUL": {
    "name": "IMUL",
    "category": "Arithmetic",
    "operands": "REG\n\r\n\tmemory",
    "description": "Signed multiply.\r\n\n\nAlgorithm:\n\n\r\n \r\n\t when operand is a byte:\n\r\n\t AX = AL * operand.\r\n \r\n\r\n \r\n\twhen operand is a word:\n\r\n\t(DX AX) = AX * operand.\r\n \r\n  Example:",
    "example": "MOV AL, -2\r\nMOV BL, -4\r\nIMUL BL      ; AX = 8\r\nRET",
    "flags": {
      "C": "r",
      "Z": "?",
      "S": "?",
      "O": "r",
      "P": "?",
      "A": "?"
    }
  },
  "IN": {
    "name": "IN",
    "category": "Data Transfer",
    "operands": "AL, im.byte\n\r\n\tAL, DX\n\r\n\tAX, im.byte\n\r\n\tAX, DX",
    "description": "Input from port into AL or AX.\n\r\nSecond operand is a port number. If required to access\r\nport number over 255 - DX register should be used.\r\n\nExample:",
    "example": "IN AX, 4  ; get status of traffic lights.\r\nIN AL, 7  ; get status of stepper-motor.",
    "flags": {}
  },
  "INC": {
    "name": "INC",
    "category": "Arithmetic",
    "operands": "REG\n\r\n\tmemory",
    "description": "Increment.\r\n\n\nAlgorithm:\n\n\r\n\r\noperand = operand + 1\r\n\n\r\n\r\n\nExample:",
    "example": "MOV AL, 4\r\nINC AL       ; AL = 5\r\nRET",
    "flags": {}
  },
  "INT": {
    "name": "INT",
    "category": "Processor Control",
    "operands": "immediate byte",
    "description": "Interrupt numbered by immediate byte (0..255).\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tPush to stack:\r\n\t\r\n\t• flags register\n\r\n\t• CS\n\r\n\t• IP\n\r\n\t\r\n\r\n\t• IF = 0\n\r\n\r\n\t• Transfer control to interrupt procedure\n\r\n\r\n\r\n\nExample:",
    "example": "MOV AH, 0Eh  ; teletype.\r\nMOV AL, 'A'\r\nINT 10h      ; BIOS interrupt.\r\nRET",
    "flags": {}
  },
  "INTO": {
    "name": "INTO",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "",
    "example": "; -5 - 127 = -132 (not in -128..127)\r\n; the result of SUB is wrong (124),\r\n; so OF = 1 is set:\r\nMOV AL, -5\r\nSUB AL, 127   ; AL = 7Ch (124)\r\nINTO          ; process error.\r\nRET",
    "flags": {}
  },
  "IRET": {
    "name": "IRET",
    "category": "Control Transfer",
    "operands": "No operands",
    "description": "Interrupt Return.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tPop from stack:\r\n\t\r\n\t• IP\n\r\n\t• CS\n\r\n\t• flags register",
    "example": "",
    "flags": {}
  },
  "JA": {
    "name": "JA",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Above second operand (as set by CMP instruction).\r\nUnsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif (CF = 0) and (ZF = 0) then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 250\r\n   CMP AL, 5\r\n   JA label1\r\n   PRINT 'AL is not above 5'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL is above 5'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JAE": {
    "name": "JAE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Above or Equal to second operand (as set by CMP instruction).\r\nUnsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 5\r\n   CMP AL, 5\r\n   JAE label1\r\n   PRINT 'AL is not above or equal to 5'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL is above or equal to 5'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JB": {
    "name": "JB",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Below second operand (as set by CMP instruction).\r\nUnsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 1\r\n   CMP AL, 5\r\n   JB  label1\r\n   PRINT 'AL is not below 5'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL is below 5'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JBE": {
    "name": "JBE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Below or Equal to second operand (as set by CMP instruction).\r\nUnsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CF = 1 or ZF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 5\r\n   CMP AL, 5\r\n   JBE  label1\r\n   PRINT 'AL is not below or equal to 5'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL is below or equal to 5'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JC": {
    "name": "JC",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Carry flag is set to 1.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 255\r\n   ADD AL, 1\r\n   JC  label1\r\n   PRINT 'no carry.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'has carry.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JCXZ": {
    "name": "JCXZ",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if CX register is 0.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CX = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV CX, 0\r\n   JCXZ label1\r\n   PRINT 'CX is not zero.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'CX is zero.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JE": {
    "name": "JE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Equal to second operand (as set by CMP instruction).\r\nSigned/Unsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif ZF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 5\r\n   CMP AL, 5\r\n   JE  label1\r\n   PRINT 'AL is not equal to 5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL is equal to 5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JG": {
    "name": "JG",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Greater then second operand (as set by CMP instruction).\r\nSigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif (ZF = 0) and (SF = OF) then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 5\r\n   CMP AL, -5\r\n   JG  label1\r\n   PRINT 'AL is not greater -5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL is greater -5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JGE": {
    "name": "JGE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Greater or Equal to second operand (as set by CMP instruction).\r\nSigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif SF = OF then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 2\r\n   CMP AL, -5\r\n   JGE  label1\r\n   PRINT 'AL &lt; -5'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL >= -5'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JL": {
    "name": "JL",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Less then second operand (as set by CMP instruction).\r\nSigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif SF <> OF then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, -2\r\n   CMP AL, 5\r\n   JL  label1\r\n   PRINT 'AL >= 5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL &lt; 5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JLE": {
    "name": "JLE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Less or Equal to second operand (as set by CMP instruction).\r\nSigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif SF <> OF or ZF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, -2\r\n   CMP AL, 5\r\n   JLE label1\r\n   PRINT 'AL > 5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL &lt;= 5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JMP": {
    "name": "JMP",
    "category": "Control Transfer",
    "operands": "label\n\r\n\t4-byte address",
    "description": "Unconditional Jump.\r\nTransfers control to another part of the program.\r\n4-byte address may be entered in this form:\r\n1234h:5678h, first value is a segment second\r\nvalue is an offset.\n\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\talways jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n   ORG 100h\r\n   MOV AL, 5\r\n   JMP label1    ; jump over 2 lines!\r\n   PRINT 'Not Jumped!'\r\n   MOV AL, 0\r\nlabel1:\r\n   PRINT 'Got Here!'\r\n   RET",
    "flags": {}
  },
  "JNA": {
    "name": "JNA",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Above second operand (as set by CMP instruction).\r\nUnsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CF = 1 or ZF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 2\r\n   CMP AL, 5\r\n   JNA label1\r\n   PRINT 'AL is above 5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL is not above 5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNAE": {
    "name": "JNAE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Above and Not Equal to second operand (as set by CMP instruction).\r\nUnsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 2\r\n   CMP AL, 5\r\n   JNAE label1\r\n   PRINT 'AL >= 5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL &lt; 5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNB": {
    "name": "JNB",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Below second operand (as set by CMP instruction).\r\nUnsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 7\r\n   CMP AL, 5\r\n   JNB label1\r\n   PRINT 'AL &lt; 5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL >= 5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNBE": {
    "name": "JNBE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Below and Not Equal to second operand (as set by CMP instruction).\r\nUnsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif (CF = 0) and (ZF = 0) then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 7\r\n   CMP AL, 5\r\n   JNBE label1\r\n   PRINT 'AL &lt;= 5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL > 5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNC": {
    "name": "JNC",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Carry flag is set to 0.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif CF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 2\r\n   ADD AL, 3\r\n   JNC  label1\r\n   PRINT 'has carry.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'no carry.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNE": {
    "name": "JNE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Equal to second operand (as set by CMP instruction).\r\nSigned/Unsigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif ZF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 2\r\n   CMP AL, 3\r\n   JNE  label1\r\n   PRINT 'AL = 3.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'Al &lt;> 3.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNG": {
    "name": "JNG",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Greater then second operand (as set by CMP instruction).\r\nSigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif (ZF = 1) and (SF <> OF) then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 2\r\n   CMP AL, 3\r\n   JNG  label1\r\n   PRINT 'AL > 3.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'Al &lt;= 3.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNGE": {
    "name": "JNGE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Greater and Not Equal to second operand (as set by CMP instruction).\r\nSigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif SF <> OF then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 2\r\n   CMP AL, 3\r\n   JNGE  label1\r\n   PRINT 'AL >= 3.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'Al &lt; 3.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNL": {
    "name": "JNL",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Less then second operand (as set by CMP instruction).\r\nSigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif SF = OF then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 2\r\n   CMP AL, -3\r\n   JNL label1\r\n   PRINT 'AL &lt; -3.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'Al >= -3.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNLE": {
    "name": "JNLE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if first operand is Not Less and Not Equal to second operand (as set by CMP instruction).\r\nSigned.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif (SF = OF) and (ZF = 0) then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 2\r\n   CMP AL, -3\r\n   JNLE label1\r\n   PRINT 'AL &lt;= -3.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'Al > -3.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNO": {
    "name": "JNO",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Not Overflow.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif OF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "; -5 - 2 = -7 (inside -128..127)\r\n; the result of SUB is correct,\r\n; so OF = 0:\r\n\r\ninclude 'emu8086.inc'\r\n\r\nORG 100h\r\n  MOV AL, -5\r\n  SUB AL, 2   ; AL = 0F9h (-7)\r\nJNO  label1\r\n  PRINT 'overflow!'\r\nJMP exit\r\nlabel1:\r\n  PRINT 'no overflow.'\r\nexit:\r\n  RET",
    "flags": {}
  },
  "JNP": {
    "name": "JNP",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if No Parity (odd). Only 8 low bits of result are checked.\r\nSet by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif PF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 00000111b   ; AL = 7\r\n   OR  AL, 0           ; just set flags.\r\n   JNP label1\r\n   PRINT 'parity even.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'parity odd.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNS": {
    "name": "JNS",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Not Signed (if positive).\r\nSet by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif SF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 00000111b   ; AL = 7\r\n   OR  AL, 0           ; just set flags.\r\n   JNS label1\r\n   PRINT 'signed.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'not signed.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JNZ": {
    "name": "JNZ",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Not Zero (not equal).\r\nSet by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif ZF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 00000111b   ; AL = 7\r\n   OR  AL, 0           ; just set flags.\r\n   JNZ label1\r\n   PRINT 'zero.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'not zero.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JO": {
    "name": "JO",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Overflow.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif OF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "; -5 - 127 = -132 (not in -128..127)\r\n; the result of SUB is wrong (124),\r\n; so OF = 1 is set:\r\n\r\ninclude 'emu8086.inc'\r\n\r\norg 100h\r\n  MOV AL, -5\r\n  SUB AL, 127   ; AL = 7Ch (124)\r\nJO  label1\r\n  PRINT 'no overflow.'\r\nJMP exit\r\nlabel1:\r\n  PRINT 'overflow!'\r\nexit:\r\n  RET",
    "flags": {}
  },
  "JP": {
    "name": "JP",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Parity (even). Only 8 low bits of result are checked.\r\nSet by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif PF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 00000101b   ; AL = 5\r\n   OR  AL, 0           ; just set flags.\r\n   JP label1\r\n   PRINT 'parity odd.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'parity even.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JPE": {
    "name": "JPE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Parity Even. Only 8 low bits of result are checked.\r\nSet by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif PF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 00000101b   ; AL = 5\r\n   OR  AL, 0           ; just set flags.\r\n   JPE label1\r\n   PRINT 'parity odd.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'parity even.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JPO": {
    "name": "JPO",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Parity Odd. Only 8 low bits of result are checked.\r\nSet by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif PF = 0 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 00000111b   ; AL = 7\r\n   OR  AL, 0           ; just set flags.\r\n   JPO label1\r\n   PRINT 'parity even.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'parity odd.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JS": {
    "name": "JS",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Signed (if negative).\r\nSet by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif SF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 10000000b   ; AL = -128\r\n   OR  AL, 0           ; just set flags.\r\n   JS label1\r\n   PRINT 'not signed.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'signed.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "JZ": {
    "name": "JZ",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Short Jump if Zero (equal).\r\nSet by CMP, SUB, ADD, TEST, AND, OR, XOR instructions.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tif ZF = 1 then jump\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AL, 5\r\n   CMP AL, 5\r\n   JZ  label1\r\n   PRINT 'AL is not equal to 5.'\r\n   JMP exit\r\nlabel1:\r\n   PRINT 'AL is equal to 5.'\r\nexit:\r\n   RET",
    "flags": {}
  },
  "LAHF": {
    "name": "LAHF",
    "category": "Data Transfer",
    "operands": "No operands",
    "description": "Load AH from 8 low bits of Flags register.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tAH = flags register",
    "example": "AH bit:   7    6   5    4   3    2   1    0\r\n        [SF] [ZF] [0] [AF] [0] [PF] [1] [CF]",
    "flags": {}
  },
  "LDS": {
    "name": "LDS",
    "category": "Data Transfer",
    "operands": "REG, memory",
    "description": "Load memory double word into word register and DS.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n    • REG = first word\n\r\n\t• DS = second word\n\r\n\r\n\r\n\n\r\nExample:",
    "example": "ORG 100h\r\n\r\nLDS AX, m\r\n\r\nRET\r\n\r\nm  DW  1234h\r\n   DW  5678h\r\n\r\nEND",
    "flags": {}
  },
  "LEA": {
    "name": "LEA",
    "category": "Data Transfer",
    "operands": "REG, memory",
    "description": "Load Effective Address.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n    • REG = address of memory (offset)\n\r\n\r\n\r\n\n\n\r\nExample:\r\n\r\n\r\nMOV BX, 35h\r\nMOV DI, 12h\r\nLEA SI, [BX+DI]    ; SI = 35h + 12h = 47h \r\n\r\n\r\n\r\n\r\nNote: The integrated 8086 assembler automatically replaces LEA with a\r\nmore efficient MOV where possible.\r\nFor example:\r\n\r\n\r\norg 100h\r\nLEA AX, m       ; AX = offset of m\r\nRET\r\nm  dw  1234h\r\nEND",
    "example": "MOV BX, 35h\r\nMOV DI, 12h\r\nLEA SI, [BX+DI]    ; SI = 35h + 12h = 47h",
    "flags": {}
  },
  "LES": {
    "name": "LES",
    "category": "Data Transfer",
    "operands": "REG, memory",
    "description": "Load memory double word into word register and ES.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n    • REG = first word\n\r\n\t• ES = second word\n\r\n\r\n\r\n\n\r\nExample:",
    "example": "ORG 100h\r\n\r\nLES AX, m\r\n\r\nRET\r\n\r\nm  DW  1234h\r\n   DW  5678h\r\n\r\nEND",
    "flags": {}
  },
  "LODSB": {
    "name": "LODSB",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Load byte at DS:[SI] into AL. Update SI.\n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• AL = DS:[SI]\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• SI = SI + 1\n\r\n\t\r\n\telse\r\n\t\r\n\t• SI = SI - 1\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "ORG 100h\r\n\r\nLEA SI, a1\r\nMOV CX, 5\r\nMOV AH, 0Eh\r\n\r\nm: LODSB\r\nINT 10h\r\nLOOP m\r\n\r\nRET\r\n\r\na1 DB 'H', 'e', 'l', 'l', 'o'",
    "flags": {}
  },
  "LODSW": {
    "name": "LODSW",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Load word at DS:[SI] into AX. Update SI.\n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• AX = DS:[SI]\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• SI = SI + 2\n\r\n\t\r\n\telse\r\n\t\r\n\t• SI = SI - 2\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "ORG 100h\r\n\r\nLEA SI, a1\r\nMOV CX, 5\r\n\r\nREP LODSW   ; finally there will be 555h in AX.\r\n\r\nRET\r\n\r\na1 dw 111h, 222h, 333h, 444h, 555h",
    "flags": {}
  },
  "LOOP": {
    "name": "LOOP",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Decrease CX, jump to label if CX not zero. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• CX = CX - 1\n\n\r\n• if CX <> 0 then\r\n\t\r\n\t• jump\n\r\n\t\r\n\telse\r\n\t\r\n\t• no jump, continue\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV CX, 5\r\nlabel1:\r\n   PRINTN 'loop!'\r\n   LOOP label1\r\n   RET",
    "flags": {}
  },
  "LOOPE": {
    "name": "LOOPE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Decrease CX, jump to label if CX not zero and Equal (ZF = 1). \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• CX = CX - 1\n\n\r\n• if (CX <> 0) and (ZF = 1) then\r\n\t\r\n\t• jump\n\r\n\t\r\n\telse\r\n\t\r\n\t• no jump, continue\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "; Loop until result fits into AL alone,\r\n; or 5 times. The result will be over 255\r\n; on third loop (100+100+100),\r\n; so loop will exit.\r\n\r\n   include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AX, 0\r\n   MOV CX, 5\r\nlabel1:\r\n   PUTC '*'\r\n   ADD AX, 100\r\n   CMP AH, 0\r\n   LOOPE label1\r\n   RET",
    "flags": {}
  },
  "LOOPNE": {
    "name": "LOOPNE",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Decrease CX, jump to label if CX not zero and Not Equal (ZF = 0). \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• CX = CX - 1\n\n\r\n• if (CX <> 0) and (ZF = 0) then\r\n\t\r\n\t• jump\n\r\n\t\r\n\telse\r\n\t\r\n\t• no jump, continue\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "; Loop until '7' is found,\r\n; or 5 times.\r\n\r\n   include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV SI, 0\r\n   MOV CX, 5\r\nlabel1:\r\n   PUTC '*'\r\n   MOV AL, v1[SI]\r\n   INC SI         ; next byte (SI=SI+1).\r\n   CMP AL, 7\r\n   LOOPNE label1\r\n   RET\r\n   v1 db 9, 8, 7, 6, 5",
    "flags": {}
  },
  "LOOPNZ": {
    "name": "LOOPNZ",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Decrease CX, jump to label if CX not zero and ZF = 0. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• CX = CX - 1\n\n\r\n• if (CX <> 0) and (ZF = 0) then\r\n\t\r\n\t• jump\n\r\n\t\r\n\telse\r\n\t\r\n\t• no jump, continue\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "; Loop until '7' is found,\r\n; or 5 times.\r\n\r\n   include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV SI, 0\r\n   MOV CX, 5\r\nlabel1:\r\n   PUTC '*'\r\n   MOV AL, v1[SI]\r\n   INC SI         ; next byte (SI=SI+1).\r\n   CMP AL, 7\r\n   LOOPNZ label1\r\n   RET\r\n   v1 db 9, 8, 7, 6, 5",
    "flags": {}
  },
  "LOOPZ": {
    "name": "LOOPZ",
    "category": "Control Transfer",
    "operands": "label",
    "description": "Decrease CX, jump to label if CX not zero and ZF = 1. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• CX = CX - 1\n\n\r\n• if (CX <> 0) and (ZF = 1) then\r\n\t\r\n\t• jump\n\r\n\t\r\n\telse\r\n\t\r\n\t• no jump, continue\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "; Loop until result fits into AL alone,\r\n; or 5 times. The result will be over 255\r\n; on third loop (100+100+100),\r\n; so loop will exit.\r\n\r\n   include 'emu8086.inc'\r\n\r\n   ORG 100h\r\n   MOV AX, 0\r\n   MOV CX, 5\r\nlabel1:\r\n   PUTC '*'\r\n   ADD AX, 100\r\n   CMP AH, 0\r\n   LOOPZ label1\r\n   RET",
    "flags": {}
  },
  "MOV": {
    "name": "MOV",
    "category": "Data Transfer",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate\n\n\r\n\r\n\tSREG, memory\n\r\n\tmemory, SREG\n\r\n\tREG, SREG\n\r\n\tSREG, REG",
    "description": "Copy operand2 to operand1.\n\n\r\nThe MOV instruction cannot:\r\n\r\n• set the value of the CS and IP registers.\n\r\n• copy value of one segment register to another segment register (should copy to general register first).\n\r\n• copy immediate value to segment register (should copy to general register first).\n\r\n\r\n\nAlgorithm:\n\n\r\n\r\n\r\noperand1 = operand2\r\n\r\n\r\nExample:",
    "example": "ORG 100h\r\nMOV AX, 0B800h    ; set AX = B800h (VGA memory).\r\nMOV DS, AX        ; copy value of AX to DS.\r\nMOV CL, 'A'       ; CL = 41h (ASCII code).\r\nMOV CH, 01011111b ; CL = color attribute.\r\nMOV BX, 15Eh      ; BX = position on screen.\r\nMOV [BX], CX      ; w.[0B800h:015Eh] = CX.\r\nRET               ; returns to operating system.",
    "flags": {}
  },
  "MOVSB": {
    "name": "MOVSB",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Copy byte at DS:[SI] to ES:[DI].\r\nUpdate SI and DI.\n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• ES:[DI] = DS:[SI]\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• SI = SI + 1\n\r\n\t• DI = DI + 1\n\r\n\t\r\n\telse\r\n\t\r\n\t• SI = SI - 1\n\r\n\t• DI = DI - 1\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "ORG 100h\r\n\r\nCLD\r\nLEA SI, a1\r\nLEA DI, a2\r\nMOV CX, 5\r\nREP MOVSB\r\n\r\nRET\r\n\r\na1 DB 1,2,3,4,5\r\na2 DB 5 DUP(0)",
    "flags": {}
  },
  "MOVSW": {
    "name": "MOVSW",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Copy word at DS:[SI] to ES:[DI].\r\nUpdate SI and DI.\n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• ES:[DI] = DS:[SI]\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• SI = SI + 2\n\r\n\t• DI = DI + 2\n\r\n\t\r\n\telse\r\n\t\r\n\t• SI = SI - 2\n\r\n\t• DI = DI - 2\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "ORG 100h\r\n\r\nCLD\r\nLEA SI, a1\r\nLEA DI, a2\r\nMOV CX, 5\r\nREP MOVSW\r\n\r\nRET\r\n\r\na1 DW 1,2,3,4,5\r\na2 DW 5 DUP(0)",
    "flags": {}
  },
  "MUL": {
    "name": "MUL",
    "category": "Arithmetic",
    "operands": "REG\n\r\n\tmemory",
    "description": "Unsigned multiply.\r\n\n\nAlgorithm:\n\n\r\n \r\n\t when operand is a byte:\n\r\n\t AX = AL * operand.\r\n \r\n\r\n \r\n\twhen operand is a word:\n\r\n\t(DX AX) = AX * operand.\r\n \r\n   Example:",
    "example": "MOV AL, 200   ; AL = 0C8h\r\nMOV BL, 4\r\nMUL BL        ; AX = 0320h (800)\r\nRET",
    "flags": {
      "C": "r",
      "Z": "?",
      "S": "?",
      "O": "r",
      "P": "?",
      "A": "?"
    }
  },
  "NEG": {
    "name": "NEG",
    "category": "Arithmetic",
    "operands": "REG\n\r\n\tmemory",
    "description": "Negate. Makes operand negative (two's complement).\r\n\n\nAlgorithm:\n\n\r\n \r\n \r\n • Invert all bits of the operand\n\r\n • Add 1 to inverted operand\n\r\n \r\n \r\n    Example:",
    "example": "MOV AL, 5   ; AL = 05h\r\nNEG AL      ; AL = 0FBh (-5)\r\nNEG AL      ; AL = 05h (5)\r\nRET",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "NOP": {
    "name": "NOP",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "No Operation.\n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• Do nothing\n\n\r\n\r\n\r\n    Example:",
    "example": "; do nothing, 3 times:\r\nNOP\r\nNOP\r\nNOP\r\nRET",
    "flags": {}
  },
  "NOT": {
    "name": "NOT",
    "category": "Logic",
    "operands": "REG\n\r\n\tmemory",
    "description": "Invert each bit of the operand.\n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• if bit is 1 turn it to 0.\n\n\r\n• if bit is 0 turn it to 1.\n\n\r\n\r\n\r\n    Example:",
    "example": "MOV AL, 00011011b\r\nNOT AL   ; AL = 11100100b\r\nRET",
    "flags": {}
  },
  "OR": {
    "name": "OR",
    "category": "Logic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Logical OR between all bits of two operands.\r\nResult is stored in first operand.\n\n\r\nThese rules apply:\n\n\r\n\r\n1 OR 1 = 1\n\r\n1 OR 0 = 1\n\r\n0 OR 1 = 1\n\r\n0 OR 0 = 0\n\r\n\r\n\n\nExample:",
    "example": "MOV AL, 'A'       ; AL = 01000001b\r\nOR AL, 00100000b  ; AL = 01100001b  ('a')\r\nRET",
    "flags": {
      "C": "0",
      "Z": "r",
      "S": "r",
      "O": "0",
      "P": "r",
      "A": "?"
    }
  },
  "OUT": {
    "name": "OUT",
    "category": "Data Transfer",
    "operands": "im.byte, AL\n\r\n\tim.byte, AX\n\r\n\tDX, AL\n\r\n\tDX, AX",
    "description": "Output from AL or AX to port.\n\r\nFirst operand is a port number. If required to access\r\nport number over 255 - DX register should be used.\r\n\r\n\n\nExample:",
    "example": "MOV AX, 0FFFh ; Turn on all\r\nOUT 4, AX     ; traffic lights.\r\n\r\nMOV AL, 100b  ; Turn on the third\r\nOUT 7, AL     ; magnet of the stepper-motor.",
    "flags": {}
  },
  "POP": {
    "name": "POP",
    "category": "Data Transfer",
    "operands": "REG\n\r\n\tSREG\n\r\n\tmemory",
    "description": "Get 16 bit value from the stack.\r\n\n\nAlgorithm:\n\n\r\n \r\n \r\n • operand = SS:[SP] (top of the stack)\n\r\n • SP = SP + 2\n\r\n \r\n \r\n \nExample:",
    "example": "MOV AX, 1234h\r\nPUSH AX\r\nPOP  DX     ; DX = 1234h\r\nRET",
    "flags": {}
  },
  "POPA": {
    "name": "POPA",
    "category": "Data Transfer",
    "operands": "No operands",
    "description": "Pop all general purpose registers DI, SI, BP, SP, BX, DX, CX, AX from the stack.\n\r\nSP value is ignored, it is Popped but not set to SP register).\n\n\r\nNote: this instruction works only on 80186 CPU and later!\r\n\n\nAlgorithm:\n\n\r\n \r\n \r\n • POP DI\n\r\n • POP SI\n\r\n • POP BP\n\r\n • POP xx (SP value ignored)\n\r\n • POP BX\n\r\n • POP DX\n\r\n • POP CX\n\r\n • POP AX",
    "example": "",
    "flags": {}
  },
  "POPF": {
    "name": "POPF",
    "category": "Data Transfer",
    "operands": "No operands",
    "description": "Get flags register from the stack.\r\n\n\nAlgorithm:\n\n\r\n \r\n \r\n • flags = SS:[SP] (top of the stack)\n\r\n • SP = SP + 2",
    "example": "",
    "flags": {}
  },
  "PUSH": {
    "name": "PUSH",
    "category": "Data Transfer",
    "operands": "REG\n\r\n\tSREG\n\r\n\tmemory\n\r\n\timmediate",
    "description": "Store 16 bit value in the stack.\n\n\r\n\r\nNote: PUSH immediate works only on 80186 CPU and later!\r\n\n\nAlgorithm:\n\n\r\n \r\n \r\n • SP = SP - 2\n\r\n • SS:[SP] (top of the stack) = operand\n\r\n \r\n \r\n\nExample:",
    "example": "MOV AX, 1234h\r\nPUSH AX\r\nPOP  DX     ; DX = 1234h\r\nRET",
    "flags": {}
  },
  "PUSHA": {
    "name": "PUSHA",
    "category": "Data Transfer",
    "operands": "No operands",
    "description": "Push all general purpose registers AX, CX, DX, BX, SP, BP, SI, DI in the stack.\n\r\nOriginal value of SP register (before PUSHA) is used.\n\n\r\nNote: this instruction works only on 80186 CPU and later!\r\n\n\nAlgorithm:\n\n\r\n \r\n \r\n\t• PUSH AX\n\r\n\t• PUSH CX\n\r\n\t• PUSH DX\n\r\n\t• PUSH BX\n\r\n\t• PUSH SP\n\r\n\t• PUSH BP\n\r\n\t• PUSH SI\n\r\n\t• PUSH DI",
    "example": "",
    "flags": {}
  },
  "PUSHF": {
    "name": "PUSHF",
    "category": "Data Transfer",
    "operands": "No operands",
    "description": "Store flags register in the stack.\r\n\n\nAlgorithm:\n\n\r\n \r\n \r\n • SP = SP - 2\n\r\n • SS:[SP] (top of the stack) = flags",
    "example": "",
    "flags": {}
  },
  "RCL": {
    "name": "RCL",
    "category": "Shift & Rotate",
    "operands": "memory, immediate\n\r\n\tREG, immediate\n\n\r\n\tmemory, CL\n\r\n\tREG, CL",
    "description": "Rotate operand1 left through Carry Flag. The number of rotates is set by operand2.\r\n\n\r\nWhen immediate is greater then 1, assembler generates several\r\nRCL xx, 1 instructions because 8086 has machine code only for this\r\ninstruction (the same principle works for all other shift/rotate instructions).\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tshift all bits left, the bit that goes off is set to\r\n\tCF and previous value of CF is inserted to the right-most position.\r\n\r\n\r\n\nExample:",
    "example": "STC               ; set carry (CF=1).\r\nMOV AL, 1Ch       ; AL = 00011100b\r\nRCL AL, 1         ; AL = 00111001b,  CF=0.\r\nRET",
    "flags": {}
  },
  "RCR": {
    "name": "RCR",
    "category": "Shift & Rotate",
    "operands": "memory, immediate\n\r\n\tREG, immediate\n\n\r\n\tmemory, CL\n\r\n\tREG, CL",
    "description": "Rotate operand1 right through Carry Flag. The number of rotates is set by operand2.\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tshift all bits right, the bit that goes off is set to\r\n\tCF and previous value of CF is inserted to the left-most position.\r\n\r\n\r\n\nExample:",
    "example": "STC               ; set carry (CF=1).\r\nMOV AL, 1Ch       ; AL = 00011100b\r\nRCR AL, 1         ; AL = 10001110b,  CF=0.\r\nRET",
    "flags": {}
  },
  "REP": {
    "name": "REP",
    "category": "String Operations",
    "operands": "chain instruction",
    "description": "Repeat following MOVSB, MOVSW, LODSB, LODSW, STOSB, STOSW instructions\r\nCX times.\r\n\n\nAlgorithm:\n\n\r\n\r\ncheck_cx:\n\n\r\nif CX <> 0 then\r\n\r\n\t• do following chain instruction\n\r\n\t• CX = CX - 1\n\r\n\t• go back to check_cx\n\r\n\r\nelse\r\n\r\n\t• exit from REP cycle",
    "example": "",
    "flags": {}
  },
  "REPE": {
    "name": "REPE",
    "category": "String Operations",
    "operands": "chain instruction",
    "description": "Repeat following CMPSB, CMPSW, SCASB, SCASW instructions\r\nwhile ZF = 1 (result is Equal), maximum CX times.\r\n\n\nAlgorithm:\n\n\r\n\r\ncheck_cx:\n\n\r\nif CX <> 0 then\r\n\r\n\t• do following chain instruction\n\r\n\t• CX = CX - 1\n\r\n\t• if ZF = 1 then:\r\n\t\t\r\n\t\t• go back to check_cx\n\r\n\t\t\r\n\telse\r\n\t\t\r\n\t\t• exit from REPE cycle\n\r\n\t\t\r\n\t\n\r\n\r\nelse\r\n\r\n\t• exit from REPE cycle\n\r\n\r\n\r\nexample:\n\r\nopen cmpsb.asm from c:\\emu8086\\examples",
    "example": "",
    "flags": {}
  },
  "REPNE": {
    "name": "REPNE",
    "category": "String Operations",
    "operands": "chain instruction",
    "description": "Repeat following CMPSB, CMPSW, SCASB, SCASW instructions\r\nwhile ZF = 0 (result is Not Equal), maximum CX times.\r\n\n\nAlgorithm:\n\n\r\n\r\ncheck_cx:\n\n\r\nif CX <> 0 then\r\n\r\n\t• do following chain instruction\n\r\n\t• CX = CX - 1\n\r\n\t• if ZF = 0 then:\r\n\t\t\r\n\t\t• go back to check_cx\n\r\n\t\t\r\n\telse\r\n\t\t\r\n\t\t• exit from REPNE cycle\n\r\n\t\t\r\n\t\n\r\n\r\nelse\r\n\r\n\t• exit from REPNE cycle",
    "example": "",
    "flags": {}
  },
  "REPNZ": {
    "name": "REPNZ",
    "category": "String Operations",
    "operands": "chain instruction",
    "description": "Repeat following CMPSB, CMPSW, SCASB, SCASW instructions\r\nwhile ZF = 0 (result is Not Zero), maximum CX times.\r\n\n\nAlgorithm:\n\n\r\n\r\ncheck_cx:\n\n\r\nif CX <> 0 then\r\n\r\n\t• do following chain instruction\n\r\n\t• CX = CX - 1\n\r\n\t• if ZF = 0 then:\r\n\t\t\r\n\t\t• go back to check_cx\n\r\n\t\t\r\n\telse\r\n\t\t\r\n\t\t• exit from REPNZ cycle\n\r\n\t\t\r\n\t\n\r\n\r\nelse\r\n\r\n\t• exit from REPNZ cycle",
    "example": "",
    "flags": {}
  },
  "REPZ": {
    "name": "REPZ",
    "category": "String Operations",
    "operands": "chain instruction",
    "description": "Repeat following CMPSB, CMPSW, SCASB, SCASW instructions\r\nwhile ZF = 1 (result is Zero), maximum CX times.\r\n\n\nAlgorithm:\n\n\r\n\r\ncheck_cx:\n\n\r\nif CX <> 0 then\r\n\r\n\t• do following chain instruction\n\r\n\t• CX = CX - 1\n\r\n\t• if ZF = 1 then:\r\n\t\t\r\n\t\t• go back to check_cx\n\r\n\t\t\r\n\telse\r\n\t\t\r\n\t\t• exit from REPZ cycle\n\r\n\t\t\r\n\t\n\r\n\r\nelse\r\n\r\n\t• exit from REPZ cycle",
    "example": "",
    "flags": {}
  },
  "RET": {
    "name": "RET",
    "category": "Control Transfer",
    "operands": "No operands\n\r\nor even immediate",
    "description": "Return from near procedure.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\t• \r\n\t\tPop from stack:\r\n\t\t\r\n\t\t• IP\n\r\n\t\t\r\n\t\n\r\n\t• \r\n\tif immediate operand is present:\r\n\tSP = SP + operand\r\n\t\n\r\n\r\n\r\nExample:",
    "example": "ORG 100h  ; for COM file.\r\n\r\nCALL p1\r\n\r\nADD AX, 1\r\n\r\nRET         ; return to OS.\r\n\r\np1 PROC     ; procedure declaration.\r\n    MOV AX, 1234h\r\n    RET     ; return to caller.\r\np1 ENDP",
    "flags": {}
  },
  "RETF": {
    "name": "RETF",
    "category": "Control Transfer",
    "operands": "No operands\n\r\nor even immediate",
    "description": "Return from Far procedure.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\t• \r\n\t\tPop from stack:\r\n\t\t\r\n\t\t• IP\n\r\n\t\t• CS\n\r\n\t\t\r\n\t\n\r\n\t• \r\n\tif immediate operand is present:\r\n\tSP = SP + operand",
    "example": "",
    "flags": {}
  },
  "ROL": {
    "name": "ROL",
    "category": "Shift & Rotate",
    "operands": "memory, immediate\n\r\n\tREG, immediate\n\n\r\n\tmemory, CL\n\r\n\tREG, CL",
    "description": "Rotate operand1 left. The number of rotates is set by operand2.\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tshift all bits left, the bit that goes off is set to\r\n\tCF and the same bit is inserted to the right-most position.\r\n\r\n\r\nExample:",
    "example": "MOV AL, 1Ch       ; AL = 00011100b\r\nROL AL, 1         ; AL = 00111000b,  CF=0.\r\nRET",
    "flags": {}
  },
  "ROR": {
    "name": "ROR",
    "category": "Shift & Rotate",
    "operands": "memory, immediate\n\r\n\tREG, immediate\n\n\r\n\tmemory, CL\n\r\n\tREG, CL",
    "description": "Rotate operand1 right. The number of rotates is set by operand2.\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tshift all bits right, the bit that goes off is set to\r\n\tCF and the same bit is inserted to the left-most position.\r\n\r\n\r\nExample:",
    "example": "MOV AL, 1Ch       ; AL = 00011100b\r\nROR AL, 1         ; AL = 00001110b,  CF=0.\r\nRET",
    "flags": {}
  },
  "SAHF": {
    "name": "SAHF",
    "category": "Data Transfer",
    "operands": "No operands",
    "description": "Store AH register into low 8 bits of Flags register.\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\tflags register = AH",
    "example": "AH bit:   7    6   5    4   3    2   1    0\r\n        [SF] [ZF] [0] [AF] [0] [PF] [1] [CF]",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "SAL": {
    "name": "SAL",
    "category": "Shift & Rotate",
    "operands": "memory, immediate\n\r\n\tREG, immediate\n\n\r\n\tmemory, CL\n\r\n\tREG, CL",
    "description": "Shift Arithmetic operand1 Left. The number of shifts is set by operand2.\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\t• Shift all bits left, the bit that goes off is set to CF.\n\r\n\t• Zero bit is inserted to the right-most position.\n\r\n\r\n\r\nExample:",
    "example": "MOV AL, 0E0h      ; AL = 11100000b\r\nSAL AL, 1         ; AL = 11000000b,  CF=1.\r\nRET",
    "flags": {}
  },
  "SAR": {
    "name": "SAR",
    "category": "Shift & Rotate",
    "operands": "memory, immediate\n\r\n\tREG, immediate\n\n\r\n\tmemory, CL\n\r\n\tREG, CL",
    "description": "Shift Arithmetic operand1 Right. The number of shifts is set by operand2.\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\t• Shift all bits right, the bit that goes off is set to CF.\n\r\n\t• The sign bit that is inserted to the left-most position has\r\n\t    the same value as before shift.\n\r\n\r\n\r\nExample:",
    "example": "MOV AL, 0E0h      ; AL = 11100000b\r\nSAR AL, 1         ; AL = 11110000b,  CF=0.\r\n\r\nMOV BL, 4Ch       ; BL = 01001100b\r\nSAR BL, 1         ; BL = 00100110b,  CF=0.\r\n\r\nRET",
    "flags": {}
  },
  "SBB": {
    "name": "SBB",
    "category": "Arithmetic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Subtract with Borrow.\r\n\n\nAlgorithm:\n\n\r\n\r\noperand1 = operand1 - operand2 - CF\r\n\r\n\n\n\r\nExample:",
    "example": "STC\r\nMOV AL, 5\r\nSBB AL, 3    ; AL = 5 - 3 - 1 = 1\r\n\r\nRET",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "SCASB": {
    "name": "SCASB",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Compare bytes: AL from ES:[DI]. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• AL - ES:[DI]\n\n\r\n• set flags according to result:\n OF, SF, ZF, AF, PF, CF\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• DI = DI + 1\n\r\n\t\r\n\telse\r\n\t\r\n\t• DI = DI - 1",
    "example": "",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "SCASW": {
    "name": "SCASW",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Compare words: AX from ES:[DI]. \n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• AX - ES:[DI]\n\n\r\n• set flags according to result:\n OF, SF, ZF, AF, PF, CF\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• DI = DI + 2\n\r\n\t\r\n\telse\r\n\t\r\n\t• DI = DI - 2",
    "example": "",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "SHL": {
    "name": "SHL",
    "category": "Shift & Rotate",
    "operands": "memory, immediate\n\r\n\tREG, immediate\n\n\r\n\tmemory, CL\n\r\n\tREG, CL",
    "description": "Shift operand1 Left. The number of shifts is set by operand2.\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\t• Shift all bits left, the bit that goes off is set to CF.\n\r\n\t• Zero bit is inserted to the right-most position.\n\r\n\r\n\r\nExample:",
    "example": "MOV AL, 11100000b\r\nSHL AL, 1         ; AL = 11000000b,  CF=1.\r\n\r\nRET",
    "flags": {}
  },
  "SHR": {
    "name": "SHR",
    "category": "Shift & Rotate",
    "operands": "memory, immediate\n\r\n\tREG, immediate\n\n\r\n\tmemory, CL\n\r\n\tREG, CL",
    "description": "Shift operand1 Right. The number of shifts is set by operand2.\r\n\r\n\n\nAlgorithm:\n\n\r\n\r\n\r\n\t• Shift all bits right, the bit that goes off is set to CF.\n\r\n\t• Zero bit is inserted to the left-most position.\n\r\n\r\n\r\nExample:",
    "example": "MOV AL, 00000111b\r\nSHR AL, 1         ; AL = 00000011b,  CF=1.\r\n\r\nRET",
    "flags": {}
  },
  "STC": {
    "name": "STC",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "Set Carry flag. \n\nAlgorithm:\r\n\n\n\r\n\r\nCF = 1",
    "example": "",
    "flags": {}
  },
  "STD": {
    "name": "STD",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "Set Direction flag. SI and DI will be decremented by chain\r\ninstructions: CMPSB, CMPSW, LODSB, LODSW, MOVSB, MOVSW, STOSB, STOSW. \n\nAlgorithm:\r\n\n\n\r\n\r\nDF = 1",
    "example": "",
    "flags": {}
  },
  "STI": {
    "name": "STI",
    "category": "Processor Control",
    "operands": "No operands",
    "description": "Set Interrupt enable flag. This enables hardware interrupts. \n\nAlgorithm:\r\n\n\n\r\n\r\nIF = 1",
    "example": "",
    "flags": {}
  },
  "STOSB": {
    "name": "STOSB",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Store byte in AL into ES:[DI]. Update DI.\n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• ES:[DI] = AL\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• DI = DI + 1\n\r\n\t\r\n\telse\r\n\t\r\n\t• DI = DI - 1\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "ORG 100h\r\n\r\nLEA DI, a1\r\nMOV AL, 12h\r\nMOV CX, 5\r\n\r\nREP STOSB\r\n\r\nRET\r\n\r\na1 DB 5 dup(0)",
    "flags": {}
  },
  "STOSW": {
    "name": "STOSW",
    "category": "String Operations",
    "operands": "No operands",
    "description": "Store word in AX into ES:[DI]. Update DI.\n\nAlgorithm:\r\n\n\n\r\n\r\n\r\n• ES:[DI] = AX\n\n\r\n• if DF = 0 then\r\n\t\r\n\t• DI = DI + 2\n\r\n\t\r\n\telse\r\n\t\r\n\t• DI = DI - 2\n\r\n\t\r\n\n\r\n\r\n\r\nExample:",
    "example": "ORG 100h\r\n\r\nLEA DI, a1\r\nMOV AX, 1234h\r\nMOV CX, 5\r\n\r\nREP STOSW\r\n\r\nRET\r\n\r\na1 DW 5 dup(0)",
    "flags": {}
  },
  "SUB": {
    "name": "SUB",
    "category": "Arithmetic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Subtract.\r\n\n\nAlgorithm:\n\n\r\n\r\noperand1 = operand1 - operand2\r\n\r\n\n\n\r\nExample:",
    "example": "MOV AL, 5\r\nSUB AL, 1         ; AL = 4\r\n\r\nRET",
    "flags": {
      "C": "r",
      "Z": "r",
      "S": "r",
      "O": "r",
      "P": "r",
      "A": "r"
    }
  },
  "TEST": {
    "name": "TEST",
    "category": "Logic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Logical AND between all bits of two operands for flags only.\r\nThese flags are effected: ZF, SF, PF.\r\nResult is not stored anywhere.\n\n\r\nThese rules apply:\n\n\r\n\r\n1 AND 1 = 1\n\r\n1 AND 0 = 0\n\r\n0 AND 1 = 0\n\r\n0 AND 0 = 0\n\r\n\r\n\n\n\r\nExample:",
    "example": "MOV AL, 00000101b\r\nTEST AL, 1         ; ZF = 0.\r\nTEST AL, 10b       ; ZF = 1.\r\nRET",
    "flags": {}
  },
  "XCHG": {
    "name": "XCHG",
    "category": "Data Transfer",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG",
    "description": "Exchange values of two operands.\r\n\n\nAlgorithm:\n\n\r\n\r\noperand1 < - > operand2\r\n\r\n\n\n\r\nExample:",
    "example": "MOV AL, 5\r\nMOV AH, 2\r\nXCHG AL, AH   ; AL = 2, AH = 5\r\nXCHG AL, AH   ; AL = 5, AH = 2\r\nRET",
    "flags": {}
  },
  "XLATB": {
    "name": "XLATB",
    "category": "Data Transfer",
    "operands": "No operands",
    "description": "Translate byte from table.\n\r\nCopy value of memory byte at DS:[BX + unsigned AL] to\r\nAL register.\r\n\n\nAlgorithm:\n\n\r\n\r\nAL = DS:[BX + unsigned AL]\r\n\r\n\n\n\r\nExample:",
    "example": "ORG 100h\r\nLEA BX, dat\r\nMOV AL, 2\r\nXLATB     ; AL = 33h\r\n\r\nRET\r\n\r\ndat DB 11h, 22h, 33h, 44h, 55h",
    "flags": {}
  },
  "XOR": {
    "name": "XOR",
    "category": "Logic",
    "operands": "REG, memory\n\r\n\tmemory, REG\n\r\n\tREG, REG\n\r\n\tmemory, immediate\n\r\n\tREG, immediate",
    "description": "Logical XOR (Exclusive OR) between all bits of two operands.\r\nResult is stored in first operand.\n\n\r\nThese rules apply:\n\n\r\n\r\n1 XOR 1 = 0\n\r\n1 XOR 0 = 1\n\r\n0 XOR 1 = 1\n\r\n0 XOR 0 = 0\n\r\n\r\n\n\n\r\nExample:",
    "example": "MOV AL, 00000111b\r\nXOR AL, 00000010b    ; AL = 00000101b\r\nRET",
    "flags": {
      "C": "0",
      "Z": "r",
      "S": "r",
      "O": "0",
      "P": "r",
      "A": "?"
    }
  }
};

if (typeof module !== "undefined") { module.exports = INSTRUCTION_SET; }
