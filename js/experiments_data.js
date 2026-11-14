// Pre-loaded solutions & documentation for all Lab Experiments
const LAB_EXPERIMENTS = [
  // ==========================================
  // EXPERIMENT 1: ADD & SUBTRACT
  // ==========================================
  {
    id: "exp1a",
    category: "Experiment 1: Add & Subtract",
    title: "1a. Addition of Two 8-bit Numbers (All Addressing Modes)",
    description: "Demonstrates 8-bit addition using Register, Immediate, Direct, and Indirect addressing modes. Stores results in memory and registers.",
    code: `; ========================================================
; Experiment 1a: Addition of two 8-bit numbers
; Demonstrating Register, Immediate, Direct & Indirect modes
; ========================================================
ORG 100h

; 1. IMMEDIATE ADDRESSING MODE
; Operands specified directly in the instruction
MOV AL, 25h       ; AL = 25h (immediate)
ADD AL, 14h       ; AL = 25h + 14h = 39h

; 2. REGISTER ADDRESSING MODE
; Operands are CPU registers
MOV BL, 30h       ; BL = 30h
MOV CL, 12h       ; CL = 12h
ADD BL, CL        ; BL = 30h + 12h = 42h

; 3. DIRECT ADDRESSING MODE
; Operands are memory addresses specified by variable names
MOV AL, [num1]    ; AL = value at num1 (0Ah)
ADD AL, [num2]    ; AL = 0Ah + 15h = 1Fh
MOV [res_dir], AL ; Store result in memory

; 4. REGISTER INDIRECT ADDRESSING MODE
; Memory address is held in a pointer register (SI / BX)
LEA SI, num1      ; SI points to num1
MOV AL, [SI]      ; AL = [SI] = 0Ah
INC SI            ; SI points to num2
ADD AL, [SI]      ; AL = 0Ah + 15h = 1Fh
MOV [res_ind], AL ; Store result

HLT               ; Halt execution

; --- DATA SECTION ---
num1    DB 0Ah    ; First 8-bit number (10 decimal)
num2    DB 15h    ; Second 8-bit number (21 decimal)
res_dir DB 0      ; Direct mode result storage
res_ind DB 0      ; Indirect mode result storage
`
  },
  {
    id: "exp1b",
    category: "Experiment 1: Add & Subtract",
    title: "1b. Addition of Two 16-bit Numbers (All Addressing Modes)",
    description: "Demonstrates 16-bit word addition using Register, Immediate, Direct, and Indirect addressing modes.",
    code: `; ========================================================
; Experiment 1b: Addition of two 16-bit numbers
; Demonstrating Register, Immediate, Direct & Indirect modes
; ========================================================
ORG 100h

; 1. IMMEDIATE ADDRESSING MODE
MOV AX, 1234h     ; AX = 1234h (immediate)
ADD AX, 4321h     ; AX = 1234h + 4321h = 5555h

; 2. REGISTER ADDRESSING MODE
MOV BX, 2000h     ; BX = 2000h
MOV CX, 3456h     ; CX = 3456h
ADD BX, CX        ; BX = 2000h + 3456h = 5456h

; 3. DIRECT ADDRESSING MODE
MOV AX, [val1]    ; AX = value of 16-bit val1 (1111h)
ADD AX, [val2]    ; AX = 1111h + 2222h = 3333h
MOV [sum_dir], AX ; Store 16-bit result

; 4. INDIRECT ADDRESSING MODE
LEA SI, val1      ; SI points to val1
MOV AX, [SI]      ; AX = [SI] (1111h)
ADD AX, [SI+2]    ; AX = 1111h + [SI+2] (2222h) = 3333h
MOV [sum_ind], AX ; Store result

HLT

; --- DATA SECTION ---
val1    DW 1111h  ; First 16-bit word
val2    DW 2222h  ; Second 16-bit word
sum_dir DW 0      ; Direct result
sum_ind DW 0      ; Indirect result
`
  },
  {
    id: "exp1c",
    category: "Experiment 1: Add & Subtract",
    title: "1c. Addition of Two 32-bit Numbers",
    description: "Multi-precision 32-bit addition on 8086 using ADD for lower 16 bits and ADC (Add with Carry) for upper 16 bits, with final carry capture.",
    code: `; ========================================================
; Experiment 1c: Addition of two 32-bit numbers
; 32-bit Addition using ADD and ADC (Add with Carry)
; Number 1: 12345678h (Low: 5678h, High: 1234h)
; Number 2: 87654321h (Low: 4321h, High: 8765h)
; ========================================================
ORG 100h

; Step 1: Add Lower 16-bits (Words)
MOV AX, [num1_low]   ; AX = 5678h
ADD AX, [num2_low]   ; AX = 5678h + 4321h = 9999h (CF set if overflow)
MOV [res_low], AX    ; Store lower 16 bits

; Step 2: Add Higher 16-bits with Carry from Step 1
MOV AX, [num1_high]  ; AX = 1234h
ADC AX, [num2_high]  ; AX = 1234h + 8765h + CF = 9999h
MOV [res_high], AX   ; Store higher 16 bits

; Step 3: Capture overall 33rd Carry bit (if any)
MOV [res_carry], 0
JNC no_carry
MOV [res_carry], 1

no_carry:
HLT

; --- DATA SECTION ---
num1_low   DW 5678h
num1_high  DW 1234h
num2_low   DW 4321h
num2_high  DW 8765h

res_low    DW 0      ; Result lower 16-bits (9999h)
res_high   DW 0      ; Result higher 16-bits (9999h)
res_carry  DB 0      ; Final Carry flag (0 or 1)
`
  },
  {
    id: "exp1d",
    category: "Experiment 1: Add & Subtract",
    title: "1d. Subtraction of Two 8-bit Numbers (All Addressing Modes)",
    description: "Demonstrates 8-bit subtraction using Register, Immediate, Direct, and Indirect addressing modes.",
    code: `; ========================================================
; Experiment 1d: Subtraction of two 8-bit numbers
; Demonstrating Register, Immediate, Direct & Indirect modes
; ========================================================
ORG 100h

; 1. IMMEDIATE ADDRESSING MODE
MOV AL, 50h       ; AL = 50h
SUB AL, 20h       ; AL = 50h - 20h = 30h

; 2. REGISTER ADDRESSING MODE
MOV BL, 45h       ; BL = 45h
MOV CL, 15h       ; CL = 15h
SUB BL, CL        ; BL = 45h - 15h = 30h

; 3. DIRECT ADDRESSING MODE
MOV AL, [diff1]   ; AL = 65h
SUB AL, [diff2]   ; AL = 65h - 23h = 42h
MOV [res_sub1], AL

; 4. REGISTER INDIRECT ADDRESSING MODE
LEA SI, diff1
MOV AL, [SI]      ; AL = 65h
INC SI
SUB AL, [SI]      ; AL = 65h - 23h = 42h
MOV [res_sub2], AL

HLT

; --- DATA SECTION ---
diff1    DB 65h
diff2    DB 23h
res_sub1 DB 0
res_sub2 DB 0
`
  },
  {
    id: "exp1e",
    category: "Experiment 1: Add & Subtract",
    title: "1e. Subtraction of Two 16-bit Numbers (All Addressing Modes)",
    description: "Demonstrates 16-bit word subtraction using Register, Immediate, Direct, and Indirect addressing modes.",
    code: `; ========================================================
; Experiment 1e: Subtraction of two 16-bit numbers
; Demonstrating Register, Immediate, Direct & Indirect modes
; ========================================================
ORG 100h

; 1. IMMEDIATE ADDRESSING MODE
MOV AX, 5432h
SUB AX, 1234h     ; AX = 5432h - 1234h = 41FEh

; 2. REGISTER ADDRESSING MODE
MOV BX, 8000h
MOV CX, 3000h
SUB BX, CX        ; BX = 8000h - 3000h = 5000h

; 3. DIRECT ADDRESSING MODE
MOV AX, [w1]      ; AX = 9876h
SUB AX, [w2]      ; AX = 9876h - 5432h = 4444h
MOV [res_w1], AX

; 4. INDIRECT ADDRESSING MODE
LEA DI, w1
MOV AX, [DI]      ; AX = 9876h
SUB AX, [DI+2]    ; AX = 9876h - 5432h = 4444h
MOV [res_w2], AX

HLT

; --- DATA SECTION ---
w1     DW 9876h
w2     DW 5432h
res_w1 DW 0
res_w2 DW 0
`
  },
  {
    id: "exp1f",
    category: "Experiment 1: Add & Subtract",
    title: "1f. Subtraction of Two 32-bit Numbers",
    description: "Multi-precision 32-bit subtraction on 8086 using SUB for lower 16 bits and SBB (Subtract with Borrow) for upper 16 bits.",
    code: `; ========================================================
; Experiment 1f: Subtraction of two 32-bit numbers
; Multi-precision 32-bit Subtraction using SUB & SBB
; Number 1: 98765432h (Low: 5432h, High: 9876h)
; Number 2: 12346789h (Low: 6789h, High: 1234h)
; Notice 5432h < 6789h so borrow is propagated to high word!
; ========================================================
ORG 100h

; Step 1: Subtract Lower 16-bits
MOV AX, [n1_low]  ; AX = 5432h
SUB AX, [n2_low]  ; AX = 5432h - 6789h = ECA9h (Borrow CF=1 set!)
MOV [diff_low], AX

; Step 2: Subtract Higher 16-bits with Borrow
MOV AX, [n1_high] ; AX = 9876h
SBB AX, [n2_high] ; AX = 9876h - 1234h - CF(1) = 8641h
MOV [diff_high], AX

; Step 3: Capture overall Borrow (if any)
MOV [diff_borrow], 0
JNC no_borrow
MOV [diff_borrow], 1

no_borrow:
HLT

; --- DATA SECTION ---
n1_low      DW 5432h
n1_high     DW 9876h
n2_low      DW 6789h
n2_high     DW 1234h

diff_low    DW 0   ; Lower 16-bit difference (ECA9h)
diff_high   DW 0   ; Higher 16-bit difference (8641h)
diff_borrow DB 0   ; Overall borrow (0)
`
  },

  // ==========================================
  // EXPERIMENT 2: MULTIPLICATION & DIVISION
  // ==========================================
  {
    id: "exp2a",
    category: "Experiment 2: Multiplication & Division",
    title: "2a. Multiplication of Two 8-bit Numbers",
    description: "Multiplies two 8-bit numbers using MUL (AL * operand -> AX). Demonstrates Register, Direct, and Indirect addressing modes.",
    code: `; ========================================================
; Experiment 2a: Multiplication of two 8-bit numbers
; 8-bit MUL: AL * operand -> AX (Product in AX)
; ========================================================
ORG 100h

; 1. REGISTER ADDRESSING MODE
MOV AL, 12h       ; AL = 12h (18 decimal)
MOV BL, 05h       ; BL = 05h (5 decimal)
MUL BL            ; AX = AL * BL = 12h * 05h = 005Ah (90 decimal)
MOV [res_reg], AX

; 2. DIRECT ADDRESSING MODE
MOV AL, [num1]    ; AL = 20h (32 decimal)
MUL BYTE PTR [num2] ; AX = AL * [num2] = 20h * 04h = 0080h (128 decimal)
MOV [res_dir], AX

; 3. INDIRECT ADDRESSING MODE
LEA SI, num1      ; SI points to num1
MOV AL, [SI]      ; AL = 20h
INC SI            ; SI points to num2
MUL BYTE PTR [SI] ; AX = 20h * 04h = 0080h
MOV [res_ind], AX

HLT

; --- DATA SECTION ---
num1    DB 20h
num2    DB 04h
res_reg DW 0
res_dir DW 0
res_ind DW 0
`
  },
  {
    id: "exp2b",
    category: "Experiment 2: Multiplication & Division",
    title: "2b. Multiplication of Two 16-bit Numbers",
    description: "Multiplies two 16-bit numbers using MUL (AX * operand -> DX:AX). Result is 32-bit: High word in DX, Low word in AX.",
    code: `; ========================================================
; Experiment 2b: Multiplication of two 16-bit numbers
; 16-bit MUL: AX * operand -> DX:AX
; DX = High 16 bits of product, AX = Low 16 bits of product
; ========================================================
ORG 100h

; 1. REGISTER ADDRESSING MODE
MOV AX, 1000h     ; AX = 1000h
MOV BX, 2000h     ; BX = 2000h
MUL BX            ; DX:AX = 1000h * 2000h = 0200:0000h
MOV [prod_reg_low], AX
MOV [prod_reg_high], DX

; 2. DIRECT ADDRESSING MODE
MOV AX, [val1]    ; AX = 1234h
MUL WORD PTR [val2] ; DX:AX = 1234h * 5678h
MOV [prod_dir_low], AX
MOV [prod_dir_high], DX

; 3. INDIRECT ADDRESSING MODE
LEA SI, val1
MOV AX, [SI]      ; AX = [val1]
MUL WORD PTR [SI+2] ; Multiply with [val2]
MOV [prod_ind_low], AX
MOV [prod_ind_high], DX

HLT

; --- DATA SECTION ---
val1          DW 1234h
val2          DW 5678h
prod_reg_low  DW 0
prod_reg_high DW 0
prod_dir_low  DW 0
prod_dir_high DW 0
prod_ind_low  DW 0
prod_ind_high DW 0
`
  },
  {
    id: "exp2c",
    category: "Experiment 2: Multiplication & Division",
    title: "2c. Division of 32-bit by 16-bit Numbers",
    description: "Divides 32-bit dividend (DX:AX) by 16-bit divisor. Quotient stored in AX, Remainder stored in DX.",
    code: `; ========================================================
; Experiment 2c: Division of 32-bit by 16-bit numbers
; Dividend is 32-bit in DX:AX (DX = High Word, AX = Low Word)
; Divisor is 16-bit operand
; Result: AX = Quotient, DX = Remainder
; ========================================================
ORG 100h

; DIRECT ADDRESSING MODE
MOV AX, [dividend_low]   ; AX = Low word (5678h)
MOV DX, [dividend_high]  ; DX = High word (0012h) -> 32-bit value 00125678h
MOV BX, [divisor]        ; BX = 0100h (Divisor)
DIV BX                   ; AX = Quotient, DX = Remainder

MOV [quotient], AX       ; Store Quotient
MOV [remainder], DX      ; Store Remainder

HLT

; --- DATA SECTION ---
dividend_low  DW 5678h   ; Dividend low word
dividend_high DW 0012h   ; Dividend high word (Total = 00125678h = 1,201,784 dec)
divisor       DW 0100h   ; Divisor (256 dec)
quotient      DW 0       ; Expected AX = 1256h (4694 dec)
remainder     DW 0       ; Expected DX = 0078h (120 dec)
`
  },
  {
    id: "exp2d",
    category: "Experiment 2: Multiplication & Division",
    title: "2d. Division of 16-bit by 8-bit Numbers",
    description: "Divides 16-bit dividend (AX) by 8-bit divisor. Quotient stored in AL, Remainder stored in AH.",
    code: `; ========================================================
; Experiment 2d: Division of 16-bit by 8-bit numbers
; Dividend is 16-bit in AX
; Divisor is 8-bit operand
; Result: AL = Quotient, AH = Remainder
; ========================================================
ORG 100h

; 1. REGISTER ADDRESSING
MOV AX, 0064h     ; AX = 100 decimal (64h)
MOV BL, 07h       ; BL = 7 decimal
DIV BL            ; AL = 100 / 7 = 14 (0Eh), AH = 100 % 7 = 2
MOV [q_reg], AL
MOV [r_reg], AH

; 2. DIRECT ADDRESSING
MOV AX, [dividend16] ; AX = 00FFh (255 dec)
DIV BYTE PTR [div8]  ; Divide by 0Ah (10 dec)
MOV [q_dir], AL      ; Quotient = 25 (19h)
MOV [r_dir], AH      ; Remainder = 5 (05h)

HLT

; --- DATA SECTION ---
dividend16 DW 00FFh
div8       DB 0Ah
q_reg      DB 0
r_reg      DB 0
q_dir      DB 0
r_dir      DB 0
`
  },

  // ==========================================
  // EXPERIMENT 3: ARRAY OPERATIONS
  // ==========================================
  {
    id: "exp3a",
    category: "Experiment 3: Array Operations",
    title: "3a. Find Largest Element in an Array",
    description: "Iterates through an array of 8-bit numbers and finds the maximum unsigned value.",
    code: `; ========================================================
; Experiment 3a: Find Largest Element in an Array
; Input: Array of 8-bit unsigned numbers
; Output: Largest number stored in [largest] and AL
; ========================================================
ORG 100h

LEA SI, array     ; SI points to start of array
MOV CL, [count]   ; CL = number of elements
DEC CL            ; CL = count - 1 comparisons
MOV AL, [SI]      ; Initialize AL with first element as current Max

find_max:
INC SI            ; Move to next element
CMP AL, [SI]      ; Compare current max with next element
JAE skip_update   ; If AL >= [SI], skip
MOV AL, [SI]      ; Otherwise, update max: AL = [SI]

skip_update:
DEC CL            ; Decrement loop counter
JNZ find_max      ; Repeat until all elements checked

MOV [largest], AL ; Store largest value found
HLT

; --- DATA SECTION ---
count   DB 5
array   DB 25h, 4Ah, 12h, 89h, 34h
largest DB 0      ; Expected: 89h
`
  },
  {
    id: "exp3b",
    category: "Experiment 3: Array Operations",
    title: "3b. Find Smallest Element in an Array",
    description: "Iterates through an array of 8-bit numbers and finds the minimum unsigned value.",
    code: `; ========================================================
; Experiment 3b: Find Smallest Element in an Array
; Input: Array of 8-bit unsigned numbers
; Output: Smallest number stored in [smallest] and AL
; ========================================================
ORG 100h

LEA SI, array     ; SI points to array start
MOV CL, [count]   ; CL = element count
DEC CL            ; Number of comparisons = count - 1
MOV AL, [SI]      ; AL = first element as current Min

find_min:
INC SI            ; Point to next element
CMP AL, [SI]      ; Compare current min with [SI]
JBE skip_update   ; If AL <= [SI], skip update
MOV AL, [SI]      ; AL = new min

skip_update:
DEC CL
JNZ find_min

MOV [smallest], AL ; Store minimum value
HLT

; --- DATA SECTION ---
count    DB 5
array    DB 42h, 15h, 78h, 09h, 33h
smallest DB 0     ; Expected: 09h
`
  },
  {
    id: "exp3c",
    category: "Experiment 3: Array Operations",
    title: "3c. Find the Range of an Array (Max - Min)",
    description: "Finds both the maximum and minimum elements in a single pass through the array, then computes Range = Max - Min.",
    code: `; ========================================================
; Experiment 3c: Find the Range of an Array
; Range = (Maximum Element) - (Minimum Element)
; ========================================================
ORG 100h

LEA SI, array     ; SI points to array
MOV CL, [count]   ; Total elements
DEC CL            ; Comparisons = count - 1

MOV AH, [SI]      ; AH holds MAX (initial: first element)
MOV AL, [SI]      ; AL holds MIN (initial: first element)

check_elem:
INC SI
MOV BL, [SI]      ; Current element

; Check for Max
CMP BL, AH
JBE check_min     ; If BL <= AH, check if it's min
MOV AH, BL        ; New Max = BL
JMP next_loop

check_min:
CMP BL, AL
JAE next_loop     ; If BL >= AL, no change
MOV AL, BL        ; New Min = BL

next_loop:
DEC CL
JNZ check_elem

MOV [max_val], AH
MOV [min_val], AL

; Compute Range = Max - Min
SUB AH, AL
MOV [range], AH   ; Store range in memory

HLT

; --- DATA SECTION ---
count   DB 6
array   DB 20h, 05h, 50h, 12h, 80h, 30h
max_val DB 0      ; Expected: 80h
min_val DB 0      ; Expected: 05h
range   DB 0      ; Expected: 80h - 05h = 7Bh
`
  },
  {
    id: "exp3d",
    category: "Experiment 3: Array Operations",
    title: "3d. Find Smallest Number in a Signed Array",
    description: "Finds the smallest number in a signed array (using signed conditional jump JLE / JL instead of JBE / JB).",
    code: `; ========================================================
; Experiment 3d: Find Smallest Number in a SIGNED Array
; Signed comparison uses JL (Jump if Less) / JLE
; Numbers in two's complement: e.g. -15 (F1h), +25 (19h), -50 (CEh)
; ========================================================
ORG 100h

LEA SI, signed_arr
MOV CL, [count]
DEC CL
MOV AL, [SI]      ; AL = initial signed min

find_signed_min:
INC SI
CMP AL, [SI]      ; Compare signed AL with signed [SI]
JLE skip_upd      ; Signed check: if AL <= [SI] skip
MOV AL, [SI]      ; Update signed min: AL = [SI]

skip_upd:
DEC CL
JNZ find_signed_min

MOV [min_signed], AL
HLT

; --- DATA SECTION ---
count      DB 6
signed_arr DB 15, -10, 42, -50, 8, -3  ; -50 is 0CEh
min_signed DB 0                        ; Expected: -50 (0CEh)
`
  },
  {
    id: "exp3e",
    category: "Experiment 3: Array Operations",
    title: "3e. Count Odd and Even Elements in an Array",
    description: "Iterates through array, tests the Least Significant Bit (LSB). If LSB=0 -> Even, if LSB=1 -> Odd.",
    code: `; ========================================================
; Experiment 3e: Count the number of odd and even elements
; LSB test using TEST instruction:
; If (AL AND 1) == 0 -> EVEN
; If (AL AND 1) == 1 -> ODD
; ========================================================
ORG 100h

LEA SI, array
MOV CL, [count]
MOV BL, 0         ; BL = Even Counter
MOV BH, 0         ; BH = Odd Counter

count_loop:
MOV AL, [SI]
TEST AL, 01h      ; Test bit 0 (ZF=1 if even, ZF=0 if odd)
JNZ is_odd

; Even branch
INC BL
JMP next_item

is_odd:
INC BH

next_item:
INC SI
DEC CL
JNZ count_loop

MOV [even_count], BL
MOV [odd_count], BH

HLT

; --- DATA SECTION ---
count      DB 6
array      DB 12h, 15h, 24h, 33h, 48h, 51h  ; 3 even (12h, 24h, 48h), 3 odd (15h, 33h, 51h)
even_count DB 0
odd_count  DB 0
`
  },
  {
    id: "exp3f",
    category: "Experiment 3: Array Operations",
    title: "3f. Separate Positive and Negative Numbers into Arrays",
    description: "Classifies array elements into separate POSITIVE and NEGATIVE memory arrays using sign bit or CMP.",
    code: `; ========================================================
; Experiment 3f: Separate Positive & Negative numbers
; Scans source array and copies positive numbers to pos_array
; and negative numbers to neg_array
; ========================================================
ORG 100h

LEA SI, src_array ; SI points to source array
LEA DI, pos_array ; DI points to positive array
LEA BX, neg_array ; BX points to negative array

MOV CL, [count]   ; Loop counter
MOV CH, 0         ; Pos count
MOV DL, 0         ; Neg count

classify_loop:
MOV AL, [SI]
CMP AL, 0         ; Check sign of AL
JS is_negative    ; Jump if sign flag SF=1 (Negative)

; Positive number (>= 0)
MOV [DI], AL
INC DI
INC CH
JMP next_element

is_negative:
MOV [BX], AL
INC BX
INC DL

next_element:
INC SI
DEC CL
JNZ classify_loop

MOV [pos_count], CH
MOV [neg_count], DL

HLT

; --- DATA SECTION ---
count     DB 6
src_array DB 10, -5, 24, -18, 45, -2
pos_array DB 6 DUP(0)  ; Positive numbers: 10, 24, 45
neg_array DB 6 DUP(0)  ; Negative numbers: -5, -18, -2
pos_count DB 0         ; Expected: 3
neg_count DB 0         ; Expected: 3
`
  },

  // ==========================================
  // EXPERIMENT 4: SORTING & MANIPULATION
  // ==========================================
  {
    id: "exp4a",
    category: "Experiment 4: Sorting & Manipulation",
    title: "4a. Bubble Sort in Ascending Order",
    description: "Sorts an array of 8-bit unsigned numbers in ascending order using nested Bubble Sort loops.",
    code: `; ========================================================
; Experiment 4a: Bubble Sort in Ascending Order
; Arranges array elements in smallest-to-largest order
; ========================================================
ORG 100h

MOV CH, [count]
DEC CH            ; Outer loop runs (count - 1) times

outer_loop:
MOV CL, [count]
DEC CL            ; Inner loop runs (count - 1) times
LEA SI, array     ; Reset pointer to start of array

inner_loop:
MOV AL, [SI]      ; AL = array[i]
MOV BL, [SI+1]    ; BL = array[i+1]
CMP AL, BL
JBE no_swap       ; If array[i] <= array[i+1], already in order

; Swap elements: array[i] <-> array[i+1]
MOV [SI], BL
MOV [SI+1], AL

no_swap:
INC SI            ; Move to next adjacent pair
DEC CL
JNZ inner_loop

DEC CH
JNZ outer_loop

HLT

; --- DATA SECTION ---
count DB 5
array DB 45h, 12h, 89h, 23h, 05h
; Expected sorted array: 05h, 12h, 23h, 45h, 89h
`
  },
  {
    id: "exp4b",
    category: "Experiment 4: Sorting & Manipulation",
    title: "4b. Bubble Sort in Descending Order",
    description: "Sorts an array of 8-bit unsigned numbers in descending order (largest to smallest).",
    code: `; ========================================================
; Experiment 4b: Bubble Sort in Descending Order
; Arranges array elements in largest-to-smallest order
; ========================================================
ORG 100h

MOV CH, [count]
DEC CH            ; Outer loop runs (count - 1) times

outer_loop:
MOV CL, [count]
DEC CL            ; Inner loop
LEA SI, array     ; SI points to array start

inner_loop:
MOV AL, [SI]      ; AL = array[i]
MOV BL, [SI+1]    ; BL = array[i+1]
CMP AL, BL
JAE no_swap       ; For Descending: If AL >= BL, already correct

; Swap if AL < BL
MOV [SI], BL
MOV [SI+1], AL

no_swap:
INC SI
DEC CL
JNZ inner_loop

DEC CH
JNZ outer_loop

HLT

; --- DATA SECTION ---
count DB 5
array DB 14h, 78h, 02h, 55h, 31h
; Expected sorted: 78h, 55h, 31h, 14h, 02h
`
  },
  {
    id: "exp4c",
    category: "Experiment 4: Sorting & Manipulation",
    title: "4c. Reverse the Order of Array Elements",
    description: "Reverses array elements in-place using two pointers (SI pointing to start, DI pointing to end) and swapping elements.",
    code: `; ========================================================
; Experiment 4c: Reverse Array Elements In-Place
; Two-pointer approach:
; SI starts at beginning (0), DI starts at end (N-1)
; Swap [SI] and [DI], then SI++, DI--
; ========================================================
ORG 100h

LEA SI, array     ; SI points to first element
LEA DI, array
MOV AL, [count]
MOV AH, 0
ADD DI, AX
DEC DI            ; DI points to last element (array + count - 1)

MOV CL, [count]
SHR CL, 1         ; Loop count = length / 2

reverse_loop:
MOV AL, [SI]      ; AL = left element
MOV BL, [DI]      ; BL = right element
MOV [SI], BL      ; Swap left with right
MOV [DI], AL

INC SI            ; Move left pointer right
DEC DI            ; Move right pointer left
DEC CL
JNZ reverse_loop

HLT

; --- DATA SECTION ---
count DB 6
array DB 11h, 22h, 33h, 44h, 55h, 66h
; Expected reversed array: 66h, 55h, 44h, 33h, 22h, 11h
`
  },
  // Sample DOS "Hello World"
  {
    id: "hello_world",
    category: "Demos & IO",
    title: "Hello World (INT 21h AH=09h)",
    description: "Classic DOS Hello World printing a $-terminated string using INT 21h function 09h.",
    code: `; ========================================================
; DOS Hello World Demo
; Prints a string to the emulated screen using INT 21h
; ========================================================
ORG 100h

LEA DX, msg       ; DX points to $-terminated string
MOV AH, 09h       ; DOS function: print string
INT 21h           ; Call DOS interrupt

; Read a key before exit
MOV AH, 01h       ; DOS function: read character
INT 21h

MOV AH, 4Ch       ; DOS function: terminate program
INT 21h

; --- DATA SECTION ---
msg DB 'Hello from Open8086!', 0Dh, 0Ah, 'Ready for Lab on Monday!$'
`
  }
];

if (typeof module !== "undefined") {
  module.exports = LAB_EXPERIMENTS;
}
