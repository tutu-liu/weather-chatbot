import express from 'express';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// ミドルウェア
app.use(express.json());
app.use(express.static(__dirname));

// MCPクライアントの初期化
let mcpClient = null;
let isConnected = false;

async function initializeMCPClient() {
    try {
        const serverPath = '/Users/liu/Documents/IBM Bob/MCP/weather-server/build/index.js';
        const apiKey = process.env.OPENWEATHER_API_KEY || 'DEMO_MODE';
        
        // デモモードの場合は警告を表示
        if (apiKey === 'DEMO_MODE') {
            console.log('⚠️  Running in DEMO MODE - using mock weather data');
            console.log('   To use real weather data, set OPENWEATHER_API_KEY environment variable');
            isConnected = false;
            return;
        }
        
        // MCPサーバープロセスを起動
        const serverProcess = spawn('node', [serverPath], {
            env: {
                ...process.env,
                OPENWEATHER_API_KEY: apiKey
            },
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // エラーハンドリング
        serverProcess.stderr.on('data', (data) => {
            console.error(`MCP Server stderr: ${data}`);
        });

        serverProcess.on('error', (error) => {
            console.error('Failed to start MCP server:', error);
            isConnected = false;
        });

        serverProcess.on('exit', (code) => {
            console.log(`MCP server exited with code ${code}`);
            isConnected = false;
        });

        // トランスポートの作成
        const transport = new StdioClientTransport({
            command: 'node',
            args: [serverPath],
            env: {
                OPENWEATHER_API_KEY: apiKey
            }
        });

        // クライアントの作成と接続
        mcpClient = new Client({
            name: 'weather-chatbot-client',
            version: '1.0.0'
        }, {
            capabilities: {}
        });

        await mcpClient.connect(transport);
        isConnected = true;
        console.log('✅ MCP client connected successfully');

        // 利用可能なツールを取得
        const tools = await mcpClient.listTools();
        console.log('Available tools:', tools.tools.map(t => t.name));

    } catch (error) {
        console.error('❌ Failed to initialize MCP client:', error);
        isConnected = false;
    }
}

// デモモードのモックデータを生成
function generateMockWeatherData(toolName, args) {
    if (toolName === 'get_current_weather') {
        return {
            都市: args.city,
            気温: `${(15 + Math.random() * 15).toFixed(1)}°C`,
            体感温度: `${(14 + Math.random() * 15).toFixed(1)}°C`,
            天気: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
            詳細: ['晴れ', '曇り', '小雨'][Math.floor(Math.random() * 3)],
            湿度: `${Math.floor(40 + Math.random() * 40)}%`,
            気圧: `${Math.floor(1000 + Math.random() * 30)}hPa`,
            風速: `${(1 + Math.random() * 8).toFixed(1)}m/s`,
            取得時刻: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
        };
    } else if (toolName === 'get_forecast') {
        const forecasts = [];
        const now = new Date();
        const days = args.days || 3;
        
        for (let i = 0; i < days * 8; i++) {
            const forecastTime = new Date(now.getTime() + i * 3 * 60 * 60 * 1000);
            forecasts.push({
                日時: forecastTime.toLocaleString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                気温: `${(15 + Math.random() * 15).toFixed(1)}°C`,
                体感温度: `${(14 + Math.random() * 15).toFixed(1)}°C`,
                天気: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
                詳細: ['晴れ', '曇り', '小雨'][Math.floor(Math.random() * 3)],
                湿度: `${Math.floor(40 + Math.random() * 40)}%`,
                風速: `${(1 + Math.random() * 8).toFixed(1)}m/s`
            });
        }
        
        return {
            都市: args.city,
            予報期間: `${days}日間`,
            予報データ: forecasts
        };
    }
}

// 天気情報を取得するエンドポイント
app.post('/api/weather', async (req, res) => {
    try {
        const { toolName, args } = req.body;

        // デモモードの場合はモックデータを返す
        if (!isConnected || !mcpClient) {
            console.log(`🎭 DEMO MODE: Generating mock data for ${toolName}`);
            const mockData = generateMockWeatherData(toolName, args);
            return res.json({ data: mockData });
        }

        console.log(`Calling tool: ${toolName} with args:`, args);

        // MCPツールを呼び出し
        const result = await mcpClient.callTool({
            name: toolName,
            arguments: args
        });

        console.log('Tool result:', result);

        // レスポンスを解析
        if (result.content && result.content.length > 0) {
            const content = result.content[0];
            if (content.type === 'text') {
                // エラーレスポンスの場合
                if (result.isError) {
                    return res.status(500).json({ error: content.text });
                }
                
                try {
                    const data = JSON.parse(content.text);
                    res.json({ data });
                } catch (parseError) {
                    // JSONパースに失敗した場合はテキストとして返す
                    res.json({ data: { message: content.text } });
                }
            } else {
                res.json({ data: content });
            }
        } else {
            res.status(500).json({ error: 'ツールから有効な応答が得られませんでした' });
        }

    } catch (error) {
        console.error('Error calling MCP tool:', error);
        res.status(500).json({
            error: error.message || '天気情報の取得中にエラーが発生しました'
        });
    }
});

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
    res.json({
        status: isConnected ? 'connected' : 'demo_mode',
        mcpClient: mcpClient ? 'initialized' : 'not initialized',
        mode: isConnected ? 'live' : 'demo'
    });
});

// サーバー起動
app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log('Initializing MCP client...');
    await initializeMCPClient();
});

// グレースフルシャットダウン
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (mcpClient && isConnected) {
        await mcpClient.close();
    }
    process.exit(0);
});

// Made with Bob
