import { PDFDocument, StandardFonts, rgb, PDFFont } from 'pdf-lib'

// toLocaleString('fr-FR') uses narrow no-break space (\u202F) as thousands separator
// which WinAnsi cannot encode — use a plain space instead
function fmtNum(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export interface ContractData {
  typeLabel:      string
  memberName:     string
  ownerName:      string
  projectName:    string
  amount:         number
  durationMonths: number
  interestRate:   number
  mensualite:     number | null
  createdAt:      string
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

export async function generateContractPdf(d: ContractData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create()
  const page   = pdfDoc.addPage([595.28, 841.89]) // A4

  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const bold    = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const oblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique)

  const { width, height } = page.getSize()
  const margin  = 72
  const usableW = width - 2 * margin
  const lineH   = 16
  const paraGap = 18

  let y = height - margin

  /* ── helpers ── */
  function drawLine(text: string, x: number, font: PDFFont, size: number, color: [number, number, number] = [0.22, 0.22, 0.22]) {
    page.drawText(text, { x, y, size, font, color: rgb(...color) })
    y -= lineH
  }

  function drawWrapped(text: string, x: number, font: PDFFont, size: number, maxW: number, color: [number, number, number] = [0.22, 0.22, 0.22]) {
    for (const line of wrapText(text, font, size, maxW)) {
      page.drawText(line, { x, y, size, font, color: rgb(...color) })
      y -= lineH
    }
  }

  function gap(n = 1) { y -= paraGap * n }

  function hline() {
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) })
    y -= lineH
  }

  function centered(text: string, font: PDFFont, size: number, color: [number, number, number] = [0.22, 0.22, 0.22]) {
    const w = font.widthOfTextAtSize(text, size)
    page.drawText(text, { x: (width - w) / 2, y, size, font, color: rgb(...color) })
    y -= lineH
  }

  /* ── En-tete ── */
  centered(d.typeLabel.toUpperCase(), bold, 16, [0.11, 0.23, 0.18])
  y -= 2
  centered(`Etabli le ${d.createdAt}`, regular, 9, [0.42, 0.45, 0.50])
  y -= 6
  hline()
  gap(0.4)

  /* ── Parties ── */
  drawLine('ENTRE LES SOUSSIGNES', margin, bold, 11, [0.11, 0.23, 0.18])
  y -= 4
  drawWrapped(`${d.memberName}, ci-apres designe(e) le "Preteur"`, margin, regular, 10, usableW)
  y -= 4
  centered('\u2014', regular, 10, [0.61, 0.64, 0.69])
  y -= 4
  drawWrapped(`${d.ownerName}, porteur du projet "${d.projectName}", ci-apres designe(e) l'"Emprunteur"`, margin, regular, 10, usableW)
  gap(0.5)
  drawLine(`Il a ete convenu ce qui suit :`, margin, oblique, 10, [0.42, 0.45, 0.50])
  gap()

  /* ── Article 1 ── */
  drawLine('Article 1 - Objet du pret', margin, bold, 11, [0.11, 0.23, 0.18])
  y -= 4
  const amtTxt = d.amount > 0 ? `${fmtNum(d.amount)} euros` : '[MONTANT A PRECISER]'
  drawWrapped(
    `Le Preteur, ${d.memberName}, consent a preter a l'Emprunteur, ${d.ownerName}, la somme de ${amtTxt} destinee au financement du projet "${d.projectName}".`,
    margin, regular, 10, usableW,
  )
  gap()

  /* ── Article 2 ── */
  drawLine('Article 2 - Duree et remboursement', margin, bold, 11, [0.11, 0.23, 0.18])
  y -= 4
  if (d.durationMonths > 0) {
    let a2 = `Le pret est consenti pour une duree de ${d.durationMonths} mois.`
    if (d.mensualite != null) a2 += ` L'Emprunteur s'engage a rembourser une mensualite de ${fmtNum(d.mensualite)} euros.`
    drawWrapped(a2, margin, regular, 10, usableW)
  } else {
    drawWrapped("La duree de remboursement sera definie d'un commun accord entre les parties.", margin, regular, 10, usableW)
  }
  gap()

  /* ── Article 3 ── */
  drawLine("Article 3 - Taux d'interet", margin, bold, 11, [0.11, 0.23, 0.18])
  y -= 4
  if (d.interestRate === 0) {
    drawWrapped("Le present pret est consenti a titre gratuit, sans interets, conformement a l'article 1905 du Code civil.", margin, regular, 10, usableW)
  } else {
    drawWrapped(`Le present pret est consenti au taux annuel de ${d.interestRate}%, conformement a l'article 1905 du Code civil.`, margin, regular, 10, usableW)
  }

  /* ── Zones de signature (positionnees bas de page) ── */
  const signY = 160  // depuis le bas de la page (pdf-lib: 0 = bas)
  const halfW = usableW / 2 - 10
  const rightX = margin + halfW + 20

  page.drawText('LE PRETEUR', { x: margin, y: signY + 36, size: 9, font: bold, color: rgb(0.42, 0.45, 0.50) })
  page.drawText(d.memberName, { x: margin, y: signY + 20, size: 10, font: regular, color: rgb(0.22, 0.22, 0.22) })
  page.drawLine({ start: { x: margin, y: signY }, end: { x: margin + halfW, y: signY }, thickness: 0.5, color: rgb(0.82, 0.84, 0.86) })

  page.drawText("L'EMPRUNTEUR", { x: rightX, y: signY + 36, size: 9, font: bold, color: rgb(0.42, 0.45, 0.50) })
  page.drawText(d.ownerName, { x: rightX, y: signY + 20, size: 10, font: regular, color: rgb(0.22, 0.22, 0.22) })
  page.drawLine({ start: { x: rightX, y: signY }, end: { x: width - margin, y: signY }, thickness: 0.5, color: rgb(0.82, 0.84, 0.86) })

  const bytes = await pdfDoc.save()
  return Buffer.from(bytes)
}
