import random
from solver import solve_sudoku
from solver import empty_cell

DIFFICULTY_LEVELS = {
    "easy": {"filled": (36, 45), "empty": (36, 45)},
    "medium": {"filled": (32, 36), "empty": (45, 49)},
    "hard": {"filled": (28, 32), "empty": (49, 53)},
    "expert": {"filled": (24, 28), "empty": (53, 57)},
    "master": {"filled": (20, 24), "empty": (57, 61)},
}

def create_empty_board():
    return [[0 for _ in range(9)] for _ in range(9)]

def generate_full_board():
    board = create_empty_board()
    solve_sudoku(board)
    return board

def remove_numbers(board, num_holes):
    holes = 0
    while holes < num_holes:
        row = random.randint(0, 8)
        col = random.randint(0, 8)

        if board[row][col] != 0:
            board[row][col] = 0
            holes += 1

    return board

def get_empty_count(level):
    level = level.lower()

    if level not in DIFFICULTY_LEVELS:
        raise ValueError(
            "Invalid difficulty level. Choose from: easy, medium, hard, expert, master"
        )

    min_empty, max_empty = DIFFICULTY_LEVELS[level]["empty"]
    return random.randint(min_empty, max_empty)
def generate_sudoku(level):
    full_board = generate_full_board()
    num_holes = get_empty_count(level)
    return remove_numbers(full_board, num_holes)