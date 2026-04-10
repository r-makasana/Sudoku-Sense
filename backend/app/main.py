from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from generator import generate_sudoku
from solver import solve_sudoku

app = FastAPI()

class SudokuRequest(BaseModel):
    board: List[List[int]]

@app.get("/")
def home():
    return {"message": "Sudoku API is working"}

@app.get("/generate/{level}")
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
    
