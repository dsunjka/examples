/* Erklärfilme mit Flo – automatisch erzeugt von tools/video/build-films-data.mjs. Nicht von Hand bearbeiten. */
(function () {
  window.LT = window.LT || {};
  window.LT.films = [
    {
      "id": "kraft-der-zehn",
      "title": "Die Kraft der *Zehn*",
      "icon": "🔟",
      "subject": "mathe1",
      "src": "videos/kraft-der-zehn.mp4",
      "poster": "videos/kraft-der-zehn.jpg",
      "duration": 80,
      "ready": true,
      "related": [
        "zehnerfeld"
      ],
      "parent": "Bündeln in Zehner: Zahlen bis zwanzig als Zehner und Einer sehen, sprechen und richtig schreiben (13 = 1 Z + 3 E).",
      "intro": "Schau mal, wie Flo ganz schnell Kastanien zählt!",
      "quiz": [
        {
          "q": "Wie viele Kastanien passen in eine volle Zehner-Schachtel?",
          "options": [
            {
              "text": "5",
              "say": "fünf",
              "correct": false
            },
            {
              "text": "10",
              "say": "zehn",
              "correct": true
            },
            {
              "text": "20",
              "say": "zwanzig",
              "correct": false
            }
          ],
          "explain": "Schau mal auf den Namen: Zehner-Schachtel.",
          "model": "Fünf oben und fünf unten. Das sind zehn Kastanien.",
          "key": "Zehner = 10",
          "at": 13.75
        },
        {
          "q": "Eine volle Schachtel und vier Kastanien. Wie viele sind das?",
          "options": [
            {
              "text": "14",
              "say": "vierzehn",
              "correct": true
            },
            {
              "text": "41",
              "say": "einundvierzig",
              "correct": false
            },
            {
              "text": "5",
              "say": "fünf",
              "correct": false
            }
          ],
          "explain": "Denk dran: In der vollen Schachtel sind schon zehn Kastanien.",
          "model": "Ein Zehner und vier Einer. Zehn und vier sind vierzehn.",
          "key": "10 + 4",
          "at": 34.25
        },
        {
          "q": "Wie viele Einer hat die Zahl fünfzehn?",
          "options": [
            {
              "text": "1",
              "say": "eins",
              "correct": false
            },
            {
              "text": "5",
              "say": "fünf",
              "correct": true
            },
            {
              "text": "15",
              "say": "fünfzehn",
              "correct": false
            }
          ],
          "explain": "Schau mal: Fünfzehn ist ein voller Zehner und noch ein paar Kastanien. Wie viele liegen übrig?",
          "model": "Fünfzehn sind ein Zehner und fünf Einer. Also fünf Einer.",
          "key": "Einer der 15",
          "at": 34.25
        },
        {
          "q": "Wie schreibt man siebzehn?",
          "options": [
            {
              "text": "17",
              "say": "erst die Eins, dann die Sieben",
              "correct": true
            },
            {
              "text": "71",
              "say": "erst die Sieben, dann die Eins",
              "correct": false
            },
            {
              "text": "7",
              "say": "nur die Sieben",
              "correct": false
            }
          ],
          "explain": "Hör genau hin: sieben, zehn. Wir sagen zuerst die Sieben. Aber was schreiben wir zuerst?",
          "model": "Siebzehn ist ein Zehner und sieben Einer. Erst die Eins für den Zehner, dann die Sieben.",
          "key": "17 schreiben",
          "at": 40.92
        }
      ]
    },
    {
      "id": "ueber-die-zehn",
      "title": "Flo hüpft über die *Zehn*",
      "icon": "🌉",
      "subject": "mathe1",
      "src": "videos/ueber-die-zehn.mp4",
      "poster": "videos/ueber-die-zehn.jpg",
      "duration": 87,
      "ready": true,
      "related": [
        "zehnerbruecke"
      ],
      "parent": "Zehnerübergang beim Plusrechnen: erst bis zur Zehn ergänzen, dann den Rest dazu (8 + 5 = 8 + 2 + 3 = 13), am Zahlenstrahl und im Zwanzigerfeld.",
      "intro": "Schau mal, wie Flo über die Zehn hüpft!",
      "quiz": [
        {
          "q": "Flo steht auf der Acht. Wie viele Hüpfer sind es bis zur Zehn?",
          "options": [
            {
              "text": "1",
              "say": "eins",
              "correct": false
            },
            {
              "text": "2",
              "say": "zwei",
              "correct": true
            },
            {
              "text": "3",
              "say": "drei",
              "correct": false
            }
          ],
          "explain": "Schau mal: Die Acht zählt nicht mit. Zähl nur die Hüpfer bis zur Brücke.",
          "model": "Acht, neun, zehn. Das sind zwei Hüpfer.",
          "key": "8 bis 10",
          "at": 25.46
        },
        {
          "q": "Was macht Flo zuerst?",
          "options": [
            {
              "text": "🌉 bis zur 10",
              "say": "bis zur Zehn hüpfen",
              "correct": true
            },
            {
              "text": "➡️ bis zur 20",
              "say": "bis zur Zwanzig hüpfen",
              "correct": false
            },
            {
              "text": "⬅️ rückwärts",
              "say": "rückwärts hüpfen",
              "correct": false
            }
          ],
          "explain": "Denk an die Brücke. Bei welcher Zahl steht sie?",
          "model": "Erst hüpft Flo bis zur Zehn. Dann hüpft er den Rest.",
          "key": "Erst bis 10",
          "at": 77.58
        },
        {
          "q": "Neun plus vier. Wie viel ist das?",
          "options": [
            {
              "text": "12",
              "say": "zwölf",
              "correct": false
            },
            {
              "text": "13",
              "say": "dreizehn",
              "correct": true
            },
            {
              "text": "14",
              "say": "vierzehn",
              "correct": false
            }
          ],
          "explain": "Fast! Von neun bis zur Zehn ist es nur ein Hüpfer. Wie viele fehlen dann noch?",
          "model": "Neun plus eins ist zehn. Dann noch drei. Das sind dreizehn.",
          "key": "9 + 4",
          "at": 36.17
        },
        {
          "q": "Sieben plus fünf. Flo hüpft erst bis zur Zehn. Wie viele Hüpfer fehlen dann noch?",
          "options": [
            {
              "text": "2",
              "say": "zwei",
              "correct": true
            },
            {
              "text": "3",
              "say": "drei",
              "correct": false
            },
            {
              "text": "5",
              "say": "fünf",
              "correct": false
            }
          ],
          "explain": "Schau mal: Bis zur Zehn hat Flo schon ein paar Hüpfer gemacht. Die fehlen nicht mehr.",
          "model": "Sieben plus drei ist zehn. Fünf Hüpfer, drei sind geschafft. Es fehlen noch zwei.",
          "key": "Rest nach 10",
          "at": 58.5
        }
      ]
    },
    {
      "id": "verdoppeln",
      "title": "Verdoppeln wie im *Spiegel*",
      "icon": "🪞",
      "subject": "mathe1",
      "src": "videos/verdoppeln.mp4",
      "poster": "videos/verdoppeln.jpg",
      "duration": 73,
      "ready": true,
      "related": [
        "verdoppeln"
      ],
      "parent": "Verdoppeln als „gleich viele noch einmal“ (nicht „zwei dazu“) und Halbieren als gerechtes Teilen in zwei gleiche Teile; Verdopplungen bis 5 + 5.",
      "intro": "Schau mal, Flo hat einen Zauberspiegel!",
      "quiz": [
        {
          "q": "Was ist das Doppelte von vier?",
          "options": [
            {
              "text": "6",
              "say": "sechs",
              "correct": false
            },
            {
              "text": "8",
              "say": "acht",
              "correct": true
            },
            {
              "text": "5",
              "say": "fünf",
              "correct": false
            }
          ],
          "explain": "Schau mal in den Spiegel. Beim Verdoppeln kommen gleich viele dazu, nicht nur zwei.",
          "model": "Vier und noch einmal vier. Vier und vier sind acht.",
          "key": "Doppelte von 4",
          "at": 23.71
        },
        {
          "q": "Was ist die Hälfte von zehn?",
          "options": [
            {
              "text": "5",
              "say": "fünf",
              "correct": true
            },
            {
              "text": "2",
              "say": "zwei",
              "correct": false
            },
            {
              "text": "20",
              "say": "zwanzig",
              "correct": false
            }
          ],
          "explain": "Fast! Teile zehn Kekse gerecht auf zwei Teller. Wie viele liegen dann auf jedem Teller?",
          "model": "Fünf für dich und fünf für mich. Die Hälfte von zehn ist fünf.",
          "key": "Hälfte von 10",
          "at": 55.63
        },
        {
          "q": "Wann ist gerecht geteilt?",
          "options": [
            {
              "text": "🍪🍪 | 🍪🍪",
              "say": "Beide haben gleich viel.",
              "correct": true
            },
            {
              "text": "🍪🍪🍪 | 🍪",
              "say": "Einer hat mehr.",
              "correct": false
            },
            {
              "text": "🍪🍪🍪🍪 | 0",
              "say": "Einer hat nichts.",
              "correct": false
            }
          ],
          "explain": "Denk an Flo und Eule. Keiner soll traurig sein. Wie viele bekommt jeder?",
          "model": "Gerecht teilen heißt: Beide haben gleich viel.",
          "key": "gerecht teilen",
          "at": 55.63
        },
        {
          "q": "Flo verdoppelt sechs. Wie viele sind das?",
          "options": [
            {
              "text": "8",
              "say": "acht",
              "correct": false
            },
            {
              "text": "12",
              "say": "zwölf",
              "correct": true
            },
            {
              "text": "7",
              "say": "sieben",
              "correct": false
            }
          ],
          "explain": "Schau mal: Beim Verdoppeln kommen nicht nur eins oder zwei dazu. Es kommen gleich viele dazu.",
          "model": "Sechs und noch einmal sechs. Sechs und sechs sind zwölf.",
          "key": "Doppelte von 6",
          "at": 28.46
        }
      ]
    },
    {
      "id": "uhrzeit",
      "title": "Wie *spät* ist es?",
      "icon": "⏰",
      "subject": "mathe1",
      "src": "videos/uhrzeit.mp4",
      "poster": "videos/uhrzeit.jpg",
      "duration": 90,
      "ready": true,
      "related": [
        "uhr"
      ],
      "parent": "Uhr lesen: kurzer Zeiger = Stunde, langer Zeiger = Minuten; langer Zeiger oben auf der 12 = volle Stunde (8 Uhr), unten auf der 6 = halb (8:30 = halb neun, der kurze Zeiger steht zwischen 8 und 9).",
      "intro": "Schau mal, Flo lernt die Uhr lesen!",
      "quiz": [
        {
          "q": "Welcher Zeiger zeigt die Stunde?",
          "options": [
            {
              "text": "kurzer Zeiger",
              "say": "der kurze Zeiger",
              "correct": true
            },
            {
              "text": "langer Zeiger",
              "say": "der lange Zeiger",
              "correct": false
            },
            {
              "text": "beide",
              "say": "beide Zeiger",
              "correct": false
            }
          ],
          "explain": "Schau mal: Der lange Zeiger läuft schnell herum. Er zeigt die Minuten.",
          "model": "Der kurze Zeiger zeigt die Stunde. Der lange zeigt die Minuten.",
          "key": "Stundenzeiger",
          "at": 13.63
        },
        {
          "q": "Der lange Zeiger steht oben auf der Zwölf. Der kurze zeigt auf die Neun. Wie spät ist es?",
          "options": [
            {
              "text": "halb neun",
              "say": "halb neun",
              "correct": false
            },
            {
              "text": "9 Uhr",
              "say": "neun Uhr",
              "correct": true
            },
            {
              "text": "12 Uhr",
              "say": "zwölf Uhr",
              "correct": false
            }
          ],
          "explain": "Denk daran: Der kurze Zeiger sagt die Stunde. Und steht der lange oben, gibt es kein halb.",
          "model": "Langer Zeiger oben heißt volle Stunde. Der kurze zeigt auf die Neun. Es ist neun Uhr.",
          "key": "volle Stunde",
          "at": 27.13
        },
        {
          "q": "Der lange Zeiger steht unten auf der Sechs. Der kurze steht zwischen vier und fünf. Wie spät ist es?",
          "options": [
            {
              "text": "halb fünf",
              "say": "halb fünf",
              "correct": true
            },
            {
              "text": "halb vier",
              "say": "halb vier",
              "correct": false
            },
            {
              "text": "6 Uhr",
              "say": "sechs Uhr",
              "correct": false
            }
          ],
          "explain": "Fast! Halb heißt: auf halbem Weg zur nächsten Stunde. Wohin ist der kurze Zeiger unterwegs?",
          "model": "Der lange Zeiger steht unten, also ist es halb. Der kurze ist auf dem Weg zur Fünf. Es ist halb fünf.",
          "key": "halbe Stunde",
          "at": 51.33
        },
        {
          "q": "Es ist eine volle Stunde. Wohin zeigt der lange Zeiger?",
          "options": [
            {
              "text": "⬆️ oben zur 12",
              "say": "nach oben zur Zwölf",
              "correct": true
            },
            {
              "text": "⬇️ unten zur 6",
              "say": "nach unten zur Sechs",
              "correct": false
            },
            {
              "text": "➡️ zur 3",
              "say": "zur Drei",
              "correct": false
            }
          ],
          "explain": "Denk an acht Uhr, als die Schule anfing. Wo stand da der lange Zeiger?",
          "model": "Bei einer vollen Stunde zeigt der lange Zeiger nach oben auf die Zwölf.",
          "key": "Zeiger oben",
          "at": 27.13
        }
      ]
    },
    {
      "id": "geld",
      "title": "Flos *Geldbeutel*",
      "icon": "💶",
      "subject": "mathe1",
      "src": "videos/geld.mp4",
      "poster": "videos/geld.jpg",
      "duration": 94,
      "ready": true,
      "related": [
        "kaufladen"
      ],
      "parent": "Euro-Münzen und Scheine kennen, auf den aufgedruckten Wert statt auf die Größe achten (die 50-Cent-Münze ist größer als die 1-Euro-Münze), Beträge zusammenlegen und Rückgeld durch Weiterzählen bestimmen.",
      "intro": "Schau mal, Flo geht mit seinem Geldbeutel einkaufen!",
      "quiz": [
        {
          "q": "Welche Münze ist am meisten wert?",
          "options": [
            {
              "text": "50 ct",
              "say": "fünfzig Cent",
              "correct": false
            },
            {
              "text": "2 €",
              "say": "zwei Euro",
              "correct": true
            },
            {
              "text": "1 €",
              "say": "ein Euro",
              "correct": false
            }
          ],
          "explain": "Schau mal: Nicht die Größe zählt. Was steht auf der Münze?",
          "model": "Zwei Euro sind mehr als ein Euro. Und ein Euro ist mehr als fünfzig Cent.",
          "key": "Münzwert",
          "at": 27.42
        },
        {
          "q": "Der Ball kostet sieben Euro. Welches Geld passt genau?",
          "options": [
            {
              "text": "5 € + 2 €",
              "say": "fünf Euro und zwei Euro",
              "correct": true
            },
            {
              "text": "5 € + 1 €",
              "say": "fünf Euro und ein Euro",
              "correct": false
            },
            {
              "text": "2 € + 2 €",
              "say": "zwei Euro und zwei Euro",
              "correct": false
            }
          ],
          "explain": "Fast! Zähl das Geld zusammen. Kommst du genau bis sieben?",
          "model": "Fünf Euro plus zwei Euro ist sieben Euro. Das passt genau.",
          "key": "Betrag legen",
          "at": 34.5
        },
        {
          "q": "Fünf Euro, zwei Euro und ein Euro. Wie viel ist das zusammen?",
          "options": [
            {
              "text": "7 €",
              "say": "sieben Euro",
              "correct": false
            },
            {
              "text": "8 €",
              "say": "acht Euro",
              "correct": true
            },
            {
              "text": "3 €",
              "say": "drei Euro",
              "correct": false
            }
          ],
          "explain": "Schau mal: Hast du alle drei Geldstücke gezählt? Auch den einen Euro?",
          "model": "Fünf plus zwei ist sieben. Plus eins ist acht. Zusammen acht Euro.",
          "key": "Summe",
          "at": 56.38
        },
        {
          "q": "Ein Eis kostet zwei Euro. Ich gebe fünf Euro. Wie viel bekomme ich zurück?",
          "options": [
            {
              "text": "2 €",
              "say": "zwei Euro",
              "correct": false
            },
            {
              "text": "3 €",
              "say": "drei Euro",
              "correct": true
            },
            {
              "text": "7 €",
              "say": "sieben Euro",
              "correct": false
            }
          ],
          "explain": "Zähl vom Preis weiter bis fünf. Wie viele Schritte sind das?",
          "model": "Von zwei bis fünf: drei, vier, fünf. Das sind drei Schritte. Ich bekomme drei Euro zurück.",
          "key": "Rückgeld",
          "at": 70.25
        }
      ]
    },
    {
      "id": "silben",
      "title": "Silben *schwingen*",
      "icon": "🌈",
      "subject": "deutsch1",
      "src": "videos/silben.mp4",
      "poster": "videos/silben.jpg",
      "duration": 74,
      "ready": true,
      "related": [
        "silbenlesen"
      ],
      "parent": "Silben als Lesehilfe: Wörter klatschen und in Silben gliedern (To-ma-te), Silbenbögen, in jeder Silbe steckt ein Selbstlaut (Silbenkönig), lange Wörter Silbe für Silbe lesen und dann zum ganzen Wort zusammenziehen.",
      "intro": "Schau mal, Flo findet ein ganz langes Wort!",
      "quiz": [
        {
          "q": "Wie viele Silben hat das Wort Sonne?",
          "options": [
            {
              "text": "1",
              "say": "eine",
              "correct": false
            },
            {
              "text": "2",
              "say": "zwei",
              "correct": true
            },
            {
              "text": "3",
              "say": "drei",
              "correct": false
            }
          ],
          "explain": "Klatsch das Wort ganz langsam. Wie oft klatschst du?",
          "model": "Son, ne. Zwei Mal geklatscht. Zwei Silben.",
          "key": "Silben zählen",
          "at": 19.5
        },
        {
          "q": "Welcher Buchstabe ist ein Silbenkönig?",
          "options": [
            {
              "text": "m",
              "say": "M",
              "correct": false
            },
            {
              "text": "a",
              "say": "a",
              "correct": true
            },
            {
              "text": "t",
              "say": "t",
              "correct": false
            }
          ],
          "explain": "Denk an die Tomate. Welche Buchstaben haben dort gelb geleuchtet?",
          "model": "Das a ist ein Selbstlaut. A, e, i, o und u sind Silbenkönige.",
          "key": "Selbstlaut",
          "at": 25.67
        },
        {
          "q": "Ro, se. Welches Wort ist das?",
          "options": [
            {
              "text": "🌹 Rose",
              "say": "Rose",
              "correct": true
            },
            {
              "text": "👃 Nase",
              "say": "Nase",
              "correct": false
            },
            {
              "text": "🐦 Rabe",
              "say": "Rabe",
              "correct": false
            }
          ],
          "explain": "Fast! Sag die zwei Silben schnell hintereinander.",
          "model": "Ro, se. Zusammen: Rose.",
          "key": "Silben zusammenziehen",
          "at": 33.38
        },
        {
          "q": "Wie liest Flo ein langes Wort?",
          "options": [
            {
              "text": "🐌 Silbe für Silbe",
              "say": "Silbe für Silbe",
              "correct": true
            },
            {
              "text": "⚡ ganz schnell auf einmal",
              "say": "ganz schnell auf einmal",
              "correct": false
            },
            {
              "text": "🙈 gar nicht",
              "say": "gar nicht",
              "correct": false
            }
          ],
          "explain": "Denk an die Schokolade. Wie hat Flo das Wort gelesen?",
          "model": "Silbe für Silbe. Scho, ko, la, de. Dann das ganze Wort: Schokolade.",
          "key": "Lesestrategie",
          "at": 58.04
        }
      ]
    },
    {
      "id": "wort-schreiben",
      "title": "So schreibst du *ein Wort*",
      "icon": "✏️",
      "subject": "deutsch1",
      "src": "videos/wort-schreiben.mp4",
      "poster": "videos/wort-schreiben.jpg",
      "duration": 87,
      "ready": true,
      "related": [
        "schreibwerkstatt"
      ],
      "parent": "Lautierendes Schreiben: das Wort langsam dehnend sprechen, die Laute der Reihe nach heraushören, für jeden Laut den Buchstaben in der Anlauttabelle suchen (M wie Mond), und wissen, dass manche Laute aus mehreren Buchstaben bestehen (au, ei, sch).",
      "intro": "Schau mal, Flo will ein Wort schreiben!",
      "quiz": [
        {
          "q": "Wie spricht Flo ein Wort, bevor er es schreibt?",
          "options": [
            {
              "text": "⚡ ganz schnell",
              "say": "ganz schnell",
              "correct": false
            },
            {
              "text": "🐌 ganz langsam",
              "say": "ganz langsam",
              "correct": true
            },
            {
              "text": "🤐 gar nicht",
              "say": "gar nicht",
              "correct": false
            }
          ],
          "explain": "Denk an die Schnecke. Wie hat Flo Maus gesprochen?",
          "model": "Ganz langsam, wie eine Schnecke. Mmm, au, sss. So hört man jeden Laut.",
          "key": "Wort dehnen",
          "at": 10.25
        },
        {
          "q": "Welchen Laut hörst du ganz am Anfang von Fisch?",
          "options": [
            {
              "text": "M",
              "say": "mmm",
              "correct": false
            },
            {
              "text": "F",
              "say": "fff",
              "correct": true
            },
            {
              "text": "A",
              "say": "aaa",
              "correct": false
            }
          ],
          "explain": "Sprich das Wort ganz langsam. Was hörst du zuerst?",
          "model": "Fffisch. Ganz am Anfang hörst du fff. Den Laut schreibe ich mit F.",
          "key": "Anlaut",
          "at": 65.04
        },
        {
          "q": "Wie viele Buchstaben braucht der Laut sch?",
          "options": [
            {
              "text": "1",
              "say": "einen",
              "correct": false
            },
            {
              "text": "2",
              "say": "zwei",
              "correct": false
            },
            {
              "text": "3",
              "say": "drei",
              "correct": true
            }
          ],
          "explain": "Schau mal genau hin. Ein Laut kann aus mehreren Buchstaben bestehen.",
          "model": "S, c, h. Drei Buchstaben, aber nur ein Laut: sch, wie bei Schaf.",
          "key": "sch",
          "at": 45.29
        },
        {
          "q": "Wie viele Laute hörst du bei Eis?",
          "options": [
            {
              "text": "1",
              "say": "einen",
              "correct": false
            },
            {
              "text": "2",
              "say": "zwei",
              "correct": true
            },
            {
              "text": "3",
              "say": "drei",
              "correct": false
            }
          ],
          "explain": "Sprich ganz langsam und zähl mit den Fingern. Denk an das au bei Maus.",
          "model": "Ei, sss. Zwei Laute. Das ei schreibe ich mit zwei Buchstaben.",
          "key": "Laute zählen",
          "at": 45.29
        }
      ]
    },
    {
      "id": "satz-zug",
      "title": "Der *Satz-Zug*",
      "icon": "🚂",
      "subject": "deutsch1",
      "src": "videos/satz-zug.mp4",
      "poster": "videos/satz-zug.jpg",
      "duration": 82,
      "ready": true,
      "related": [
        "satzbaumeister"
      ],
      "parent": "Was ist ein Satz? Wörter gehören zusammen wie Wagen eines Zuges: Satzanfang groß, Namenwörter (Nomen) groß, am Ende Punkt oder bei einer Frage Fragezeichen.",
      "intro": "Schau mal, Flos Satz-Zug fährt noch nicht richtig!",
      "quiz": [
        {
          "q": "Wie beginnt ein Satz?",
          "options": [
            {
              "text": "A  groß",
              "say": "mit einem großen Buchstaben",
              "correct": true
            },
            {
              "text": ".  Punkt",
              "say": "mit einem Punkt",
              "correct": false
            },
            {
              "text": "a  klein",
              "say": "mit einem kleinen Buchstaben",
              "correct": false
            }
          ],
          "explain": "Schau mal auf die Lok ganz vorne. Wie sieht der erste Buchstabe aus?",
          "model": "Ein Satz beginnt immer mit einem großen Buchstaben. Wie die Lok vorne im Zug.",
          "key": "Satzanfang groß",
          "at": 17.67
        },
        {
          "q": "Was sagt der Punkt am Ende?",
          "options": [
            {
              "text": "🏁 Ende",
              "say": "Hier ist der Satz zu Ende.",
              "correct": true
            },
            {
              "text": "▶️ Anfang",
              "say": "Hier fängt der Satz an.",
              "correct": false
            },
            {
              "text": "❓ Frage",
              "say": "Das ist eine Frage.",
              "correct": false
            }
          ],
          "explain": "Schau mal, wo der Punkt steht. Er hängt ganz hinten im Zug.",
          "model": "Der Punkt steht im Schlusswagen. Er sagt: Hier ist der Satz zu Ende.",
          "key": "Punkt am Satzende",
          "at": 25.29
        },
        {
          "q": "Wie heißt du? Das ist eine Frage. Was kommt in den Schlusswagen?",
          "options": [
            {
              "text": ".",
              "say": "ein Punkt",
              "correct": false
            },
            {
              "text": "?",
              "say": "ein Fragezeichen",
              "correct": true
            },
            {
              "text": "nichts",
              "say": "gar nichts",
              "correct": false
            }
          ],
          "explain": "Hör mal genau hin. Bei einer Frage geht die Stimme hoch.",
          "model": "Wie heißt du? Das ist eine Frage. Also kommt hinten ein Fragezeichen.",
          "key": "Fragezeichen",
          "at": 47
        },
        {
          "q": "Welches Wort schreiben wir groß?",
          "options": [
            {
              "text": "SPIELT",
              "say": "spielt",
              "correct": false
            },
            {
              "text": "HUND",
              "say": "Hund",
              "correct": true
            },
            {
              "text": "SCHNELL",
              "say": "schnell",
              "correct": false
            }
          ],
          "explain": "Fast! Frag dich: Ist es ein Ding, ein Tier oder ein Mensch?",
          "model": "Hund ist ein Tier. Namen für Tiere schreiben wir groß.",
          "key": "Namenwörter groß",
          "at": 31.63
        }
      ]
    },
    {
      "id": "schulweg",
      "title": "Sicher über die *Straße*",
      "icon": "🚸",
      "subject": "sach1",
      "src": "videos/schulweg.mp4",
      "poster": "videos/schulweg.jpg",
      "duration": 96,
      "ready": true,
      "related": [
        "schulweg"
      ],
      "parent": "Verkehrserziehung für den Schulweg: Bei Rot stehen bleiben (auch ohne Auto), am Bordstein anhalten und links, rechts, links schauen, warten bis Autos stehen und Blickkontakt suchen, nicht zwischen parkenden Autos queren, im Dunkeln helle Kleidung und Reflektoren; der sicherste Weg ist nicht immer der kürzeste.",
      "intro": "Schau mal, Flo geht zur Schule. Wie kommt er sicher über die Straße?",
      "quiz": [
        {
          "q": "Die Ampel ist rot. Es kommt kein Auto. Was tust du?",
          "options": [
            {
              "text": "🚶 gehen",
              "say": "gehen",
              "correct": false
            },
            {
              "text": "🧍 warten",
              "say": "warten",
              "correct": true
            },
            {
              "text": "🏃 rennen",
              "say": "schnell rennen",
              "correct": false
            }
          ],
          "explain": "Schau mal auf die Ampel. Was sagt uns Rot? Das gilt auch ohne Auto.",
          "model": "Rot heißt stehen bleiben. Ich warte, bis die Ampel grün ist.",
          "key": "Rot heißt stehen",
          "at": 25.96
        },
        {
          "q": "Du stehst am Zebrastreifen. Wohin schaust du?",
          "options": [
            {
              "text": "⬅️ ➡️ ⬅️",
              "say": "links, rechts, und nochmal links",
              "correct": true
            },
            {
              "text": "⬆️ nach oben",
              "say": "nach oben",
              "correct": false
            },
            {
              "text": "⬇️ auf den Boden",
              "say": "auf den Boden",
              "correct": false
            }
          ],
          "explain": "Die Autos kommen von der Seite. Dorthin müssen deine Augen schauen.",
          "model": "Ich schaue links, rechts, und nochmal links. Die nahen Autos kommen von links.",
          "key": "links rechts links",
          "at": 34.38
        },
        {
          "q": "Ein Auto kommt zum Zebrastreifen. Wann gehst du los?",
          "options": [
            {
              "text": "sofort",
              "say": "sofort",
              "correct": false
            },
            {
              "text": "🚗 Auto steht",
              "say": "wenn das Auto ganz steht",
              "correct": true
            },
            {
              "text": "🚗 Auto fährt",
              "say": "wenn das Auto noch fährt",
              "correct": false
            }
          ],
          "explain": "Fast! Ein fahrendes Auto braucht Zeit zum Bremsen. Warte ab, was es macht.",
          "model": "Ich warte, bis das Auto ganz steht. Ich schaue dem Fahrer in die Augen. Dann gehe ich.",
          "key": "warten bis Auto steht",
          "at": 49
        },
        {
          "q": "Morgens ist es noch dunkel. Was hilft dir?",
          "options": [
            {
              "text": "🧥 schwarze Jacke",
              "say": "eine schwarze Jacke",
              "correct": false
            },
            {
              "text": "🦺 Leuchtstreifen",
              "say": "Leuchtstreifen",
              "correct": true
            },
            {
              "text": "🧢 Mütze",
              "say": "eine Mütze",
              "correct": false
            }
          ],
          "explain": "Im Dunkeln müssen dich die Autofahrer gut sehen. Was sehen sie im Licht der Autos gut?",
          "model": "Leuchtstreifen leuchten im Licht der Autos. Dann sieht mich der Fahrer.",
          "key": "Leuchtstreifen",
          "at": 71.71
        }
      ]
    },
    {
      "id": "igel-winter",
      "title": "Warum schlafen *Igel* im Winter?",
      "icon": "🦔",
      "subject": "sach1",
      "src": "videos/igel-winter.mp4",
      "poster": "videos/igel-winter.jpg",
      "duration": 89,
      "ready": true,
      "related": [
        "jahreszeiten"
      ],
      "parent": "Tiere im Winter: Der Igel findet im Winter keine Insekten, frisst sich im Herbst einen Fettvorrat an und hält Winterschlaf (Körper kühlt ab, Herz schlägt sehr langsam). Eichhörnchen halten Winterruhe (wachen auf und fressen Vorräte), Frösche fallen in Winterstarre, Schwalben ziehen in den Süden. Tipp: Laubhaufen im Garten als Igel-Quartier liegen lassen.",
      "intro": "Schau mal, Flo sucht seinen Freund Igel!",
      "quiz": [
        {
          "q": "Warum schläft der Igel im Winter?",
          "options": [
            {
              "text": "🪱❌ kein Futter",
              "say": "Er findet kein Futter.",
              "correct": true
            },
            {
              "text": "🦥 faul",
              "say": "Er ist faul.",
              "correct": false
            },
            {
              "text": "☀️ zu hell",
              "say": "Es ist zu hell.",
              "correct": false
            }
          ],
          "explain": "Schau mal, was der Igel frisst. Gibt es das im Winter?",
          "model": "Im Winter verstecken sich Käfer und Würmer. Der Igel findet kein Futter. Darum schläft er.",
          "key": "Grund Winterschlaf",
          "at": 20.17
        },
        {
          "q": "Was frisst der Igel am liebsten?",
          "options": [
            {
              "text": "🍎 Äpfel",
              "say": "Äpfel",
              "correct": false
            },
            {
              "text": "🐞 Käfer",
              "say": "Käfer",
              "correct": true
            },
            {
              "text": "🌰 Nüsse",
              "say": "Nüsse",
              "correct": false
            }
          ],
          "explain": "Denk mal an den Sommer. Was krabbelt da auf dem Boden?",
          "model": "Der Igel frisst Käfer, Würmer und Schnecken.",
          "key": "Igel-Futter",
          "at": 12.25
        },
        {
          "q": "Wer wacht im Winter auf und frisst?",
          "options": [
            {
              "text": "🦔 Igel",
              "say": "der Igel",
              "correct": false
            },
            {
              "text": "🐸 Frosch",
              "say": "der Frosch",
              "correct": false
            },
            {
              "text": "🐿️ Eichhörnchen",
              "say": "das Eichhörnchen",
              "correct": true
            }
          ],
          "explain": "Denk mal an den Vorrat im Versteck. Wer hat ihn im Herbst angelegt?",
          "model": "Das Eichhörnchen wacht auf und holt sich eine Nuss. Das heißt Winterruhe.",
          "key": "Winterruhe",
          "at": 55.5
        },
        {
          "q": "Was ist ein gutes Igel-Hotel?",
          "options": [
            {
              "text": "🍂 Laubhaufen",
              "say": "ein Laubhaufen",
              "correct": true
            },
            {
              "text": "💧 Pfütze",
              "say": "eine Pfütze",
              "correct": false
            },
            {
              "text": "🛣️ Straße",
              "say": "die Straße",
              "correct": false
            }
          ],
          "explain": "Der Igel möchte es trocken und gemütlich. Wo kann er sich einkuscheln?",
          "model": "Ein Laubhaufen ist trocken und warm. Darin schläft der Igel gut.",
          "key": "Igel-Hotel",
          "at": 81.67
        }
      ]
    },
    {
      "id": "schwimmen-sinken",
      "title": "Schwimmt das oder *sinkt* das?",
      "icon": "🛁",
      "subject": "sach1",
      "src": "videos/schwimmen-sinken.mp4",
      "poster": "videos/schwimmen-sinken.jpg",
      "duration": 84,
      "ready": true,
      "related": [
        "schwimmen-sinken"
      ],
      "parent": "Stoffe und ihre Eigenschaften: Ob etwas schwimmt oder sinkt, hängt vom Material ab, nicht von Größe oder Gewicht (ein großer Holzstamm schwimmt, eine winzige Schraube sinkt). Holz, Kork und viele Kunststoffe schwimmen, Metall und Stein sinken. Dazu der Forscher-Ablauf: vermuten, ausprobieren, beobachten. Tipp: zu Hause in der Badewanne mit Alltagsdingen nachmachen.",
      "intro": "Schau mal, Flo forscht in der Badewanne!",
      "quiz": [
        {
          "q": "Was macht der Korken im Wasser?",
          "options": [
            {
              "text": "🌊 schwimmt",
              "say": "Er schwimmt.",
              "correct": true
            },
            {
              "text": "⬇️ sinkt",
              "say": "Er sinkt.",
              "correct": false
            },
            {
              "text": "🫠 schmilzt",
              "say": "Er schmilzt.",
              "correct": false
            }
          ],
          "explain": "Denk an den ersten Versuch. Wo blieb der Korken?",
          "model": "Der Korken bleibt oben auf dem Wasser. Er schwimmt.",
          "key": "Korken",
          "at": 24.17
        },
        {
          "q": "Ein riesiger Baumstamm kommt ins Wasser. Was passiert?",
          "options": [
            {
              "text": "⬇️ sinkt",
              "say": "Er sinkt.",
              "correct": false
            },
            {
              "text": "🌊 schwimmt",
              "say": "Er schwimmt.",
              "correct": true
            },
            {
              "text": "💥 geht kaputt",
              "say": "Er geht kaputt.",
              "correct": false
            }
          ],
          "explain": "Groß und schwer ist nicht der Grund. Woraus ist der Baumstamm gemacht?",
          "model": "Der Baumstamm ist aus Holz. Holz schwimmt. Also schwimmt auch der große Stamm.",
          "key": "Baumstamm",
          "at": 36.92
        },
        {
          "q": "Was sinkt im Wasser?",
          "options": [
            {
              "text": "✏️ Bleistift",
              "say": "der Bleistift",
              "correct": false
            },
            {
              "text": "🔑 Schlüssel",
              "say": "der Schlüssel",
              "correct": true
            },
            {
              "text": "🍾 Korken",
              "say": "der Korken",
              "correct": false
            }
          ],
          "explain": "Schau mal auf das Material. Welches Material sinkt?",
          "model": "Der Schlüssel ist aus Metall. Metall sinkt. Holz und Kork schwimmen.",
          "key": "Material Metall",
          "at": 67.63
        },
        {
          "q": "Was macht ein Forscher zuerst?",
          "options": [
            {
              "text": "🤔 vermuten",
              "say": "vermuten",
              "correct": true
            },
            {
              "text": "🧹 aufräumen",
              "say": "aufräumen",
              "correct": false
            },
            {
              "text": "🏃 weglaufen",
              "say": "weglaufen",
              "correct": false
            }
          ],
          "explain": "Bevor Flo etwas ins Wasser legt, überlegt er. Wie heißt das?",
          "model": "Erst vermuten, dann ausprobieren, dann genau schauen.",
          "key": "Forscher-Plan",
          "at": 11.08
        }
      ]
    },
    {
      "id": "zaehne",
      "title": "Zähne putzen mit *KAI*",
      "icon": "🦷",
      "subject": "sach1",
      "src": "videos/zaehne.mp4",
      "poster": "videos/zaehne.jpg",
      "duration": 79,
      "ready": true,
      "related": [
        "koerperlabor"
      ],
      "parent": "Zahnpflege nach der KAI-Methode: Kauflächen hin und her schrubben, Außenflächen bei geschlossenen Zähnen mit kleinen Kreisen, Innenflächen vom Zahnfleisch zum Zahn (von Rot nach Weiß) auswischen; zweimal täglich zwei Minuten mit erbsengroßer Fluorid-Zahnpasta; Zucker wird von Bakterien im Zahnbelag zu Säure, die Löcher macht, darum Wasser trinken und nicht den ganzen Tag naschen. Tipp: Eltern putzen bis etwa zum Ende der Grundschulzeit abends nach.",
      "intro": "Schau mal, Flo putzt Zähne. Kennst du den Trick mit Kai?",
      "quiz": [
        {
          "q": "Kai ist ein Trick. Wofür steht das K?",
          "options": [
            {
              "text": "🦷 Kauflächen",
              "say": "Kauflächen",
              "correct": true
            },
            {
              "text": "⭕ Kreise",
              "say": "Kreise",
              "correct": false
            },
            {
              "text": "🙂 Kopf",
              "say": "Kopf",
              "correct": false
            }
          ],
          "explain": "Schau mal: Jeder Buchstabe ist eine Stelle am Zahn. Mit welcher Stelle beißt du zu?",
          "model": "K wie Kauflächen. Damit kauen wir. Da schrubbe ich hin und her.",
          "key": "K wie Kauflächen",
          "at": 25.83
        },
        {
          "q": "Wie putzt du die Außenflächen?",
          "options": [
            {
              "text": "↔️ hin und her",
              "say": "hin und her",
              "correct": false
            },
            {
              "text": "⭕ kleine Kreise",
              "say": "kleine Kreise",
              "correct": true
            },
            {
              "text": "🙅 gar nicht",
              "say": "gar nicht",
              "correct": false
            }
          ],
          "explain": "Fast! Hin und her geht es oben auf den Kauflächen. Schau noch mal, was die Bürste außen malt.",
          "model": "Ich beiße die Zähne zusammen. Dann male ich außen kleine Kreise.",
          "key": "A wie Außenflächen",
          "at": 30.83
        },
        {
          "q": "Wie oft am Tag putzt du deine Zähne?",
          "options": [
            {
              "text": "1 ×",
              "say": "einmal am Tag",
              "correct": false
            },
            {
              "text": "2 ×",
              "say": "zweimal am Tag",
              "correct": true
            },
            {
              "text": "nur sonntags",
              "say": "nur am Sonntag",
              "correct": false
            }
          ],
          "explain": "Denk mal an den Morgen und an den Abend. Wann putzt du da?",
          "model": "Ich putze zweimal am Tag. Morgens und abends, immer zwei Minuten lang.",
          "key": "zweimal am Tag",
          "at": 49.04
        },
        {
          "q": "Du hast Durst. Was ist gut für deine Zähne?",
          "options": [
            {
              "text": "🥤 Limo",
              "say": "Limo",
              "correct": false
            },
            {
              "text": "💧 Wasser",
              "say": "Wasser",
              "correct": true
            },
            {
              "text": "🧃 Saft",
              "say": "Saft",
              "correct": false
            }
          ],
          "explain": "Schau mal: Die Bakterien lieben Zucker. Welches Getränk hat gar keinen Zucker?",
          "model": "Wasser hat keinen Zucker. Wasser ist das beste Getränk für die Zähne.",
          "key": "Wasser trinken",
          "at": 60.96
        }
      ]
    }
  ];
})();
