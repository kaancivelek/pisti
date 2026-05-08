import PDFDocument from 'pdfkit';
import type { RecipePdfData } from './types';

/**
 * Verilen tarif verisinden bir PDF Buffer üretir.
 * Sunucu tarafında çalışır (Node.js / Next.js Route Handler).
 */
export async function generateRecipePdf(recipe: RecipePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 60, right: 60 },
      info: {
        Title: recipe.title ?? 'Tarif',
        Author: 'Pişti',
        Subject: 'Yemek Tarifi',
      },
    });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 120; // margins
    const accentColor = '#1a1a1a';
    const mutedColor = '#888888';
    const borderColor = '#e5e5e5';
    const bgLight = '#f7f7f5';

    // ── HEADER BAND ──────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 10).fill(accentColor);

    // ── LOGO / BRAND ─────────────────────────────────────────────
    doc
      .fontSize(11)
      .fillColor(mutedColor)
      .font('Helvetica-Bold')
      .text('PİŞTİ', 60, 28, { align: 'left' });

    doc
      .fontSize(9)
      .fillColor(mutedColor)
      .font('Helvetica')
      .text('Yemek Tarifleri', 60, 43, { align: 'left' });

    // ── CATEGORY ─────────────────────────────────────────────────
    doc.moveDown(3.5);
    if (recipe.categoryName) {
      doc
        .fontSize(9)
        .fillColor(mutedColor)
        .font('Helvetica-Bold')
        .text(recipe.categoryName.toUpperCase());
      doc.moveDown(0.4);
    }

    // ── TITLE ────────────────────────────────────────────────────
    doc
      .fontSize(28)
      .fillColor(accentColor)
      .font('Helvetica-Bold')
      .text(recipe.title ?? 'Tarif', { lineGap: 4 });

    // ── SHORT TITLE / DESCRIPTION ─────────────────────────────────
    if (recipe.shortTitle || recipe.description) {
      doc.moveDown(0.4);
      doc
        .fontSize(12)
        .fillColor(mutedColor)
        .font('Helvetica-Oblique')
        .text(recipe.shortTitle || recipe.description || '', { lineGap: 2 });
    }

    doc.moveDown(1.2);

    // ── META GRID ─────────────────────────────────────────────────
    const metaY = doc.y;
    const col = pageWidth / 3;

    doc
      .rect(60, metaY, pageWidth, 54)
      .fill(bgLight);

    const metaItems = [
      { label: 'Hazırlık', value: recipe.prepTime ? `${recipe.prepTime} ${recipe.prepTimeUnit ?? 'dk'}` : '—' },
      { label: 'Pişirme', value: recipe.cookTime ? `${recipe.cookTime} ${recipe.cookTimeUnit ?? 'dk'}` : '—' },
      { label: 'Porsiyon', value: recipe.servings ? `${recipe.servings} ${recipe.servingUnit ?? 'kişilik'}` : '—' },
    ];

    metaItems.forEach((item, i) => {
      doc
        .fontSize(8)
        .fillColor(mutedColor)
        .font('Helvetica')
        .text(item.label, 60 + col * i + 12, metaY + 10, { width: col - 12, align: 'left' });
      doc
        .fontSize(14)
        .fillColor(accentColor)
        .font('Helvetica-Bold')
        .text(item.value, 60 + col * i + 12, metaY + 24, { width: col - 12, align: 'left' });

      if (i < 2) {
        doc.moveTo(60 + col * (i + 1), metaY + 10).lineTo(60 + col * (i + 1), metaY + 44).stroke(borderColor);
      }
    });

    doc.y = metaY + 62;

    const dividerY = doc.y;
    doc.moveTo(60, dividerY).lineTo(60 + pageWidth, dividerY).stroke(borderColor);
    doc.moveDown(1.2);

    // ── INGREDIENTS ──────────────────────────────────────────────
    if (Array.isArray(recipe.ingredientGroups) && recipe.ingredientGroups.length > 0) {
      doc
        .fontSize(14)
        .fillColor(accentColor)
        .font('Helvetica-Bold')
        .text('MALZEMELER');

      doc.moveDown(0.6);

      for (const group of recipe.ingredientGroups) {
        if (group.name) {
          doc
            .fontSize(10)
            .fillColor(mutedColor)
            .font('Helvetica-Bold')
            .text(group.name);
          doc.moveDown(0.3);
        }

        if (Array.isArray(group.items)) {
          for (const ing of group.items) {
            const rowY = doc.y;
            const nameText = ing.name + (ing.note ? ` (${ing.note})` : '');
            const amountText = [ing.amount, ing.unit].filter(Boolean).join(' ');

            doc.fontSize(10).fillColor(mutedColor).font('Helvetica').text('·', 60, rowY);
            doc.fontSize(10).fillColor(accentColor).font('Helvetica').text(nameText, 76, rowY, { width: pageWidth - 120 });
            doc.fontSize(10).fillColor(mutedColor).font('Helvetica-Oblique').text(amountText, 76, rowY, { width: pageWidth - 16, align: 'right' });
            doc.moveDown(0.15);
          }
        }
        doc.moveDown(0.4);
      }
    }

    // ── INSTRUCTIONS ─────────────────────────────────────────────
    if (Array.isArray(recipe.instructionGroups) && recipe.instructionGroups.length > 0) {
      const d2 = doc.y;
      doc.moveTo(60, d2).lineTo(60 + pageWidth, d2).stroke(borderColor);
      doc.moveDown(1.2);

      doc
        .fontSize(14)
        .fillColor(accentColor)
        .font('Helvetica-Bold')
        .text('HAZIRLANIŞI');

      doc.moveDown(0.6);

      let globalStep = 1;
      for (const group of recipe.instructionGroups) {
        if (group.name) {
          doc.fontSize(10).fillColor(mutedColor).font('Helvetica-Bold').text(group.name);
          doc.moveDown(0.3);
        }

        if (Array.isArray(group.instructions)) {
          for (const ins of group.instructions) {
            const stepY = doc.y;
            const stepNum = ins.order ?? globalStep;

            doc.circle(74, stepY + 6, 10).fill(accentColor);
            doc.fontSize(8).fillColor('#ffffff').font('Helvetica-Bold').text(String(stepNum), 68, stepY + 2, { width: 12, align: 'center' });
            doc.fontSize(10).fillColor(accentColor).font('Helvetica').text(ins.description, 92, stepY, { width: pageWidth - 32, lineGap: 2 });

            doc.moveDown(0.9);
            globalStep++;
          }
        }
        doc.moveDown(0.2);
      }
    }

    // ── FOOTER ───────────────────────────────────────────────────
    const footerY = doc.page.height - 45;
    doc.moveTo(60, footerY).lineTo(doc.page.width - 60, footerY).stroke(borderColor);
    doc
      .fontSize(8)
      .fillColor(mutedColor)
      .font('Helvetica')
      .text(
        `pisti.app  ·  ${new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        60, footerY + 8,
        { width: pageWidth, align: 'center' }
      );

    doc.end();
  });
}
