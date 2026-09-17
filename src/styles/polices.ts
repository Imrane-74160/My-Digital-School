// Polices de la charte MyDigitalSchool, servies en local (aucun appel à Google Fonts).
// Les paquets @fontsource déclarent les familles sous les noms EXACTS attendus par
// design/tokens.css : « Bricolage Grotesque », « Inter », « JetBrains Mono ».
// (Les paquets @fontsource-variable, eux, les nomment « … Variable » : les polices
// ne s'appliqueraient jamais.)
// On ne charge que ce que l'interface française utilise : latin + latin-ext, graisses 400 et 500.

// Titres et chiffres
import '@fontsource/bricolage-grotesque/latin-400.css'
import '@fontsource/bricolage-grotesque/latin-500.css'
import '@fontsource/bricolage-grotesque/latin-ext-400.css'
import '@fontsource/bricolage-grotesque/latin-ext-500.css'

// Textes
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-ext-400.css'
import '@fontsource/inter/latin-ext-500.css'

// Codes, heures et montants de tableau
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-ext-400.css'
