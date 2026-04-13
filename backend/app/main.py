from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from generator import generate_sudoku
from solver import solve_sudoku, empty_cell

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SudokuRequest(BaseModel):
    board: List[List[int]]

class ValidateRequest(BaseModel):
    board: List[List[int]]
    row: int
    col: int
    num: int

class HintRequest(BaseModel):
    board: List[List[int]]
    hints_used: int = 0

@app.get("/")
def home():
    return {"message": "Sudoku API is working"}

@app.get("/newgame")
def generate(level: str = "easy"):
    try:
        board = generate_sudoku(level)
        return {"board": board}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/solve")
def solve(request: SudokuRequest):
    board = [row[:] for row in request.board]
    if solve_sudoku(board):
        return {"solution": board}
    raise HTTPException(status_code=400, detail="No solution exists for the provided board.")

@app.post("/validate")
def validate(request: ValidateRequest):
    board = [row[:] for row in request.board]
    row, col, num = request.row, request.col, request.num

    if not (0 <= row < 9 and 0 <= col < 9):
        raise HTTPException(status_code=400, detail="Row and column must be between 0 and 8.")
    if not (1 <= num <= 9):
        raise HTTPException(status_code=400, detail="Number must be between 1 and 9.")
    if board[row][col] != 0:
        return {"valid": False, "message": "Cell is already filled."}

    if any(board[row][i] == num for i in range(9)):
        return {"valid": False, "message": "Number already exists in the same row."}
    if any(board[i][col] == num for i in range(9)):
        return {"valid": False, "message": "Number already exists in the same column."}

    br, bc = row - row % 3, col - col % 3
    if any(board[i][j] == num for i in range(br, br + 3) for j in range(bc, bc + 3)):
        return {"valid": False, "message": "Number already exists in the same 3x3 box."}

    return {"valid": True, "message": "Valid move."}

@app.post("/hint")
def get_hint(request: HintRequest):
    MAX_HINTS = 3

    if request.hints_used >= MAX_HINTS:
        return {
            "hint_available": False,
            "message": "No hints remaining.",
            "hints_remaining": 0
        }

    board_copy = [row[:] for row in request.board]
    solved_board = [row[:] for row in request.board]

    if not solve_sudoku(solved_board):
        raise HTTPException(status_code=400, detail="Board cannot be solved.")

    cell = empty_cell(board_copy)
    if cell is None:
        return {
            "hint_available": False,
            "message": "Board is already complete.",
            "hints_remaining": MAX_HINTS - request.hints_used
        }

    hint_row, hint_col = cell
    correct_value = solved_board[hint_row][hint_col]
    hints_remaining = MAX_HINTS - (request.hints_used + 1)

    return {
        "hint_available": True,
        "row": hint_row,
        "col": hint_col,
        "value": correct_value,
        "message": "Hint generated successfully.",
        "hints_used": request.hints_used + 1,
        "hints_remaining": hints_remaining
    }