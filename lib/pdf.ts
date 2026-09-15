// ==================== PDF URL HELPER ====================
// NCERT URL pattern: book_code + chapter_num (2 digits)
// Part 2 books me file number reset hota hai (Ch X → file 01)

export function getPdfUrl(
  bookCode: string | null,
  classNum: number,
  chapterNum: number
): string | null {
  if (!bookCode) return null

  // ═══════════════════════════════════════════════════════
  // HINDI FALLBACK: Class 8 Math Part 2 (NCERT pe Hindi nahi hai)
  // hhgp2 → hegp2 use karo (English PDF)
  // ═══════════════════════════════════════════════════════
  if (classNum === 8 && bookCode === 'hhgp2') {
    bookCode = 'hegp2'
  }

  // ═══════════════════════════════════════════════════════
  // SPECIAL CASES: Part 2 books (chapter_num reset hota hai)
  // ═══════════════════════════════════════════════════════

  // Class 7 Math Part 2 (gegp2 / ghgp2) — Ch 9-15 → file 01-07
  if (classNum === 7 && (bookCode === 'gegp2' || bookCode === 'ghgp2')) {
    const adjustedCh = String(chapterNum - 8).padStart(2, '0')
    return `https://ncert.nic.in/textbook/pdf/${bookCode}${adjustedCh}.pdf`
  }

  // Class 8 Math Part 2 (hegp2 / hhgp2) — Ch 8-14 → file 01-07
  if (classNum === 8 && (bookCode === 'hegp2' || bookCode === 'hhgp2')) {
    const adjustedCh = String(chapterNum - 7).padStart(2, '0')
    return `https://ncert.nic.in/textbook/pdf/${bookCode}${adjustedCh}.pdf`
  }

  // Class 11 Physics Part 2 (keph2 / khph2) — Ch 8-14 → file 01-07
  if (classNum === 11 && (bookCode === 'keph2' || bookCode === 'khph2')) {
    const adjustedCh = String(chapterNum - 7).padStart(2, '0')
    return `https://ncert.nic.in/textbook/pdf/${bookCode}${adjustedCh}.pdf`
  }

  // Class 11 Chemistry Part 2 (kech2 / khch2) — Ch 7-9 → file 01-03
  if (classNum === 11 && (bookCode === 'kech2' || bookCode === 'khch2')) {
    const adjustedCh = String(chapterNum - 6).padStart(2, '0')
    return `https://ncert.nic.in/textbook/pdf/${bookCode}${adjustedCh}.pdf`
  }

  // Class 12 Physics Part 2 (leph2 / lhph2) — Ch 9-14 → file 01-06
  if (classNum === 12 && (bookCode === 'leph2' || bookCode === 'lhph2')) {
    const adjustedCh = String(chapterNum - 8).padStart(2, '0')
    return `https://ncert.nic.in/textbook/pdf/${bookCode}${adjustedCh}.pdf`
  }

  // Class 12 Chemistry Part 2 (lech2 / lhch2) — Ch 6-10 → file 01-05
  if (classNum === 12 && (bookCode === 'lech2' || bookCode === 'lhch2')) {
    const adjustedCh = String(chapterNum - 5).padStart(2, '0')
    return `https://ncert.nic.in/textbook/pdf/${bookCode}${adjustedCh}.pdf`
  }

  // Class 12 Math Part 2 (lemh2 / lhmh2) — Ch 7-13 → file 01-07
  if (classNum === 12 && (bookCode === 'lemh2' || bookCode === 'lhmh2')) {
    const adjustedCh = String(chapterNum - 6).padStart(2, '0')
    return `https://ncert.nic.in/textbook/pdf/${bookCode}${adjustedCh}.pdf`
  }

  // ═══════════════════════════════════════════════════════
  // DEFAULT: book_code + chapter_num (2 digits)
  // ═══════════════════════════════════════════════════════
  const chNum = String(chapterNum).padStart(2, '0')
  return `https://ncert.nic.in/textbook/pdf/${bookCode}${chNum}.pdf`
}

// ==================== CHECK TWO PARTS ====================
export function hasTwoParts(classNum: number, subject: string): boolean {
  // Class 7 Math
  if (classNum === 7 && subject === 'Mathematics') return true
  // Class 8 Math
  if (classNum === 8 && subject === 'Mathematics') return true
  // Class 11 Physics, Chemistry
  if (classNum === 11 && (subject === 'Physics' || subject === 'Chemistry'))
    return true
  // Class 12 Physics, Chemistry, Math
  if (
    classNum === 12 &&
    (subject === 'Physics' ||
      subject === 'Chemistry' ||
      subject === 'Mathematics')
  )
    return true
  return false
}