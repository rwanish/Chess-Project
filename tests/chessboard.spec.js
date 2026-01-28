import { test, expect } from '@playwright/test';

test.describe('ChessBoard Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('devrait afficher le titre de l\'application', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Jeu d\'Échecs - Mode Libre');
  });

  test('devrait afficher le plateau d\'échecs avec 64 cases', async ({ page }) => {
    const squares = page.locator('.square');
    await expect(squares).toHaveCount(64);
  });

  test('devrait afficher toutes les pièces noires en haut', async ({ page }) => {
    // Vérifier la rangée 0 (pièces principales noires)
    const rook1 = page.locator('.square').nth(0).locator('.piece');
    await expect(rook1).toHaveText('♜');

    const knight1 = page.locator('.square').nth(1).locator('.piece');
    await expect(knight1).toHaveText('♞');

    const bishop1 = page.locator('.square').nth(2).locator('.piece');
    await expect(bishop1).toHaveText('♝');

    const queen = page.locator('.square').nth(3).locator('.piece');
    await expect(queen).toHaveText('♛');

    const king = page.locator('.square').nth(4).locator('.piece');
    await expect(king).toHaveText('♚');

    // Vérifier les pions noirs (rangée 1 = cases 8-15)
    for (let i = 8; i < 16; i++) {
      const pawn = page.locator('.square').nth(i).locator('.piece');
      await expect(pawn).toHaveText('♟');
    }
  });

  test('devrait afficher toutes les pièces blanches en bas', async ({ page }) => {
    // Vérifier les pions blancs (rangée 6 = cases 48-55)
    for (let i = 48; i < 56; i++) {
      const pawn = page.locator('.square').nth(i).locator('.piece');
      await expect(pawn).toHaveText('♙');
    }

    // Vérifier la rangée 7 (pièces principales blanches, cases 56-63)
    const rook1 = page.locator('.square').nth(56).locator('.piece');
    await expect(rook1).toHaveText('♖');

    const knight1 = page.locator('.square').nth(57).locator('.piece');
    await expect(knight1).toHaveText('♘');

    const king = page.locator('.square').nth(60).locator('.piece');
    await expect(king).toHaveText('♔');
  });

  test('devrait avoir des cases vides au milieu du plateau', async ({ page }) => {
    // Vérifier quelques cases du milieu (rangées 2-5)
    for (let i = 16; i < 48; i += 8) {
      const square = page.locator('.square').nth(i);
      const piece = square.locator('.piece');
      await expect(piece).toHaveCount(0);
    }
  });

  test('devrait sélectionner une pièce au clic', async ({ page }) => {
    // Cliquer sur un pion blanc (case 48)
    const pawn = page.locator('.square').nth(48);
    await pawn.click();

    // Vérifier que la case est sélectionnée
    await expect(pawn).toHaveClass(/selected/);

    // Vérifier le statut de sélection
    const status = page.locator('.status .value').first();
    await expect(status).toContainText('white pawn (6,0)');
  });

  test('devrait désélectionner une pièce en cliquant dessus à nouveau', async ({ page }) => {
    // Sélectionner une pièce
    const pawn = page.locator('.square').nth(48);
    await pawn.click();
    await expect(pawn).toHaveClass(/selected/);

    // Cliquer à nouveau pour désélectionner
    await pawn.click();
    await expect(pawn).not.toHaveClass(/selected/);

    // Vérifier le statut
    const status = page.locator('.status .value').first();
    await expect(status).toContainText('aucune');
  });

  test('devrait déplacer une pièce vers une case vide', async ({ page }) => {
    // Sélectionner un pion blanc (case 48)
    const fromSquare = page.locator('.square').nth(48);
    await fromSquare.click();

    // Cliquer sur une case vide (case 32, milieu du plateau)
    const toSquare = page.locator('.square').nth(32);
    await toSquare.click();

    // Vérifier que la pièce a été déplacée
    const piece = toSquare.locator('.piece');
    await expect(piece).toHaveText('♙');

    // Vérifier que l'ancienne case est vide
    const oldPiece = fromSquare.locator('.piece');
    await expect(oldPiece).toHaveCount(0);
  });

  test('devrait remplacer une pièce adverse', async ({ page }) => {
    // Sélectionner un pion blanc (case 48)
    const whitePawn = page.locator('.square').nth(48);
    await whitePawn.click();

    // Cliquer sur un pion noir (case 8)
    const blackPawn = page.locator('.square').nth(8);
    await blackPawn.click();

    // Vérifier que le pion blanc a remplacé le pion noir
    const piece = blackPawn.locator('.piece');
    await expect(piece).toHaveText('♙'); // Pion blanc
  });

  test('devrait mettre à jour l\'historique après un déplacement', async ({ page }) => {
    // Vérifier que l'historique est vide
    await expect(page.locator('.empty')).toBeVisible();

    // Effectuer un déplacement
    await page.locator('.square').nth(48).click(); // Sélectionner
    await page.locator('.square').nth(32).click(); // Déplacer

    // Vérifier que l'historique contient le déplacement
    await expect(page.locator('.history-item')).toHaveCount(1);
    await expect(page.locator('.move-piece').first()).toContainText('white pawn');
    await expect(page.locator('.move-coords').first()).toContainText('(6,0) → (4,0)');
  });

  test('devrait afficher plusieurs déplacements dans l\'historique', async ({ page }) => {
    // Premier déplacement
    await page.locator('.square').nth(48).click();
    await page.locator('.square').nth(32).click();

    // Deuxième déplacement
    await page.locator('.square').nth(8).click();
    await page.locator('.square').nth(24).click();

    // Vérifier que l'historique contient 2 déplacements
    await expect(page.locator('.history-item')).toHaveCount(2);
  });

  test('devrait réinitialiser le plateau avec le bouton reset', async ({ page }) => {
    // Effectuer un déplacement
    await page.locator('.square').nth(48).click();
    await page.locator('.square').nth(32).click();

    // Vérifier que le déplacement a eu lieu
    await expect(page.locator('.history-item')).toHaveCount(1);

    // Cliquer sur le bouton reset
    await page.locator('.reset-btn').click();

    // Vérifier que l'historique est vide
    await expect(page.locator('.empty')).toBeVisible();

    // Vérifier que les pièces sont revenues à leur position initiale
    const pawn = page.locator('.square').nth(48).locator('.piece');
    await expect(pawn).toHaveText('♙');

    const emptySquare = page.locator('.square').nth(32).locator('.piece');
    await expect(emptySquare).toHaveCount(0);
  });

  test('devrait basculer entre mode clair et sombre', async ({ page }) => {
    // Vérifier le mode initial (clair)
    const app = page.locator('.app');
    await expect(app).not.toHaveClass(/dark-mode/);

    // Cliquer sur le bouton de thème
    await page.locator('.theme-toggle').click();

    // Vérifier le mode sombre
    await expect(app).toHaveClass(/dark-mode/);

    // Recliquer pour revenir au mode clair
    await page.locator('.theme-toggle').click();
    await expect(app).not.toHaveClass(/dark-mode/);
  });
});