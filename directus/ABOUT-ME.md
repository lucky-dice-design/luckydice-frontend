# About me bearbeiten

Die neue Seite nutzt weiterhin `pages`, Datensatz `slug = about`. Die zusätzlichen
Felder beginnen mit `sheet_` und sind in sechs aufklappbare Gruppen gegliedert.
Das bestehende Backend erlaubt diese Collection bereits, und `sync-content.mjs`
exportiert die zusätzlichen Seitenfelder ohne Anpassung mit. Es ist keine neue
öffentliche Collection und kein Token im Browser nötig.

## Einrichtung über das bestehende Docker-Deployment

Die About-Erweiterung wird im Repository `luckydice-backend` in das bestehende
`setup.mjs` integriert. Diese Backend-Änderung muss zuerst gemergt und erfolgreich
deployt sein. Der normale Backend-Deploymentlauf führt die Einrichtung bereits
im Container `luckydice-cms` aus. Er verwendet die vorhandenen Zugangsdaten aus
der Container-Umgebung und ergänzt die Felder, Repeater, Profilbild-Relation,
fehlenden Startwerte und eingeschränkten Website-Leserechte automatisch.

Auf dem VPS ist dafür **keine Node.js-Installation auf dem Host**, kein neuer
Admin-Token und kein Directus-Neubau nötig. Es werden keine Docker-Imageversionen
oder privilegierten Deployment-Einstiegspunkte geändert. Die Gateway-Freigabe
der neuen About-Felder wird mit demselben Backend-Release aktualisiert.

Nach dem erfolgreichen Backend-Deployment: Directus neu laden und unter
**Seiten & Rechtstexte → about** die beschrifteten About-Gruppen öffnen.

## Alternative: direkte Einrichtung vom Entwicklungsrechner

Die folgenden Befehle gelten für einen Entwicklungsrechner mit Node.js 22 und
einem vollständigen Frontend-Checkout. Sie sind **keine Befehle für das
Home-Verzeichnis des VPS**; der Frontend-Deploy veröffentlicht dort nur `dist/`.
Der automatische Backend-Weg oben benötigt dieses zusätzliche Skript nicht.

Im Frontend-Projekt mit Node.js 22 ausführen. Zuerst der lokale Plan ohne Änderungen:

```powershell
node directus/setup-about.mjs
```

Anschließend `DIRECTUS_URL` (vollständige URL deiner bestehenden Directus-Instanz)
und `DIRECTUS_ADMIN_TOKEN` als Umgebungsvariablen in der ausführenden Shell setzen.
Einen vorhandenen Administrator-Token lokal verwenden, nicht ins Repository oder
in den Chat schreiben. Danach:

```powershell
node directus/setup-about.mjs --apply
```

Das Skript ergänzt fehlende Felder und die Profilbild-Relation und erweitert die
bestehende eingeschränkte Policy `Lucky Website` um die neuen Seitenfelder.
Der vorhandene Veröffentlichungsfilter bleibt erhalten. Für Bilder ergänzt es
gezielt den Zugriff auf unterstützte Bilddateien, die dem veröffentlichten
`about`-Datensatz zugewiesen sind; bestehende Screenshot-Regeln bleiben bestehen.
Es ergänzt nur leere (`null`) oder fehlende Startwerte und überschreibt keine
vorhandenen Texte, Bilder oder bewusst geleerten Listen. Es lässt sich nach einem
Abbruch erneut ausführen. Vor produktiven Schemaänderungen das übliche
Datenbank-Backup erstellen.

Die Migration nutzt dieselben Felder wie die ergänzte Directus-12-Konfiguration
im Schwesterprojekt `luckydice-backend`. Die Live-Instanz wurde aus dieser
Arbeitsumgebung nicht direkt verändert. Das ergänzte Backend-Setup erhält auch
bei späteren Deployments die benötigten Feld- und Bildberechtigungen.

## Redaktion

1. Directus → Seiten & Rechtstexte → `about` öffnen.
2. **About me · Kopfbereich & Profilbild**: Überschrift, Einleitung,
   Charaktereinträge und Bild bearbeiten. Bei **Profilbild** eine Datei hochladen
   oder aus der Mediathek auswählen. JPEG, PNG, WebP und AVIF werden vom bestehenden
   Website-Proxy unterstützt. Bildbeschreibung und Bildunterschrift ergänzen.
3. **Würfel & Einblicke**: Button und Hinweistexte ändern. Unter
   **Würfelergebnisse (1–20)** Zahlenbereiche, Titel, Texte und Zielbereich
   bearbeiten. Einzelwerte erhalten denselben Von-/Bis-Wert. Die Vorgaben sind
   1 (Patzer), 2–5, 6–10, 11–15, 16–19 und 20 (kritischer Erfolg).
   Beim Eintrag für 20 den **Bonus-Inhalt** pflegen; die Bonus-Überschrift hat ein
   eigenes Feld. Der Bonus wird aufgeklappt und bleibt bis zum Neuladen erhalten.
   Spezifische Bereiche haben Vorrang vor breiteren, fehlende oder ungültige
   Bereiche nutzen die integrierten Vorgaben. Eine bewusst leere Ergebnisliste
   deaktiviert den Button. Alle Zahlen haben dieselbe Chance; Wiederholungen sind
   möglich. **Einblicke für den Entdeckungswurf** steuert weiterhin den Einblick
   vor dem ersten Wurf; nach dem Wurf gelten die Zahlenergebnisse.
4. **Fähigkeiten, Inventar & Arbeitsweise**: Einträge direkt im Repeater bearbeiten,
   hinzufügen, entfernen und sortieren. Fähigkeiten haben zusätzlich ein Linkziel.
5. **Nebenquests**: Abschnittstitel, Einleitung und Linktext für das Öffnen der
   Karten ändern. Unter **Nebenquests: Karten & Geschichten** Titel, Kurzbeschreibung,
   Geschichte, Symbol und optionalen Link pflegen. Die vier Startkarten sind
   Pen & Paper, Rennrad, Snowboardlehrer und Gaming. Die Ammersee Wadler sind
   bei Rennrad erwähnt; das Linkziel bleibt bis zur neuen Website leer. Ein
   leerer Link wird nicht ausgegeben. In der Gaming-Karte ist Twitch aktiviert.
   Den Kanalnamen ohne URL unter **Twitch: Kanalname** eintragen (`mrjokytv`).
   Andere Karten können Twitch ebenfalls über ihren Schalter anzeigen.
6. **Kontakt** und **Navigation & Bedienelemente**: Auch CTA, Linktexte,
   Farbschema-Schalter und barrierefreie Beschreibungen sind bearbeitbar.

Das frühere Questlog mit Projekt- und Prozess-Tabs ist entfernt. Alte Questlog-
Textfelder bleiben zur Datenerhaltung bestehen und werden vom Einrichtungsskript
im Editor ausgeblendet. Bestehende Würfel-Ziele `quests` führen jetzt zu den
Nebenquests. Der technische Feldname der Karten bleibt `sheet_personal`;
vorhandene persönliche Einträge bleiben erhalten. Die Navigation kommt aus
`navigation_items`, allgemeine Footertexte,
Mail und Instagram aus `site_settings`. Seitentitel und Suchbeschreibung nutzen
die vorhandenen Felder `meta_title` und `meta_description` im `about`-Datensatz.
`pages.title`, `pages.text` und `about_facts` werden auf der neuen Seite nicht mehr
verwendet; stattdessen die entsprechend beschrifteten `sheet_`-Felder bearbeiten.

Gespeicherte Änderungen werden beim Neuladen der Seite abgefragt. Der bestehende
CMS-Export übernimmt die Felder auch für den statischen Ausfall-Fallback. Ohne
CMS-Verbindung zeigen sich die integrierten Beispielinhalte. Ohne Profilbild oder
bei einem Bildfehler erscheint ein neutraler Platzhalter. Ohne WebGL oder bei
nicht erreichbarem Three.js bleibt der Entdeckungswurf per Button nutzbar.

### Twitch

Die Gaming-Karte zeigt einen direkten Kanallink. Auf einer HTTPS-Seite mit genug
Platz kann der Besucher zusätzlich **Twitch-Player laden** wählen. Vorher gibt
es keine Player-Anfrage an Twitch. Der Stream wird in voller Abschnittsbreite
mit dem aktuellen Host als `parent` und ohne Autoplay geladen. Auf kleinen
Bildschirmen und in der lokalen HTTP-Vorschau bleibt der Kanallink verfügbar.
Der Player benötigt mindestens 400 × 300 Pixel und HTTPS, siehe die
[offiziellen Twitch-Vorgaben](https://dev.twitch.tv/docs/embed/video-and-clips/).

## Technische Referenz

Felddefinitionen und Repeater: `directus/about-schema.mjs`. Offizielle Directus-
Referenzen: [Felder](https://docs.directus.io/reference/system/fields),
[Repeater](https://github.com/directus/docs/blob/main/content/guides/01.data-model/3.interfaces.md).
