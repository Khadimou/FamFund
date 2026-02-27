export default function FamilyTreeSVG() {
  return (
    <svg
      viewBox="0 0 440 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[480px] drop-shadow-2xl"
      aria-label="Illustration d'un arbre familial FamilyFund"
    >
      <defs>
        <radialGradient id="cardBg" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#1B3028" />
          <stop offset="100%" stopColor="#132019" />
        </radialGradient>
        <radialGradient id="projectGlow" cx="50%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#52B788" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Fond dark card */}
      <rect width="440" height="320" rx="24" fill="url(#cardBg)" />
      <rect width="440" height="320" rx="24" fill="none" stroke="#27412E" strokeWidth="1" />

      {/* ── LIGNES DE CONNEXION ── */}
      <path d="M 85 72 Q 102 118 135 155" stroke="#27412E" strokeWidth="1.5" strokeDasharray="5,3" />
      <path d="M 175 62 Q 158 108 135 155" stroke="#27412E" strokeWidth="1.5" strokeDasharray="5,3" />
      <path d="M 265 62 Q 282 108 305 155" stroke="#27412E" strokeWidth="1.5" strokeDasharray="5,3" />
      <path d="M 355 72 Q 338 118 305 155" stroke="#27412E" strokeWidth="1.5" strokeDasharray="5,3" />

      {/* Parents → Projet central */}
      <line x1="135" y1="183" x2="202" y2="258" stroke="#40916C" strokeWidth="2.5" />
      <line x1="305" y1="183" x2="238" y2="258" stroke="#40916C" strokeWidth="2.5" />

      {/* Oncle / Sœur → Parents */}
      <line x1="50" y1="165" x2="108" y2="165" stroke="#F4A261" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />
      <line x1="390" y1="165" x2="332" y2="165" stroke="#F4A261" strokeWidth="1.5" strokeDasharray="4,3" opacity="0.6" />

      {/* ── NŒUDS GRANDS-PARENTS ── */}
      {[
        { cx: 85,  cy: 56, label: 'GP', amount: '2 000€' },
        { cx: 175, cy: 48, label: 'GM', amount: '5 000€' },
        { cx: 265, cy: 48, label: 'GP', amount: '3 000€' },
        { cx: 355, cy: 56, label: 'GM', amount: '4 000€' },
      ].map(({ cx, cy, label, amount }) => (
        <g key={`gp-${cx}`}>
          <circle cx={cx} cy={cy} r={25} fill="#1B3028" stroke="#40916C" strokeWidth="1.5" />
          <text x={cx} y={cy - 3} textAnchor="middle" fill="#74C69D" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">{label}</text>
          <text x={cx} y={cy + 9} textAnchor="middle" fill="#52B788" fontSize="8" fontFamily="Inter, sans-serif">{amount}</text>
        </g>
      ))}

      {/* ── NŒUDS PARENTS ── */}
      <circle cx={135} cy={166} r={31} fill="#1B3028" stroke="#40916C" strokeWidth="2" />
      <text x={135} y={162} textAnchor="middle" fill="#74C69D" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">Papa</text>
      <text x={135} y={175} textAnchor="middle" fill="#52B788" fontSize="8.5" fontFamily="Inter, sans-serif">10 000€</text>

      <circle cx={305} cy={166} r={31} fill="#1B3028" stroke="#40916C" strokeWidth="2" />
      <text x={305} y={162} textAnchor="middle" fill="#74C69D" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">Maman</text>
      <text x={305} y={175} textAnchor="middle" fill="#52B788" fontSize="8.5" fontFamily="Inter, sans-serif">8 000€</text>

      {/* ── NŒUDS SECONDAIRES ── */}
      <circle cx={50}  cy={166} r={23} fill="#1A2410" stroke="#F4A261" strokeWidth="1.5" />
      <text x={50}  y={162} textAnchor="middle" fill="#F4A261" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">Oncle</text>
      <text x={50}  y={173} textAnchor="middle" fill="#F9C784" fontSize="7.5" fontFamily="Inter, sans-serif">3 000€</text>

      <circle cx={390} cy={166} r={23} fill="#1A2410" stroke="#F4A261" strokeWidth="1.5" />
      <text x={390} y={162} textAnchor="middle" fill="#F4A261" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">Sœur</text>
      <text x={390} y={173} textAnchor="middle" fill="#F9C784" fontSize="7.5" fontFamily="Inter, sans-serif">1 500€</text>

      {/* ── BADGES ✓ ── */}
      <circle cx={165} cy={216} r={11} fill="#F4A261" />
      <text x={165} y={220} textAnchor="middle" fill="#0C1A10" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">✓</text>
      <circle cx={275} cy={216} r={11} fill="#F4A261" />
      <text x={275} y={220} textAnchor="middle" fill="#0C1A10" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">✓</text>

      {/* ── NŒUD CENTRAL ── */}
      <circle cx={220} cy={265} r={44} fill="#2D6A4F" />
      <circle cx={220} cy={265} r={44} fill="url(#projectGlow)" />
      <text x={220} y={258} textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Inter, sans-serif">Mon Projet</text>
      <text x={220} y={273} textAnchor="middle" fill="#B7E4C7" fontSize="10" fontFamily="Inter, sans-serif">33 500 €</text>

      {/* ── MINI DASHBOARD ── */}
      <rect x="308" y="240" width="116" height="58" rx="12" fill="#1B3028" stroke="#27412E" strokeWidth="1" />
      <text x="366" y="255" textAnchor="middle" fill="#74C69D" fontSize="8.5" fontWeight="700" fontFamily="Inter, sans-serif">Tableau de bord</text>
      <rect x="316" y="262" width="100" height="5" rx="2.5" fill="#27412E" />
      <rect x="316" y="262" width="76"  height="5" rx="2.5" fill="#40916C" />
      <text x="366" y="282" textAnchor="middle" fill="#52B788" fontSize="7.5" fontFamily="Inter, sans-serif">Privé · Sécurisé</text>

      {/* Ligne vers le dashboard */}
      <line x1="264" y1="260" x2="308" y2="260" stroke="#27412E" strokeWidth="1" strokeDasharray="3,2" />
    </svg>
  )
}
