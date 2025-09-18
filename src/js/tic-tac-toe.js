const game = (function tictactoe() {
	// #region PRIVATE FIELDS
	// // CONSTANTS
	const player1 = 0;
	const player2 = 1;
	const tie = 2;

	// playerSymbol is the respective player's game board symbol
	// The index represents the player
	// ie. index 0 represnts player 1 who has the symbol 'X'
	const playerSymbol = ['X', 'O'];

	// // STATE
	// board is the 3x3 tic-tac-toe board. Elements can be one of: '.', 'X', 'O' represnting
	// an empty slot, player 1 piece, or player 2 piece respectively
	const board = new Array(3).fill([]);
	for (let i = 0; i < 3; i++) {
		board[i] = new Array(3).fill('.');
	}

	// currentPlayer represents the current players turn
	// one of: 0, 1
	// value of 0 means it is player 1's turn, 1 means player 2
	let currentPlayer = 0;
	// #endregion

	// #region PRIVATE METHODS
	/** Returns true if row and column locations are out of bounds of board
	 *
	 * @param {number} row - row of board to check
	 * @param {number} col - column of board to check
	 * @returns {boolean} - location is out of bounds
	 */
	function oob(row, col) {
		return row >= 3 || col >= 3 || row < 0 || col < 0;
	}

	/** Returns true if board location has not been placed by a player. Represented by
	 * element equal to '.'
	 * ASSUME: row and col are not out of bounds (!oob(row, col))
	 *
	 * @param {number[0,2]} row - row location of board to check
	 * @param {number[0,2]} col - column location of board to check
	 * @returns {boolean} - board location has not been placed '.'
	 */
	function empty(row, col) {
		return board[row][col] === '.';
	}

	/** Changes currentPlayer state from 0 to 1 or 1 to 0 */
	function toggleCurrentPlayer() {
		currentPlayer ^= 1;
	}

	/** Prints board to console */
	function render() {
		console.log(board);
	}

	/** Checks if any winner of the game and returns it, otherwise returns undefined.
	 * A game winner is if either player has placed 3 of their symbols in a row.
	 * A game tie is if the board is filled and there is no winner.
	 * Game is still ongoing (return undefined) if board is not filled and there is no winner.
	 *
	 * @returns {undefined|player1|player2|tie} - the winner of the game
	 */
	function checkWinner() {
		let winner;

		const mapToPlayer = { X: player1, O: player2 };
		// check rows
		for (let i = 0; i < 3; i++) {
			if (
				board[i][0] !== '.' &&
				board[i][0] === board[i][1] &&
				board[i][0] === board[i][2]
			) {
				winner = mapToPlayer[board[i][0]];
				break;
			}
		}

		// check columns
		if (!winner) {
			for (let i = 0; i < 3; i++) {
				if (
					board[0][i] !== '.' &&
					board[0][i] === board[1][i] &&
					board[0][i] === board[2][i]
				) {
					winner = mapToPlayer[board[0][i]];
					break;
				}
			}
		}

		// check diagonals
		if (!winner) {
			if (
				board[0][0] !== '.' &&
				board[0][0] === board[1][1] &&
				board[0][0] === board[2][2]
			) {
				winner = mapToPlayer[board[0][0]];
			}
		}
		if (!winner) {
			if (
				board[0][2] !== '.' &&
				board[0][2] === board[1][1] &&
				board[0][2] === board[2][0]
			) {
				winner = mapToPlayer[board[0][2]];
			}
		}

		// check for tie (all game board slots are filled)
		let isTie = true;
		outer: for (const row of board) {
			for (const el of row) {
				if (el === '.') {
					isTie = false;
					break outer;
				}
			}
		}

		if (isTie) {
			winner = tie;
		}

		return winner;
	}

	function gameOver(winner) {
		switch (winner) {
			case player1:
				console.log('Player 1 wins!');
				break;
			case player2:
				console.log('Player 2 wins!');
				break;
			case tie:
				console.log('It was a tie.');
				break;
		}
		console.log("If you'd like to play again, call reset()");
	}
	// #endregion

	// #region PUBLIC METHODS
	/** Places the game piece for the current player at the inputted board location.
	 * Throws error if incorrect location inputed or if location is already filled.
	 * Calls to re-render board, checks for winner, and toggle player after a valid placement.
	 *
	 * @param {number[0,2]} row - the row to place the game piece
	 * @param {number[0,2]} col - the column to place the game place
	 */
	function place(row, col) {
		if (oob(row, col)) {
			throw Error('location out of bounds of board');
		}

		if (!empty(row, col)) {
			throw Error('tried placing piece in already occupied location');
		}

		const currentPlayerSymbol = playerSymbol[currentPlayer];
		board[row][col] = currentPlayerSymbol;
		render();
		const winner = checkWinner();
		if (winner !== undefined) {
			gameOver(winner);
		} else {
			toggleCurrentPlayer();
		}
	}

	/** Resets game to initial state */
	function reset() {
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				board[i][j] = '.';
			}
		}

		currentPlayer = 0;
		render();
	}
	// #endregion

	render();

	return { place, reset };
})();
