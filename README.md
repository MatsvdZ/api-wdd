# Link to live site
https://api-wdd.onrender.com/

# Welkom bij het vak API!
Welkom bij mijn wiki voor het vak API van de minor Web Design & Development. In deze wiki komt al mijn documentatie te staan van dit vak.


# Concept 1
Mijn idee voor een concept is eigenlijk niet heel ingewikkeld, maar wel iets wat mij grappig, en ook best nuttig lijkt om te maken. Ik wil graag als het ware een spinning wheel maken met verschillende categorieën voor activiteiten. Het wiel draait dan rond en komt op een van de categorieën van de bored API. Deze API zorgt er dan voor dat je een passende activiteit krijgt bij de categorie die je hebt gedraaid. Ik wil hier ook eigenlijk nog een soort filter lijst bij maken zodat je zelf wel een beetje kunt customizen wat je wel zou willen, en wat niet. Dit biedt de bored API namelijk ook aan. Ook wil ik iets van een storage toevoegen waardoor je voorgaande activiteiten terug kan vinden.

## Hoe kan mijn site werken?
- Overzichtspagina: Het draaiwiel met de categorieën

- Gebruiker stelt voorkeuren in en klikt op 'spin'

- Het wiel draait en kiest een categorie, zoals: 
   - Education
   - Recreational
   - Social
   - DIY
   - Charity
   - Cooking
   - Relaxation
   - Music
   - Busywork

- Daarna een fetch naar de Bored API voor een activiteit in die categorie
- Een detailpagine die de gekozen challenge toont inclusief info

## Welke web API's worden er dan gebruikt?
Fetch API / Bored API -> Activiteiten ophalen
Canvas API -> Draaiende wiel tekenen en draaien
LocalStorage API -> Laatste challenges bewaren


# Eerste checkout (01-04)
## Wat heb ik vandaag gedaan?
Vandaag zijn we begonnen met een presentatie over het vak en een korte workshop over Astro. Ik heb vandaag dus ook meteen mijn Astro project aangemaakt en al een klein beetje geoefend met het fetchen van API's. 

Na het opzetten van Astro ben ik begonnen met het bedenken van een idee. Na heel wat concepten te hebben bedacht ben ik eigenlijk uitgekomen op een soort anti-boredom generator. Hier staat meer over uitgelegd onder het kopje 'Het concept.'

Na het bedenken van mijn concept heb ik geprobeerd om alvast een deel van de data in te laden via Astro, en dat is al gelukt.


## Hoe lang duurde het?
Ik heb vandaag zo'n 4 uurtjes echt gewerkt aan mijn project. Dit was voor zowel het bedenken van mijn idee, als het fetchen van de data.


## Wat heb ik geleerd?
Ik heb geleerd wat Astro is en hoe dit ongeveer in elkaar zit. Ook heb ik weer even een kleine refresh gehad over het fetchen van API's.


## Wat ga ik morgen doen?
Ik heb morgen de feedback gesprekken waarin ik te horen krijg of mijn idee wordt goedgekeurd of niet. Daarna ga ik verder met wat er dan wordt besproken in het gesprek.


# Feedback gesprek (02-04)
Ik heb vandaag een feedback gesprek gehad samen met Cyd, en dit kwam uit dat gesprek:

- Het rad zelf draaien door scroll oid
- Het tekenen in canvas 
- gsap draggable, hier zit inersia in
- Ook alvast nadenken over uitbreidingsmogelijkheden voor als ik eerder klaar ben

Hier ga ik dan volgende week mee aan de slag



## Voortgang week 1 (02-04)
Ik heb deze week het begin gemaakt aan het vak API. We hebben een eerste idee bedacht en al een klein beetje geoefend met het fetchen van een API. Voor mijn eerste idee moest ik onderzoek doen naar verschillende API's die ik zou willen gebruiken. Dit staat allemaal bij het kopje [Concept 1](#concept-1) 


### Volgende week
Volgende week ga ik kijken of ik iets anders kan verzinnen voor een idee en hier natuurlijk ook een begin aan maken.


# Concept 2
Ik heb met Cyd gezeten en heb samen met haar een nieuw concept bedacht. In ga aan de hand van de Solar System OpenData API een solar system maken met Canvas. De API levert per hemellichaam fysieke en baan-data, waaronder onder meer isPlanet, semimajorAxis, meanRadius, gravity, sideralOrbit, moons en aroundPlanet. Daarmee kan ik een zonnestelsel tekenen en er een detailpagina / infopanel aan te koppelen.

Ik kan niet alles 1-op-1 op schaal kunnen tekenen. De afstanden in de API zijn groot en de radius ook, dus ik moet ze visueel gaan schalen. In de API wordt ook aangegeven dat waarden zoals semimajorAxis, perihelion en aphelion heel groot zijn.

## Aanpak
Ik ga dus het volgende doen:
- API gebruiken voor de echte data (Solar System OpenData API)
- Een gestileerde versie van het zonnestelsel tekenen
- Afstanden en groottes apart schalen
- Banen animeren

Ik wil het op deze manier in elkaar zetten:
- Canvas met de zon in het midden van het scherm (Canvas API)
- Planeten als cirkels op banen
- Klik op een planeet voor meer details
- Planeet locaties onthouden (LocalStorage API)

op de detailpagina komt dan te staan:
- Naam
- Radius
- Zwaartekracht
- Aantal manen
- Omlooptijd
- Eventueel als er tijd is afbeeldingen of extra content uit een tweede API?


# Tweede checkout (08-04)
## Wat heb ik vandaag gedaan?
We begonnen vandaag met een lange workshop over Astro, waar we hebben geleerd wat we precies kunnen doen met components ect.

Ik heb vandaag een drastische verandering gemaakt. Ik heb namelijk een compleet ander concept bedacht. Ik ga nu een zonnestelsel maken in canvas en API data gebruiken hiervoor. Dit staat verder omschreven bij het kopje [Concept 2.0](#concept-2).

Daarna ben ik meteen aan de slag gegaan met het fetchen van de data en dit een beetje ordenen zodat ik straks stap voor stap aan de slag kan gaan met het maken van mijn stelsel.

Na het fetchen van de data heb ik een soort opzet gemaakt met mijn canvas en dit samen met een camera gemaakt dat ik als het ware door het zonnestelsel heen kan zweven. 

<img width="621" height="214" alt="Screenshot 2026-04-08 at 16 15 54" src="https://github.com/user-attachments/assets/675a4c8a-8ccb-4848-b0b4-a4bcad3bbafa" />

<img width="678" height="786" alt="Screenshot 2026-04-08 at 16 16 21" src="https://github.com/user-attachments/assets/dd0804a3-1dbd-4ec4-92ed-b062648b272d" />

<img width="1728" height="959" alt="Screenshot 2026-04-08 at 16 17 13" src="https://github.com/user-attachments/assets/5d4a3e5c-5b13-4bcb-83be-d74c36e54b68" />

De planeten staan niet op de juiste plek, maar de namen komen wel uit de API :)


## Hoe lang duurde het?
Ik heb vandaag zo'n 3 uur aan mijn website gezeten.De rest van de tijd was de wordkshop en pauze.

## Wat heb ik geleerd?
Ik heb een basis van canvas gebruikt en dit ook deels gecombineerd met een camera, dit is ook de eerste keer dat ik dit gebruik.

Verder heb ik dus meer geleerd over hoe Astro werkt. Ik ben al deels bekend met het gebruiken van componenten, dus het was niet volledig nieuw voor mij.

## Wat ga ik morgen doen?
Verder met mijn idee uitwerken in canvas, en het toevoegen van API data om zo ook juiste groottes en afstanden te krijgen.


# Derde checkout (09-04)
## Wat heb ik vandaag gedaan?
Ik heb vandaag een aantal dingen gefixt. Ik heb het nu voor elkaar gekregen dat de planeten om de zon heen draaien, met de orbitTime die ik uit de API haal. Zo is de snelheid tussen de planeten onderling altijd juist.

Daarnaast heb ik ook de juiste radius uit de API kunnen halen voor de groottes van de planeten. Hier heb ik wel een eigen scaling aan toe gepast zodat deze niet HEEL groot zijn ineens. Maar elke planeet wordt op dezelfde manier berekend, waardoor het relatief gezien dus wel overeen komt met de echte data.

Ik heb vandaag ook de workshop van Jad gevolgd over localStorage en heb dit daarna ook meteen toegepast bij mijn project. Ik heb er voor gezorgd dat de positie van de planeten bewaard wordt wanneer je de pagina refreshed of verlaat. Dus dan kunnen de planeten vanaf hun laatste opgeslagen plek weer verder met hun rondje om de zon.

<img width="727" height="182" alt="Screenshot 2026-04-09 at 14 02 56" src="https://github.com/user-attachments/assets/1528a0f7-55be-4834-9cb1-627d36909229" />

<img width="702" height="241" alt="Screenshot 2026-04-09 at 14 03 38" src="https://github.com/user-attachments/assets/4cf9dbbc-fff2-4e7c-9b22-6a67c38116f1" />

Ik heb vandaag ook ervoor gezorgd dat je nu makkelijk kun in- en uitzoomen met je scrollwheel, waardoor navigatie iets makkelijker wordt door het zonnestelsel.

<img width="917" height="882" alt="Screenshot 2026-04-09 at 14 12 26" src="https://github.com/user-attachments/assets/f2255d1b-4646-4466-ab06-15081293825e" />

Om de dag mee te eindigen hadden we een weekly nerd van Johann Huijkman.


## Hoe lang duurde het?
Ik heb vandaag zeker zo'n 4 uur aan mijn project kunnen werken. De rest van de tijd was voor de workshop en voor pauze.

## Wat heb ik geleerd?
Ik heb geleerd hoe localStorage in elkaar zit en hoe ik dit ook voor sessions zou kunnen doen. Dit heb ik toe kunnen passen om de posities van mijn planeten te onthouden.

Verder heb ik geleerd hoe ik de planeten kan scalen, de afstand van de zon kan gebruiken en de orbit tijd kan gebruiken om zo kloppende data te gebruiken en deze aan te passen om het zo visueel kloppend te krijgen.

## Wat ga ik volgende keer doen?
Ik ga volgende keer aan de slag met het maken van de detail pagina. Ik ga het zo maken dat je op de planeten kan klikken en dat er dan een scherm komt met allemaal algemene data over de planeet. Daarna wil ik ook nog kijken of het me lukt om eventueel andere dingen toe te voegen zoals manen bij verschillende planeten.

# Feedback gesprek (10-04)
Ook vandaag hebben we weer een feedback gesprek gehad. Ik kreeg van Cyd twee grote punten aan feedback:

- Nu aan de slag met meer functionaliteit, zoals detailpagina
- Vormgeving kan ook wat spannender, bijvoorbeeld textures voor de planeten en eventueel animaties

Dit is dan ook precies waar ik volgende keer aan wil gaan werken, dus dat komt mooi uit!


# Vierde checkout (15-04)
Vandaag was er niet echt een checkout en heb ik niks kunnen doen aan API, omdat ik bij de Smashing conference was.


# Vijfde checkout (16-04)
## Wat heb ik vandaag gedaan?
Ik heb vandaag gewerkt aan het geven van textures aan de planeten. Daarnaast heb ik ervoor gezorgd dat je nu op een planeet kan klikken en dat je dan wordt herleid naar de detail pagina. Hiervan moet ik de styling nog doen, maar technisch werkt het wel al allemaal.

## Hoe lang duurde het?
Ik heb er vandaag zo'n 4 uurtjes aan kunnen zitten.

## Wat heb ik geleerd?
Ik heb geleerd hoe ik images kan gebruiken in combinatie met canvas. Ook heb ik nu geleerd hoe je dynamische pagina's maakt met astro.

## Wat ga ik volgende keer doen?
Ik ga volgende keer door met de styling van de detail pagina en als ik meer tijd heb verder met andere functies voor op de hoofdpagina zelf.


# Zesde checkout (22-04)
## Wat heb ik vandaag gedaan?
We begonnen vandaag met het online zetten van onze site op Render, dit ging alleen iets minder soepel dan dat ik had gehoopt, maar ik heb dit uiteindelijk gewoon kunnen fixen door te mijn code naar GitHub te pushen, waarna het wel werkte. 

Nadat ik dit dus eindelijk gefixt had, ging ik door met het maken van de detail pagina. Ik heb hier een redelijk algemene layout op toegepast en gezorgd dat alle data netjes getoond wordt.

Ik heb hierbij ook gewerkt met een baseLayout, en met componenten in Astro.

Na de detail pagina heb ik een slider gemaakt, die de snelheid van de planeten aanpast, waardoor je deze snel en langzaam kunt laten draaien.

## Hoe lang duurde het?
Ik heb er vandaag in totaal zo'n 5 uur aan gewerkt, waarvan ik zeker 1,5 uur kwijt was aan Render.

## Wat heb ik geleerd?
Ik heb in Astro geoefend met het gebruik van componenten en een baseLayout, hierdoor heb ik mijn code dus iets beter kunnen ordenen.

Ook heb ik weer geoefend met het maken van een slider die de value aanpast van mijn speed van mijn planeten.

## Wat ga ik volgende keer doen?
Ik ga volgende keer verder met het kijken of ik de detail pagina ook zou kunnen verwerken op de indexpagina, waardoor ik als het ware kan inzoomen op een planeet, en deze met een soepele animatie overgaat in een detailpagina.


# Zevende checkout (23-04)
## Wat heb ik vandaag gedaan?
Ik ben vandaag begonnen met de zon een texture en een glow geven.


<img width="647" height="731" alt="Screenshot 2026-04-23 at 11 41 31" src="https://github.com/user-attachments/assets/e0b72509-b123-438f-b755-0a1577833666" />

Ook heb ik vandaag de maan toegevoegd aan de aarde. Ik heb het voor nu gehouden bij alleen de aarde, omdat als ik alle manen probeer te tekenen begint de computer het helaas erg zwaar te hebben. Dus dit is voor nu even geen optie. 

<img width="615" height="310" alt="Screenshot 2026-04-23 at 15 58 00" src="https://github.com/user-attachments/assets/863f2fb4-91e1-4388-a4f1-a696e3a459c0" />

<img width="469" height="392" alt="Screenshot 2026-04-23 at 15 59 11" src="https://github.com/user-attachments/assets/0441a88f-b351-49d3-b7f0-746a49f22dfb" />

## Hoe lang duurde het?
Ik heb vandaag ongeveer zo'n 5 uur aan mijn project gewerkt, dit is wel inclusief een hele hoop troubleshooting voor het werkend krijgen van de maan.

## Wat heb ik geleerd?
Ik heb vandaag geleerd hoe ik met JS ook in mijn geval manen los op kan vragen bij de API en deze koppelen aan de juiste planeet. In dit geval is dit dus alleen nog de aarde samen met onze maan.

## Wat ga ik volgende keer doen?
Volgende keer heb ik het voortgang gesprek met Cyd. Hierin krijg ik te horen wat ik nog zou kunnen doen, omdat ik het gevoel heb dat ik nog wat mis.


# Feedback gesprek (24-04)
Vandaag had ik weer een feedback gesprek met Cyd. Na het laten zien van al mijn aanpassingen heb ik de volgende feedback gekregen wat ik nog kan verwerken in mijn site:

## Notes feedback
- View transitions werken anders in astro
- Inzoomen op planeet voor detailpagina
- 3D model voor planeet / layout grote planeet
- Hoe ver is planeet van zon in, Burj khalifa ect
- Gravity vergeleken met aarde
- Gradenmeter
- Kelvin uitschrijven / omrekenen naar celcius

Deze aanpassingen zou wel moeten lukken denk ik.

Verder ben ik na vandaag lekker naar huis gegaan en heb ik vakantie gevierd!

# De laatste loodjes
In de laatste paar dagen voor mijn gesprek heb ik nog de allerlaatste feedback verwerkt die ik heb gekregen, helaas heb ik niet alles kunnen doen vanwege tijdnood, maar ik heb mijn best gedaan.

Ik heb vooral gewerkt aan de detailpagina van de site.

## Axis tilt meter
Ik heb voor het aantal graden dat een planeet is gekanteld een visuele meter gemaakt. Deze laat dus de hoek van de as zien als een lijn binnen een cirkel. Dan zie je meteen hoe erg de as gedraaid is ten opzichte van rechtop.

<img width="236" height="274" alt="Screenshot 2026-05-05 at 01 15 30" src="https://github.com/user-attachments/assets/b50d67ed-4a27-4d65-99ca-b876da9cbff6" />

## Temperatuur meter
Ik heb nu de temperatuur niet alleen als getal, maar ook als balk visueel gemaakt. De temperatuur is nu ook omgerekend van Kelvin naar Celcius, en de temperatuur van de planeten wordt vergeleken met die van Aarde.

<img width="195" height="182" alt="Screenshot 2026-05-05 at 01 26 08" src="https://github.com/user-attachments/assets/87d20c65-6505-4d3a-bbae-6436583c7bb2" />

## Afstand tot zon in bekende objecten
Cyd wil zich graag de afstand beter voor kunnen stellen ten opzicht van de zon, dus daar heb ik voor gezorgd. Nu kun je van elke planeet de afstand tot de zon zien, in het aantal Eiffeltorens, Burj Khalifa's en ook Statues of liberty.

<img width="222" height="227" alt="Screenshot 2026-05-05 at 01 26 21" src="https://github.com/user-attachments/assets/028ef5fc-64bb-43a0-8e96-36be3f551f9b" />


## Gravity vergelijking
De zwaartekracht van elke planeet wordt nu vergeleken met die van de aarde. Ook staat hier nu bij of de zwaartekracht dan sterker of zwakker is, en keer hoeveel. Daarbij heb ik ook een vergelijking gemaakt door te berekenen hoe zwaar iemand is op die desbetreffende planeet. Daardoor kan je het nog net een beetje beter inschatten.

<img width="218" height="172" alt="Screenshot 2026-05-05 at 01 26 34" src="https://github.com/user-attachments/assets/9f3b3ba9-cc76-43d5-80b2-ce0f651d73c6" />

De toevoegingen zorgen er dus vooral voor dat het niet alleen cijfers zijn, maar dat alles ook iets beter te begrijpen is.

Daarnaast heb ik ook gewoon de algemene layout van de pagina veranderd, waardoor het nu iets cleaner is geworden.

<img width="1728" height="961" alt="Screenshot 2026-05-05 at 01 37 27" src="https://github.com/user-attachments/assets/5b550bd2-afb6-4dda-9bca-03e08deb9392" />

## Wat is helaas niet gelukt
Tijdens het maken was het de bedoeling om een soepele overgang te maken tussen het canvas en de detailpagina. Hierbij zou je dus op een planeet klikken en dan inzoomen op de planeet om zo naar de detail pagina te gaan. Helaas is dit mij niet gelukt ivm de tijd.



# Alles nog even kort samengevat
Voor het vak API heb ik dus een interactieve visualisatie van het zonnenstelsel ontwikkeld. Dit heb ik gedaan aan de hand van de data van de Solar System OpenData API. Hierbij heb ik ook de Canvas API, en de LocalStorage API gebruikt. 

In mijn zonnestelsel draaien planeten realistisch rond de zon op basis van echte data. Door middel van een camera en zoom, kan je over het hele canvas heen navigeren naar alle planeten.

Elke planeet heeft een detailpagina waarin aanvullende informatie staat. Hierin heb ik nu dus ook wat meer visuele elementen toegevoegd om de ervaring te verbeteren. 

Ik heb nu dus:
- een axis tilt meter om de helling van de planeet te weergeven
- een temperatuur meter die de temperatuur toont in celcius en vergeleken wordt met aarde
- de afstand tot de zon laten zien aan de hand van echte objecten, om zo de schaal beter over te laten komen
- een zwaartekracht vergelijking gemaakt, die ook je gewicht berekent op basis van de zwaartekracht op die specifieke planeet


# Reflectie
Tijdens dit project heb ik erg veel geleerd over het combineren van API-data met nieuwe, voor mij, technieken zoals de Canvas API en de LocalStorage API. 

In het begin was het even lastig om een leuk, maar ook uitdagen concept te bedenken, maar met een beetje hulp van Cyd kwam ik hier gelukkig na een eerst (wat saaier) idee op een leuk tweede idee. 

Eenmaal aan het begin van mijn project lag mijn focus heel erg op het technische gedeelte van mijn zonnestelsel. Denk dan aan het fetchen en werkend krijgen van de data op mijn canvas. Dit was in het begin nog helemaal nieuw, en iets waar ik dus even mee moest experimenteren. Naarmate het steeds beter ging, ging ik meer nadenken over hoe ik de data kan tonen en hoe ik dit interessant kan maken. Ook hier heb ik in de feedback gespreken stappen in gezet door goede ideeën van zowel klasgenoten als Cyd. 

Een belangrijk inzicht wat ik daar van heb gekregen, is dat echte ruwe data en cijfers (zoals kilometers en Kelvin) soms lastig te interpreteren is. Daarom heb ik ervoor gekozen om deze data meer visueel te maken door deze ook te vergelijken met dingen die je als mens zijnde al kent. Dit maakt het voor mensen een stuk interessanter en beter te begrijpen, want het zijn nogal grote en lastige getallen om je voor te stellen. Daarnaast is de functie van het opslaan van de posities van de planeten erg fijn en geeft net even dat beetje detail waar ik van hou.

Daarnaast heb ik ook in Astro leren werken. Hierin heb ik met componenten gewerkt waardoor mijn code net dat beetje overzichtelijker en wat beter gestructureerd is geworden. De eerste weken gebruikte ik nog geen componenten, maar dit heb ik later omgezet en dat werkte al beter.

Wat wel echt een stuk beter had gekund was de tijdsplanning. Ik wou eigenlijk nog een vloeiende animatie maken tussen mijn canvas en de detailpagina, maar hier had ik helaas niet genoeg tijd meer voor. Hier had ik eigenlijk al eerder mee moeten beginnen, maar helaas is het nu eenmaal wat het is. 

Ik ben dan ook nog steeds wel tevreden met mijn eindproduct. Ik heb nieuwe technische vaardigheden ontwikkeld maar ook geleerd om na te denken over hoe ik iets daadwerkelijk interessanter en begrijpelijker kan maken door de cijfers op een wat andere manier te tonen.


# Bronnen

https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API

https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes

https://api.le-systeme-solaire.net/en/

https://www.solarsystemscope.com/spacepedia/handbook/sun

https://gist.github.com/callumlocke/cc258a193839691f60dd

https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame

https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent

https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations#moving-the-canvas-camera

https://nl.dreamstime.com/royalty-vrije-stock-foto-s-de-close-up-van-de-zon-lava-image7888418

https://dev.to/ivanadokic/javascript-array-methods-filter-map-reduce-and-sort-32m5

https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth

https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event



