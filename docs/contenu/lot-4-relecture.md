# Lot 4 — production du contenu v1 (#10)

Rédigé le 8 novembre 2026. **Toutes les nouvelles fiches sont en brouillon** ; seule la relecture de Hugo permet le passage en `valide` (ADR 0006). Aucune nouvelle fiche n’est validée automatiquement. Les 84 fiches précédentes sont conservées à l’identique.

## Bilan

- Volume : **25 nouvelles fiches**.
- Difficultés du lot (crans 1 / 2 / 3 / 4) : **4 / 16 / 5 / 0**.
- Stock après fusion des lots 3 à 4 : **134 fiches**, dont 31 / 60 / 29 / 14 par cran.
- Thèmes du lot : Nature et climat (3), Sport et jeux (2), Arts et culture (2), Nombres et mesures (2), Corps humain (1), Animaux (2), Géographie (3), Terre et géologie (2), Physique et chimie (3), Astronomie (2), Constructions et transports (2), Histoire (1).

## Méthode et sources

Sujets issus de la culture générale, des programmes scolaires et des axes validés dans #36 et #38. La source d’idée est notée dans chaque fiche. Recherche effectuée auprès des organismes et institutions cités : organismes météo, musées, fédérations sportives, administrations, universités et organismes scientifiques. La consultation combine pages et extraits indexés ; certains sites empêchent l’ouverture directe mais leurs résultats indexés et les recoupements confirment les nombres. Les deux références de chaque fiche figurent ci-dessous pour faciliter la relecture.

Les notes de pièges distinguent les grandeurs réellement publiées des calculs dérivés ou des hypothèses de confusion (unité, périmètre, comptage). Le type `erreur_frequente` désigne ici un mécanisme proposé de confusion : aucune fréquence d’erreur des joueurs n’a été mesurée. Les valeurs proches sont des propositions inventées, sans être présentées comme des mesures scientifiques.

## Points à relire

- `animaux-pieuvre-coeurs` et `physique-eau-atomes` : même contrainte arithmétique pour la réponse 3 ; deux leurres éloignés sont documentés.
- Période lunaire sidérale : 27,321661 jours convertis en 655,72 heures, soit 656 h à retenir. Le cycle des phases, différent, sert de piège. La précision à l’heure près motive le cran curieux.
- Tennis : 23,77 m sont exprimés en 2377 cm afin de garder une réponse entière sans perdre la précision réglementaire.
- Pays : provinces canadiennes, États australiens et brésiliens sont distingués des territoires ou du District fédéral.
- Fusionner le lot 3 avant de tester ces fiches dans le jeu : il contient le correctif des cinq propositions pour les petites réponses. Les branches ne sont pas empilées.

## Inventaire et références

| Fiche | Valeur à retenir | Cran | Source et recoupement |
|---|---|---:|---|
| Combien de catégories compte l’échelle de Saffir-Simpson des ouragans ?<br>`nature-saffir-simpson-categories` | 5 catégories (pas 1) | 2 | [Référence](https://www.nhc.noaa.gov/aboutsshws.php) · [Recoupement](https://www.weather.gov.hk/en/education/tropical-cyclone/classification-naming-characteristics/00445-typhoon-and-hurricane.html) |
| À partir de quelle vitesse de vent soutenu un cyclone est-il classé comme ouragan par le NHC ?<br>`nature-ouragan-seuil-vent` | 119 km/h (pas 1) | 2 | [Référence](https://www.nhc.noaa.gov/aboutgloss.shtml) · [Recoupement](https://www.weather.gov.hk/en/education/tropical-cyclone/classification-naming-characteristics/00445-typhoon-and-hurricane.html) |
| Sous quelle distance de visibilité parle-t-on de brouillard en météorologie ?<br>`nature-brouillard-visibilite` | 1000 m (pas 1) | 2 | [Référence](https://weather.metoffice.gov.uk/learn-about/weather/types-of-weather/fog) · [Recoupement](https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/aviation/aviation-hazards-low-visibility-and-low-cloud) |
| Combien de joueurs une équipe complète de handball peut-elle avoir sur le terrain ?<br>`sport-handball-joueurs` | 7 joueurs (pas 1) | 1 | [Référence](https://www.federhandball.it/wp-content/uploads/2025/07/Regolamento-tecnico-di-giuoco-2025-inglese.pdf) · [Recoupement](https://en.wikipedia.org/wiki/Handball) |
| Quelle est la longueur réglementaire d’un court de tennis ?<br>`sport-tennis-longueur-court` | 2377 cm (pas 1) | 3 | [Référence](https://www.itftennis.com/en/about-us/organisation/tennis-glossary/) · [Recoupement](https://m.itftennis.com/media/7221/2025-rules-of-tennis-english.pdf) |
| Combien de lettres compte l’alphabet français actuel ?<br>`arts-alphabet-francais-lettres` | 26 lettres (pas 1) | 1 | [Référence](https://www.dictionnaire-academie.fr/article/A9Z0001) · [Recoupement](https://salleovale.bnf.fr/fr/selections-thematiques/alphabart-les-lettres-cachees-dans-lart-anne-guery-olivier-dussutour) |
| En combien de chants l’Iliade est-elle traditionnellement divisée ?<br>`arts-iliade-chants` | 24 chants (pas 1) | 3 | [Référence](https://multimedia-ext.bnf.fr/pdf/Homere1.pdf) · [Recoupement](https://catalogue.bnf.fr/ark%3A/12148/cb476289845) |
| Combien de mètres contient un kilomètre ?<br>`nombres-kilometre-metres` | 1000 m (pas 1) | 1 | [Référence](https://www.nist.gov/pml/owm/metric-si-prefixes) · [Recoupement](https://www.nist.gov/pml/owm/writing-si-metric-system-units) |
| Combien de centimètres cubes contient un litre ?<br>`nombres-litre-centimetres-cubes` | 1000 cm³ (pas 1) | 2 | [Référence](https://www.nist.gov/pml/owm/si-units-volume) · [Recoupement](https://www.legislation.gov.uk/ukpga/1985/72/schedule/1/2023-05-03/data.xht) |
| Combien de groupes distingue le système sanguin ABO ?<br>`corps-groupes-sanguins-abo` | 4 groupes (pas 1) | 2 | [Référence](https://www.blood.co.uk/why-give-blood/blood-types/) · [Recoupement](https://www.nhs.uk/tests-and-treatments/blood-groups/) |
| Combien de cœurs possède une pieuvre ?<br>`animaux-pieuvre-coeurs` | 3 cœurs (pas 1) | 2 | [Référence](https://www.nhm.ac.uk/discover/octopuses-keep-surprising-us-here-are-eight-examples-how.html) · [Recoupement](https://www.sheddaquarium.org/stories/eight-strange-and-wonderful-facts-about-octopuses) |
| Combien d’ailes possède normalement un papillon adulte ?<br>`animaux-papillon-ailes` | 4 ailes (pas 1) | 1 | [Référence](https://gardens.si.edu/learn/for-educators/cultivating-habitat/butterfly-gardening/about-butterflies/) · [Recoupement](https://australian.museum/learn/species-identification/ask-an-expert/what-do-butterflies-moths-and-skippers-look-like/) |
| Combien de régions compte l’Italie ?<br>`geo-italie-regions` | 20 régions (pas 1) | 2 | [Référence](https://www.ice.it/en/invest/regions) · [Recoupement](https://www.senato.it/node/228/printable/print) |
| Combien d’États fédérés compte l’Australie ?<br>`geo-australie-etats` | 6 États (pas 1) | 2 | [Référence](https://peo.gov.au/understand-our-parliament/how-parliament-works/three-levels-of-government/three-levels-of-government-governing-australia) · [Recoupement](https://www.australia.com/en-us/facts-and-planning/about-australia/cities-states-and-territories.html) |
| Combien d’États fédérés compte le Brésil ?<br>`geo-bresil-etats` | 26 États (pas 1) | 2 | [Référence](https://educa.ibge.gov.br/jovens/conheca-o-brasil/territorio/19637-divisao-territorial.html) · [Recoupement](https://www.ibge.gov.br/geociencias/todos-os-produtos-geociencias/15816-politico.html) |
| Quelle est la dureté de référence du quartz sur l’échelle de Mohs ?<br>`terre-mohs-quartz` | 7 sur Mohs (pas 1) | 3 | [Référence](https://www.nps.gov/articles/mohs-hardness-scale.htm) · [Recoupement](https://pubs.usgs.gov/gip/gemstones/mineral.html) |
| À quelle profondeur commence le noyau terrestre ?<br>`terre-profondeur-noyau` | 2900 km (pas 100) | 2 | [Référence](https://www.bgs.ac.uk/discovering-geology/earth-hazards/earthquakes/what-causes-earthquakes/) · [Recoupement](https://www.geolsoc.org.uk/Plate-Tectonics/Chap2-What-is-a-Plate/Chemical-composition-crust-and-mantle.html) |
| Combien d’atomes contient une molécule d’eau ?<br>`physique-eau-atomes` | 3 atomes (pas 1) | 2 | [Référence](https://science.nasa.gov/astrobiology/learning-resources/alp/water-so-important-for-life/) · [Recoupement](https://www.esa.int/ESA_Multimedia/Images/2009/10/Molecule_of_water) |
| Quelle est la tension nominale d’une prise domestique monophasée en France ?<br>`physique-tension-domestique` | 230 V (pas 1) | 2 | [Référence](https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000021896673) · [Recoupement](https://fr.electrical-installation.org/frwiki/D%C3%A9finition_des_plages_de_tension) |
| Quelle est la fréquence nominale du réseau électrique en France métropolitaine ?<br>`physique-frequence-reseau` | 50 Hz (pas 1) | 2 | [Référence](https://www.rte-france.com/bases-electricite/systeme-electrique/frequence-electrique-indicateur-equilibre-reseau) · [Recoupement](https://www.enedis.fr/faq/prevention-du-risque-electrique/comment-se-fait-lequilibre-du-reseau-electrique) |
| Combien de temps la Lune met-elle pour faire le tour de la Terre par rapport aux étoiles ?<br>`astro-lune-periode-siderale` | 656 h (pas 1) | 3 | [Référence](https://science.nasa.gov/moon/top-moon-questions/) · [Recoupement](https://en.wikipedia.org/wiki/Moon) |
| Combien d’astronautes ont marché sur la Lune pendant le programme Apollo ?<br>`astro-apollo-marcheurs` | 12 astronautes (pas 1) | 2 | [Référence](https://www.nasa.gov/learning-resources/for-kids-and-students/what-was-the-apollo-program-grades-5-8/) · [Recoupement](https://www.esa.int/ESA_Multimedia/Images/2021/09/Ten_things_you_did_not_know_about_the_Moon_1._Moonwalkers) |
| Quelle est la hauteur maximale du viaduc de Millau ?<br>`construction-millau-hauteur` | 343 m (pas 1) | 2 | [Référence](https://www.leviaducdemillau.com/sites/viaducdemillau/accueil-viaduc-de-millau/le-viaduc/les-chiffres-cles.html) · [Recoupement](https://www.explore-millau.com/les-incontournables/viaduc-de-millau/comprendre-le-viaduc-de-millau/construction-et-chiffres-cles-du-viaduc-de-millau/) |
| Quel est l’écartement standard entre les deux rails d’une voie ferrée ?<br>`transport-rail-ecartement-standard` | 1435 mm (pas 1) | 3 | [Référence](https://www.sncf-reseau.com/medias-publics/2023-12/ig02053_etude_d_impacts_v2.pdf) · [Recoupement](https://www.sncf-reseau.com/medias-publics/2024-02/version_comparee_drr_2021_v2_et_v3_0.pdf) |
| Combien de colonies britanniques sont à l’origine des États-Unis ?<br>`histoire-colonies-americaines` | 13 colonies (pas 1) | 2 | [Référence](https://wwws.loc.gov/exhibits/mapping-a-growing-nation/overview.html) · [Recoupement](https://bensguide.gpo.gov/j-american-flag) |

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
