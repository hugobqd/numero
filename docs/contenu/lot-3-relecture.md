# Lot 3 — production du contenu v1 (#10)

Rédigé le 8 novembre 2026. **Toutes les nouvelles fiches sont en brouillon** ; seule la relecture de Hugo permet le passage en `valide` (ADR 0006). Aucune nouvelle fiche n’est validée automatiquement. Les 84 fiches précédentes sont conservées à l’identique.

## Bilan

- Volume : **25 nouvelles fiches**.
- Difficultés du lot (crans 1 / 2 / 3 / 4) : **12 / 13 / 0 / 0**.
- Stock après fusion des lots 3 à 3 : **109 fiches**, dont 27 / 44 / 24 / 14 par cran.
- Thèmes du lot : Nature et climat (5), Sport et jeux (3), Arts et culture (3), Nombres et mesures (3), Corps humain (2), Animaux (2), Géographie (2), Terre et géologie (2), Physique et chimie (2), Astronomie (1).

## Méthode et sources

Sujets issus de la culture générale, des programmes scolaires et des axes validés dans #36 et #38. La source d’idée est notée dans chaque fiche. Recherche effectuée auprès des organismes et institutions cités : organismes météo, musées, fédérations sportives, administrations, universités et organismes scientifiques. La consultation combine pages et extraits indexés ; certains sites empêchent l’ouverture directe mais leurs résultats indexés et les recoupements confirment les nombres. Les deux références de chaque fiche figurent ci-dessous pour faciliter la relecture.

Les notes de pièges distinguent les grandeurs réellement publiées des calculs dérivés ou des hypothèses de confusion (unité, périmètre, comptage). Le type `erreur_frequente` désigne ici un mécanisme proposé de confusion : aucune fréquence d’erreur des joueurs n’a été mesurée. Les valeurs proches sont des propositions inventées, sans être présentées comme des mesures scientifiques.

## Points à relire

- `nature-trefle-folioles` et `terre-roches-familles` : deux leurres hors de ×0,5–×2. Pour une réponse entière de 3, il n’existe que quatre autres entiers positifs entre 1,5 et 6 ; une réserve de six leurres distincts impose donc au moins deux valeurs en dehors de cet intervalle.
- Le lot introduit des réponses petites ou très rondes. Le générateur pouvait retourner moins de cinq choix en tirant un rang impossible. Le correctif borne le rang aux valeurs positives disponibles de même forme. Les rangs restent uniformes parmi les rangs réalisables ; comportement identique quand les cinq rangs sont possibles.

## Inventaire et références

| Fiche | Valeur à retenir | Cran | Source et recoupement |
|---|---|---:|---|
| Combien de grands genres de nuages distingue l’Atlas international des nuages ?<br>`nature-nuages-genres` | 10 genres (pas 1) | 2 | [Référence](https://public.wmo.int/world-meteorological-day-2017/classifying-clouds) · [Recoupement](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/clouds) |
| Quel est le degré maximal de l’échelle de Beaufort usuelle ?<br>`nature-beaufort-maximum` | 12 degrés (pas 1) | 2 | [Référence](https://weather.metoffice.gov.uk/guides/coast-and-sea/beaufort-scale) · [Recoupement](https://www.weather.gov/boi/beaufort) |
| Combien de folioles porte normalement une feuille de trèfle blanc ?<br>`nature-trefle-folioles` | 3 folioles (pas 1) | 1 | [Référence](https://endeavour.kew.org/sites/endeavour/files/documents/2024-06/Kew-KS4-Tree-of-life-species-guide.pdf) · [Recoupement](https://plants.ces.ncsu.edu/plants/trifolium-repens/) |
| Combien de branches principales possède un cristal de neige en étoile simple ?<br>`nature-cristal-neige-branches` | 6 branches (pas 1) | 1 | [Référence](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/snow/snowflake) · [Recoupement](https://www.nesdis.noaa.gov/about/k-12-education/ice-snow/how-do-snowflakes-form) |
| Sur combien d’années calcule-t-on une normale climatique standard ?<br>`nature-normale-climatique-duree` | 30 ans (pas 1) | 2 | [Référence](https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/climate-services/wmo-climatological-normals) · [Recoupement](https://climate.copernicus.eu/temperature-qas) |
| Combien de joueurs d’une équipe de volley-ball en salle sont sur le terrain ?<br>`sport-volleyball-joueurs` | 6 joueurs (pas 1) | 1 | [Référence](https://www.fivb.com/volleyball/the-game/basic-rules/) · [Recoupement](https://usavolleyball.org/play/rules-of-volleyball/) |
| Combien de joueurs d’une équipe de basket-ball sont sur le terrain ?<br>`sport-basketball-joueurs` | 5 joueurs (pas 1) | 1 | [Référence](https://assets.fiba.basketball/image/upload/documents-corporate-wabc-coaches-manual-eng.pdf) · [Recoupement](https://assets.fiba.basketball/image/upload/documents-corporate-wabc-start-coaching-eng-facilitator-handbook.pdf) |
| Combien de joueurs une équipe complète de rugby à XV aligne-t-elle sur le terrain ?<br>`sport-rugby-quinze-joueurs` | 15 joueurs (pas 1) | 1 | [Référence](https://passport.world.rugby/laws-of-the-game/laws-by-number/3-team/) · [Recoupement](https://passport.world.rugby/media/dafo2cbl/2501en-world-rugby-laws-2025-compressed.pdf) |
| Combien de cordes possède un violon classique ?<br>`arts-violon-cordes` | 4 cordes (pas 1) | 1 | [Référence](https://www.yamaha.com/en/musical_instrument_guide/violin/mechanism/mechanism002.html) · [Recoupement](https://pad.philharmoniedeparis.fr/histoires-d-instruments-le-violon.aspx?_lg=fr-FR) |
| Combien de cordes possède une guitare classique standard ?<br>`arts-guitare-cordes` | 6 cordes (pas 1) | 1 | [Référence](https://europe.yamaha.com/en/musical-instruments/guitars-basses-amps/explore/musical-instrument-guide/acoustic-guitar/structure002.html) · [Recoupement](https://www.yamaha.com/en/musical_instrument_guide/acoustic_guitar/trivia/trivia006.html) |
| Combien de demi-tons égaux séparent deux notes distantes d’une octave ?<br>`arts-octave-demi-tons` | 12 demi-tons (pas 1) | 2 | [Référence](https://collectionsdumusee.philharmoniedeparis.fr/vers-la-gamme-a-temperament-egal.aspx?_lg=fr-FR) · [Recoupement](https://en.wikipedia.org/wiki/Equal_temperament) |
| Quelle mesure d’angle correspond à un tour complet ?<br>`nombres-tour-complet-degres` | 360 ° (pas 1) | 1 | [Référence](https://downloads.bbc.co.uk/skillswise/maths/ma33angl/factsheet/ma33angl-e3-f-right-angles.pdf) · [Recoupement](https://www.ncetm.org.uk/media/hwfluxcs/ncetm_ks3_cc_6_1.pdf) |
| Quelle est la somme des trois angles intérieurs d’un triangle dessiné dans un plan ?<br>`nombres-triangle-somme-angles` | 180 ° (pas 1) | 2 | [Référence](https://www.amsi.org.au/ESA_middle_years/Year7/Year7_2cS/Year7_2cS_R2_pg2.html) · [Recoupement](https://openstax.org/books/prealgebra/pages/9-3-use-properties-of-angles-triangles-and-the-pythagorean-theorem) |
| Combien d’arêtes possède un cube ?<br>`nombres-cube-aretes` | 12 arêtes (pas 1) | 1 | [Référence](https://www.cambridge.org/gb/download_file/1000740/129924/) · [Recoupement](https://en.wikipedia.org/wiki/Cube) |
| Combien de cavités possède le cœur humain ?<br>`corps-coeur-cavites` | 4 cavités (pas 1) | 2 | [Référence](https://www.nhlbi.nih.gov/health/heart/anatomy) · [Recoupement](https://www.bhf.org.uk/informationsupport/how-a-healthy-heart-works) |
| Combien de dents compte une denture de lait complète ?<br>`corps-dents-lait` | 20 dents (pas 1) | 1 | [Référence](https://www.nhsinform.scot/healthy-living/dental-health/your-teeth/everything-you-need-to-know-about-teeth) · [Recoupement](https://www.kentcht.nhs.uk/leaflet/looking-after-your-babys-mouth-and-teeth/) |
| Combien de pattes possède normalement un insecte adulte ?<br>`animaux-insecte-pattes` | 6 pattes (pas 1) | 1 | [Référence](https://mdc.mo.gov/wildlife/wildlife-facts/insect-spider-and-kin-facts) · [Recoupement](https://www.nps.gov/kaww/learn/nature/insects.htm) |
| Combien de pattes possède normalement une araignée adulte ?<br>`animaux-araignee-pattes` | 8 pattes (pas 1) | 1 | [Référence](https://australian.museum/learn/species-identification/ask-an-expert/what-is-a-spiders/) · [Recoupement](https://extension.umn.edu/garden-and-home/home-maintenance/household-insects/spiders) |
| Combien de provinces compte le Canada ?<br>`geo-canada-provinces` | 10 provinces (pas 1) | 2 | [Référence](https://www.canada.ca/en/intergovernmental-affairs/services/provinces-territories.html) · [Recoupement](https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/land-climate.html) |
| Combien de Länder composent l’Allemagne ?<br>`geo-allemagne-lander` | 16 Länder (pas 1) | 2 | [Référence](https://www.destatis.de/DE/Themen/Laender-Regionen/Regionales/Gemeindeverzeichnis/Glossar/bundeslaender.html) · [Recoupement](https://www.bundestag.de/en/parliament/function/legislation/competencies-245700) |
| Quelle est la dureté de référence du diamant sur l’échelle de Mohs ?<br>`terre-mohs-diamant` | 10 sur Mohs (pas 1) | 2 | [Référence](https://www.nps.gov/articles/mohs-hardness-scale.htm) · [Recoupement](https://pubs.usgs.gov/gip/gemstones/mineral.html) |
| En combien de grandes familles classe-t-on les roches selon leur formation ?<br>`terre-roches-familles` | 3 familles (pas 1) | 2 | [Référence](https://www.nps.gov/subjects/geology/how-rocks-are-classified.htm) · [Recoupement](https://floridadep.gov/fgs/geologic-topics/content/all-about-rocks) |
| Combien de protons contient le noyau d’un atome de carbone ?<br>`physique-carbone-protons` | 6 protons (pas 1) | 2 | [Référence](https://periodic-table.rsc.org/element/6/Carbon) · [Recoupement](https://pubchem.ncbi.nlm.nih.gov/element/C) |
| Combien de protons contient le noyau d’un atome d’oxygène ?<br>`physique-oxygene-protons` | 8 protons (pas 1) | 2 | [Référence](https://periodic-table.rsc.org/element/8/oxygen) · [Recoupement](https://pubchem.ncbi.nlm.nih.gov/element/O) |
| Quel est l’âge du Soleil ?<br>`astro-age-soleil` | 4600000000 ans (pas 100000000) | 2 | [Référence](https://science.nasa.gov/sun/facts/) · [Recoupement](https://en.wikipedia.org/wiki/Sun) |

## Vérifications

- Contrôle du stock combiné : 150 fiches, 150 identifiants distincts, 66 ajouts, format et statut conformes.
- Chaque nouvelle fiche possède difficulté justifiée, thème, tags, source, recoupement, source d’idée et six leurres dont au moins trois pièges.
- Contrôle des arrondis : la valeur source arrondie au pas donne la valeur à retenir.
- `npm run verifier` : aucune erreur bloquante sur les 150 fiches ; huit avertissements préexistants, quatre réserves de petits entiers et l’arrondi historique signalés ci-dessus.
- `npm test` : 23 tests passent, dont sept régressions sur les petites réponses.
- `npm run check` : aucune erreur ; neuf avertissements préexistants dans les mécaniques.
- `npm run build` : réussi.
- 5940 tirages sur les 66 ajouts (30 graines × 3 exigences) : cinq choix positifs distincts, bonne réponse conservée, pas respecté.

## Suite

Hugo relit les valeurs, périmètres, ancrages, difficultés et pièges avant toute validation. La PR ajoute uniquement les fiches de ce lot ; chaque branche part de `main`, les fichiers de lots et rapports sont distincts pour permettre les trois fusions sans empilement. #10 reste ouverte tant que les 150 fiches ne sont pas validées et fusionnées.
