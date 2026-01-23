import { describe, it, expect, beforeEach } from 'vitest';
import { chessService } from './ChessService';

describe('ChessService', () => {
  beforeEach(() => {
    // Réinitialiser le service avant chaque test
    chessService.reset();
  });

  describe('Initialisation du plateau', () => {
    it('devrait créer un plateau 8x8', () => {
      const board = chessService.getBoard();
      expect(board).toHaveLength(8);
      expect(board[0]).toHaveLength(8);
    });

    it('devrait placer les pièces noires en haut (rangées 0 et 1)', () => {
      const board = chessService.getBoard();
      
      // Vérifier la rangée 0 (pièces principales noires)
      expect(board[0][0]).toMatchObject({ color: 'black', type: 'rook' });
      expect(board[0][1]).toMatchObject({ color: 'black', type: 'knight' });
      expect(board[0][2]).toMatchObject({ color: 'black', type: 'bishop' });
      expect(board[0][3]).toMatchObject({ color: 'black', type: 'queen' });
      expect(board[0][4]).toMatchObject({ color: 'black', type: 'king' });
      expect(board[0][7]).toMatchObject({ color: 'black', type: 'rook' });
      
      // Vérifier les pions noirs
      for (let c = 0; c < 8; c++) {
        expect(board[1][c]).toMatchObject({ color: 'black', type: 'pawn' });
      }
    });

    it('devrait placer les pièces blanches en bas (rangées 6 et 7)', () => {
      const board = chessService.getBoard();
      
      // Vérifier les pions blancs
      for (let c = 0; c < 8; c++) {
        expect(board[6][c]).toMatchObject({ color: 'white', type: 'pawn' });
      }
      
      // Vérifier la rangée 7 (pièces principales blanches)
      expect(board[7][0]).toMatchObject({ color: 'white', type: 'rook' });
      expect(board[7][1]).toMatchObject({ color: 'white', type: 'knight' });
      expect(board[7][4]).toMatchObject({ color: 'white', type: 'king' });
      expect(board[7][7]).toMatchObject({ color: 'white', type: 'rook' });
    });

    it('devrait laisser les cases du milieu vides (rangées 2 à 5)', () => {
      const board = chessService.getBoard();
      
      for (let r = 2; r <= 5; r++) {
        for (let c = 0; c < 8; c++) {
          expect(board[r][c]).toBeNull();
        }
      }
    });
  });

  describe('Déplacement des pièces', () => {
    it('devrait déplacer une pièce vers une case vide', () => {
      const board = chessService.getBoard();
      
      // Déplacer un pion blanc de (6,0) vers (4,0)
      const result = chessService.movePiece(6, 0, 4, 0);
      
      expect(result).toBe(true);
      expect(board[6][0]).toBeNull(); // Case d'origine vide
      expect(board[4][0]).toMatchObject({ color: 'white', type: 'pawn' }); // Nouvelle position
    });

    it('devrait remplacer une pièce sur une case occupée', () => {
      const board = chessService.getBoard();
      
      // Déplacer un pion blanc (6,0) sur un pion noir (1,0)
      const result = chessService.movePiece(6, 0, 1, 0);
      
      expect(result).toBe(true);
      expect(board[6][0]).toBeNull(); // Case d'origine vide
      expect(board[1][0]).toMatchObject({ color: 'white', type: 'pawn' }); // Pion blanc a remplacé le noir
    });

    it('ne devrait pas déplacer une pièce depuis une case vide', () => {
      const result = chessService.movePiece(3, 3, 4, 4); // Case vide
      
      expect(result).toBe(false);
    });

    it('devrait déplacer le roi blanc correctement', () => {
      const board = chessService.getBoard();
      
      // Déplacer le roi blanc de (7,4) vers (5,4)
      chessService.movePiece(7, 4, 5, 4);
      
      expect(board[7][4]).toBeNull();
      expect(board[5][4]).toMatchObject({ color: 'white', type: 'king' });
    });
  });

  describe('Historique des déplacements', () => {
    it('devrait ajouter un déplacement à l\'historique', () => {
      chessService.movePiece(6, 0, 4, 0);
      
      const history = chessService.getHistory();
      
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        pieceName: 'white pawn',
        from: [6, 0],
        to: [4, 0],
        replacedName: null
      });
      expect(history[0].time).toBeDefined();
    });

    it('devrait enregistrer le remplacement d\'une pièce', () => {
      chessService.movePiece(6, 0, 1, 0); // Pion blanc remplace pion noir
      
      const history = chessService.getHistory();
      
      expect(history[0]).toMatchObject({
        pieceName: 'white pawn',
        from: [6, 0],
        to: [1, 0],
        replacedName: 'black pawn'
      });
    });

    it('devrait empiler les déplacements dans l\'ordre inverse', () => {
      chessService.movePiece(6, 0, 4, 0); // Premier déplacement
      chessService.movePiece(1, 0, 3, 0); // Deuxième déplacement
      
      const history = chessService.getHistory();
      
      expect(history).toHaveLength(2);
      expect(history[0].pieceName).toBe('black pawn'); // Le plus récent en premier
      expect(history[1].pieceName).toBe('white pawn');
    });

    it('devrait limiter l\'historique à 50 coups', () => {
      // Faire 60 déplacements
      for (let i = 0; i < 60; i++) {
        chessService.movePiece(6, 0, 4, 0);
        chessService.movePiece(4, 0, 6, 0);
      }
      
      const history = chessService.getHistory();
      
      expect(history).toHaveLength(50); // Maximum 50 coups
    });
  });

  describe('Réinitialisation', () => {
    it('devrait réinitialiser le plateau à la position initiale', () => {
      // Faire quelques déplacements
      chessService.movePiece(6, 0, 4, 0);
      chessService.movePiece(1, 0, 3, 0);
      
      // Réinitialiser
      chessService.reset();
      
      const board = chessService.getBoard();
      
      // Vérifier que les pièces sont revenues à leur position initiale
      expect(board[6][0]).toMatchObject({ color: 'white', type: 'pawn' });
      expect(board[1][0]).toMatchObject({ color: 'black', type: 'pawn' });
      expect(board[4][0]).toBeNull(); // Case du milieu vide
      expect(board[3][0]).toBeNull();
    });

    it('devrait vider l\'historique après réinitialisation', () => {
      chessService.movePiece(6, 0, 4, 0);
      chessService.movePiece(1, 0, 3, 0);
      
      chessService.reset();
      
      const history = chessService.getHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Cas limites', () => {
    it('devrait gérer le déplacement vers la même position', () => {
      const board = chessService.getBoard();
      const pieceAvant = board[6][0];
      
      chessService.movePiece(6, 0, 6, 0); // Même position
      
      expect(board[6][0]).toEqual(pieceAvant);
    });

    it('devrait gérer les déplacements en chaîne', () => {
      // Déplacer plusieurs fois la même pièce
      chessService.movePiece(6, 0, 4, 0);
      chessService.movePiece(4, 0, 2, 0);
      chessService.movePiece(2, 0, 0, 0);
      
      const board = chessService.getBoard();
      const history = chessService.getHistory();
      
      expect(board[0][0]).toMatchObject({ color: 'white', type: 'pawn' });
      expect(history).toHaveLength(3);
    });
  });
});