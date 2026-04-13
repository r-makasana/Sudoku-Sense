const BASE_URL = "http://127.0.0.1:8000";

export async function fetchNewGame(level) {
  const response = await fetch(`${BASE_URL}/newgame?level=${level}`);

  if (!response.ok) {
    throw new Error("Failed to fetch new game");
  }

  return response.json();
}

export async function fetchHint(board, hintsUsed) {     
    const response = await fetch(`${BASE_URL}/hint`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ board, hints_used: hintsUsed }),
    }); 
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }   
    return await response.json();
}

export async function fetchSolve(board) {
    const response = await fetch(`${BASE_URL}/solve`, {     
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ board }),
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

