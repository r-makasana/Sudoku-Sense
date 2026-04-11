from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from generator import generate_sudoku
from solver import solve_sudoku, empty_cell

app = FastAPI()

class SudokuRequest(BaseModel):
    board: List[List[int]]

@app.get("/")
def home():
    return {"message": "Sudoku API is working"}

@app.get("/newgame")
def generate(level: str):
    try:
        board = generate_sudoku(level)
        return {"board": board}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/solve")
def solve(request: SudokuRequest):
    board = request.board
    if solve_sudoku(board):
        return {"solution": board}
    else:
        raise HTTPException(status_code=400, detail="No solution exists for the provided board.")
    
@app.post("/validate")
def validate(request: SudokuRequest):
    board=[row[:] for row in request.board]  # Create a copy of the board
    row=request.row
    col=request.col
    num=request.num
     # Check row/col range
    if not (0 <= row < 9 and 0 <= col < 9):
        raise HTTPException(status_code=400, detail="Row and column must be between 0 and 8.")

    # Check number range
    if not (1 <= num <= 9):
        raise HTTPException(status_code=400, detail="Number must be between 1 and 9.")

    # Check if cell is empty
    if board[row][col] != 0:
        return {
            "valid": False,
            "message": "Cell is already filled."
        }

    # Validate move
    if any(board[row][i] == num for i in range(9)):
        return {
            "valid": False,
            "message": "Number already exists in the same row."
        }
    if any(board[i][col] == num for i in range(9)):
        return {
            "valid": False,
            "message": "Number already exists in the same column."
        }
    if any(board[i][j] == num for i in range(row - row % 3, row - row % 3 + 3) for j in range(col - col % 3, col - col % 3 + 3)):
        return {
            "valid": False,
            "message": "Number already exists in the same 3x3 box."
        }

    return {
        "valid": True,
        "message": "Valid move."
    }    

@app.post("/hint")
def get_hint(request: SudokuRequest):
    MAX_HINTS = 3

    if request.hints_used >= MAX_HINTS:
        return {
            "hint_available": False,
            "message": "No hints remaining.",
            "hints_remaining": 0
        }

    board_copy = [row[:] for row in request.board]
    solved_board = [row[:] for row in request.board]

    if not solve(solved_board):
        raise HTTPException(status_code=400, detail="Board cannot be solved.")

    empty_cell = empty_cell(board_copy)

    if empty_cell is None:
        return {
            "hint_available": False,
            "message": "Board is already complete.",
            "hints_remaining": MAX_HINTS - request.hints_used
        }

    row, col = empty_cell
    correct_value = solved_board[row][col]
    hints_remaining = MAX_HINTS - (request.hints_used + 1)

    return {
        "hint_available": True,
        "row": row,
        "col": col,
        "value": correct_value,
        "message": "Hint generated successfully.",
        "hints_used": request.hints_used + 1,
        "hints_remaining": hints_remaining
    }


       

