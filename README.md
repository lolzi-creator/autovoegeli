# Auto Vögeli - Car Dealership Website

Ein modernes, benutzerfreundliches Website für das Autohaus Auto Vögeli in der Schweiz. Entwickelt mit Next.js, TypeScript und Tailwind CSS.

## 🚗 Features

- **Modernes Design**: Saubere, professionelle Benutzeroberfläche basierend auf dem Auto Vögeli Logo
- **Responsive**: Optimiert für alle Geräte (Desktop, Tablet, Mobile)
- **Deutsche Lokalisierung**: Vollständig auf Deutsch für den Schweizer Markt
- **Fahrzeug-Galerie**: Ansprechende Darstellung der verfügbaren Fahrzeuge
- **Suchfunktion**: Einfache Fahrzeugsuche nach Marke, Preis, etc.
- **Kontaktformulare**: Anfragen und Probefahrt-Buchungen
- **AutoScout24 Integration**: Vorbereitet für die Integration mit AutoScout24

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Sprache**: TypeScript
- **Styling**: Tailwind CSS
- **Animationen**: Framer Motion
- **Icons**: Lucide React
- **Formulare**: React Hook Form

## 🎨 Design System

### Farben (basierend auf dem Auto Vögeli Logo)

- **Primary**: Grün (#8bc442) - Hauptfarbe aus dem Logo
- **Secondary**: Grau (#64748b) - Sekundärfarbe aus dem Logo
- **Accent**: Orange (#ed741e) - Akzentfarbe für Highlights

### Komponenten

- Header mit Navigation und Kontaktinformationen
- Hero-Bereich mit Schnellsuche
- Fahrzeug-Karten mit detaillierten Informationen
- Footer mit Kontaktdaten und Links

## 🚀 Getting Started

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn

### Installation

1. Repository klonen:
```bash
git clone [repository-url]
cd autovoegeli
```

2. Dependencies installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
npm run dev
```

4. Website öffnen: [http://localhost:3000](http://localhost:3000)

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # Homepage
│   └── globals.css        # Globale Styles
├── components/            # React Komponenten
│   ├── Header.tsx         # Website Header
│   ├── Hero.tsx           # Hero Sektion
│   ├── FeaturedCars.tsx   # Fahrzeug-Galerie
│   └── Footer.tsx         # Website Footer
└── lib/                   # Utilities und Services
    └── autoscout-integration.ts  # AutoScout24 Integration
```

## 🔄 AutoScout24 Integration

Das Projekt enthält eine vorbereitete Integration für AutoScout24, um Fahrzeuge automatisch zu synchronisieren. Dies vermeidet die doppelte Pflege von Inseraten sowohl auf der eigenen Website als auch auf AutoScout24.

### Features der Integration:

- **Automatischer Import**: Fahrzeuge von AutoScout24 importieren
- **Bidirektionale Synchronisation**: Änderungen in beide Richtungen synchronisieren
- **Datenkonvertierung**: Automatische Umwandlung zwischen verschiedenen Datenformaten
- **Fehlerbehandlung**: Robuste Fehlerbehandlung und Logging

### Setup (Konzept):

1. AutoScout24 API-Schlüssel erhalten
2. Umgebungsvariable setzen: `AUTOSCOUT24_API_KEY=your_api_key`
3. Sync-Service konfigurieren

**Hinweis**: AutoScout24 stellt nicht öffentlich eine API zur Verfügung. Eine tatsächliche Integration würde eine direkte Zusammenarbeit mit AutoScout24 erfordern.

## 🎯 Benutzerfreundlichkeit (UX)

- **Einfache Navigation**: Klare Menüstruktur und Breadcrumbs
- **Schnelle Suche**: Prominente Suchfunktion auf der Startseite
- **Mobile-First**: Optimiert für mobile Nutzung
- **Schnelle Ladezeiten**: Optimierte Bilder und Code-Splitting
- **Barrierefreiheit**: WCAG-konforme Implementierung

## 📱 Responsive Design

Die Website ist vollständig responsive und bietet optimale Darstellung auf:

- **Desktop**: 1920px+
- **Laptop**: 1024px - 1919px
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## 🚀 Deployment

### Vercel (Empfohlen)

```bash
npm run build
vercel --prod
```

### Andere Plattformen

```bash
npm run build
npm start
```

## 🔧 Konfiguration

### Umgebungsvariablen

```env
AUTOSCOUT24_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Anpassungen

- Logo: Ersetzen Sie das Placeholder-Logo in den Komponenten
- Kontaktdaten: Aktualisieren Sie die Kontaktinformationen im Header und Footer
- Fahrzeugdaten: Verbinden Sie mit Ihrer Fahrzeugdatenbank oder API

## 📞 Support

Bei Fragen oder Problemen:

- Email: info@autovoegeli.ch
- Telefon: +41 XX XXX XX XX

## 📄 Lizenz

Dieses Projekt ist für Auto Vögeli entwickelt. Alle Rechte vorbehalten.

---

**Auto Vögeli** - Ihr Partner für Qualitätsfahrzeuge in der Schweiz
