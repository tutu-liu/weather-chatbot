# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Non-Obvious Patterns

### Dual-Mode Architecture
- Server auto-detects DEMO_MODE when `OPENWEATHER_API_KEY` is missing/invalid
- `isConnected=false` triggers mock data generation in `generateMockWeatherData()` (server.js:91)
- No fallback - API calls MUST go through `/api/weather` endpoint, never direct MCP calls from frontend

### MCP Server Path Hardcoded
- MCP server path is HARDCODED in server.js:24: `/Users/liu/Documents/IBM Bob/MCP/weather-server/build/index.js`
- Must update this path if deploying to different environment
- Path contains spaces - requires proper escaping in spawn() calls

### Japanese Data Keys
- Weather data uses Japanese keys: `都市`, `気温`, `体感温度`, `天気`, `詳細`, `湿度`, `気圧`, `風速`
- Frontend expects these exact keys in `formatWeatherData()` (app.js:89)
- Changing keys breaks UI rendering

### City Name Extraction Logic
- `extractCityName()` (app.js:53) uses hardcoded city list + regex fallback
- Regex pattern `/([ぁ-んァ-ヶー一-龠a-zA-Z]+)の/` extracts word before 「の」
- Adding new cities requires updating the hardcoded array

### Forecast Day Limits
- Days are clamped to 1-5 range in `extractDays()` (app.js:83)
- Backend multiplies by 8 (3-hour intervals) in `generateMockWeatherData()` (app.js:109)
- Real API also uses 3-hour intervals, so this is intentional alignment

### ES Module Requirements
- `package.json` has `"type": "module"` - all files use ES6 imports
- `__dirname` must be manually constructed using `fileURLToPath()` (server.js:8-9)
- Cannot use CommonJS `require()` anywhere

### Port Configuration
- Port 3000 is hardcoded in server.js:12
- No environment variable override - must edit code to change port
- Express serves static files from `__dirname` (server.js:16)

## Build/Run Commands
```bash
npm start          # Production mode
npm run dev        # Development with auto-reload (--watch flag)
```

## MCP Server Location
External dependency at: `/Users/liu/Documents/IBM Bob/MCP/weather-server/`
- Must be pre-built before running this app
- Build command: `cd "/Users/liu/Documents/IBM Bob/MCP/weather-server" && npm run build`