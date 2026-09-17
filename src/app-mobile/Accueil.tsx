/**
 * A3 · Accueil — `/app` — nœud Figma `28:2`.
 *
 * En-tête, carte « À rendre ce soir », « Mes prêts », raccourcis.
 * États dérivés construits avec les composants existants : bloqué (carte rose),
 * bureau fermé le soir, aucun prêt en cours, et le rappel d'un incident dû.
 */
import { Link } from 'react-router'
import { euros, horloge, selecteurs } from '@/domain'
import {
  Avatar,
  Bouton,
  CarteDePret,
  CarteSombre,
  Encart,
  EtatVide,
  Icone,
  initialeDe,
  Pictogramme,
  Raccourci,
  TitreDeSection,
} from '@/design-system'
import { badgeDePret, iconeDe, teinteDe } from './aides'
import { useEtat, usePersonaApp } from '@/store/hooks'

export function Accueil() {
  const etat = useEtat()
  const persona = usePersonaApp()

  const prets = selecteurs.pretsEnCoursDe(etat, persona.id)
  const aRendreCeSoir = prets.filter((pret) => pret.statut === 'actif').length
  const raisonDeBlocage = selecteurs.raisonDeBlocage(etat, persona.id)
  const bureauOuvert = horloge.estBureauOuvert(etat.horloge)
  const nonLues = etat.notifications.filter((n) => n.pour.includes(persona.id) && !n.lue).length
  const incidents = etat.incidents.filter(
    (incident) => incident.responsable === persona.id && incident.statut === 'a_rembourser',
  )
  const role = persona.role === 'intervenant' ? 'Intervenant' : 'Élève'
  const classes = persona.classes?.join(', ') ?? persona.classe ?? ''

  return (
    <div className="flex flex-col gap-lg pb-lg">
      <header className="flex items-center gap-md px-lg pt-[10px]">
        <Avatar
          initiale={initialeDe(persona.prenom ?? persona.nom)}
          taille={48}
          couleur={persona.couleur}
          titre={persona.nom}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="mds-titre-ecran-mobile truncate text-texte-principal">
            Bonjour {persona.prenom ?? persona.nom}
          </h1>
          <p className="mds-texte-petit text-texte-secondaire">
            {role}
            {classes && ` · ${classes}`} · {horloge.jourLong(etat.horloge.maintenant)}
          </p>
        </div>
        <Link
          to="/app/alertes"
          aria-label={nonLues > 0 ? `Alertes · ${nonLues} non lues` : 'Alertes'}
          className="relative inline-flex size-[48px] shrink-0 items-center justify-center rounded-rond bg-surface-carte text-texte-principal"
        >
          <Icone nom="Cloche" taille="2xl" />
          {nonLues > 0 && (
            <span
              aria-hidden
              className="absolute top-[10px] right-[10px] size-[10px] rounded-rond bg-marque-orange"
            />
          )}
        </Link>
      </header>

      <div className="px-lg">
        {raisonDeBlocage ? (
          <section className="flex flex-col gap-sm rounded-carte-mobile bg-marque-rose-clair p-xl">
            <span className="flex items-center gap-sm text-marque-rose-fonce">
              <Icone nom="Cadenas" taille="xl" />
              <span className="mds-titre-carte">Emprunts bloqués</span>
            </span>
            <p className="mds-texte-corps text-marque-rose-fonce">
              {raisonDeBlocage}. Rapporte-le au bureau de la pédagogie.
            </p>
          </section>
        ) : !bureauOuvert ? (
          <CarteSombre className="flex items-center gap-lg p-xl">
            <Pictogramme icone="Lune" forme="Rond" teinte="Blanc" taille={48} />
            <div className="flex flex-col">
              <p className="mds-titre-carte text-texte-inverse">Bureau fermé</p>
              <p className="mds-texte-petit text-texte-inverse/70">Réouverture demain à 8h</p>
            </div>
          </CarteSombre>
        ) : (
          <CarteSombre className="flex flex-col gap-lg p-xl">
            <div className="flex items-start justify-between gap-lg">
              <div className="flex flex-col gap-sm">
                <p className="mds-texte-corps text-texte-inverse">À rendre ce soir</p>
                <p className="flex items-baseline gap-sm">
                  <span className="mds-chiffre-xl text-marque-turquoise">{aRendreCeSoir}</span>
                  <span className="mds-texte-corps text-texte-inverse">
                    prêt{aRendreCeSoir > 1 ? 's' : ''} avant 18h
                  </span>
                </p>
              </div>
              <Pictogramme
                icone="Lune"
                forme="Rond"
                teinte="Contour"
                taille={48}
                className="text-texte-inverse"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="mds-texte-petit text-texte-inverse/70">
                Rappel à {etat.horloge.rappel.replace(':', ':')}
              </span>
              <span className="mds-texte-petit text-marque-turquoise">Avec une photo</span>
            </div>
          </CarteSombre>
        )}
      </div>

      {incidents.length > 0 && (
        <div className="px-lg">
          <Encart icone="Portefeuille" ton="rose">
            À rembourser : {euros(incidents.reduce((somme, i) => somme + i.montant, 0))} ·{' '}
            {incidents.map((i) => i.motif).join(', ')}
          </Encart>
        </div>
      )}

      <section>
        <TitreDeSection titre="Mes prêts" lien="/app/alertes?onglet=historique" libelleLien="Historique" />
        <div className="flex flex-col gap-md px-lg">
          {prets.length === 0 ? (
            <EtatVide icone="Colis" titre="Aucun prêt en cours" detail="Scanne un QR pour emprunter." />
          ) : (
            prets.map((pret) => {
              const materiel = selecteurs.materiel(etat, pret.materiel)
              const badge = badgeDePret(etat, pret)
              return (
                <CarteDePret
                  key={pret.id}
                  icone={iconeDe(materiel)}
                  teinte={teinteDe(materiel)}
                  nom={materiel.nom}
                  detail={badge.libelle}
                  statut={badge.statut}
                  alerte={badge.alerte}
                  action={
                    pret.statut === 'actif' ? (
                      <Link to={`/app/rendre/${materiel.id}`} className="shrink-0">
                        <Bouton libelle="Rendre" />
                      </Link>
                    ) : undefined
                  }
                  consigne={
                    pret.statut === 'remise_a_valider' ? (
                      <Encart icone="Repère" ton="orange">
                        Présente-toi {selecteurs.auLieu(materiel.lieu)} : l’équipe vérifie le matériel avec
                        toi.
                      </Encart>
                    ) : pret.statut === 'retour_a_valider' ? (
                      <Encart icone="Liste cochée" ton="orange">
                        L’équipe contrôle le retour sur place.
                      </Encart>
                    ) : undefined
                  }
                />
              )
            })
          )}
        </div>
      </section>

      <div className="flex gap-md px-lg">
        <Raccourci vers="/app/materiel" icone="Grille" titre="Voir le matériel" detail="En temps réel" />
        <Raccourci vers="/app/signaler" icone="Drapeau" titre="Signaler" detail="Panne, casse, salle…" />
      </div>
    </div>
  )
}
