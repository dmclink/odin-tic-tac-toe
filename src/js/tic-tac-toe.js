// #region events
const events = (function events() {
	const e = {};

	function on(eventName, fn) {
		e[eventName] = e[eventName] || [];
		e[eventName].push(fn);
	}

	function off(eventName, fn) {
		if (e[eventName]) {
			for (let i = 0; i < e[eventName].length; i++) {
				if (e[eventName] === fn) {
					e[eventName].splice(i, 1);
					break;
				}
			}
		}
	}

	function emit(eventName, data) {
		if (e[eventName]) {
			e[eventName].forEach((fn) => {
				fn(data);
			});
		}
	}

	return { on, off, emit };
})();
// #endregion

// #region game
const game = (function tictactoe() {
	// #region PRIVATE FIELDS
	// // CONSTANTS
	const player1 = 0;
	const player2 = 1;
	const tie = 2;

	/** playerSymbol is the respective player's game board symbol
	 * The index represents the player
	 * ie. index 0 represnts player 1 who has the symbol 'X' */
	const playerSymbol = ['X', 'O'];

	// // STATE
	/** board is the 3x3 tic-tac-toe board. Elements can be one of: '.', 'X', 'O' represnting
	 * an empty slot, player 1 piece, or player 2 piece respectively */
	const board = new Array(3).fill([]);
	for (let i = 0; i < 3; i++) {
		board[i] = new Array(3).fill('.');
	}

	/** currentPlayer represents the current players turn
	 * one of: 0, 1
	 * value of 0 means it is player 1's turn, 1 means player 2 */
	let currentPlayer = 0;

	let winner;
	// #endregion

	// #region PRIVATE METHODS
	/** Returns true if row and column locations are out of bounds of board
	 *
	 * @param {number} row - row of board to check
	 * @param {number} col - column of board to check
	 * @returns {boolean} - location is out of bounds */
	function oob(row, col) {
		return row >= 3 || col >= 3 || row < 0 || col < 0;
	}

	/** Returns true if board location has not been placed by a player. Represented by
	 * element equal to '.'
	 * ASSUME: row and col are not out of bounds (!oob(row, col))
	 *
	 * @param {number[0,2]} row - row location of board to check
	 * @param {number[0,2]} col - column location of board to check
	 * @returns {boolean} - board location has not been placed '.' */
	function empty(row, col) {
		return board[row][col] === '.';
	}

	/** Changes currentPlayer state from 0 to 1 or 1 to 0 */
	function toggleCurrentPlayer() {
		currentPlayer ^= 1;
		events.emit('playerChange', currentPlayer);
	}

	/** Returns true if winner is undefined.
	 * Winner state is updated via updateWinner function */
	function noWinner() {
		return winner === undefined;
	}

	/** Updates winner state if game has a winner, otherwise leaves winner as undefined.
	 * A game winner is if either player has placed 3 of their symbols in a row.
	 * A game tie is if the board is filled and there is no winner.
	 * Game is still ongoing (winner is undefined) if board is not filled and there is no winner. */
	function updateWinner() {
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
		if (noWinner()) {
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
		if (noWinner()) {
			if (
				board[0][0] !== '.' &&
				board[0][0] === board[1][1] &&
				board[0][0] === board[2][2]
			) {
				winner = mapToPlayer[board[0][0]];
			}
		}

		if (noWinner()) {
			if (
				board[0][2] !== '.' &&
				board[0][2] === board[1][1] &&
				board[0][2] === board[2][0]
			) {
				winner = mapToPlayer[board[0][2]];
			}
		}

		// check for tie (all game board slots are filled)
		if (noWinner()) {
			console.log('got here:', winner);
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
		}
	}

	// TODO: delete this function and move emit logic to replace function call once ui elements added
	function gameOver(winner) {
		events.emit('gameOver', winner);
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

	/** Returns the symbol for the current player.
	 *
	 * @returns {'X'|'O'} - current player's symbol */
	function currentPlayerSymbol() {
		return playerSymbol[currentPlayer];
	}
	// #endregion

	// #region PUBLIC METHODS
	function tryRound(data) {
		const { row, col } = data;
		console.log('try round called:', row, col);
		if (oob(row, col)) {
			return;
		}

		if (!empty(row, col)) {
			return;
		}
		console.log('emitting playRound');
		data.symbol = currentPlayerSymbol();
		events.emit('playRound', data);
	}

	/** Places the game piece for the current player at the inputted board location.
	 * ASSUME: row and col are valid locations (tryRound is called and inputs are
	 *         validated before calling this method)
	 *
	 * @param {number[0,2]} row - the row to place the game piece
	 * @param {number[0,2]} col - the column to place the game place */
	function place(row, col) {
		const currentPlayerSymbol = playerSymbol[currentPlayer];
		board[row][col] = currentPlayerSymbol;
	}

	/** Resets game to initial state */
	function reset() {
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				board[i][j] = '.';
			}
		}

		currentPlayer = 0;
		winner = undefined;
	}

	function playRound(data) {
		const { row, col } = data;
		console.log('playround called:', row, col);
		place(row, col);
		updateWinner();
		if (noWinner()) {
			toggleCurrentPlayer();
		} else {
			gameOver(winner);
		}
	}

	/** Updates DOM element with string describing current player. */
	function updatePlayer(currentPlayer) {
		// TODO: update a DOM element with current playerString
		const playerStrings = ["Player 1: X's", "Player 2: O's"];
		console.log(playerStrings[currentPlayer]);
	}
	// #endregion

	// #region INIT
	events.on('tryRound', tryRound);
	events.on('playRound', playRound);
	events.on('playerChange', updatePlayer);

	// #endregion
	return { place, reset, currentPlayerSymbol };
})();
// #endergion

// #region displayController
const displayController = (function displayController() {
	const board = document.querySelector('.board');

	// build 2d matrix of cached cell element references for quick manipulation via row and col
	const cellEls = board.querySelectorAll('.cell');
	const cells = new Array(3);
	for (let i = 0; i < 3; i++) {
		cells[i] = new Array(3);
	}
	Array.from(cellEls).forEach((cell) => {
		const row = Number(cell.getAttribute('data-row'));
		const col = Number(cell.getAttribute('data-col'));
		cells[row][col] = cell;
		return cells;
	});

	// PRIVATE METHODS
	function handleCellClick(e) {
		const cell = e.target;
		const row = Number(cell.getAttribute('data-row'));
		const col = Number(cell.getAttribute('data-col'));

		events.emit('tryRound', { row, col });
	}

	// PUBLIC METHODS
	function bindEvents() {
		cellEls.forEach((cell) => {
			cell.addEventListener('click', handleCellClick);
		});
	}

	// TODO: probably need to rebind events on restart
	function unbindEvents() {
		cellEls.forEach((cell) => {
			cell.removeEventListener('click', handleCellClick);
		});
	}

	function updateCellData(data) {
		const { row, col, symbol } = data;
		console.log('updating cell data:', row, col, symbol);

		cells[row][col].setAttribute('data-piece', symbol);
	}

	function displayWinner(winner) {
		// TODO: create a ui element in the html and update it here
		console.log('wooo the winner was:', winner);
	}

	events.on('playRound', updateCellData);
	events.on('gameOver', unbindEvents);
	events.on('gameOver', displayWinner);

	return { updateCellData, bindEvents };
})();
// #endregion

document.addEventListener('DOMContentLoaded', () => {
	displayController.bindEvents();
});
