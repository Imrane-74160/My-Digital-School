/**
 * Motif de QR code, généré depuis le code du matériel (« MDS-KIT-R10-01 »).
 *
 * Le prototype n'embarque pas d'encodeur QR : le motif est **dérivé du code**, de
 * façon déterministe, avec les trois repères d'angle d'un vrai QR. Il sert d'étiquette
 * imprimable et de cible de scan simulée, jamais de code réellement lisible.
 */
const COTE = 21

/** Hachage déterministe (FNV-1a 32 bits) : le même code donne toujours le même motif. */
function hacher(texte: string): number {
  let valeur = 0x811c9dc5
  for (const caractere of texte) {
    valeur ^= caractere.codePointAt(0) ?? 0
    valeur = Math.imul(valeur, 0x01000193) >>> 0
  }
  return valeur
}

/** Les trois carrés de repère d'un QR, en haut à gauche, en haut à droite, en bas à gauche. */
function estRepere(ligne: number, colonne: number): boolean | null {
  const dansUnRepere = (l: number, c: number) => l >= 0 && l < 7 && c >= 0 && c < 7
  const motifRepere = (l: number, c: number) => {
    const bord = l === 0 || l === 6 || c === 0 || c === 6
    const centre = l >= 2 && l <= 4 && c >= 2 && c <= 4
    return bord || centre
  }
  for (const [decalageL, decalageC] of [
    [0, 0],
    [0, COTE - 7],
    [COTE - 7, 0],
  ] as const) {
    const l = ligne - decalageL
    const c = colonne - decalageC
    if (dansUnRepere(l, c)) return motifRepere(l, c)
  }
  return null
}

export function MotifQR({ code, taille = 160 }: { code: string; taille?: number }) {
  const graine = hacher(code)
  const modules: boolean[] = []

  for (let ligne = 0; ligne < COTE; ligne += 1) {
    for (let colonne = 0; colonne < COTE; colonne += 1) {
      const repere = estRepere(ligne, colonne)
      if (repere !== null) {
        modules.push(repere)
        continue
      }
      // Bruit déterministe : le hachage du code mélangé à la position du module.
      const bit = hacher(`${graine}:${ligne}:${colonne}`) & 1
      modules.push(bit === 1)
    }
  }

  return (
    <svg
      role="img"
      aria-label={`QR code ${code}`}
      viewBox={`0 0 ${COTE} ${COTE}`}
      style={{ width: taille, height: taille }}
      shapeRendering="crispEdges"
    >
      <rect width={COTE} height={COTE} fill="var(--mds-surface-carte)" />
      {modules.map((plein, index) =>
        plein ? (
          <rect
            key={index}
            x={index % COTE}
            y={Math.floor(index / COTE)}
            width={1}
            height={1}
            fill="var(--mds-marque-anthracite)"
          />
        ) : null,
      )}
    </svg>
  )
}
