/* ==========================================================================
   Forscherwelt – Kapitel 🌍 Welt & Technik (vier Wissensreisen)
     w-wetter   Wetter und Wasserkreislauf
     w-weltall  Sonne, Erde, Mond und Sterne
     w-umwelt   Unsere Umwelt schützen
     w-dinos    Die Welt der Dinosaurier
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
     1) Wetter und Wasserkreislauf
     ------------------------------------------------------------------ */
  add({
    id: 'w-wetter',
    theme: 'welt',
    title: 'Wetter und Wasserkreislauf',
    icon: '🌦️',
    intro: 'Heute erforschen wir, woher der Regen kommt und wie ein Regenbogen entsteht.',
    parent: {
      skill: 'Sachwissen Welt: Wetter und Wasserkreislauf (Verdunsten, Wolke, Regen, Schnee, Gewitter, Regenbogen)',
      goal: 'Das Kind kann den Wasserkreislauf in eigenen Worten erklären, kennt Wasser in verschiedenen Formen (Regen, Schnee, Eis, Wolke), weiß, wie es sich bei Gewitter sicher verhält, und wann ein Regenbogen zu sehen ist.',
      levels: [
        'Stufe 1: Bildergeschichte vom Wassertropfen zum Mitmachen, Grundfragen, Stationen des Wasserkreislaufs der Reihe nach legen',
        'Stufe 2: Fachbegriff Verdunsten, woraus Wolken bestehen, Blitz und Donner, Sicherheit bei Gewitter; sortieren, was aus Wasser ist',
        'Stufe 3: Denkfragen zu Pfütze, Schneemann und beschlagenem Spiegel; Aussagen prüfen (stimmt oder stimmt nicht)',
      ],
      tip: 'Ziehen Sie nach einem Regenschauer mit Kreide einen Kreis um eine Pfütze und schauen Sie ein paar Stunden später gemeinsam nach: Wohin ist das Wasser verschwunden? Ein kaltes Glas aus dem Kühlschrank beschlägt in der warmen Küche – so entstehen auch Wolken. An einem sonnigen Tag mit dem Gartenschlauch und der Sonne im Rücken einen eigenen Regenbogen sprühen.',
    },
    story: [
      { scene: ['☀️', '🌊'], say: 'Ella spielt am Meer. Die Sonne scheint warm auf das Wasser.',
        tap: { index: 0, say: 'Tippe auf die Sonne!', done: 'Super! Die Sonne wärmt das Wasser im Meer.' } },
      { scene: ['💧', '⬆️', '☁️'], say: 'Das warme Wasser steigt als unsichtbarer Dampf in die Luft. Das nennt man verdunsten. Hoch oben im Kalten wird aus dem Dampf eine Wolke.',
        tap: { index: 2, say: 'Tippe auf die Wolke!', done: 'Genau! Die Wolke besteht aus winzigen Wassertröpfchen.' } },
      { scene: ['☁️', '🌧️'], say: 'In der Wolke werden die Tröpfchen immer größer und schwerer. Dann fallen sie als Regen herunter.',
        tap: { index: 1, say: 'Tippe auf die Regenwolke!', done: 'Plitsch, platsch! Es regnet.' } },
      { scene: ['🌨️', '❄️', '⛄'], say: 'Ist es in der Wolke sehr kalt, wachsen dort winzige Eiskristalle. Sie werden zu Schneeflocken und fallen herunter. Fast jede Schneeflocke hat sechs Arme.',
        tap: { index: 1, say: 'Tippe auf die Schneeflocke!', done: 'Wunderbar! Eine Schneeflocke ist aus Eis.' } },
      { scene: ['🏞️', '🌊', '🔄'], say: 'Das Regenwasser fließt in Bäche und Flüsse und am Ende zurück ins Meer. Dort beginnt die Reise von vorn. Das ist der Wasserkreislauf.' },
      { scene: ['☀️', '🌧️', '🌈'], say: 'Scheint die Sonne, während es regnet, siehst du vielleicht einen Regenbogen. Dafür muss die Sonne hinter dir stehen.',
        tap: { index: 2, say: 'Tippe auf den Regenbogen!', done: 'Wie schön! Die Regentropfen machen aus dem Sonnenlicht bunte Farben.' } },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Woher kommt der Regen?', answers: [['☁️', 'Aus einer Wolke'], ['🌳', 'Von einem Baum'], ['🌙', 'Vom Mond']], correct: 0,
        why: 'Genau! Der Regen fällt aus den Wolken.' },
      { level: 1, q: 'Was fällt vom Himmel, wenn es im Winter sehr kalt ist?', answers: [['🔥', 'Feuer'], ['❄️', 'Schnee'], ['⭐', 'Sterne']], correct: 1,
        why: 'Richtig! Wenn es sehr kalt ist, fällt Schnee.' },
      { level: 1, q: 'Was macht die Sonne mit dem Wasser im Meer?', answers: [['🧊', 'Sie friert es ein'], ['🎨', 'Sie malt es bunt'], ['🌡️', 'Sie wärmt es']], correct: 2,
        why: 'Super! Die Sonne wärmt das Wasser. Dann steigt es als Dampf nach oben.' },
      { level: 1, q: 'Was hilft dir, wenn es regnet?', answers: [['☔', 'Ein Regenschirm'], ['🕶️', 'Eine Sonnenbrille'], ['🩳', 'Eine kurze Hose']], correct: 0,
        why: 'Genau! Unter dem Regenschirm bleibst du trocken.' },
      { level: 1, q: 'Wann kannst du einen Regenbogen sehen?', answers: [['🌑', 'Wenn es ganz dunkel ist'], ['🌦️', 'Wenn Sonne und Regen zusammen kommen'], ['🌬️', 'Wenn nur der Wind weht']], correct: 1,
        why: 'Richtig! Für einen Regenbogen braucht man Sonnenlicht und Regentropfen.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Wasser steigt durch Wärme als Dampf in die Luft. Wie nennt man das?', answers: [['💨', 'Verdunsten'], ['🧊', 'Einfrieren'], ['🎈', 'Platzen']], correct: 0,
        why: 'Genau! Das heißt verdunsten. Den Wasserdampf kann man nicht sehen.' },
      { level: 2, q: 'Woraus besteht eine Wolke?', answers: [['🍬', 'Aus Zuckerwatte'], ['💧', 'Aus winzigen Wassertröpfchen'], ['🪶', 'Aus Federn']], correct: 1,
        why: 'Richtig! Wolken sind aus winzigen Wassertröpfchen. Ganz hoch oben auch aus kleinen Eiskristallen.' },
      { level: 2, q: 'Bei einem Gewitter: Was kommt zuerst bei dir an?', answers: [['⚡', 'Das Licht vom Blitz'], ['🔊', 'Der Donner']], correct: 0,
        why: 'Genau! Licht ist viel schneller als der Schall. Darum hörst du den Donner erst danach.' },
      { level: 2, q: 'Wo bist du bei einem Gewitter sicher?', answers: [['🌳', 'Unter einem hohen Baum'], ['🏊', 'Im Freibad'], ['🏠', 'Im Haus']], correct: 2,
        why: 'Richtig! Im Haus oder im Auto bist du bei Gewitter sicher.' },
      { level: 2, q: 'Was ist Schnee?', answers: [['❄️', 'Gefrorenes Wasser'], ['🧂', 'Salz'], ['☁️', 'Kleine Wolkenstücke']], correct: 0,
        why: 'Genau! Schnee ist gefrorenes Wasser. Wird es warm, schmilzt er wieder zu Wasser.' },
      { level: 2, q: 'Was steckt im hellen Sonnenlicht versteckt?', answers: [['⚫', 'Nur Schwarz'], ['🌈', 'Alle Farben des Regenbogens'], ['🟫', 'Nur Braun']], correct: 1,
        why: 'Richtig! Regentropfen zerlegen das Sonnenlicht in seine bunten Farben.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Nach dem Regen ist eine Pfütze da. Dann scheint lange die Sonne. Was passiert?', answers: [['☀️', 'Das Wasser verdunstet, die Pfütze verschwindet'], ['🧊', 'Die Pfütze wird zu Eis'], ['🐸', 'Die Pfütze wird ein Teich']], correct: 0,
        why: 'Richtig! Die Sonne wärmt das Wasser. Es verdunstet und wird später wieder zu einer Wolke.' },
      { level: 3, q: 'Ein Schneemann steht lange in der warmen Sonne. Was passiert?', answers: [['⬆️', 'Er wird größer'], ['💧', 'Er schmilzt zu Wasser'], ['🧊', 'Er wird härter']], correct: 1,
        why: 'Genau! Wärme macht aus Schnee wieder Wasser. Das nennt man schmelzen.' },
      { level: 3, q: 'Beim Duschen wird der kalte Spiegel nass. Warum?', answers: [['💦', 'Jemand hat ihn bespritzt'], ['🧊', 'Der Spiegel schmilzt'], ['💧', 'Warmer Dampf wird am Spiegel zu Tröpfchen']], correct: 2,
        why: 'Super! Der Dampf kühlt am Spiegel ab und wird zu Tröpfchen. Genauso entstehen die Wolken.' },
      { level: 3, q: 'Woher kommt das Wasser, das als Regen fällt?', answers: [['🌊', 'Aus Meeren, Seen und Flüssen'], ['🪄', 'Es wird gezaubert'], ['🌙', 'Vom Mond']], correct: 0,
        why: 'Richtig! Das Wasser reist immer im Kreis. Vielleicht war dein Regentropfen früher im Meer.' },
      { level: 3, q: 'Warum fallen die Tropfen irgendwann aus der Wolke?', answers: [['👋', 'Die Wolke wirft sie weg'], ['⬇️', 'Sie werden zu groß und zu schwer'], ['😴', 'Die Wolke schläft ein']], correct: 1,
        why: 'Genau! Viele kleine Tröpfchen werden zu großen, schweren Tropfen. Dann fallen sie herunter.' },
    ],
    play: [
      { type: 'order', say: 'Wie reist das Wasser? Fang mit dem Wasser im Meer an!',
        items: [['🌊', 'Wasser im Meer'], ['💨', 'Dampf steigt auf'], ['☁️', 'Eine Wolke entsteht'], ['🌧️', 'Regen fällt']] },
      { type: 'sort', say: 'Was ist aus Wasser und was nicht? Sortiere!',
        groups: [['💧', 'Ist aus Wasser'], ['🚫', 'Ist nicht aus Wasser']],
        items: [['🌧️', 'Regen', 0], ['❄️', 'Schnee', 0], ['☁️', 'Wolke', 0], ['🧊', 'Eis', 0],
          ['☀️', 'Sonne', 1], ['🪨', 'Stein', 1], ['⚡', 'Blitz', 1], ['🌬️', 'Wind', 1]] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🌈', s: 'Für einen Regenbogen muss die Sonne hinter dir stehen.', ok: true, why: 'Stimmt! Die Sonne scheint dann von hinten auf die Regentropfen vor dir.' },
        { e: '☁️', s: 'Wolken sind aus Watte.', ok: false, why: 'Stimmt nicht! Wolken sind aus winzigen Wassertröpfchen.' },
        { e: '🌊', s: 'Das Wasser im Regen war früher vielleicht im Meer.', ok: true, why: 'Stimmt! Das Wasser reist im Kreis. Das ist der Wasserkreislauf.' },
        { e: '🌳', s: 'Bei Gewitter ist es unter einem hohen Baum am sichersten.', ok: false, why: 'Stimmt nicht! Bei Gewitter geht man ins Haus oder ins Auto.' },
        { e: '⚡', s: 'Erst hörst du den Donner, dann siehst du den Blitz.', ok: false, why: 'Stimmt nicht! Das Licht ist schneller. Erst kommt der Blitz, dann der Donner.' },
        { e: '❄️', s: 'Schnee ist gefrorenes Wasser.', ok: true, why: 'Stimmt! Schneeflocken sind aus Eis.' },
      ] },
    ],
    facts: [
      { e: '💧', text: 'Die Sonne wärmt das Wasser. Es verdunstet und wird zur Wolke. Dann regnet es. Das ist der Wasserkreislauf.' },
      { e: '⚡', text: 'Erst kommt der Blitz, dann der Donner. Licht ist viel schneller als der Schall.' },
      { e: '🌈', text: 'Scheint die Sonne in den Regen, entsteht ein Regenbogen. Die Tropfen machen aus dem Sonnenlicht bunte Farben.' },
    ],
  });

  /* ------------------------------------------------------------------
     2) Sonne, Erde, Mond und Sterne
     ------------------------------------------------------------------ */
  add({
    id: 'w-weltall',
    theme: 'welt',
    title: 'Reise ins Weltall',
    icon: '🚀',
    intro: 'Heute fliegen wir ins Weltall und besuchen die Sonne, den Mond und die Sterne.',
    parent: {
      skill: 'Sachwissen Welt: Sonne, Erde, Mond, Tag und Nacht, Sterne, Planeten, Raumfahrt',
      goal: 'Das Kind weiß, dass die Sonne ein Stern ist, dass Tag und Nacht durch die Drehung der Erde entstehen, dass der Mond von der Sonne angestrahlt wird und die Erde um die Sonne kreist, und kann Größenverhältnisse grob einordnen.',
      levels: [
        'Stufe 1: Bildergeschichte zum Mitmachen, Grundfragen, sortieren, was man am Tag und in der Nacht sieht',
        'Stufe 2: Warum es Nacht wird, warum der Mond leuchtet, acht Planeten, Raumanzug; Mond, Erde und Sonne der Größe nach ordnen',
        'Stufe 3: Denkfragen zu Tag und Nacht auf der anderen Erdseite, Fußspuren auf dem Mond, Entfernung; Aussagen prüfen',
      ],
      tip: 'Spielen Sie im abgedunkelten Zimmer Tag und Nacht: Eine Taschenlampe ist die Sonne, eine Orange mit einem kleinen Aufkleber ist die Erde. Drehen Sie die Orange langsam – wann hat der Aufkleber Tag, wann Nacht? Beobachten Sie über zwei Wochen jeden Abend gemeinsam den Mond und malen Sie seine Form auf.',
    },
    story: [
      { scene: ['☀️', '🔥'], say: 'Die Sonne ist ein Stern. Sie ist eine riesige, heiße Kugel und viel größer als unsere Erde.',
        tap: { index: 0, say: 'Tippe auf die Sonne!', done: 'Toll! Die Sonne schenkt uns Licht und Wärme.' } },
      { scene: ['🌍', '🏙️', '🌃'], say: 'Die Erde dreht sich jeden Tag einmal um sich selbst. Wo die Sonne hinscheint, ist Tag. Auf der anderen Seite ist Nacht.',
        tap: { index: 2, say: 'Tippe auf das Bild, wo gerade Nacht ist!', done: 'Genau! Dort ist es dunkel, und die Kinder schlafen.' } },
      { scene: ['🌍', '🌕'], say: 'Der Mond kreist um die Erde. Er leuchtet nicht selbst. Die Sonne strahlt ihn an.',
        tap: { index: 1, say: 'Tippe auf den Mond!', done: 'Super! Das ist der Mond. Er ist unser Nachbar im Weltall.' } },
      { scene: ['🌌', '✨'], say: 'Nachts siehst du viele Sterne. Jeder Stern ist auch eine Sonne. Sie sind nur so weit weg, dass sie winzig aussehen.',
        tap: { index: 1, say: 'Tippe auf die funkelnden Sterne!', done: 'Wie schön sie funkeln!' } },
      { scene: ['☀️', '🌍', '🪐'], say: 'Die Erde ist einer von acht Planeten. Alle kreisen um die Sonne. Der Saturn hat große Ringe aus Eis und Gestein.',
        tap: { index: 2, say: 'Tippe auf den Saturn mit seinen Ringen!', done: 'Richtig! Das ist der Saturn.' } },
      { scene: ['🚀', '👩‍🚀'], say: 'Astronautinnen und Astronauten fliegen mit einer Rakete ins Weltall. In der Raumstation schweben sie durch die Luft.',
        tap: { index: 0, say: 'Tippe auf die Rakete, damit sie startet!', done: 'Drei, zwei, eins, los! Die Rakete fliegt ins Weltall.' } },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Was ist die Sonne?', answers: [['🎈', 'Ein Ballon'], ['⭐', 'Ein Stern'], ['💡', 'Eine Lampe']], correct: 1,
        why: 'Genau! Die Sonne ist ein Stern. Sie ist der Stern, der uns am nächsten ist.' },
      { level: 1, q: 'Wann siehst du die Sterne am besten?', answers: [['🌃', 'In der Nacht'], ['🏙️', 'Am Tag']], correct: 0,
        why: 'Richtig! Am Tag sind die Sterne auch da. Aber die Sonne ist so hell, dass man sie nicht sieht.' },
      { level: 1, q: 'Womit fliegen Astronauten ins Weltall?', answers: [['🚲', 'Mit dem Fahrrad'], ['🚂', 'Mit dem Zug'], ['🚀', 'Mit einer Rakete']], correct: 2,
        why: 'Super! Nur eine Rakete ist stark genug, um bis ins Weltall zu fliegen.' },
      { level: 1, q: 'Wo wohnen wir Menschen im Weltall?', answers: [['🌍', 'Auf der Erde'], ['🌕', 'Auf dem Mond'], ['🪐', 'Auf dem Saturn']], correct: 0,
        why: 'Genau! Wir wohnen auf der Erde. Sie ist unser Zuhause im Weltall.' },
      { level: 1, q: 'Was kreist um die Erde?', answers: [['☀️', 'Die Sonne'], ['🌕', 'Der Mond'], ['🪐', 'Der Saturn']], correct: 1,
        why: 'Richtig! Der Mond kreist um die Erde. Und die Erde kreist um die Sonne.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Warum wird es Nacht?', answers: [['💤', 'Die Sonne geht schlafen'], ['🌍', 'Die Erde dreht unsere Seite von der Sonne weg'], ['☁️', 'Eine Wolke deckt die Sonne zu']], correct: 1,
        why: 'Genau! Die Erde dreht sich. Dann zeigt unsere Seite von der Sonne weg, und es wird Nacht.' },
      { level: 2, q: 'Warum leuchtet der Mond?', answers: [['☀️', 'Die Sonne strahlt ihn an'], ['💡', 'In ihm ist eine Lampe'], ['🔥', 'Er brennt']], correct: 0,
        why: 'Richtig! Der Mond leuchtet nicht selbst. Er wird von der Sonne angestrahlt.' },
      { level: 2, q: 'Wie viele Planeten kreisen um unsere Sonne?', answers: [['2️⃣', 'Zwei'], ['8️⃣', 'Acht'], ['🔟', 'Zehn']], correct: 1,
        why: 'Genau! Acht Planeten kreisen um die Sonne. Die Erde ist einer davon.' },
      { level: 2, q: 'Was tragen Astronauten draußen im Weltall?', answers: [['👙', 'Einen Badeanzug'], ['🧥', 'Eine Winterjacke'], ['👩‍🚀', 'Einen Raumanzug']], correct: 2,
        why: 'Richtig! Im Weltall gibt es keine Luft zum Atmen. Der Raumanzug gibt ihnen Luft und schützt sie.' },
      { level: 2, q: 'Wie lange braucht die Erde für eine Runde um die Sonne?', answers: [['📅', 'Ein ganzes Jahr'], ['⏰', 'Eine Stunde'], ['🌙', 'Eine Nacht']], correct: 0,
        why: 'Genau! Für eine Runde um die Sonne braucht die Erde ein Jahr. An deinem Geburtstag ist sie wieder am selben Platz.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Bei uns ist Mittag. Was ist auf der anderen Seite der Erde?', answers: [['🌃', 'Dort ist Nacht'], ['🏙️', 'Dort ist auch Mittag']], correct: 0,
        why: 'Richtig! Wenn wir Tag haben, schlafen die Kinder auf der anderen Seite der Erde.' },
      { level: 3, q: 'Auf dem Mond gibt es keinen Wind und keinen Regen. Was passiert mit Fußspuren dort?', answers: [['💨', 'Der Wind weht sie weg'], ['👣', 'Sie bleiben sehr, sehr lange'], ['🌧️', 'Der Regen wäscht sie weg']], correct: 1,
        why: 'Genau! Darum sind die Fußspuren der Astronauten wohl heute noch auf dem Mond.' },
      { level: 3, q: 'Die Sonne ist riesig. Warum sieht sie trotzdem klein aus?', answers: [['🤏', 'Sie ist in Wahrheit klein'], ['☁️', 'Die Wolken machen sie klein'], ['🔭', 'Sie ist sehr, sehr weit weg']], correct: 2,
        why: 'Richtig! Was weit weg ist, sieht klein aus. Die Sonne ist sehr, sehr weit von uns entfernt.' },
      { level: 3, q: 'Auf dem Mond gibt es keine Luft. Kann man dort ohne Raumanzug spielen?', answers: [['⚽', 'Ja, ganz einfach'], ['👩‍🚀', 'Nein, nur mit Raumanzug']], correct: 1,
        why: 'Genau! Ohne Luft kann man nicht atmen. Darum brauchen Astronauten einen Raumanzug.' },
      { level: 3, q: 'Warum kannst du die Sterne in der Stadt schlechter sehen als auf dem Land?', answers: [['💡', 'Die vielen Lampen sind zu hell'], ['🏠', 'Die Sterne wohnen auf dem Land'], ['🌧️', 'In der Stadt regnet es immer']], correct: 0,
        why: 'Richtig! Das helle Licht der Stadt überstrahlt die Sterne. Auf dem Land siehst du viel mehr.' },
    ],
    play: [
      { type: 'sort', say: 'Was siehst du am Tag und was in der Nacht? Sortiere!',
        groups: [['🏙️', 'Am Tag'], ['🌃', 'In der Nacht']],
        items: [['☀️', 'Sonne', 0], ['🌈', 'Regenbogen', 0], ['🦋', 'Schmetterling', 0],
          ['⭐', 'Sterne', 1], ['🦉', 'Eule auf der Jagd', 1], ['🦇', 'Fledermaus', 1]] },
      { type: 'order', say: 'Lege die Dinge der Größe nach. Fang mit dem Kleinsten an!',
        items: [['⚽', 'Fußball'], ['🌕', 'Mond'], ['🌍', 'Erde'], ['☀️', 'Sonne']] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '☀️', s: 'Die Sonne ist ein Stern.', ok: true, why: 'Stimmt! Die Sonne ist der Stern, der uns am nächsten ist.' },
        { e: '🌕', s: 'Der Mond leuchtet von selbst wie eine Lampe.', ok: false, why: 'Stimmt nicht! Die Sonne strahlt den Mond an.' },
        { e: '🌍', s: 'Wenn bei uns Tag ist, ist auf der anderen Seite der Erde Nacht.', ok: true, why: 'Stimmt! Die Sonne kann immer nur eine Seite der Erde bescheinen.' },
        { e: '🔄', s: 'Die Sonne kreist um die Erde.', ok: false, why: 'Stimmt nicht! Die Erde kreist um die Sonne. Für eine Runde braucht sie ein Jahr.' },
        { e: '👩‍🚀', s: 'Im Weltall kann man ohne Raumanzug atmen.', ok: false, why: 'Stimmt nicht! Im Weltall gibt es keine Luft zum Atmen.' },
        { e: '🪐', s: 'Der Saturn ist ein Planet mit großen Ringen.', ok: true, why: 'Stimmt! Seine Ringe sind aus Eis und Gestein.' },
      ] },
    ],
    facts: [
      { e: '☀️', text: 'Die Sonne ist ein Stern. Die Erde kreist um die Sonne. Eine Runde dauert ein ganzes Jahr.' },
      { e: '🌍', text: 'Die Erde dreht sich. Auf der Seite zur Sonne ist Tag, auf der anderen Seite ist Nacht.' },
      { e: '🌕', text: 'Der Mond leuchtet nicht selbst, die Sonne strahlt ihn an. Zwölf Menschen waren schon auf dem Mond.' },
    ],
  });

  /* ------------------------------------------------------------------
     3) Unsere Umwelt schützen
     ------------------------------------------------------------------ */
  add({
    id: 'w-umwelt',
    theme: 'welt',
    title: 'Unsere Umwelt schützen',
    icon: '♻️',
    intro: 'Heute werden wir Umwelt-Helfer. Wir trennen Müll, sparen Wasser und schützen die Natur.',
    parent: {
      skill: 'Sachwissen Welt und Werte: Mülltrennung, Recycling, Wasser sparen, Natur schützen',
      goal: 'Das Kind kann typischen Hausmüll der richtigen Tonne zuordnen, versteht, dass aus getrenntem Müll Neues entsteht (Recycling), und kennt einfache Möglichkeiten, Wasser zu sparen und die Natur zu schützen.',
      levels: [
        'Stufe 1: Bildergeschichte zum Mitmachen, Grundfragen, Müll in gelbe Tonne, Papiertonne und Biotonne sortieren',
        'Stufe 2: Fachbegriff Recycling, Glas, Plastik zerfällt nur sehr langsam, Mehrwegtasche; den Weg vom Altpapier zum neuen Karton der Reihe nach legen',
        'Stufe 3: Denkfragen zu Reparieren, Altpapier und Wald, Fahrrad statt Auto, Blumen im Wald; Aussagen prüfen',
      ],
      tip: 'Lassen Sie Ihr Kind zu Hause beim Mülltrennen helfen und den Müll selbst zur richtigen Tonne bringen. Die Regeln und Tonnenfarben sind je nach Wohnort etwas unterschiedlich – schauen Sie gemeinsam nach, welche Tonnen es bei Ihnen gibt. Beim Zähneputzen eine Sanduhr oder ein Lied nutzen und den Wasserhahn dabei zugedreht lassen.',
    },
    story: [
      { scene: ['🌳', '🥤', '🐦'], say: 'Jonas und Aylin spielen im Park. Auf der Wiese liegt ein leerer Becher. Müll gehört nicht in die Natur.',
        tap: { index: 1, say: 'Tippe auf den Becher und heb ihn auf!', done: 'Danke! Jetzt ist die Wiese wieder sauber.' } },
      { scene: ['🥫', '🧴', '🟡'], say: 'Zu Hause trennen wir den Müll. Verpackungen aus Plastik und Metall kommen in die gelbe Tonne.',
        tap: { index: 0, say: 'Tippe auf die leere Dose!', done: 'Richtig! Die Dose kommt in die gelbe Tonne.' } },
      { scene: ['📰', '📦', '🔵'], say: 'Papier und Pappe kommen in die blaue Papiertonne. Daraus wird in einer Fabrik neues Papier.',
        tap: { index: 1, say: 'Tippe auf den Karton!', done: 'Genau! Aus dem alten Karton wird neues Papier.' } },
      { scene: ['🍌', '🥚', '🪱'], say: 'Obstreste und Eierschalen kommen in die Biotonne. Regenwürmer und winzige Lebewesen machen daraus gute Erde.',
        tap: { index: 2, say: 'Tippe auf den Regenwurm!', done: 'Hallo, Regenwurm! Du bist ein toller Erde-Macher.' } },
      { scene: ['🍯', '♻️'], say: 'Leere Gläser kommen in den Glascontainer. Daraus wird neues Glas, das nennt man Recycling. Flaschen mit Pfand bringen wir zurück in den Laden.',
        tap: { index: 1, say: 'Tippe auf das Recycling-Zeichen!', done: 'Super! Dieses Zeichen bedeutet: Aus Altem wird etwas Neues.' } },
      { scene: ['🪥', '🚰'], say: 'Sauberes Wasser ist kostbar. Beim Zähneputzen drehen wir den Wasserhahn zu.',
        tap: { index: 1, say: 'Tippe auf den Wasserhahn, um ihn zuzudrehen!', done: 'Klasse! Du hast Wasser gespart.' } },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Wohin gehört der leere Becher aus dem Park?', answers: [['🗑️', 'In den Mülleimer'], ['🌳', 'Hinter den Baum'], ['🌊', 'In den Teich']], correct: 0,
        why: 'Genau! Müll gehört in den Mülleimer, nicht in die Natur.' },
      { level: 1, q: 'Wohin kommt die alte Zeitung?', answers: [['🟡', 'In die gelbe Tonne'], ['🔵', 'In die blaue Papiertonne'], ['🟤', 'In die Biotonne']], correct: 1,
        why: 'Richtig! Papier kommt in die Papiertonne. Daraus wird neues Papier.' },
      { level: 1, q: 'Wohin kommt die Bananenschale?', answers: [['🔵', 'In die Papiertonne'], ['🟡', 'In die gelbe Tonne'], ['🟤', 'In die Biotonne']], correct: 2,
        why: 'Super! Obstreste kommen in die Biotonne. Daraus wird gute Erde.' },
      { level: 1, q: 'Wohin kommt die leere Dose?', answers: [['🟡', 'In die gelbe Tonne'], ['🔵', 'In die Papiertonne'], ['🟤', 'In die Biotonne']], correct: 0,
        why: 'Genau! Verpackungen aus Metall und Plastik kommen in die gelbe Tonne.' },
      { level: 1, q: 'Wie sparst du beim Zähneputzen Wasser?', answers: [['💦', 'Ich lasse das Wasser laufen'], ['🚰', 'Ich drehe den Hahn zu']], correct: 1,
        why: 'Richtig! Wenn der Hahn zu ist, fließt kein Wasser umsonst weg.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Was bedeutet Recycling?', answers: [['♻️', 'Aus altem Müll wird etwas Neues'], ['🎨', 'Müll wird bunt angemalt'], ['🕳️', 'Müll wird versteckt']], correct: 0,
        why: 'Genau! Beim Recycling werden aus alten Sachen neue Sachen gemacht.' },
      { level: 2, q: 'Was wird aus alten Glasflaschen?', answers: [['🍞', 'Brot'], ['🍾', 'Neue Flaschen und Gläser'], ['🧸', 'Teddys']], correct: 1,
        why: 'Richtig! Das alte Glas wird geschmolzen. Daraus macht man neue Flaschen und Gläser.' },
      { level: 2, q: 'Eine Plastikflasche liegt im Wald. Wie lange dauert es, bis sie verschwunden ist?', answers: [['🌙', 'Eine Nacht'], ['📅', 'Eine Woche'], ['⏳', 'Viele hundert Jahre']], correct: 2,
        why: 'Genau! Plastik zerfällt nur ganz, ganz langsam. Darum gehört es nie in die Natur.' },
      { level: 2, q: 'Warum trennen wir den Müll?', answers: [['♻️', 'Damit daraus Neues gemacht werden kann'], ['🎨', 'Damit er schön bunt aussieht'], ['😴', 'Damit die Müllabfuhr schlafen kann']], correct: 0,
        why: 'Richtig! Nur getrennter Müll kann gut recycelt werden.' },
      { level: 2, q: 'Was ist beim Einkaufen besser für die Umwelt?', answers: [['🛍️', 'Jedes Mal eine neue Plastiktüte'], ['👜', 'Eine Tasche, die man immer wieder benutzt']], correct: 1,
        why: 'Genau! Eine Tasche, die man oft benutzt, spart viel Müll.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Dein Teddy hat ein kleines Loch. Was ist gut für die Umwelt?', answers: [['🪡', 'Ihn zunähen und weiter lieb haben'], ['🗑️', 'Ihn sofort wegwerfen']], correct: 0,
        why: 'Super! Was repariert wird, muss nicht neu gemacht werden. Das spart Müll und Energie.' },
      { level: 3, q: 'Papier wird aus Holz gemacht. Was schützen wir, wenn wir Altpapier sammeln?', answers: [['🏠', 'Die Häuser'], ['🌳', 'Die Bäume im Wald'], ['🚗', 'Die Autos']], correct: 1,
        why: 'Richtig! Aus Altpapier wird neues Papier. Dann müssen weniger Bäume gefällt werden.' },
      { level: 3, q: 'Warum ist es gut, mit dem Rad oder zu Fuß in den Kindergarten zu kommen?', answers: [['🚲', 'Die Luft bleibt sauberer'], ['🚗', 'Autos machen die Luft frischer'], ['🌧️', 'Dann regnet es nicht']], correct: 0,
        why: 'Genau! Autos machen Abgase. Wer läuft oder radelt, hält die Luft sauber und bleibt fit.' },
      { level: 3, q: 'Im Wald blüht eine schöne Blume. Was ist gut für die Natur?', answers: [['✂️', 'Ich pflücke sie ab'], ['👀', 'Ich schaue sie an und lasse sie stehen']], correct: 1,
        why: 'Richtig! So können sich auch die Bienen und andere Menschen an der Blume freuen.' },
      { level: 3, q: 'Warum gehört Müll nicht ins Meer?', answers: [['🐢', 'Tiere halten ihn für Futter'], ['🌊', 'Das Meer wird davon sauber'], ['🐟', 'Die Fische spielen gern damit']], correct: 0,
        why: 'Genau! Schildkröten verwechseln Plastiktüten mit Quallen. Darum werfen wir Müll in die Tonne.' },
    ],
    play: [
      { type: 'sort', say: 'Hilf beim Mülltrennen! In welche Tonne gehört das?',
        groups: [['🟡', 'Gelbe Tonne'], ['🔵', 'Papiertonne'], ['🟤', 'Biotonne']],
        items: [['🥫', 'Dose', 0], ['🧴', 'Leere Shampooflasche', 0], ['📰', 'Zeitung', 1], ['📦', 'Karton', 1],
          ['🍌', 'Bananenschale', 2], ['🥚', 'Eierschale', 2]] },
      { type: 'order', say: 'Wie wird aus alter Zeitung ein neuer Karton? Fang mit der alten Zeitung an!',
        items: [['📰', 'Alte Zeitung'], ['🔵', 'Papiertonne'], ['🚛', 'Müllauto'], ['🏭', 'Papierfabrik'], ['📦', 'Neuer Karton']] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🍌', s: 'Eine Bananenschale gehört in die Biotonne.', ok: true, why: 'Stimmt! Aus Obstresten wird wieder gute Erde.' },
        { e: '🧴', s: 'Plastik verschwindet in der Natur schon nach einem Tag.', ok: false, why: 'Stimmt nicht! Plastik bleibt viele hundert Jahre liegen.' },
        { e: '🍾', s: 'Flaschen mit Pfand bringt man zurück in den Laden.', ok: true, why: 'Stimmt! Viele davon werden gespült und wieder befüllt. Das ist noch besser als Recycling.' },
        { e: '🚰', s: 'Beim Zähneputzen soll das Wasser die ganze Zeit laufen.', ok: false, why: 'Stimmt nicht! Dreh den Hahn zu, dann sparst du Wasser.' },
        { e: '🌳', s: 'Papier wird aus Holz gemacht.', ok: true, why: 'Stimmt! Darum schützt Altpapier den Wald.' },
        { e: '🐢', s: 'Müll im Meer ist gut für die Tiere.', ok: false, why: 'Stimmt nicht! Müll gehört nie ins Meer, sondern in die Tonne.' },
      ] },
    ],
    facts: [
      { e: '♻️', text: 'Getrennter Müll ist wertvoll. Aus altem Papier, Glas und Plastik werden neue Sachen. Das heißt Recycling.' },
      { e: '⏳', text: 'Plastik zerfällt erst nach vielen hundert Jahren. Darum gehört Müll nie in die Natur.' },
      { e: '🌳', text: 'Papier wird aus Holz gemacht. Wer Altpapier sammelt, schützt die Bäume im Wald.' },
    ],
  });

  /* ------------------------------------------------------------------
     4) Die Welt der Dinosaurier
     ------------------------------------------------------------------ */
  add({
    id: 'w-dinos',
    theme: 'welt',
    title: 'Die Welt der Dinosaurier',
    icon: '🦕',
    intro: 'Heute reisen wir in die Zeit der Dinosaurier und graben wie echte Forscher nach Knochen.',
    parent: {
      skill: 'Sachwissen Welt: Dinosaurier, Pflanzen- und Fleischfresser, Fossilien, Arbeit von Forschenden, Vögel als Nachfahren',
      goal: 'Das Kind weiß, dass Dinosaurier vor sehr langer Zeit lebten, lange vor den Menschen, unterscheidet Pflanzen- und Fleischfresser an Merkmalen wie Zähnen und Hals, kennt den Begriff Fossil und weiß, dass Vögel von Dinosauriern abstammen.',
      levels: [
        'Stufe 1: Bildergeschichte zum Mitmachen, Grundfragen, sortieren, was es zur Zeit der Dinosaurier schon gab und was noch nicht',
        'Stufe 2: Fachbegriff Fossil, Ausgraben mit dem Pinsel, Menschen und die großen Dinosaurier lebten nie zusammen; vom Dinosaurier zum Museum der Reihe nach legen',
        'Stufe 3: Rückschlüsse aus Zähnen und Hals, warum es keine Fotos gibt, wie Forschende die Größe herausfinden; Aussagen prüfen',
      ],
      tip: 'Besuchen Sie gemeinsam ein Naturkundemuseum mit Dinosaurier-Skeletten. Zu Hause können Sie im Sandkasten eine Ausgrabung spielen: Spielzeugknochen oder ausgekochte Hähnchenknochen vergraben und mit Pinsel und Löffel vorsichtig freilegen. Schauen Sie sich die Füße eines Huhns oder einer Taube genau an – Schuppen und Krallen erinnern an die Dinosaurier.',
    },
    story: [
      { scene: ['⏳', '🌋', '🦕'], say: 'Vor sehr, sehr langer Zeit lebten Dinosaurier auf der Erde. Das war lange bevor es Menschen gab.',
        tap: { index: 2, say: 'Tippe auf den Dinosaurier!', done: 'Hallo, Dino! Du hast aber einen langen Hals.' } },
      { scene: ['🦕', '🌳'], say: 'Viele Dinosaurier waren Pflanzenfresser. Mit ihrem langen Hals erreichten sie Blätter hoch oben in den Bäumen.',
        tap: { index: 1, say: 'Tippe auf den Baum, damit der Dino fressen kann!', done: 'Mampf! Der Langhals-Dino frisst die Blätter.' } },
      { scene: ['🦖', '🦷'], say: 'Andere Dinosaurier waren Fleischfresser. Der Tyrannosaurus hatte große, spitze Zähne.',
        tap: { index: 1, say: 'Tippe auf den Zahn!', done: 'Staunst du? Ein Zahn vom Tyrannosaurus war so lang wie eine Banane.' } },
      { scene: ['🥚', '🐣'], say: 'Dino-Babys schlüpften aus Eiern, so wie Küken heute. Sogar die riesigen Dinosaurier waren am Anfang ganz klein.',
        tap: { index: 0, say: 'Tippe auf das Ei!', done: 'Knack! Ein kleines Dino-Baby schlüpft.' } },
      { scene: ['⛏️', '🦴', '🖌️'], say: 'Heute graben Forscherinnen und Forscher Dino-Knochen aus. Die Knochen sind in langer Zeit zu Stein geworden. Man nennt sie Fossilien.',
        tap: { index: 2, say: 'Tippe auf den Pinsel, um den Knochen sauber zu machen!', done: 'Ganz vorsichtig! So bleibt das Fossil heil.' } },
      { scene: ['🦖', '➡️', '🐦'], say: 'Wusstest du das? Die Vögel sind die Nachfahren der Dinosaurier. Der kleine Spatz ist also ein Verwandter vom Tyrannosaurus.',
        tap: { index: 2, say: 'Tippe auf den Vogel!', done: 'Piep, piep! Vögel stammen von den Dinosauriern ab.' } },
    ],
    quiz: [
      // Stufe 1 – Grundwissen
      { level: 1, q: 'Wann lebten die Dinosaurier?', answers: [['⏳', 'Vor sehr, sehr langer Zeit'], ['📅', 'Letzte Woche'], ['🌙', 'Gestern Nacht']], correct: 0,
        why: 'Genau! Die Dinosaurier lebten vor sehr, sehr langer Zeit, lange vor den Menschen.' },
      { level: 1, q: 'Was fraß ein Dinosaurier mit langem Hals?', answers: [['🐟', 'Fische'], ['🌿', 'Blätter'], ['🍕', 'Pizza']], correct: 1,
        why: 'Richtig! Die Langhals-Dinosaurier waren Pflanzenfresser.' },
      { level: 1, q: 'Welcher Dinosaurier hatte große, spitze Zähne?', answers: [['🦕', 'Der Langhals-Dinosaurier'], ['🦖', 'Der Tyrannosaurus']], correct: 1,
        why: 'Genau! Der Tyrannosaurus war ein Fleischfresser mit spitzen Zähnen.' },
      { level: 1, q: 'Woraus schlüpften die Dino-Babys?', answers: [['🥚', 'Aus Eiern'], ['🌰', 'Aus Nüssen'], ['🎁', 'Aus Geschenken']], correct: 0,
        why: 'Richtig! Dinosaurier legten Eier, so wie Vögel heute.' },
      { level: 1, q: 'Was finden Forscher heute von den Dinosauriern?', answers: [['🧸', 'Kuscheltiere'], ['📸', 'Fotos'], ['🦴', 'Knochen aus Stein']], correct: 2,
        why: 'Super! Forscher finden Knochen, die zu Stein geworden sind.' },
      // Stufe 2 – vertieft
      { level: 2, q: 'Wie nennt man Knochen, die zu Stein geworden sind?', answers: [['💎', 'Edelsteine'], ['🦴', 'Fossilien'], ['🍪', 'Kekse']], correct: 1,
        why: 'Genau! Das sind Fossilien. Auch Fußspuren im Stein sind Fossilien.' },
      { level: 2, q: 'Womit legen Forscher die Knochen ganz vorsichtig frei?', answers: [['🖌️', 'Mit einem Pinsel'], ['🍴', 'Mit Messer und Gabel'], ['🥊', 'Mit Boxhandschuhen']], correct: 0,
        why: 'Richtig! Mit dem Pinsel fegen sie Sand und Staub ganz sanft weg.' },
      { level: 2, q: 'Welche Tiere sind die Nachfahren der Dinosaurier?', answers: [['🐶', 'Die Hunde'], ['🐟', 'Die Fische'], ['🐦', 'Die Vögel']], correct: 2,
        why: 'Genau! Die Vögel stammen von den Dinosauriern ab.' },
      { level: 2, q: 'Haben Menschen und die großen Dinosaurier zusammen gelebt?', answers: [['✅', 'Ja, früher schon'], ['🚫', 'Nein, nie']], correct: 1,
        why: 'Richtig! Die großen Dinosaurier gab es schon lange nicht mehr, als die ersten Menschen lebten. Nur ihre Nachfahren, die Vögel, leben mit uns.' },
      { level: 2, q: 'Der Triceratops hatte drei Hörner. Was hat er gefressen?', answers: [['🌿', 'Pflanzen'], ['🍖', 'Fleisch']], correct: 0,
        why: 'Genau! Der Triceratops war ein Pflanzenfresser. Mit seinen Hörnern konnte er sich verteidigen.' },
      // Stufe 3 – Experte, Denk- und Transferfragen
      { level: 3, q: 'Ein Dinosaurier hatte flache, stumpfe Zähne. Was hat er wohl gefressen?', answers: [['🍖', 'Fleisch'], ['🌿', 'Pflanzen']], correct: 1,
        why: 'Richtig! Stumpfe Zähne zermahlen Pflanzen. Spitze Zähne sind zum Fleischfressen.' },
      { level: 3, q: 'Warum hatten manche Dinosaurier einen so langen Hals?', answers: [['🌳', 'Um an hohe Blätter zu kommen'], ['🎤', 'Um laut zu singen'], ['🧣', 'Um einen langen Schal zu tragen']], correct: 0,
        why: 'Genau! Mit dem langen Hals kamen sie an Blätter, die andere Tiere nicht erreichten.' },
      { level: 3, q: 'Warum gibt es keine Fotos von lebenden Dinosauriern?', answers: [['🙈', 'Die Dinos waren zu schüchtern'], ['📷', 'Damals gab es keine Menschen und keine Kameras'], ['🌑', 'Es war immer dunkel']], correct: 1,
        why: 'Richtig! Darum lernen wir alles über Dinosaurier von ihren Fossilien.' },
      { level: 3, q: 'Woher wissen wir, wie groß ein Dinosaurier war?', answers: [['📺', 'Aus dem Fernsehen'], ['👴', 'Opa hat ihn gesehen'], ['🦴', 'Forscher setzen die Knochen zusammen']], correct: 2,
        why: 'Genau! Aus den Knochen bauen Forscher ein Skelett. Dann sieht man, wie groß der Dino war.' },
      { level: 3, q: 'Ein Huhn hat Schuppen und Krallen an den Füßen. An wen erinnert das?', answers: [['🦖', 'An einen Dinosaurier'], ['🐌', 'An eine Schnecke'], ['🐸', 'An einen Frosch']], correct: 0,
        why: 'Richtig! Das Huhn ist ein Vogel, und Vögel stammen von den Dinosauriern ab.' },
    ],
    play: [
      { type: 'sort', say: 'Was gab es zur Zeit der Dinosaurier schon und was noch nicht? Sortiere!',
        groups: [['🦕', 'Gab es schon'], ['🚫', 'Gab es noch nicht']],
        items: [['🌳', 'Bäume', 0], ['🌋', 'Vulkane', 0], ['🥚', 'Eier', 0], ['🐢', 'Schildkröten', 0],
          ['🚗', 'Autos', 1], ['🏠', 'Häuser', 1], ['👪', 'Menschen', 1], ['📱', 'Handys', 1]] },
      { type: 'order', say: 'Wie kommt ein Dino-Knochen ins Museum? Fang beim lebenden Dinosaurier an!',
        items: [['🦕', 'Ein Dinosaurier lebt'], ['🦴', 'Knochen liegen in der Erde'], ['🪨', 'Knochen werden zu Stein'], ['⛏️', 'Forscher graben sie aus'], ['🏛️', 'Im Museum']] },
      { type: 'truefalse', say: 'Stimmt das oder stimmt das nicht?', items: [
        { e: '🐦', s: 'Vögel sind die Nachfahren der Dinosaurier.', ok: true, why: 'Stimmt! Jeder Vogel stammt von Dinosauriern ab.' },
        { e: '👪', s: 'Menschen haben mit einem Tyrannosaurus gespielt.', ok: false, why: 'Stimmt nicht! Die Dinosaurier lebten lange vor den Menschen.' },
        { e: '🦕', s: 'Alle Dinosaurier haben Fleisch gefressen.', ok: false, why: 'Stimmt nicht! Viele Dinosaurier waren Pflanzenfresser.' },
        { e: '🦴', s: 'Fossilien sind Knochen, die zu Stein geworden sind.', ok: true, why: 'Stimmt! Fossilien verraten uns, wie die Dinosaurier aussahen.' },
        { e: '🥚', s: 'Dinosaurier schlüpften aus Eiern.', ok: true, why: 'Stimmt! Genau wie Vögel heute.' },
        { e: '🦷', s: 'Ein Dinosaurier mit spitzen Zähnen hat bestimmt nur Gras gefressen.', ok: false, why: 'Stimmt nicht! Spitze Zähne zeigen einen Fleischfresser.' },
      ] },
    ],
    facts: [
      { e: '🦕', text: 'Dinosaurier lebten vor sehr, sehr langer Zeit. Damals gab es noch keine Menschen.' },
      { e: '🦴', text: 'Knochen, die zu Stein geworden sind, heißen Fossilien. Forscher graben sie mit Pinseln vorsichtig aus.' },
      { e: '🐦', text: 'Vögel sind die Nachfahren der Dinosaurier. Auch der kleine Spatz hat Dinos als Vorfahren.' },
    ],
  });
})();
