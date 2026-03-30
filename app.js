// チャットメッセージを管理
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// メッセージを追加する関数
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (typeof content === 'string') {
        contentDiv.innerHTML = content;
    } else {
        contentDiv.appendChild(content);
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// タイピングインジケーターを表示
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot';
    typingDiv.id = 'typingIndicator';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    
    contentDiv.appendChild(indicator);
    typingDiv.appendChild(contentDiv);
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// タイピングインジケーターを削除
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

// 都市名を抽出する関数
function extractCityName(message) {
    // 日本の主要都市のリスト
    const cities = [
        '東京', 'Tokyo', '大阪', 'Osaka', '京都', 'Kyoto', '名古屋', 'Nagoya',
        '札幌', 'Sapporo', '福岡', 'Fukuoka', '神戸', 'Kobe', '横浜', 'Yokohama',
        '広島', 'Hiroshima', '仙台', 'Sendai', '千葉', 'Chiba', '北九州', 'Kitakyushu',
        '川崎', 'Kawasaki', '新潟', 'Niigata', '浜松', 'Hamamatsu', '熊本', 'Kumamoto',
        '相模原', 'Sagamihara', '静岡', 'Shizuoka', '岡山', 'Okayama', '鹿児島', 'Kagoshima'
    ];
    
    for (const city of cities) {
        if (message.includes(city)) {
            return city;
        }
    }
    
    // 「の」の前の単語を都市名として抽出
    const match = message.match(/([ぁ-んァ-ヶー一-龠a-zA-Z]+)の/);
    if (match) {
        return match[1];
    }
    
    return null;
}

// 予報日数を抽出する関数
function extractDays(message) {
    const match = message.match(/(\d+)日/);
    if (match) {
        const days = parseInt(match[1]);
        return Math.min(Math.max(days, 1), 5); // 1-5日の範囲に制限
    }
    return null;
}

// 天気データをフォーマットする関数
function formatWeatherData(data) {
    try {
        const weatherObj = typeof data === 'string' ? JSON.parse(data) : data;
        
        const container = document.createElement('div');
        container.className = 'weather-data';
        
        if (weatherObj.都市) {
            const title = document.createElement('h4');
            title.textContent = `📍 ${weatherObj.都市}`;
            container.appendChild(title);
            
            // 現在の天気情報
            if (weatherObj.気温) {
                const items = [
                    { label: '気温', value: weatherObj.気温 },
                    { label: '体感温度', value: weatherObj.体感温度 },
                    { label: '天気', value: weatherObj.天気 },
                    { label: '詳細', value: weatherObj.詳細 },
                    { label: '湿度', value: weatherObj.湿度 },
                    { label: '気圧', value: weatherObj.気圧 },
                    { label: '風速', value: weatherObj.風速 }
                ];
                
                items.forEach(item => {
                    if (item.value) {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'weather-item';
                        itemDiv.innerHTML = `
                            <span class="weather-label">${item.label}:</span>
                            <span class="weather-value">${item.value}</span>
                        `;
                        container.appendChild(itemDiv);
                    }
                });
            }
            
            // 予報データ
            if (weatherObj.予報データ && Array.isArray(weatherObj.予報データ)) {
                const forecastTitle = document.createElement('h4');
                forecastTitle.textContent = `📅 ${weatherObj.予報期間}の予報`;
                forecastTitle.style.marginTop = '15px';
                container.appendChild(forecastTitle);
                
                weatherObj.予報データ.slice(0, 8).forEach((forecast, index) => {
                    if (index > 0 && index % 4 === 0) {
                        const divider = document.createElement('div');
                        divider.style.borderTop = '2px solid #667eea';
                        divider.style.margin = '10px 0';
                        container.appendChild(divider);
                    }
                    
                    const forecastDiv = document.createElement('div');
                    forecastDiv.style.padding = '8px 0';
                    forecastDiv.innerHTML = `
                        <div style="font-weight: 600; color: #667eea; margin-bottom: 5px;">${forecast.日時}</div>
                        <div class="weather-item">
                            <span class="weather-label">気温:</span>
                            <span class="weather-value">${forecast.気温}</span>
                        </div>
                        <div class="weather-item">
                            <span class="weather-label">天気:</span>
                            <span class="weather-value">${forecast.詳細}</span>
                        </div>
                    `;
                    container.appendChild(forecastDiv);
                });
            }
        }
        
        return container;
    } catch (error) {
        console.error('Weather data formatting error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'データの表示中にエラーが発生しました。';
        return errorDiv;
    }
}

// メッセージを処理する関数
async function processMessage(message) {
    const city = extractCityName(message);
    
    if (!city) {
        return '都市名が見つかりませんでした。😅<br>例：「東京の天気を教えて」のように都市名を含めてください。';
    }
    
    const days = extractDays(message);
    const isForecast = message.includes('予報') || message.includes('予想') || days !== null;
    
    try {
        let response;
        
        if (isForecast) {
            // 予報を取得
            const forecastDays = days || 3;
            response = await callWeatherAPI('get_forecast', { city, days: forecastDays });
        } else {
            // 現在の天気を取得
            response = await callWeatherAPI('get_current_weather', { city });
        }
        
        if (response.error) {
            return `<span class="error-message">エラー: ${response.error}</span>`;
        }
        
        return formatWeatherData(response.data);
    } catch (error) {
        console.error('Error processing message:', error);
        return `<span class="error-message">天気情報の取得中にエラーが発生しました。😢<br>${error.message}</span>`;
    }
}

// Weather APIを呼び出す関数
async function callWeatherAPI(toolName, args) {
    try {
        const response = await fetch('/api/weather', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                toolName,
                args
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'APIリクエストに失敗しました');
        }

        return await response.json();
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// メッセージを送信する関数
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // ユーザーメッセージを追加
    addMessage(message, true);
    userInput.value = '';
    
    // 送信ボタンを無効化
    sendButton.disabled = true;
    
    // タイピングインジケーターを表示
    showTypingIndicator();
    
    // メッセージを処理
    const response = await processMessage(message);
    
    // タイピングインジケーターを削除
    removeTypingIndicator();
    
    // ボットの応答を追加
    addMessage(response, false);
    
    // 送信ボタンを有効化
    sendButton.disabled = false;
    userInput.focus();
}

// クイックメッセージを送信
function sendQuickMessage(message) {
    userInput.value = message;
    sendMessage();
}

// Enterキーで送信
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// 初期化
userInput.focus();

// Made with Bob
