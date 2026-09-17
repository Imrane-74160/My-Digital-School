/* =====================================================================
   MOTEUR PUR : données + règles validées (aucun accès au DOM)
   ===================================================================== */
const Engine = (() => {
  const CATS = {
    studio: { name: "Studio photo & vidéo", short: "Studio" },
    info: { name: "Informatique", short: "Informatique" },
    cours: { name: "Matériel de cours", short: "Cours" },
    jeux: { name: "Jeux de société", short: "Jeux" },
    boite: { name: "Boîtes intervenant", short: "Boîtes" }
  };
  const PLACES = { studio: "Armoire du studio", bureau: "Bureau de la pédagogie" };
  const RULES = [
    ["bureau", "R01", "On emprunte seulement quand le bureau est ouvert"],
    ["dispo", "R02", "Pas de réservation : premier arrivé, premier servi"],
    ["forfait", "R03", "Forfait affiché et accepté avant chaque emprunt"],
    ["n1", "R04", "Niveau 1 : remise et retour validés sur place par l'équipe"],
    ["n2", "R05", "Niveau 2 : photo au retour, contrôle plus tard"],
    ["reemprunt", "R06", "Niveau 2 : peut repartir avant contrôle, la photo fait foi"],
    ["composant", "R07", "Composant manquant : forfait du composant, pas du kit"],
    ["retour", "R08", "Seul le responsable du prêt fait le retour"],
    ["classe", "R09", "« Pour ma classe » : réservé aux intervenants, responsables"],
    ["blocage", "R10", "Non rendu le soir même : emprunts bloqués"],
    ["perte", "R11", "Toujours absent à J+2 : déclaré perdu, forfait dû"],
    ["argent", "R12", "Forfaits et paiements : réservés à Sandrine"],
    ["equipe", "R13", "Valider, contrôler, gérer : réservé à l'équipe"],
    ["prevenez", "R14", "« Prévenez-moi » : tous prévenus, le premier qui scanne gagne"],
    ["temps", "R15", "Rappel à 16h30, récap équipe à 8h"],
    ["deblocage", "R16", "Déblocage manuel possible, pour la journée"]
  ];
  const CHARTE = `Charte d'utilisation du matériel MyDigitalSchool

1. Le matériel est prêté pour un usage pédagogique sur le campus.
2. Tout matériel emprunté est rendu le jour même, avant de quitter l'école, avec une photo prise dans l'app.
3. Le matériel de niveau 1 (studio, PC) est remis et contrôlé par un membre de l'équipe pédagogique.
4. En cas de perte ou de casse, le forfait affiché au moment de l'emprunt est dû. Si un composant manque, seul son forfait est dû.
5. Un matériel non rendu le soir bloque tes emprunts. Au bout de 2 jours, il est déclaré perdu.
6. Les intervenants qui empruntent « pour leur classe » restent responsables du matériel et font eux-mêmes le retour.
7. Les photos sont conservées 30 jours après contrôle, l'historique une année scolaire.`;

  const eur = n => Math.round(n).toLocaleString("fr-FR") + " €";
  const clone = o => JSON.parse(JSON.stringify(o));

  function seed() {
    const catalog = {};
    const add = (id, type, name, cat, icon, niveau, place, forfait, composants, onlyRole) =>
      (catalog[id] = { id, type, name, cat, icon, niveau, place: PLACES[place], forfait: forfait || 0, composants: composants || null, onlyRole: onlyRole || null, qr: "MDS-" + id.toUpperCase() });
    add("kit-r10-01", "kit-r10", "Kit Canon R10 #01", "studio", "camera", 1, "studio", 0, [
      { id: "boitier", name: "Boîtier Canon R10", forfait: 600 }, { id: "objectif", name: "Objectif RF 18-150mm", forfait: 350 },
      { id: "bague", name: "Bague d'adaptation", forfait: 60 }, { id: "batterie1", name: "Batterie LP-E17 (1/2)", forfait: 45 },
      { id: "batterie2", name: "Batterie LP-E17 (2/2)", forfait: 45 }, { id: "sd", name: "Carte SD 256 Go", forfait: 30 }]);
    add("ronin-01", "ronin", "Stabilisateur DJI Ronin RSC2", "studio", "video", 1, "studio", 0, [
      { id: "stab", name: "Stabilisateur", forfait: 380 }, { id: "poignee", name: "Poignée trépied", forfait: 30 }, { id: "cables", name: "Câbles de contrôle", forfait: 20 }]);
    add("trepied-01", "trepied", "Trépied + tête fluide LeoFoto", "studio", "tripod", 1, "studio", 180);
    add("micro-hf-01", "micro-hf", "Micro HF Godox", "studio", "mic", 1, "studio", 0, [
      { id: "emetteur", name: "Émetteur + micro cravate", forfait: 80 }, { id: "recepteur", name: "Récepteur", forfait: 70 }]);
    add("zoom-h5-01", "zoom-h5", "Enregistreur Zoom H5", "studio", "radio", 1, "studio", 280);
    add("tascam-01", "tascam", "Enregistreur Tascam DR-70D", "studio", "radio", 1, "studio", 220);
    add("casque-senn-01", "casque-senn", "Casque Sennheiser", "studio", "headphones", 1, "studio", 120);
    add("hoya-01", "hoya", "Filtre variable Hoya", "studio", "aperture", 1, "studio", 90);
    add("eclairage-01", "eclairage", "Kit éclairage Newer", "studio", "lightbulb", 1, "studio", 160);
    add("led-01", "led", "Pack LED Newer + batteries", "studio", "lightbulb", 1, "studio", 110);
    add("ministudio-01", "ministudio", "Mini studio photo", "studio", "box", 1, "studio", 70);
    add("streaming-01", "streaming", "Kit streaming Audio-Technica", "studio", "cast", 1, "studio", 190);
    add("sd32-01", "sd32", "Carte SD 32 Go", "studio", "sd", 1, "studio", 15);
    add("sac-01", "sac", "Sac à dos de transport", "studio", "backpack", 1, "studio", 60);
    for (let i = 1; i <= 3; i++) add(`pc-0${i}`, "pc", `PC de prêt #0${i}`, "info", "laptop", 1, "bureau", 0, [
      { id: "pc", name: "Ordinateur portable", forfait: 420 }, { id: "chargeur", name: "Chargeur", forfait: 30 }]);
    for (let i = 1; i <= 6; i++) add(`casque-0${i}`, "casque", `Casque d'anglais #0${i}`, "cours", "headphones", 2, "bureau", 25);
    for (let i = 1; i <= 3; i++) add(`souris-0${i}`, "souris", `Souris filaire #0${i}`, "cours", "mouse", 2, "bureau", 12);
    for (let i = 1; i <= 2; i++) add(`souris-apple-0${i}`, "souris-apple", `Souris Apple #0${i}`, "cours", "mouse", 2, "bureau", 79);
    for (let i = 1; i <= 2; i++) add(`multi-a-0${i}`, "multi-a", `Multiprise modèle A #0${i}`, "cours", "plug", 2, "bureau", 15);
    add("multi-b-01", "multi-b", "Multiprise modèle B #01", "cours", "plug", 2, "bureau", 20);
    add("dixit-01", "dixit", "Jeu Dixit", "jeux", "cards", 2, "bureau", 35);
    add("codenames-01", "codenames", "Jeu Codenames", "jeux", "cards", 2, "bureau", 25);
    add("timesup-01", "timesup", "Jeu Time's Up", "jeux", "cards", 2, "bureau", 30);
    for (let i = 1; i <= 4; i++) add(`boite-0${i}`, "boite", `Boîte intervenant #0${i}`, "boite", "package", 2, "bureau", 0, [
      { id: "telecommande", name: "Télécommande vidéoprojecteur", forfait: 20 }, { id: "feutres", name: "Feutres", forfait: 8 }], "intervenant");

    const people = {
      ines: { name: "Inès Martin", short: "Inès", role: "eleve", classe: "B3", color: "#0E76B6", charte: true },
      tom: { name: "Tom Leroy", short: "Tom", role: "eleve", classe: "B1", color: "#662483", charte: false },
      lea: { name: "Léa Dubois", short: "Léa", role: "eleve", classe: "M1", color: "#B35C1E", charte: true },
      yanis: { name: "Yanis Benali", short: "Yanis", role: "eleve", classe: "B3", color: "#2B6F77", charte: true },
      sarah: { name: "Sarah Nguyen", short: "Sarah", role: "eleve", classe: "B1", color: "#8A3B6B", charte: true },
      diallo: { name: "M. Diallo", short: "M. Diallo", role: "intervenant", color: "#16794A", charte: true },
      roche: { name: "Mme Roche", short: "Mme Roche", role: "intervenant", color: "#5B5FC7", charte: true },
      cyrianne: { name: "Cyrianne", short: "Cyrianne", role: "equipe", color: "#C8558A" },
      lydia: { name: "Lydia", short: "Lydia", role: "equipe", color: "#D06A32" },
      sandrine: { name: "Sandrine", short: "Sandrine", role: "direction", color: "#3C3C3B" }
    };
    const items = {};
    for (const id in catalog) items[id] = { status: "disponible", loanId: null, pending: null, watchers: [] };
    const s = {
      clock: { day: 1, phase: "journee" }, catalog, items, people, loans: [], incidents: [], reports: [], log: [], exempt: {}, seq: 100,
      stock: {
        feutres: { name: "Feutres", unit: "boîtes", qty: 18, min: 10, lastCount: 1, icon: "pen" },
        stylos: { name: "Stylos", unit: "stylos", qty: 14, min: 20, lastCount: 1, icon: "pen" },
        couverts: { name: "Couverts", unit: "lots", qty: 32, min: 15, lastCount: 1, icon: "utensils" }
      },
      rooms: { "101": { fans: 2, present: 2, lastCheck: 1 }, "102": { fans: 1, present: 1, lastCheck: 1 }, "103": { fans: 2, present: 1, lastCheck: 1 }, "104": { fans: 1, present: 1, lastCheck: 1 }, "201": { fans: 2, present: 2, lastCheck: 1 } },
      classes: ["B1", "B2", "B3", "M1"],
      settings: { charte: CHARTE, rappel: true, recap: true }
    };
    // Situation de départ réaliste
    const mkLoan = (itemId, pid, status, forClass) => {
      const l = { id: "P" + s.seq++, itemId, borrowerId: pid, responsibleId: pid, forClass: forClass || null, dayOut: 1, forfait: forfait(s, itemId), status };
      s.loans.push(l); s.items[itemId].loanId = l.id; s.items[itemId].status = "emprunte"; return l;
    };
    mkLoan("casque-02", "lea", "actif");
    mkLoan("pc-02", "yanis", "actif");
    mkLoan("boite-02", "roche", "actif");
    const past = { id: "P" + s.seq++, itemId: "codenames-01", borrowerId: "sarah", responsibleId: "sarah", forClass: null, dayOut: 1, forfait: 25, status: "rendu" };
    s.loans.push(past); s.items["codenames-01"].pending = { loanId: past.id, responsibleId: "sarah", declared: null, day: 1 };
    const past2 = { id: "P" + s.seq++, itemId: "souris-apple-02", borrowerId: "sarah", responsibleId: "sarah", forClass: null, dayOut: 1, forfait: 79, status: "rendu" };
    s.loans.push(past2); s.items["souris-apple-02"].status = "anomalie";
    s.incidents.push({ id: "I" + s.seq++, itemId: "souris-apple-02", responsibleId: "sarah", motif: "molette cassée (photo de retour)", montant: 79, type: "casse", statut: "a_rembourser", day: 1 });
    s.reports.push({ id: "S" + s.seq++, by: "lea", target: { kind: "room", id: "103" }, type: "Manquant", text: "Il n'y a plus qu'un ventilateur dans la salle.", day: 1, status: "ouvert", photo: false });
    return s;
  }

  function forfait(s, id) { const c = s.catalog[id]; return c.composants ? c.composants.reduce((a, x) => a + x.forfait, 0) : c.forfait; }
  const role = (s, pid) => s.people[pid].role;
  const isStaff = (s, pid) => ["equipe", "direction"].includes(role(s, pid));
  const nm = (s, pid) => pid === "equipe" ? "Équipe" : s.people[pid].short;
  const overdue = (s, l) => l.status === "actif" && (l.dayOut < s.clock.day || (l.dayOut === s.clock.day && s.clock.phase === "soir"));
  function missingInfo(s, itemId, missing) {
    if (!missing) return null;
    const c = s.catalog[itemId], comp = c.composants && c.composants.find(x => x.id === missing);
    return comp ? { label: comp.name + " manquant(e)", montant: comp.forfait } : { label: "contenu incomplet ou abîmé", montant: forfait(s, itemId) };
  }
  function blockReason(s, pid) {
    if (!s.people[pid] || isStaff(s, pid) || s.exempt[pid] === s.clock.day) return null;
    const od = s.loans.filter(l => l.responsibleId === pid && overdue(s, l));
    if (od.length) return od.map(l => s.catalog[l.itemId].name).join(", ") + " non rendu";
    const lost = s.incidents.filter(i => i.responsibleId === pid && i.type === "perte" && i.statut === "a_rembourser");
    if (lost.length) return "perte non remboursée (" + lost.map(i => s.catalog[i.itemId].name).join(", ") + ")";
    return null;
  }
  const log = (s, kind, text, to, rule) => s.log.push({ id: s.seq++, day: s.clock.day, phase: s.clock.phase, kind, text, to: to || null, rule: rule || null });
  const no = (msg, rule) => ({ ok: false, msg, rule }), yes = (msg, rule) => ({ ok: true, msg, rule });
  function notifyWatchers(s, itemId) {
    const it = s.items[itemId]; if (!it.watchers.length) return;
    log(s, "notif", `${s.catalog[itemId].name} est de retour. Le premier qui le scanne le prend.`, it.watchers.slice(), "prevenez"); it.watchers = [];
  }
  function openIncident(s, itemId, pid, motif, montant, type) {
    s.incidents.push({ id: "I" + s.seq++, itemId, responsibleId: pid, motif, montant, type, statut: "a_rembourser", day: s.clock.day });
    log(s, "notif", `${s.catalog[itemId].name} : ${motif}. Forfait de ${eur(montant)} à rembourser.`, [pid], type === "perte" ? "perte" : "composant");
  }
  const staffOnly = (s, a) => isStaff(s, a.by) ? null : no(`${nm(s, a.by)} n'a pas accès à cette action : réservée à l'équipe.`, "equipe");
  const dirOnly = (s, a) => role(s, a.by) === "direction" ? null : no(`${nm(s, a.by)} ne peut pas faire ça : réservé à Sandrine (direction).`, "argent");

  function apply(s, a) {
    const p = a.by ? nm(s, a.by) : "", c = a.item ? s.catalog[a.item] : null, it = a.item ? s.items[a.item] : null;
    const loan = it && it.loanId ? s.loans.find(l => l.id === it.loanId) : null;
    let g;
    switch (a.type) {
      case "ACCEPTER_CHARTE": s.people[a.by].charte = true; return yes(`${p} accepte la charte d'utilisation.`, "forfait");
      case "EMPRUNTER": {
        if (s.clock.phase === "soir") return no(`Le bureau est fermé. ${p} pourra emprunter demain à 8h.`, "bureau");
        const br = blockReason(s, a.by); if (br) return no(`${p} ne peut pas emprunter : ${br}.`, "blocage");
        if (a.forClass && role(s, a.by) !== "intervenant") return no(`${p} ne peut pas emprunter « pour ma classe » : réservé aux intervenants.`, "classe");
        if (c.onlyRole && role(s, a.by) !== c.onlyRole) return no(`${c.name} est réservé aux intervenants.`, "classe");
        if (it.status !== "disponible") return no(`${c.name} est indisponible. ${p} peut demander à être prévenu(e).`, "dispo");
        const l = { id: "P" + s.seq++, itemId: a.item, borrowerId: a.by, responsibleId: a.by, forClass: a.forClass || null, dayOut: s.clock.day, forfait: forfait(s, a.item), status: c.niveau === 1 ? "remise_a_valider" : "actif" };
        s.loans.push(l); it.loanId = l.id; it.watchers = it.watchers.filter(w => w !== a.by);
        const pour = l.forClass ? ` pour la ${l.forClass}` : "";
        if (c.niveau === 1) { it.status = "remise_a_valider"; log(s, "notif", `Demande de remise : ${c.name} pour ${p}.`, ["equipe"], "n1"); return yes(`${p} demande ${c.name}${pour} et accepte le forfait de ${eur(l.forfait)}. L'équipe valide sur place.`, "n1"); }
        it.status = "emprunte";
        if (it.pending) return yes(`${p} emprunte ${c.name}${pour}. La photo du retour précédent n'est pas encore contrôlée, ce n'est pas bloquant.`, "reemprunt");
        return yes(`${p} emprunte ${c.name}${pour} et accepte le forfait de ${eur(l.forfait)}.`, "forfait");
      }
      case "VALIDER_REMISE": {
        if ((g = staffOnly(s, a))) return g;
        if (it.status !== "remise_a_valider") return no(`Aucune remise à valider pour ${c.name}.`, "n1");
        loan.status = "actif"; it.status = "emprunte"; loan.validatedBy = a.by;
        log(s, "notif", `Remise validée : ${c.name} est à rendre ce soir.`, [loan.responsibleId], "n1");
        return yes(`${p} vérifie ${c.name} et valide la remise à ${nm(s, loan.borrowerId)}.`, "n1");
      }
      case "RENDRE": {
        if (!loan || !["actif", "remise_a_valider", "retour_a_valider"].includes(loan.status)) return no(`${c.name} n'a pas de prêt en cours.`, "retour");
        if (a.by !== loan.responsibleId) return no(loan.forClass ? `Prêt pour la ${loan.forClass} : seul ${nm(s, loan.responsibleId)} peut rendre ${c.name}.` : `Seul(e) ${nm(s, loan.responsibleId)} peut rendre ${c.name}.`, "retour");
        if (loan.status === "remise_a_valider") return no(`La remise de ${c.name} n'est pas encore validée.`, "n1");
        if (loan.status === "retour_a_valider") return no(`Le retour de ${c.name} attend déjà l'équipe.`, "n1");
        const mi = missingInfo(s, a.item, a.missing), decl = mi ? `signale « ${mi.label} »` : "coche tout";
        if (c.niveau === 1) { loan.status = "retour_a_valider"; it.status = "retour_a_valider"; loan.declared = a.missing || null; log(s, "notif", `Retour à contrôler sur place : ${c.name} (${p}).`, ["equipe"], "n1"); return yes(`${p} rapporte ${c.name}, ${decl} et prend la photo. L'équipe contrôle sur place.`, "n1"); }
        loan.status = "rendu"; loan.dayBack = s.clock.day; it.status = "disponible"; it.loanId = null;
        it.pending = { loanId: loan.id, responsibleId: loan.responsibleId, declared: a.missing || null, day: s.clock.day };
        notifyWatchers(s, a.item);
        return yes(`${p} rend ${c.name}, ${decl} et prend la photo. Disponible tout de suite.`, "n2");
      }
      case "VALIDER_RETOUR": {
        if ((g = staffOnly(s, a))) return g;
        if (it.status !== "retour_a_valider") return no(`Aucun retour à valider pour ${c.name}.`, "n1");
        const resp = loan.responsibleId, mi = missingInfo(s, a.item, a.missing);
        loan.status = "rendu"; loan.dayBack = s.clock.day; it.loanId = null;
        if (!mi) { it.status = "disponible"; notifyWatchers(s, a.item); return yes(`${p} contrôle ${c.name} sur place : conforme, remis en stock.`, "n1"); }
        it.status = "anomalie"; openIncident(s, a.item, resp, mi.label, mi.montant, "casse");
        return yes(`${p} constate : ${mi.label}. ${nm(s, resp)} doit ${eur(mi.montant)}, pas le prix du kit.`, "composant");
      }
      case "CONTROLER_PHOTO": {
        if ((g = staffOnly(s, a))) return g;
        if (c.niveau === 1) return no(`${c.name} est de niveau 1 : contrôle sur place, jamais sur photo.`, "n1");
        if (!it.pending) return no(`Aucune photo à contrôler pour ${c.name}.`, "n2");
        const pend = it.pending, resp = nm(s, pend.responsibleId), mi = missingInfo(s, a.item, a.missing);
        it.pending = null;
        if (!mi) return yes(`${p} contrôle la photo de ${resp} : ${c.name} conforme.`, "n2");
        openIncident(s, a.item, pend.responsibleId, mi.label, mi.montant, "casse");
        if (it.status === "disponible") { it.status = "anomalie"; return yes(`${p} voit sur la photo : ${mi.label}. ${resp} doit ${eur(mi.montant)}, le matériel est retiré du prêt.`, "n2"); }
        const cur = s.loans.find(l => l.id === it.loanId);
        return yes(`${p} voit sur la photo : ${mi.label}. C'est ${resp} qui doit ${eur(mi.montant)}. ${nm(s, cur.responsibleId)} n'est pas mis(e) en cause.`, "reemprunt");
      }
      case "PREVENEZ_MOI": {
        if (it.status === "disponible") return no(`${c.name} est déjà disponible.`, "prevenez");
        if (["perdu", "anomalie", "hors_service"].includes(it.status)) return no(`${c.name} est retiré du prêt.`, "prevenez");
        if (loan && loan.responsibleId === a.by) return no(`${p} a déjà ${c.name}.`, "prevenez");
        if (it.watchers.includes(a.by)) return no(`${p} est déjà inscrit(e).`, "prevenez");
        it.watchers.push(a.by); return yes(`${p} sera prévenu(e) dès que ${c.name} revient.`, "prevenez");
      }
      case "SIGNALER": {
        const r = { id: "S" + s.seq++, by: a.by, target: a.target, type: a.kind, text: a.text || "", day: s.clock.day, status: "ouvert", photo: !!a.photo };
        s.reports.push(r);
        const what = a.target.kind === "room" ? `salle ${a.target.id}` : s.catalog[a.target.id].name;
        log(s, "notif", `Signalement de ${p} : ${a.kind.toLowerCase()} · ${what}.`, ["equipe"], null);
        return yes(`${p} signale « ${a.kind} » sur ${what}. L'équipe est prévenue.`, null);
      }
      case "TRAITER_SIGNALEMENT": {
        if ((g = staffOnly(s, a))) return g;
        const r = s.reports.find(x => x.id === a.report); r.status = "traite"; r.doneBy = a.by;
        log(s, "notif", `Ton signalement a été pris en charge par ${p}.`, [r.by], null);
        return yes(`${p} marque le signalement comme traité.`, null);
      }
      case "RETIRER": {
        if ((g = staffOnly(s, a))) return g;
        if (it.status !== "disponible") return no(`${c.name} n'est pas en stock : impossible de le retirer maintenant.`, "equipe");
        it.status = "hors_service"; return yes(`${p} retire ${c.name} du prêt.`, "equipe");
      }
      case "REMETTRE": {
        if ((g = staffOnly(s, a))) return g;
        if (!["anomalie", "hors_service", "perdu"].includes(it.status)) return no(`${c.name} est déjà en service.`, "equipe");
        it.status = "disponible"; it.loanId = null; notifyWatchers(s, a.item); return yes(`${p} remet ${c.name} en service.`, "equipe");
      }
      case "AJOUTER_MATERIEL": {
        if ((g = staffOnly(s, a))) return g;
        const d = a.data, base = d.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        let id = base || "materiel", k = 2; while (s.catalog[id]) id = base + "-" + k++;
        s.catalog[id] = { id, type: d.type || id, name: d.name, cat: d.cat, icon: { studio: "camera", info: "laptop", cours: "headphones", jeux: "cards", boite: "package" }[d.cat], niveau: +d.niveau, place: d.place, forfait: +d.forfait || 0, composants: null, onlyRole: d.cat === "boite" ? "intervenant" : null, qr: "MDS-" + id.toUpperCase() };
        s.items[id] = { status: "disponible", loanId: null, pending: null, watchers: [] };
        return yes(`${p} ajoute ${d.name} à l'inventaire (QR ${s.catalog[id].qr}).`, "equipe");
      }
      case "MODIFIER_FORFAIT": {
        if ((g = dirOnly(s, a))) return g;
        const v = Math.max(0, +a.value || 0), type = c.type; let n = 0;
        for (const id in s.catalog) if (s.catalog[id].type === type) {
          const cc = s.catalog[id]; n++;
          if (a.comp) { const x = cc.composants.find(z => z.id === a.comp); if (x) x.forfait = v; } else cc.forfait = v;
        }
        return yes(`${p} fixe le forfait à ${eur(v)} pour ${n} matériel${n > 1 ? "s" : ""} du même type.`, "argent");
      }
      case "AJUSTER_MONTANT": {
        if ((g = dirOnly(s, a))) return g;
        const inc = s.incidents.find(i => i.id === a.incident), v = Math.max(0, +a.value || 0);
        if (v > inc.montant) return no("On peut seulement baisser un montant, jamais l'augmenter.", "argent");
        inc.montant = v; return yes(`${p} ajuste le montant dû par ${nm(s, inc.responsibleId)} à ${eur(v)}.`, "argent");
      }
      case "REMBOURSEMENT": {
        const inc = s.incidents.find(i => i.id === a.incident);
        if ((g = dirOnly(s, a))) return g;
        if (inc.statut === "rembourse") return no("Déjà enregistré.", "argent");
        inc.statut = "rembourse"; inc.paidDay = s.clock.day;
        log(s, "notif", `Paiement de ${eur(inc.montant)} enregistré. Merci !`, [inc.responsibleId], "argent");
        return yes(`${p} enregistre le paiement de ${eur(inc.montant)} par ${nm(s, inc.responsibleId)}.`, "argent");
      }
      case "DEBLOQUER": {
        if ((g = staffOnly(s, a))) return g;
        if (!blockReason(s, a.person)) return no(`${nm(s, a.person)} n'est pas bloqué(e).`, "deblocage");
        s.exempt[a.person] = s.clock.day; return yes(`${p} débloque ${nm(s, a.person)} pour aujourd'hui.`, "deblocage");
      }
      case "COMPTAGE": {
        if ((g = staffOnly(s, a))) return g;
        const low = [];
        for (const k in a.counts) { const st = s.stock[k]; st.qty = Math.max(0, +a.counts[k] || 0); st.lastCount = s.clock.day; if (st.qty < st.min) low.push(st.name); }
        if (low.length) log(s, "notif", `Stock bas : ${low.join(", ")}. Pensez au réassort.`, ["equipe"], null);
        return yes(`${p} enregistre le comptage de la semaine.${low.length ? " Sous le seuil : " + low.join(", ") + "." : " Tout est au-dessus du seuil."}`, null);
      }
      case "VERIFIER_SALLE": {
        if ((g = staffOnly(s, a))) return g;
        const r = s.rooms[a.room]; r.present = Math.max(0, +a.present); r.lastCheck = s.clock.day;
        return yes(`${p} vérifie la salle ${a.room} : ${r.present}/${r.fans} ventilateur${r.fans > 1 ? "s" : ""}.`, null);
      }
      case "IMPORT_CLASSES": { if ((g = staffOnly(s, a))) return g; s.classes = a.classes.slice(); return yes(`${p} importe ${a.classes.length} classes depuis Calc.`, null); }
      case "IMPORT_INVENTAIRE": {
        if ((g = staffOnly(s, a))) return g;
        for (const d of a.rows) apply(s, { type: "AJOUTER_MATERIEL", by: a.by, data: d });
        return yes(`${p} importe ${a.rows.length} matériels depuis Calc.`, "equipe");
      }
      case "MODIFIER_CHARTE": { if ((g = dirOnly(s, a))) return g; s.settings.charte = a.text; return yes(`${p} met à jour la charte d'utilisation.`, null); }
      case "REGLAGE": { if ((g = staffOnly(s, a))) return g; s.settings[a.key] = a.value; return yes(`${p} ${a.value ? "active" : "désactive"} ${a.key === "rappel" ? "le rappel de 16h30" : "le récap de 8h"}.`, "temps"); }
      case "FIN_DE_JOURNEE": {
        if (s.clock.phase === "soir") return no("La journée est déjà terminée.", "temps");
        const byResp = {};
        for (const l of s.loans.filter(l => l.status === "actif")) (byResp[l.responsibleId] = byResp[l.responsibleId] || []).push(s.catalog[l.itemId].name);
        if (s.settings.rappel) for (const [pid, names] of Object.entries(byResp)) log(s, "notif", `16h30 · Pense à rendre ${names.join(", ")} avant de partir.`, [pid], "temps");
        for (const l of s.loans.filter(l => l.status === "remise_a_valider")) { l.status = "annule"; s.items[l.itemId].status = "disponible"; s.items[l.itemId].loanId = null; }
        s.clock.phase = "soir";
        const n = Object.keys(byResp).length, m = `Fin du jour ${s.clock.day}. ${n ? n + " emprunteur(s) n'ont pas tout rendu : blocage appliqué." : "Tout a été rendu."}`;
        log(s, "systeme", m, null, n ? "blocage" : "temps");
        return { ok: true, msg: m, rule: n ? "blocage" : "temps", logged: true };
      }
      case "LENDEMAIN": {
        if (s.clock.phase === "journee") apply(s, { type: "FIN_DE_JOURNEE" });
        s.clock.day += 1; s.clock.phase = "journee";
        for (const k in s.exempt) if (s.exempt[k] < s.clock.day) delete s.exempt[k];
        const m = `Jour ${s.clock.day}, 8h. Le bureau ouvre.`; log(s, "systeme", m, null, "temps");
        let lost = 0;
        for (const l of s.loans.filter(l => l.status === "actif" && s.clock.day - l.dayOut >= 2)) { l.status = "perdu"; s.items[l.itemId].status = "perdu"; lost++; openIncident(s, l.itemId, l.responsibleId, "déclaré perdu à J+2", l.forfait, "perte"); }
        if (s.settings.recap) log(s, "recap", recapText(s), ["equipe"], "temps");
        return { ok: true, msg: lost ? `${m} ${lost} matériel(s) passe(nt) en perdu.` : m, rule: lost ? "perte" : "temps", logged: true };
      }
    }
    return no("Action inconnue.");
  }
  function recapText(s) {
    const nr = s.loans.filter(l => overdue(s, l)).length, bl = Object.keys(s.people).filter(pid => blockReason(s, pid)).length;
    const ph = Object.values(s.items).filter(i => i.pending).length, inc = s.incidents.filter(i => i.statut === "a_rembourser").length;
    const low = Object.values(s.stock).filter(x => x.qty < x.min).map(x => x.name), rep = s.reports.filter(r => r.status === "ouvert").length;
    return `Récap 8h · jour ${s.clock.day}\n${nr} prêt(s) en retard · ${bl} emprunteur(s) bloqué(s)\n${ph} photo(s) à contrôler · ${inc} paiement(s) en attente\n${rep} signalement(s) ouvert(s)${low.length ? " · stock bas : " + low.join(", ") : ""}`;
  }
  function dispatch(state, action) {
    const before = {}; for (const pid in state.people) before[pid] = blockReason(state, pid);
    const s = clone(state), start = s.log.length, r = apply(s, action);
    if (!r.ok) { const s2 = clone(state); log(s2, "refus", r.msg, null, r.rule); return { state: s2, ok: false, msg: r.msg, rule: r.rule, events: [] }; }
    if (!r.logged) { const extra = s.log.splice(start); log(s, "ok", r.msg, null, r.rule); for (const e of extra) { e.id = s.seq++; s.log.push(e); } }
    for (const pid in s.people) {
      const after = blockReason(s, pid);
      if (!before[pid] && after) { log(s, "bloc", `${nm(s, pid)} est bloqué(e) : ${after}.`, null, "blocage"); log(s, "notif", `Tes emprunts sont bloqués : ${after}. Rapporte-le au bureau.`, [pid], "blocage"); }
      if (before[pid] && !after && action.type !== "DEBLOQUER") { log(s, "debloc", `${nm(s, pid)} peut de nouveau emprunter.`, null, "blocage"); log(s, "notif", "Tu peux de nouveau emprunter.", [pid], "blocage"); }
    }
    const all = s.log.slice(start), main = all.find(e => e.kind === "ok" || e.kind === "systeme");
    return { state: s, ok: true, msg: r.msg, rule: r.rule, events: all.filter(e => e !== main) };
  }
  return { CATS, RULES, seed, dispatch, blockReason, forfait, overdue, eur, recapText, nm };
})();
