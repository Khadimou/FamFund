import PDFDocument from 'pdfkit'

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

export async function generateContractPdf(d: ContractData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc  = new PDFDocument({ margin: 72, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data',  c  => chunks.push(c))
    doc.on('end',   () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = doc.page.width - 144 // usable width

    /* ── En-tête ── */
    doc
      .fontSize(10).font('Helvetica').fillColor('#6B7280')
      .text('DOCUMENT CONFIDENTIEL', { align: 'center' })
      .moveDown(0.4)
      .fontSize(16).font('Helvetica-Bold').fillColor('#1C3B2E')
      .text(d.typeLabel.toUpperCase(), { align: 'center' })
      .moveDown(0.3)
      .fontSize(10).font('Helvetica').fillColor('#6B7280')
      .text(`Etabli le ${d.createdAt}`, { align: 'center' })
      .moveDown(0.8)

    doc.moveTo(72, doc.y).lineTo(doc.page.width - 72, doc.y).strokeColor('#E5E7EB').stroke()
    doc.moveDown(0.8)

    /* ── Parties ── */
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1C3B2E').text('ENTRE LES SOUSSIGNES')
    doc.moveDown(0.4)
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
    doc.text(`${d.memberName}, ci-apres designe(e) le "Preteur"`)
    doc.moveDown(0.3)
    doc.fillColor('#9CA3AF').text('—', { align: 'center' })
    doc.moveDown(0.3)
    doc.fillColor('#374151').text(
      `${d.ownerName}, porteur du projet "${d.projectName}", ci-apres designe(e) l'"Emprunteur"`,
    )
    doc.moveDown(0.6)
    doc.fillColor('#6B7280').fontSize(10).font('Helvetica-Oblique')
      .text('Il a ete convenu ce qui suit :')
    doc.moveDown(0.8)

    /* ── Article 1 ── */
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1C3B2E').text('Article 1 - Objet du pret')
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
    const amtTxt = d.amount > 0
      ? `${d.amount.toLocaleString('fr-FR')} euros`
      : '[MONTANT A PRECISER]'
    doc.text(
      `Le Preteur, ${d.memberName}, consent a preter a l'Emprunteur, ${d.ownerName}, ` +
      `la somme de ${amtTxt} destinee au financement du projet "${d.projectName}".`,
      { width: W },
    )
    doc.moveDown(0.8)

    /* ── Article 2 ── */
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1C3B2E').text('Article 2 - Duree et remboursement')
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
    if (d.durationMonths > 0) {
      let a2 = `Le pret est consenti pour une duree de ${d.durationMonths} mois.`
      if (d.mensualite != null) {
        a2 += ` L'Emprunteur s'engage a rembourser une mensualite de ${Math.round(d.mensualite).toLocaleString('fr-FR')} euros.`
      }
      doc.text(a2, { width: W })
    } else {
      doc.text("La duree de remboursement sera definie d'un commun accord entre les parties.", { width: W })
    }
    doc.moveDown(0.8)

    /* ── Article 3 ── */
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1C3B2E').text("Article 3 - Taux d'interet")
    doc.moveDown(0.3)
    doc.fontSize(10).font('Helvetica').fillColor('#374151')
    if (d.interestRate === 0) {
      doc.text(
        "Le present pret est consenti a titre gratuit, sans interets, conformement a l'article 1905 du Code civil.",
        { width: W },
      )
    } else {
      doc.text(
        `Le present pret est consenti au taux annuel de ${d.interestRate}%, conformement a l'article 1905 du Code civil.`,
        { width: W },
      )
    }
    doc.moveDown(2)

    /* ── Zones de signature ── */
    const signY  = doc.y
    const halfW  = W / 2 - 10
    const rightX = 72 + halfW + 20

    // Prêteur (gauche)
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#6B7280').text('LE PRETEUR', 72, signY)
    doc.fontSize(10).font('Helvetica').fillColor('#374151').text(d.memberName, 72, signY + 16)
    doc.moveDown(4)
    doc.moveTo(72, signY + 80).lineTo(72 + halfW, signY + 80).strokeColor('#D1D5DB').stroke()

    // Emprunteur (droite)
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#6B7280').text("L'EMPRUNTEUR", rightX, signY)
    doc.fontSize(10).font('Helvetica').fillColor('#374151').text(d.ownerName, rightX, signY + 16)
    doc.moveTo(rightX, signY + 80).lineTo(rightX + halfW, signY + 80).strokeColor('#D1D5DB').stroke()

    doc.end()
  })
}
