# ReviewFlow — conceptreacties op reviews (fase 1)

Dit stukje zorgt ervoor dat Claude een conceptreactie op een Google-review
schrijft, en die naar jou mailt ter controle. **Er wordt nooit iets automatisch
op Google gepubliceerd** — jij plakt de reactie er pas op nadat je 'm hebt
gelezen en eventueel aangepast.

Je gebruikt dit via een formulier op GitHub, niet via je computer of een
terminal.

## Eenmalig instellen (dit hoef je maar één keer te doen)

### 1. Een Anthropic-sleutel aanmaken

Anthropic is het bedrijf achter Claude, het AI-model dat de conceptreacties
schrijft.

1. Ga naar [console.anthropic.com](https://console.anthropic.com) en maak een
   account aan.
2. Zorg dat er een betaalmethode aan je account is gekoppeld (het gebruik kost
   vrijwel niets — enkele dollarcenten per review, zie de kosten-inschatting in
   het automatiseringsplan).
3. Ga naar **API Keys** en maak een nieuwe sleutel aan. Kopieer deze meteen —
   je kunt hem later niet meer terugzien.

### 2. Een Gmail app-wachtwoord aanmaken

Dit is een apart wachtwoord, alleen voor dit systeem — niet je gewone
Gmail-wachtwoord.

1. Zorg dat "2-staps­verificatie" aan staat op je Google-account
   (myaccount.google.com → Beveiliging).
2. Ga naar [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Maak een nieuw app-wachtwoord aan (geef het bijvoorbeeld de naam
   "ReviewFlow"). Kopieer de 16 tekens die je te zien krijgt.

### 3. De sleutels veilig opslaan in GitHub

Deze "Secrets" zijn versleuteld en nooit zichtbaar in de code, ook niet als de
repository openbaar is.

1. Ga in deze repository naar **Settings → Secrets and variables → Actions**.
2. Klik op **New repository secret** en maak deze vier aan:

   | Naam | Waarde |
   |---|---|
   | `ANTHROPIC_API_KEY` | de sleutel uit stap 1 |
   | `GMAIL_USER` | het Gmail-adres waarvandaan gemaild wordt |
   | `GMAIL_APP_PASSWORD` | het app-wachtwoord uit stap 2 |
   | `APPROVER_EMAIL` | het e-mailadres waar jij de conceptmail wilt ontvangen (mag hetzelfde adres zijn) |

Dat was het eenmalige werk — dit hoef je nooit meer te doen, ook niet bij een
volgende review.

## Gebruiken (voor elke review die je wilt laten beantwoorden)

1. Ga naar het tabblad **Actions** bovenaan de repository.
2. Kies in de lijst links **"ReviewFlow — conceptreactie maken"**.
3. Klik rechts op de knop **"Run workflow"**.
4. Vul het formulier in: klant, naam van de reviewer, aantal sterren, en plak
   de volledige reviewtekst.
5. Klik nogmaals op **"Run workflow"** om te starten.
6. Wacht ongeveer 30–60 seconden en check je mail — daar staat het concept
   klaar om te controleren en (als je akkoord bent) zelf op Google te plaatsen.

## Een nieuwe klant toevoegen

Op dit moment staat alleen "AMI Kappers Middelharnis" in het systeem. Om een
klant toe te voegen, passen we samen (in een volgende sessie) twee dingen aan:
een nieuw blokje in `config/clients.json` (schrijfstijl, bedrijfsinfo,
afsluitzin) en een extra regel in het formulier
(`.github/workflows/reviewflow.yml`). Dat hoef je niet zelf te doen.

## Waarom dit nog niet "vanzelf 2x per dag" gaat

Deze eerste versie vraagt jou om zelf op de knop te drukken per review, in
plaats van dat het systeem reviews zelf ophaalt. Dat is een bewuste,
tijdelijke keuze — zie het automatiseringsplan voor de uitleg waarom, en voor
de vervolgstappen (Google Sheets, en later automatisch ophalen) die dit
uiteindelijk wél volledig automatisch maken.
