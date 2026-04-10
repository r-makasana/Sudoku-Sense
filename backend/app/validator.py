# Check if placing a number in a cell is valid or not.

def is_valid_move(board, row, col, num):
    # Check if the number is not in the current row
    for i in range(9):
        if board[row][i] == num:
            return False

    # Check if the number is not in the current column
    for i in range(9):
        if board[i][col] == num:
            return False

    # Check if the number is not in the current 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False

    return True

# Example usage:
'''if __name__ == "__main__":
    board = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]

print(is_valid_move(board, 0, 2, 3)) 
print(is_valid_move(board, 0, 2, 4))  '''