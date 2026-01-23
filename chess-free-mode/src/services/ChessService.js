import { reactive } from "vue";

class ChessService {
  constructor() {
    this.state = reactive({
      board: this._createInitialBoard(),
      history: [],
    });
  }

  getBoard() {
    return this.state.board;
  }

  getHistory() {
    return this.state.history;
  }

  movePiece(fromRow, fromCol, toRow, toCol) {
    const board = this.state.board;
    const piece = board[fromRow][fromCol];
    if (!piece) return false;

    const replaced = board[toRow][toCol];

    board[toRow][toCol] = piece;
    board[fromRow][fromCol] = null;

    this.state.history.unshift({
      pieceName: `${piece.color} ${piece.type}`,
      from: [fromRow, fromCol],
      to: [toRow, toCol],
      replacedName: replaced ? `${replaced.color} ${replaced.type}` : null,
      time: new Date().toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      })
    });

    // Limiter l'historique à 50 coups
    if (this.state.history.length > 50) {
      this.state.history.pop();
    }

    return true;
  }

  reset() {
    this.state.board = this._createInitialBoard();
    this.state.history = [];
  }

  _createInitialBoard() {
    const empty = Array.from({ length: 8 }, () => Array(8).fill(null));

    const mk = (color, type, symbol) => ({ color, type, symbol });

    const WHITE = {
      king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙',
    };
    const BLACK = {
      king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟',
    };

    // Pièces noires (rangée 0)
    empty[0][0] = mk('black', 'rook', BLACK.rook);
    empty[0][1] = mk('black', 'knight', BLACK.knight);
    empty[0][2] = mk('black', 'bishop', BLACK.bishop);
    empty[0][3] = mk('black', 'queen', BLACK.queen);
    empty[0][4] = mk('black', 'king', BLACK.king);
    empty[0][5] = mk('black', 'bishop', BLACK.bishop);
    empty[0][6] = mk('black', 'knight', BLACK.knight);
    empty[0][7] = mk('black', 'rook', BLACK.rook);

    // Pions noirs
    for (let c = 0; c < 8; c++) {
      empty[1][c] = mk('black', 'pawn', BLACK.pawn);
    }

    // Pions blancs
    for (let c = 0; c < 8; c++) {
      empty[6][c] = mk('white', 'pawn', WHITE.pawn);
    }

    // Pièces blanches (rangée 7)
    empty[7][0] = mk('white', 'rook', WHITE.rook);
    empty[7][1] = mk('white', 'knight', WHITE.knight);
    empty[7][2] = mk('white', 'bishop', WHITE.bishop);
    empty[7][3] = mk('white', 'queen', WHITE.queen);
    empty[7][4] = mk('white', 'king', WHITE.king);
    empty[7][5] = mk('white', 'bishop', WHITE.bishop);
    empty[7][6] = mk('white', 'knight', WHITE.knight);
    empty[7][7] = mk('white', 'rook', WHITE.rook);

    return empty;
  }
}

export const chessService = new ChessService();