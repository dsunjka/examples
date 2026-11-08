/* ==========================================================================
   Forscherwelt – Kapitel 🌿 Natur & Tiere (vier Wissensreisen)
     w-schmetterling  Vom Ei zum Schmetterling
     w-pflanzen       Wie eine Pflanze wächst
     w-lebensraeume   Wer wohnt wo?
     w-tierkinder     Tiere und ihre Kinder
   Datenformat: siehe js/games/wissen/_shared.js (LT.wissen.addUnit).
   Alle gesprochenen Sätze sind feste Strings (vorab aufgenommene Stimme).
   ========================================================================== */
(function () {
  'use strict';
  const LT = (window.LT = window.LT || {});
  // Absicherung: Fehlt die Engine noch, landen die Einheiten in der
  // Warteschlange LT.wissenQueue, die die Engine beim Laden abarbeitet.
  function add(unit) {
    if (LT.wissen && typeof LT.wissen.addUnit === 'function') LT.wissen.addUnit(unit);
    else (LT.wissenQueue = Array.isArray(LT.wissenQueue) ? LT.wissenQueue : []).push(unit);
  }

  /* ------------------------------------------------------------------
     1) Vom Ei zum Schmetterling
     ------------------------------------------------------------------ */
  add({
    id: 'w-schmetterling',
    theme: 'natur',
    title: 'Vom Ei zum Schmetterling',
    icon: '🦋',
    intro: 'Heute erforschen wir, wie aus einem winzigen Ei ein bunter Schmetterling wird.',
    parent: {
      skill: 'Sachwissen Natur: Entwicklung eines Insekts (Metamorphose: Ei, Raupe, Puppe, Schmetterling)',
      goal: 'Das Kind kennt die vier Entwicklungsstufen in der richtigen Reihenfolge, versteht, warum sich die Raupe häutet, und weiß, wie Schmetterlinge fressen, schmecken und Blüten helfen.',
      levels: [
        'Stufe 1: Bildergeschichte zum Mitmachen, Grundfragen, Entwicklungsstufen in die richtige Reihenfolge legen',
        'Stufe 2: Häuten, Rüssel, Schmecken mit den Füßen, Insekten mit sechs Beinen; Merkmale von Raupe und Schmetterling sortieren',
        'Stufe 3: Denkfragen zu Tarnung, Wärme, Bestäubung und Wachstum; Aussagen prüfen (stimmt oder stimmt nicht)',
      ],
      tip: 'Im Frühling und Sommer gemeinsam Brennnesseln am Wegrand nach Raupen absuchen (nur schauen, nicht mitnehmen) und beobachten, auf welchen Blüten Schmetterlinge sitzen. Lassen Sie Ihr Kind die Verwandlung mit eigenen Worten nacherzählen, zum Beispiel mit vier selbst gemalten Bildern, die es der Reihe nach legt.',
    },
    story: [
      { scene: ['🌿', '🥚'], say: 'Alles beginnt mit einem winzigen Ei. Die Schmetterlings-Mama hat es auf ein Blatt gelegt.',
        tap: { index: 1, say: 'Tippe auf das Ei!', done: 'Super! Das Ei ist nur so groß wie ein Stecknadelkopf.' } },
      { scene: ['🥚', '🐛'], say: 'Aus dem Ei schlüpft eine kleine Raupe. Ihr erstes Essen ist oft die eigene Eierschale.',
        tap: { index: 1, say: 'Tippe auf die Raupe!', done: 'Genau, das ist die Raupe!' } },
      { scene: ['🐛', '🍃', '🍃'], say: 'Die Raupe frisst und frisst Blätter. Jeden Tag wird sie ein bisschen dicker.',
        tap: { index: 2, say: 'Tippe auf ein Blatt, damit die Raupe fressen kann!', done: 'Mampf! Die Raupe frisst das Blatt.' } },
      { scene: ['🐛', '👕'], say: 'Die Haut der Raupe wächst nicht mit. Darum streift sie die alte Haut ab, wie ein zu kleines T-Shirt.' },
      { scene: ['🌿', '🥜'], say: 'Dann hängt sich die Raupe an einen Zweig und wird zur Puppe. Die Puppe hat eine feste Hülle, ein bisschen wie eine Nuss.',
        tap: { index: 1, say: 'Tippe auf die Puppe!', done: 'Psst! In der Puppe verwandelt sich die Raupe ganz langsam.' } },
      { scene: ['🥜', '🦋', '🌸'], say: 'Nach einiger Zeit öffnet sich die Puppe. Heraus kommt ein wunderschöner Schmetterling!',
        tap: { index: 1, say: 'Tippe auf den Schmetterling!', done: 'Hurra! Aus der Raupe ist ein Schmetterling geworden.' } },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Was schlüpft aus dem Schmetterlings-Ei?', answers: [['🐛', 'Eine Raupe'], ['🐣', 'Ein Küken'], ['🐟', 'Ein Fisch']], correct: 0,
        why: 'Genau! Aus dem Ei schlüpft eine kleine Raupe.' },
      { level: 1, q: 'Was frisst die Raupe am liebsten?', answers: [['🍃', 'Blätter'], ['🍫', 'Schokolade'], ['🧀', 'Käse']], correct: 0,
        why: 'Richtig! Die Raupe frisst Blätter von Pflanzen.' },
      { level: 1, q: 'Wo verwandelt sich die Raupe in einen Schmetterling?', answers: [['🌊', 'Im Wasser'], ['🥜', 'In der Puppe'], ['🏠', 'In einem Haus']], correct: 1,
        why: 'Super! In der Puppe wird aus der Raupe ein Schmetterling.' },
      { level: 1, q: 'Was trinkt ein Schmetterling?', answers: [['🥛', 'Milch'], ['🥤', 'Limonade'], ['🌸', 'Nektar aus Blüten']], correct: 2,
        why: 'Genau! Schmetterlinge trinken süßen Nektar aus Blüten.' },
      { level: 1, q: 'Wer legt die Schmetterlings-Eier?', answers: [['🦋', 'Der Schmetterling'], ['🐛', 'Die Raupe'], ['🐌', 'Die Schnecke']], correct: 0,
        why: 'Richtig! Die Schmetterlings-Mama legt die Eier.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Warum zieht die Raupe ihre alte Haut aus?', answers: [['👕', 'Die Haut wird zu eng'], ['🛁', 'Sie will baden'], ['🎨', 'Sie will eine neue Farbe']], correct: 0,
        why: 'Genau! Die Haut wächst nicht mit. Darum häutet sich die Raupe mehrmals.' },
      { level: 2, q: 'Womit trinkt der Schmetterling?', answers: [['🦷', 'Mit Zähnen'], ['🥤', 'Mit einem Rüssel wie ein Strohhalm'], ['🥄', 'Mit einem Löffel']], correct: 1,
        why: 'Richtig! Der Rüssel ist lang und dünn. Wenn der Schmetterling nicht trinkt, rollt er ihn ein.' },
      { level: 2, q: 'Womit schmeckt ein Schmetterling?', answers: [['👂', 'Mit den Ohren'], ['👃', 'Mit der Nase'], ['🦶', 'Mit den Füßen']], correct: 2,
        why: 'Stimmt! Schmetterlinge schmecken mit den Füßen. So merken sie, ob ein Blatt gut für ihre Eier ist.' },
      { level: 2, q: 'Wie viele Beine hat ein Schmetterling?', answers: [['2️⃣', 'Zwei'], ['6️⃣', 'Sechs'], ['🔟', 'Zehn']], correct: 1,
        why: 'Richtig! Schmetterlinge haben sechs Beine. Sie gehören zu den Insekten. Manche falten zwei Beine ganz klein an den Körper, dann sieht man nur vier.' },
      { level: 2, q: 'Wo legt die Schmetterlings-Mama ihre Eier hin?', answers: [['🌿', 'Auf eine Futterpflanze'], ['🪨', 'Auf einen Stein'], ['🌊', 'Ins Wasser']], correct: 0,
        why: 'Genau! So hat die Raupe gleich etwas zu fressen, wenn sie schlüpft.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Was passiert mit den Raupen, wenn es keine Pflanzen mehr gibt?', answers: [['😟', 'Sie finden kein Futter'], ['🦋', 'Sie werden sofort Schmetterlinge'], ['🐟', 'Sie werden zu Fischen']], correct: 0,
        why: 'Richtig! Raupen brauchen Pflanzen. Darum sind wilde Wiesen so wichtig.' },
      { level: 3, q: 'Ein Schmetterling sitzt am Morgen in der Sonne. Warum?', answers: [['😴', 'Er schläft'], ['☀️', 'Er wärmt sich auf'], ['🍽️', 'Er isst die Sonne']], correct: 1,
        why: 'Genau! Schmetterlinge brauchen Wärme. Mit kalten Flügeln können sie nicht gut fliegen.' },
      { level: 3, q: 'Warum sind Schmetterlinge wichtig für die Blumen?', answers: [['🌼', 'Sie tragen Blütenstaub von Blüte zu Blüte'], ['💧', 'Sie gießen die Blumen'], ['✂️', 'Sie schneiden die Blumen ab']], correct: 0,
        why: 'Super! Mit dem Blütenstaub können Früchte und Samen wachsen. Das machen auch die Bienen.' },
      { level: 3, q: 'Wird ein kleiner Schmetterling noch größer?', answers: [['⬆️', 'Ja, er wächst noch'], ['🚫', 'Nein, er bleibt so groß']], correct: 1,
        why: 'Richtig! Nur die Raupe wächst. Der fertige Schmetterling bleibt so groß, wie er ist.' },
      { level: 3, q: 'Warum sind viele Raupen grün wie die Blätter?', answers: [['🎨', 'Sie haben sich angemalt'], ['🔍', 'So findet man sie nicht so leicht'], ['🥬', 'Sie sind aus Salat']], correct: 1,
        why: 'Genau! Auf grünen Blättern sind grüne Raupen gut versteckt. Das nennt man Tarnung.' },
    ],
    play: [
      { type: 'order', say: 'Wie wird aus dem Ei ein Schmetterling? Lege die Bilder der Reihe nach!',
        items: [['🥚', 'Ei'], ['🐛', 'Raupe'], ['🥜', 'Puppe'], ['🦋', 'Schmetterling']] },
      { type: 'sort', say: 'Was passt zur Raupe und was zum Schmetterling? Sortiere!',
        groups: [['🐛', 'Raupe'], ['🦋', 'Schmetterling']],
        items: [['🍃', 'Frisst Blätter', 0], ['👕', 'Häutet sich', 0], ['🥜', 'Wird zur Puppe', 0],
          ['🌸', 'Trinkt Nektar', 1], ['🥚', 'Legt Eier', 1], ['🥤', 'Hat einen Rüssel', 1]] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🦶', s: 'Schmetterlinge schmecken mit ihren Füßen.', ok: true, why: 'Stimmt! An den Füßen haben sie feine Sinne zum Schmecken.' },
        { e: '🦋', s: 'Ein Schmetterling wird jeden Tag größer.', ok: false, why: 'Stimmt nicht! Nur die Raupe wächst. Der Schmetterling wächst nicht mehr.' },
        { e: '🐛', s: 'Eine Raupe häutet sich mehrmals.', ok: true, why: 'Stimmt! Ihre Haut wird zu eng, darum streift sie sie ab.' },
        { e: '🥜', s: 'In der Puppe frisst die Raupe ganz viel.', ok: false, why: 'Stimmt nicht! In der Puppe frisst sie nichts. Dort verwandelt sie sich.' },
        { e: '🐞', s: 'Schmetterlinge haben sechs Beine, genau wie Marienkäfer.', ok: true, why: 'Stimmt! Beide sind Insekten, und alle Insekten haben sechs Beine.' },
        { e: '❄️', s: 'Schmetterlinge fliegen am liebsten, wenn es eiskalt ist.', ok: false, why: 'Stimmt nicht! Schmetterlinge lieben Sonne und Wärme.' },
      ] },
    ],
    facts: [
      { e: '🦋', text: 'Ein Schmetterling war früher eine Raupe. In der Puppe hat sie sich verwandelt.' },
      { e: '🦶', text: 'Schmetterlinge schmecken mit den Füßen. Sie trinken mit einem Rüssel, den sie einrollen können.' },
      { e: '🌼', text: 'Schmetterlinge tragen Blütenstaub von Blüte zu Blüte. So helfen sie den Pflanzen.' },
    ],
  });

  /* ------------------------------------------------------------------
     2) Wie eine Pflanze wächst
     ------------------------------------------------------------------ */
  add({
    id: 'w-pflanzen',
    theme: 'natur',
    title: 'Wie eine Pflanze wächst',
    icon: '🌱',
    intro: 'Heute pflanzen wir einen Samen und finden heraus, was eine Pflanze zum Wachsen braucht.',
    parent: {
      skill: 'Sachwissen Natur: Wachstum von Pflanzen (Samen, Keimen, Wurzel, Stängel, Blatt, Blüte, Frucht)',
      goal: 'Das Kind kennt den Kreislauf vom Samen zur Frucht, weiß, was Pflanzen zum Keimen und Wachsen brauchen, und kennt die Aufgaben von Wurzel, Stängel, Blatt und Blüte.',
      levels: [
        'Stufe 1: Bildergeschichte mit Mitmach-Momenten, Grundfragen, sortieren, was eine Pflanze braucht',
        'Stufe 2: Aufgaben von Wurzel, Stängel und Blatt, Rolle der Biene; Wachstumsstufen in die richtige Reihenfolge legen',
        'Stufe 3: Was passiert, wenn …? (kein Licht, kein Wasser), Pflanzen wachsen zum Licht, Pflanzen und Atemluft; Aussagen prüfen',
      ],
      tip: 'Kresse auf feuchter Watte säen: eine Schale ans Fenster, eine in einen dunklen Schrank. Jeden Tag gemeinsam nachschauen und vergleichen: Keimen beide? Welche Kresse wird grün und kräftig? Die Kresse im Schrank wird lang, dünn und gelb. Sie sucht das Licht. Beim Einkaufen raten: Essen wir hier eine Wurzel (Möhre), ein Blatt (Salat), eine Frucht (Apfel) oder Samen (Erbsen)?',
    },
    story: [
      { scene: ['🌰', '🤲'], say: 'Das ist ein Samen. In ihm steckt schon eine winzige Pflanze.',
        tap: { index: 0, say: 'Tippe auf den Samen!', done: 'Prima! Jetzt legen wir ihn in die Erde.' } },
      { scene: ['🌰', '💧'], say: 'Wir legen den Samen in die Erde und gießen ihn. Mit Wasser und Wärme beginnt er zu keimen.',
        tap: { index: 1, say: 'Tippe auf das Wasser, um den Samen zu gießen!', done: 'Gut gegossen! Jetzt kann der Samen keimen.' } },
      { scene: ['🌱', '⬆️'], say: 'Zuerst wächst eine Wurzel nach unten in die Erde. Dann schiebt sich ein grüner Keimling nach oben.',
        tap: { index: 0, say: 'Tippe auf den Keimling!', done: 'Das ist der Keimling. Er wächst zum Licht.' } },
      { scene: ['☀️', '🌿'], say: 'Jetzt braucht die Pflanze Licht. Mit Sonnenlicht, Wasser und Luft machen die Blätter Nahrung für die Pflanze.',
        tap: { index: 0, say: 'Tippe auf die Sonne!', done: 'Danke, Sonne! Jetzt kann die Pflanze wachsen.' } },
      { scene: ['🌸', '🐝'], say: 'Bald bekommt die Pflanze Blüten. Eine Biene trägt Blütenstaub von Blüte zu Blüte.',
        tap: { index: 1, say: 'Tippe auf die Biene!', done: 'Summ, summ! Die Biene hilft der Blüte.' } },
      { scene: ['🌸', '➡️', '🍎'], say: 'Aus der Blüte wird eine Frucht. In der Frucht stecken neue Samen, und alles beginnt von vorn.',
        tap: { index: 2, say: 'Tippe auf die Frucht!', done: 'Lecker! Die Kerne im Apfel sind die Samen.' } },
    ],
    quiz: [
      // Stufe 1
      { level: 1, q: 'Was braucht ein Samen, damit er keimt?', answers: [['🍬', 'Bonbons'], ['💧', 'Wasser'], ['🧊', 'Eiswürfel']], correct: 1,
        why: 'Genau! Mit Wasser und Wärme fängt der Samen an zu keimen.' },
      { level: 1, q: 'Wohin legen wir den Samen?', answers: [['🪴', 'In die Erde'], ['🍳', 'In die Pfanne'], ['🛁', 'In die Badewanne']], correct: 0,
        why: 'Richtig! In der Erde findet der Samen Wasser und Halt.' },
      { level: 1, q: 'Was braucht eine grüne Pflanze zum Wachsen?', answers: [['📺', 'Fernsehen'], ['🎵', 'Musik'], ['☀️', 'Licht']], correct: 2,
        why: 'Super! Ohne Licht wird eine Pflanze blass und schwach. Auf Dauer kann sie ohne Licht nicht leben.' },
      { level: 1, q: 'Wer trägt Blütenstaub von Blüte zu Blüte?', answers: [['🐝', 'Die Biene'], ['🐟', 'Der Fisch'], ['🐌', 'Die Schnecke']], correct: 0,
        why: 'Genau! Bienen fliegen von Blüte zu Blüte und nehmen dabei Blütenstaub mit.' },
      { level: 1, q: 'Was wächst aus einer Apfelblüte?', answers: [['🍌', 'Eine Banane'], ['🍎', 'Ein Apfel'], ['🍓', 'Eine Erdbeere']], correct: 1,
        why: 'Richtig! Aus der Apfelblüte wird ein Apfel. Darin stecken die Kerne.' },
      // Stufe 2
      { level: 2, q: 'Was wächst aus dem Samen ganz zuerst?', answers: [['🌸', 'Die Blüte'], ['🍎', 'Die Frucht'], ['🥕', 'Die Wurzel']], correct: 2,
        why: 'Genau! Zuerst wächst die Wurzel nach unten. Übrigens ist auch eine Möhre eine Wurzel.' },
      { level: 2, q: 'Was macht die Wurzel?', answers: [['💧', 'Sie holt Wasser aus der Erde'], ['☀️', 'Sie fängt Sonnenlicht'], ['🌸', 'Sie blüht']], correct: 0,
        why: 'Richtig! Die Wurzel holt Wasser aus der Erde und hält die Pflanze fest.' },
      { level: 2, q: 'Was machen die grünen Blätter?', answers: [['💧', 'Sie holen Wasser aus der Erde'], ['☀️', 'Sie fangen Sonnenlicht'], ['🍎', 'Sie werden zu Äpfeln']], correct: 1,
        why: 'Genau! Mit dem Sonnenlicht machen die Blätter Nahrung für die ganze Pflanze.' },
      { level: 2, q: 'Wie kommt das Wasser von der Wurzel zu den Blättern?', answers: [['🪣', 'Mit einem Eimer'], ['🥤', 'Durch den Stängel, wie durch einen Strohhalm'], ['🌧️', 'Es regnet von innen']], correct: 1,
        why: 'Richtig! Im Stängel gibt es feine Röhrchen. Darin steigt das Wasser nach oben.' },
      { level: 2, q: 'Warum ist die Biene wichtig für die Pflanze?', answers: [['🍎', 'Damit Früchte wachsen können'], ['💧', 'Damit die Pflanze gegossen wird'], ['🌙', 'Damit die Pflanze schlafen kann']], correct: 0,
        why: 'Super! Mit dem Blütenstaub kann aus der Blüte eine Frucht werden.' },
      // Stufe 3
      { level: 3, q: 'Eine Pflanze steht lange in einem dunklen Schrank. Was passiert?', answers: [['🌳', 'Sie wird ein großer Baum'], ['🥀', 'Sie wird blass und schwach'], ['🌈', 'Sie wird bunt']], correct: 1,
        why: 'Richtig! Ohne Licht können die Blätter keine Nahrung machen. Die Pflanze wird blass und schwach.' },
      { level: 3, q: 'Eine Pflanze steht am Fenster. Wohin wachsen ihre Blätter?', answers: [['🪟', 'Zum Fenster, zum Licht hin'], ['🚪', 'Zur Tür'], ['🛋️', 'Zum Sofa']], correct: 0,
        why: 'Genau! Pflanzen wachsen zum Licht hin. Darum dreht man Topfpflanzen ab und zu.' },
      { level: 3, q: 'Du pflanzt einen Apfelkern. Was kann daraus wachsen?', answers: [['🌻', 'Eine Sonnenblume'], ['🌵', 'Ein Kaktus'], ['🌳', 'Ein Apfelbaum']], correct: 2,
        why: 'Richtig! Aus einem Apfelkern wächst ein Apfelbaum. Aus jedem Samen wächst die gleiche Pflanzenart.' },
      { level: 3, q: 'Was passiert mit einer Pflanze, die nie gegossen wird?', answers: [['🥀', 'Sie vertrocknet'], ['🌺', 'Sie blüht besonders schön'], ['🍎', 'Sie bekommt viele Äpfel']], correct: 0,
        why: 'Genau! Ohne Wasser vertrocknet die Pflanze. Zu viel Wasser ist aber auch nicht gut.' },
      { level: 3, q: 'Warum sind Pflanzen auch für uns Menschen wichtig?', answers: [['📱', 'Sie laden das Handy auf'], ['🌬️', 'Sie machen frische Luft zum Atmen'], ['🔦', 'Sie leuchten im Dunkeln']], correct: 1,
        why: 'Super! Pflanzen geben Sauerstoff an die Luft ab. Den brauchen wir zum Atmen.' },
    ],
    play: [
      { type: 'sort', say: 'Was braucht eine Pflanze zum Wachsen? Sortiere!',
        groups: [['🌱', 'Braucht die Pflanze'], ['🚫', 'Braucht sie nicht']],
        items: [['☀️', 'Licht', 0], ['💧', 'Wasser', 0], ['🌬️', 'Luft', 0], ['🌡️', 'Wärme', 0],
          ['🍬', 'Bonbons', 1], ['📺', 'Fernseher', 1], ['🧦', 'Socken', 1], ['⚽', 'Ball', 1]] },
      { type: 'order', say: 'Wie wächst eine Pflanze? Lege die Bilder der Reihe nach!',
        items: [['🌰', 'Samen'], ['🌱', 'Keimling'], ['🌿', 'Pflanze mit Blättern'], ['🌸', 'Blüte'], ['🍎', 'Frucht']] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🥕', s: 'Die Möhre ist eine Wurzel.', ok: true, why: 'Stimmt! Wenn wir eine Möhre essen, essen wir eine Wurzel.' },
        { e: '🌱', s: 'Im Dunkeln bleiben Pflanzen grün und kräftig.', ok: false, why: 'Stimmt nicht! Im Dunkeln werden sie blass, dünn und schwach. Sie brauchen Licht.' },
        { e: '🍎', s: 'In einem Apfel stecken Samen.', ok: true, why: 'Stimmt! Die Kerne im Apfel sind Samen.' },
        { e: '🌳', s: 'Auch ein riesiger Baum war einmal ein kleiner Samen.', ok: true, why: 'Stimmt! Sogar die größten Bäume sind aus einem Samen gewachsen.' },
        { e: '🐝', s: 'Bienen sind für Blüten ganz unwichtig.', ok: false, why: 'Stimmt nicht! Bienen tragen Blütenstaub. So können Früchte wachsen.' },
        { e: '🌬️', s: 'Pflanzen machen frische Luft zum Atmen.', ok: true, why: 'Stimmt! Ihre Blätter geben Sauerstoff an die Luft ab.' },
      ] },
    ],
    facts: [
      { e: '🌱', text: 'Ein Samen braucht Wasser und Wärme zum Keimen. Zuerst wächst die Wurzel.' },
      { e: '☀️', text: 'Mit Sonnenlicht, Wasser und Luft machen grüne Blätter Nahrung für die Pflanze.' },
      { e: '🥕', text: 'Eine Möhre ist eine Wurzel. Die Kerne im Apfel sind Samen für neue Bäume.' },
    ],
  });

  /* ------------------------------------------------------------------
     3) Wer wohnt wo? (Lebensräume)
     ------------------------------------------------------------------ */
  add({
    id: 'w-lebensraeume',
    theme: 'natur',
    title: 'Wer wohnt wo?',
    icon: '🏞️',
    intro: 'Heute reisen wir um die Welt und schauen, wo welche Tiere zu Hause sind.',
    parent: {
      skill: 'Sachwissen Natur: Lebensräume (Wald, Meer, Bauernhof, Wüste, Eis) und Anpassung von Tieren',
      goal: 'Das Kind ordnet Tiere ihren Lebensräumen zu, lernt den Begriff Lebensraum und versteht, wie Körpermerkmale (Kiemen, Höcker, Fell, Fett, breite Füße) zum Leben dort passen.',
      levels: [
        'Stufe 1: Bildergeschichte mit Mitmach-Momenten, Grundfragen, Tiere drei Lebensräumen zuordnen',
        'Stufe 2: Kiemen, Kamelhöcker, Pinguin und Eisbär, Winterschlaf; Aussagen prüfen (stimmt oder stimmt nicht)',
        'Stufe 3: Denkfragen zur Anpassung (Delfin atmet Luft, Eisbär in der Wüste, Eichhörnchen pflanzt Bäume); Anpassungen sortieren: Was hilft gegen Kälte, was in der Wüste?',
      ],
      tip: 'Beim Spaziergang Tierspuren suchen (angeknabberte Zapfen, Nester, Maulwurfshügel) und fragen: Warum wohnt das Tier gerade hier? Im Zoo, Tierpark oder Bilderbuch gemeinsam überlegen: Was hilft diesem Tier in seinem Lebensraum, zum Beispiel Fell, Flossen, Höcker oder breite Füße?',
    },
    story: [
      { scene: ['🌲', '🦉', '🐿️'], say: 'Jedes Tier hat ein Zuhause, das zu ihm passt. Das nennt man Lebensraum. Im Wald wohnen Eulen und Eichhörnchen.',
        tap: { index: 2, say: 'Tippe auf das Eichhörnchen!', done: 'Gefunden! Das Eichhörnchen versteckt Nüsse als Vorrat für den Winter.' } },
      { scene: ['🌊', '🐟', '🐬'], say: 'Im Meer ist alles voller Wasser. Fische atmen dort mit ihren Kiemen.',
        tap: { index: 2, say: 'Tippe auf den Delfin!', done: 'Toll! Der Delfin hat keine Kiemen. Er schwimmt zum Atmen nach oben.' } },
      { scene: ['🏡', '🐄', '🐔', '🐷'], say: 'Auf dem Bauernhof leben Kühe, Hühner und Schweine. Die Bäuerin und der Bauer kümmern sich um sie.',
        tap: { index: 2, say: 'Tippe auf das Huhn!', done: 'Gack, gack! Das Huhn legt Eier.' } },
      { scene: ['🏜️', '🐪', '🌵'], say: 'In der Wüste ist es heiß und trocken. Das Kamel kann sehr lange ohne Wasser auskommen.',
        tap: { index: 1, say: 'Tippe auf das Kamel!', done: 'Super! In seinem Höcker speichert das Kamel Fett als Vorrat.' } },
      { scene: ['❄️', '🐧', '🦭'], say: 'Im Eis ist es bitterkalt. Pinguine haben dichte Federn und eine dicke Fettschicht.',
        tap: { index: 1, say: 'Tippe auf den Pinguin!', done: 'Brrr! Dem Pinguin macht die Kälte nichts aus.' } },
      { scene: ['🐻‍❄️', '🧊'], say: 'Ganz im Norden lebt der Eisbär. Sein weißes Fell tarnt ihn im Schnee.',
        tap: { index: 0, say: 'Tippe auf den Eisbären!', done: 'Gut gemacht! Die meisten Pinguine leben ganz woanders, im Süden der Erde.' } },
    ],
    quiz: [
      // Stufe 1
      { level: 1, q: 'Wo wohnt der Fisch?', answers: [['🏜️', 'In der Wüste'], ['🌊', 'Im Meer'], ['🌲', 'Im Wald']], correct: 1,
        why: 'Richtig! Fische leben im Wasser. Sie atmen mit Kiemen.' },
      { level: 1, q: 'Wo wohnt das Kamel?', answers: [['🏜️', 'In der Wüste'], ['❄️', 'Im Eis'], ['🌊', 'Im Meer']], correct: 0,
        why: 'Genau! Das Kamel lebt in der heißen, trockenen Wüste.' },
      { level: 1, q: 'Wo wohnt der Pinguin?', answers: [['🏜️', 'In der heißen Wüste'], ['🏡', 'Auf dem Bauernhof'], ['❄️', 'Im kalten Eis']], correct: 2,
        why: 'Super! Viele Pinguine leben im eisigen Süden der Erde.' },
      { level: 1, q: 'Wer wohnt auf dem Bauernhof?', answers: [['🐬', 'Der Delfin'], ['🐄', 'Die Kuh'], ['🐧', 'Der Pinguin']], correct: 1,
        why: 'Richtig! Die Kuh lebt auf dem Bauernhof. Sie gibt uns Milch.' },
      { level: 1, q: 'Wer wohnt im Wald?', answers: [['🦔', 'Der Igel'], ['🐪', 'Das Kamel'], ['🐙', 'Der Oktopus']], correct: 0,
        why: 'Genau! Der Igel wohnt im Wald und auch gern im Garten.' },
      // Stufe 2
      { level: 2, q: 'Womit atmet ein Fisch unter Wasser?', answers: [['🤿', 'Mit einer Taucherbrille'], ['🐟', 'Mit Kiemen'], ['🎈', 'Mit einem Luftballon']], correct: 1,
        why: 'Richtig! Mit den Kiemen holen Fische Sauerstoff aus dem Wasser.' },
      { level: 2, q: 'Was speichert das Kamel in seinem Höcker?', answers: [['💧', 'Wasser'], ['🪨', 'Steine'], ['🧈', 'Fett']], correct: 2,
        why: 'Toll! Viele denken, im Höcker ist Wasser. Es ist aber Fett, ein Vorrat für lange Zeiten ohne Futter.' },
      { level: 2, q: 'Warum frieren Pinguine im Eis nicht?', answers: [['🧥', 'Dichte Federn und viel Fett'], ['🔥', 'Sie machen ein Feuer'], ['🧣', 'Sie tragen Schals']], correct: 0,
        why: 'Genau! Dichte Federn und die Fettschicht halten warm wie eine Winterjacke.' },
      { level: 2, q: 'Warum ist der Eisbär weiß?', answers: [['🎨', 'Er wurde angemalt'], ['❄️', 'Im Schnee sieht man ihn kaum'], ['🧼', 'Er wäscht sich so oft']], correct: 1,
        why: 'Richtig! Das weiße Fell ist eine Tarnung. Unter dem Fell ist seine Haut übrigens schwarz.' },
      { level: 2, q: 'Was macht der Igel im Winter?', answers: [['😴', 'Er hält Winterschlaf'], ['🏖️', 'Er fährt ans Meer'], ['⛸️', 'Er läuft Schlittschuh']], correct: 0,
        why: 'Genau! Der Igel schläft den Winter über in einem warmen Laubhaufen.' },
      // Stufe 3
      { level: 3, q: 'Ein Delfin lebt im Meer. Warum schwimmt er immer wieder nach oben?', answers: [['🌬️', 'Er muss Luft atmen'], ['🍦', 'Er will ein Eis essen'], ['🎈', 'Er sucht Luftballons']], correct: 0,
        why: 'Richtig! Der Delfin hat keine Kiemen. Er atmet Luft, genau wie wir.' },
      { level: 3, q: 'Wie ginge es einem Eisbären in der heißen Wüste?', answers: [['😊', 'Er fühlt sich wohl'], ['🥶', 'Ihm ist zu kalt'], ['🥵', 'Ihm ist viel zu heiß']], correct: 2,
        why: 'Genau! Sein dickes Fell ist für die Kälte gemacht. Jedes Tier passt zu seinem Lebensraum.' },
      { level: 3, q: 'Treffen sich Eisbär und Pinguin in der Natur?', answers: [['✅', 'Ja, jeden Tag'], ['🚫', 'Nein, nie']], correct: 1,
        why: 'Richtig! Eisbären leben ganz im Norden. Die meisten Pinguine leben im Süden der Erde.' },
      { level: 3, q: 'Warum hat das Kamel so breite Füße?', answers: [['🏜️', 'Damit es nicht im Sand versinkt'], ['⚽', 'Damit es Fußball spielen kann'], ['🏊', 'Damit es schnell schwimmt']], correct: 0,
        why: 'Super! Breite Füße tragen das Kamel gut über den weichen Sand.' },
      { level: 3, q: 'Das Eichhörnchen vergräbt Nüsse und vergisst manche. Was passiert dann?', answers: [['🪨', 'Sie werden zu Steinen'], ['🌳', 'Daraus wachsen neue Bäume'], ['🍫', 'Sie werden zu Schokolade']], correct: 1,
        why: 'Genau! So pflanzt das Eichhörnchen ganz nebenbei neue Bäume.' },
    ],
    play: [
      { type: 'sort', say: 'Wer wohnt wo? Bringe jedes Bild in seinen Lebensraum!',
        groups: [['🌊', 'Meer'], ['🌲', 'Wald'], ['🏜️', 'Wüste']],
        items: [['🐟', 'Fisch', 0], ['🐙', 'Oktopus', 0], ['🦉', 'Eule', 1], ['🦔', 'Igel', 1], ['🐪', 'Kamel', 2], ['🌵', 'Kaktus', 2]] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🐪', s: 'Im Höcker des Kamels ist Wasser.', ok: false, why: 'Stimmt nicht! Im Höcker ist Fett, ein Vorrat für lange Reisen.' },
        { e: '🐟', s: 'Fische atmen mit Kiemen.', ok: true, why: 'Stimmt! So holen sie Sauerstoff aus dem Wasser.' },
        { e: '🦔', s: 'Der Igel hält im Winter Winterschlaf.', ok: true, why: 'Stimmt! Er schläft in einem warmen Laubhaufen.' },
        { e: '🐧', s: 'Pinguine fliegen hoch durch die Luft.', ok: false, why: 'Stimmt nicht! Pinguine können nicht fliegen, aber sie sind tolle Schwimmer.' },
        { e: '🐬', s: 'Der Delfin ist ein Fisch.', ok: false, why: 'Stimmt nicht! Der Delfin ist ein Säugetier und atmet Luft.' },
        { e: '🐄', s: 'Die Kuh lebt auf dem Bauernhof.', ok: true, why: 'Stimmt! Dort bekommt sie Futter und einen Stall.' },
      ] },
      { type: 'sort', say: 'Was hilft gegen Kälte, was hilft in der heißen Wüste? Sortiere!',
        groups: [['❄️', 'Hilft gegen Kälte'], ['🏜️', 'Hilft in der Wüste']],
        items: [['🐻‍❄️', 'Dickes Fell', 0], ['🐧', 'Dicke Fettschicht', 0], ['🪶', 'Dichte Federn', 0], ['🐪', 'Fett im Höcker', 1], ['🦶', 'Breite Füße für den Sand', 1], ['🦊', 'Große Ohren zum Abkühlen', 1]] },
    ],
    facts: [
      { e: '🐟', text: 'Jedes Tier hat einen Lebensraum, der zu ihm passt. Fische atmen im Wasser mit Kiemen.' },
      { e: '🐪', text: 'Im Höcker des Kamels ist Fett, kein Wasser. Breite Füße tragen es über den Sand.' },
      { e: '🐧', text: 'Eisbären leben ganz im Norden, die meisten Pinguine im Süden. In der Natur treffen sie sich nie.' },
    ],
  });

  /* ------------------------------------------------------------------
     4) Tiere und ihre Kinder
     ------------------------------------------------------------------ */
  add({
    id: 'w-tierkinder',
    theme: 'natur',
    title: 'Tiere und ihre Kinder',
    icon: '🐣',
    intro: 'Heute lernen wir Tierkinder kennen und erfahren, wie sie auf die Welt kommen.',
    parent: {
      skill: 'Sachwissen Natur: Tiere und ihre Jungen (Fachwörter), Säugetiere und Tiere, die aus Eiern schlüpfen',
      goal: 'Das Kind kennt die Namen wichtiger Tierkinder (Kalb, Fohlen, Lamm, Ferkel, Küken, Welpe), unterscheidet Säugetiere von Tieren, die aus Eiern schlüpfen, und überträgt das Wissen auf neue Tiere und auf sich selbst.',
      levels: [
        'Stufe 1: Bildergeschichte mit Mitmach-Momenten, Namen der Tierkinder, vom Ei zum Huhn in die richtige Reihenfolge legen',
        'Stufe 2: Brutzeit, Eizahn, Fohlen und Lamm, Säugetier als Begriff; sortieren: Milch bei Mama oder Schlüpfen aus dem Ei',
        'Stufe 3: Transferfragen (Delfin und Mensch sind Säugetiere, Känguru, Kaiserpinguin-Papa); Aussagen prüfen',
      ],
      tip: 'Beim Bauernhofbesuch oder im Tierbuch Tiermütter und ihre Kinder benennen (Kuh und Kalb, Pferd und Fohlen, Schwein und Ferkel). Fragen Sie: Trinkt dieses Tierkind Milch oder ist es aus einem Ei geschlüpft? Schauen Sie gemeinsam Babyfotos an und erzählen Sie, dass auch Ihr Kind als Baby Milch getrunken hat.',
    },
    story: [
      { scene: ['🐄', '🥛'], say: 'Das Kind der Kuh heißt Kalb. Es trinkt Milch bei seiner Mama.',
        tap: { index: 1, say: 'Tippe auf die Milch!', done: 'Genau! Das Kalb trinkt die Milch am Euter seiner Mama.' } },
      { scene: ['🐴', '🌾'], say: 'Das Kind vom Pferd heißt Fohlen. Schon kurz nach der Geburt kann es stehen und laufen.',
        tap: { index: 0, say: 'Tippe auf das Pferd!', done: 'Super! Ein Fohlen hat lange, wackelige Beine.' } },
      { scene: ['🐑', '🌿'], say: 'Das Kind vom Schaf heißt Lamm. Es erkennt seine Mama an ihrer Stimme.',
        tap: { index: 0, say: 'Tippe auf das Schaf!', done: 'Mäh! Das Lamm ruft nach seiner Mama.' } },
      { scene: ['🐔', '🥚', '🐣'], say: 'Die Henne brütet ihre Eier drei Wochen lang warm. Dann pickt sich das Küken aus dem Ei.',
        tap: { index: 2, say: 'Tippe auf das Küken!', done: 'Piep, piep! Das Küken ist geschlüpft.' } },
      { scene: ['🐄', '🐴', '🐑', '👶'], say: 'Kalb, Fohlen und Lamm trinken Milch bei ihrer Mama. Solche Tiere nennt man Säugetiere.',
        tap: { index: 3, say: 'Tippe auf das Baby!', done: 'Genau! Auch Menschen sind Säugetiere. Du hast als Baby auch Milch getrunken.' } },
      { scene: ['🐢', '🐦', '🐟'], say: 'Andere Tierkinder schlüpfen aus Eiern. So ist es bei Vögeln, Schildkröten und den meisten Fischen.',
        tap: { index: 0, say: 'Tippe auf die Schildkröte!', done: 'Richtig! Auch kleine Schildkröten schlüpfen aus Eiern.' } },
    ],
    quiz: [
      // Stufe 1
      { level: 1, q: 'Wie heißt das Kind der Kuh?', answers: [['🐄', 'Kalb'], ['🐑', 'Lamm'], ['🐣', 'Küken']], correct: 0,
        why: 'Richtig! Das Kind der Kuh heißt Kalb.' },
      { level: 1, q: 'Wie heißt das Kind vom Pferd?', answers: [['🐄', 'Kalb'], ['🐴', 'Fohlen'], ['🐶', 'Welpe']], correct: 1,
        why: 'Genau! Das Kind vom Pferd heißt Fohlen.' },
      { level: 1, q: 'Wie heißt das Kind vom Schaf?', answers: [['🐴', 'Fohlen'], ['🐱', 'Kätzchen'], ['🐑', 'Lamm']], correct: 2,
        why: 'Super! Das Kind vom Schaf heißt Lamm.' },
      { level: 1, q: 'Wer schlüpft aus einem Ei?', answers: [['🐣', 'Das Küken'], ['🐴', 'Das Fohlen'], ['🐄', 'Das Kalb']], correct: 0,
        why: 'Richtig! Das Küken pickt sich aus dem Ei.' },
      { level: 1, q: 'Was trinkt ein Kalb?', answers: [['🧃', 'Saft'], ['🥛', 'Milch von seiner Mama'], ['☕', 'Kaffee']], correct: 1,
        why: 'Genau! Das Kalb trinkt Milch bei seiner Mama.' },
      { level: 1, q: 'Wie heißt ein Hundekind?', answers: [['🐣', 'Küken'], ['🐑', 'Lamm'], ['🐶', 'Welpe']], correct: 2,
        why: 'Richtig! Ein junger Hund heißt Welpe.' },
      // Stufe 2
      { level: 2, q: 'Wie heißt das Kind vom Schwein?', answers: [['🐷', 'Ferkel'], ['🐄', 'Kalb'], ['🐶', 'Welpe']], correct: 0,
        why: 'Genau! Das Kind vom Schwein heißt Ferkel.' },
      { level: 2, q: 'Wie lange brütet die Henne, bis die Küken schlüpfen?', answers: [['⏱️', 'Eine Minute'], ['📅', 'Drei Wochen'], ['🎂', 'Ein ganzes Jahr']], correct: 1,
        why: 'Richtig! Nach etwa drei Wochen schlüpfen die Küken.' },
      { level: 2, q: 'Wie kommt das Küken aus dem Ei?', answers: [['🔨', 'Mit einem Hammer'], ['🗝️', 'Mit einem Schlüssel'], ['🐣', 'Es pickt die Schale auf']], correct: 2,
        why: 'Super! Dafür hat das Küken einen kleinen Eizahn am Schnabel. Der fällt später ab.' },
      { level: 2, q: 'Welches Tier ist ein Säugetier?', answers: [['🐴', 'Das Pferd'], ['🐔', 'Das Huhn'], ['🐢', 'Die Schildkröte']], correct: 0,
        why: 'Genau! Das Fohlen trinkt Milch bei seiner Mama. Darum ist das Pferd ein Säugetier.' },
      { level: 2, q: 'Woran erkennt das Lamm seine Mama?', answers: [['👓', 'An ihrer Brille'], ['👂', 'An ihrer Stimme'], ['🎀', 'An ihrer Schleife']], correct: 1,
        why: 'Richtig! Lämmer erkennen ihre Mama am Rufen, sogar in einer großen Herde.' },
      { level: 2, q: 'Was kann ein Fohlen schon kurz nach der Geburt?', answers: [['🦵', 'Stehen und laufen'], ['📖', 'Lesen'], ['🚲', 'Fahrrad fahren']], correct: 0,
        why: 'Genau! So kann es schnell mit der Herde mitlaufen.' },
      // Stufe 3
      { level: 3, q: 'Ein Delfin-Baby trinkt Milch bei seiner Mama. Was ist der Delfin also?', answers: [['🐟', 'Ein Fisch'], ['🥛', 'Ein Säugetier'], ['🐦', 'Ein Vogel']], correct: 1,
        why: 'Super gedacht! Wer als Baby Milch von der Mama trinkt, ist ein Säugetier.' },
      { level: 3, q: 'Auch du hast als Baby Milch getrunken. Was ist der Mensch also?', answers: [['🐦', 'Ein Vogel'], ['🐟', 'Ein Fisch'], ['👶', 'Ein Säugetier']], correct: 2,
        why: 'Genau! Wir Menschen gehören auch zu den Säugetieren.' },
      { level: 3, q: 'Wer wärmt beim Kaiserpinguin das Ei?', answers: [['🐧', 'Der Papa, auf seinen Füßen'], ['❄️', 'Niemand, es liegt im Schnee'], ['🐟', 'Ein Fisch']], correct: 0,
        why: 'Richtig! Der Pinguin-Papa trägt das Ei auf den Füßen, unter einer warmen Bauchfalte.' },
      { level: 3, q: 'Ein Kängurubaby ist bei der Geburt winzig. Wo wächst es weiter?', answers: [['🌳', 'Auf einem Baum'], ['👜', 'Im Beutel seiner Mama'], ['🕳️', 'In einem Erdloch']], correct: 1,
        why: 'Genau! Das Kängurubaby ist erst so klein wie ein Gummibärchen. Im Beutel trinkt es Milch und wächst.' },
      { level: 3, q: 'Warum bleiben viele Tierkinder nah bei ihren Eltern?', answers: [['🤗', 'Sie bekommen Schutz und Futter'], ['🧹', 'Sie müssen aufräumen'], ['📺', 'Sie wollen fernsehen']], correct: 0,
        why: 'Richtig! Die Eltern beschützen ihre Kinder und zeigen ihnen, was sie wissen müssen.' },
    ],
    play: [
      { type: 'order', say: 'Wie wird aus dem Ei ein Huhn? Lege die Bilder der Reihe nach!',
        items: [['🥚', 'Ei'], ['🐣', 'Küken schlüpft'], ['🐥', 'Küken'], ['🐔', 'Huhn']] },
      { type: 'sort', say: 'Trinkt das Tierkind Milch bei Mama, oder schlüpft es aus einem Ei? Sortiere!',
        groups: [['🥛', 'Milch bei Mama'], ['🥚', 'Schlüpft aus dem Ei']],
        items: [['🐄', 'Kuh', 0], ['🐶', 'Hund', 0], ['🐷', 'Schwein', 0], ['🐱', 'Katze', 0],
          ['🐔', 'Huhn', 1], ['🦆', 'Ente', 1], ['🐢', 'Schildkröte', 1], ['🐸', 'Frosch', 1]] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🐬', s: 'Delfin-Babys trinken Milch bei ihrer Mama.', ok: true, why: 'Stimmt! Delfine sind Säugetiere, auch wenn sie im Meer leben.' },
        { e: '🐴', s: 'Ein Fohlen muss ein ganzes Jahr liegen, bevor es laufen kann.', ok: false, why: 'Stimmt nicht! Ein Fohlen steht schon kurz nach der Geburt auf.' },
        { e: '🐧', s: 'Beim Kaiserpinguin wärmt der Papa das Ei.', ok: true, why: 'Stimmt! Er trägt es auf seinen Füßen.' },
        { e: '🦘', s: 'Ein Kängurubaby wächst im Beutel seiner Mama.', ok: true, why: 'Stimmt! Dort ist es warm, und es bekommt Milch.' },
        { e: '🐣', s: 'Küken trinken Milch bei der Henne.', ok: false, why: 'Stimmt nicht! Hühner haben keine Milch. Küken picken Körner.' },
        { e: '👶', s: 'Menschen sind Säugetiere.', ok: true, why: 'Stimmt! Babys trinken Milch, genau wie Kälber und Fohlen.' },
      ] },
    ],
    facts: [
      { e: '🐄', text: 'Das Kind der Kuh heißt Kalb, beim Pferd heißt es Fohlen und beim Schaf Lamm.' },
      { e: '🥛', text: 'Säugetier-Babys trinken Milch bei ihrer Mama. Auch wir Menschen sind Säugetiere.' },
      { e: '🐧', text: 'Beim Kaiserpinguin wärmt der Papa das Ei auf seinen Füßen.' },
    ],
  });
})();
