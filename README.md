
# REVEIO Cycling Portal

REVEIO Cycling Portal is a cycling information website.

## Features

- National cycling race database
- Race search and filters
- Nearby race search
- Interactive race map
- Cycling beginner manual
- Team news
- JSON-based content management
- Responsive design

## Requirements

- Modern web browser
- Internet connection
- VS Code recommended

## Installation

1. Open the REVEIO folder in VS Code.
2. Install the Live Server extension.
3. Open index.html.
4. Click "Go Live".

Alternatively, run:

python -m http.server 8000

Then open:

http://localhost:8000

## Data Management

Edit the following JSON files:

- data/races.json
- data/news.json
- data/manual.json

The website loads these files automatically.

## Map

Map rendering uses Leaflet and OpenStreetMap.

Place search uses OpenStreetMap Nominatim.

Internet access is required for map tiles and place search.

## Notes

Race information must be entered and verified by the site administrator.

Do not publish unverified event dates, locations or registration details.

Check the relevant map and geocoding service usage policies before public deployment.
