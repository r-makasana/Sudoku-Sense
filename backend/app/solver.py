from validator import is_valid_move


def empty_cell(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                return (row, col)
    return None

def solve_sudoku(board):
    empty = empty_cell(board)
    if not empty:
        return True  # Puzzle solved

    row, col = empty

    for num in range(1, 10):
        if is_valid_move(board, row, col, num):
            board[row][col] = num

            if solve_sudoku(board):
                return True

            board[row][col] = 0  # Backtrack

    return False  