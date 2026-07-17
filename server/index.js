require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const LEGAL_LIMITS = {
  ph: { low: 6.0, high: 9.0 },
  temperature: { low: 0, high: 40 },
  conductivity: { low: 0, high: 5000 },
  turbidity: { low: 0, high: 100 },
  do: { low: 2, high: 20 },
  cod: { low: 0, high: 120 },
  bod5: { low: 0, high: 20 },
};

const PARAM_NAMES = {
  ph: 'pH',
  temperature: 'Temperature',
  conductivity: 'Conductivity/TDS',
  turbidity: 'Turbidity',
  do: 'DO',
  cod: 'COD',
  bod5: 'BOD5',
};

const PARAM_UNITS = {
  ph: '',
  temperature: '°C',
  conductivity: 'μS/cm',
  turbidity: 'NTU',
  do: 'mg/L',
  cod: 'mg/L',
  bod5: 'mg/L',
};

function checkParameterStatus(paramId, value) {
  const limits = LEGAL_LIMITS[paramId];
  if (!limits) return 'normal';

  if (value < limits.low || value > limits.high) {
    return 'critical';
  }

  const warningLow = limits.low + (limits.high - limits.low) * 0.1;
  const warningHigh = limits.high - (limits.high - limits.low) * 0.1;

  if (value < warningLow || value > warningHigh) {
    return 'warning';
  }

  return 'normal';
}

async function sendTelegramMessage(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram not configured, skipping message');
    return null;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    
    const data = await response.json();
    console.log('Telegram message sent:', data.ok);
    return data;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return null;
  }
}

function formatAlertMessage(stationName, alerts) {
  let message = `🚨 <b>Water Quality Alert</b>\n\n`;
  message += `📍 Station: <b>${stationName}</b>\n`;
  message += `🕐 Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })}\n\n`;
  
  alerts.forEach(alert => {
    const icon = alert.status === 'critical' ? '🔴' : '🟡';
    const statusText = alert.status.toUpperCase();
    message += `${icon} <b>${statusText}</b>: ${alert.name}\n`;
    message += `   Value: ${alert.value} ${alert.unit}\n`;
    message += `   Legal Limit: ${alert.legalLow} - ${alert.legalHigh}\n\n`;
  });
  
  message += `🌐 Dashboard: https://akradechlao.github.io/wq-dashboard/`;
  
  return message;
}

app.post('/api/alerts', async (req, res) => {
  const { stationId, stationName, parameters } = req.body;

  if (!stationId || !stationName || !parameters) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const alerts = [];

  parameters.forEach(param => {
    const status = checkParameterStatus(param.id, param.value);
    if (status !== 'normal') {
      const limits = LEGAL_LIMITS[param.id];
      alerts.push({
        id: param.id,
        name: PARAM_NAMES[param.id] || param.id,
        value: param.value,
        unit: PARAM_UNITS[param.id] || '',
        status,
        legalLow: limits?.low || 0,
        legalHigh: limits?.high || 0,
      });
    }
  });

  if (alerts.length > 0) {
    const message = formatAlertMessage(stationName, alerts);
    await sendTelegramMessage(message);
    return res.json({ success: true, alertsSent: alerts.length, alerts });
  }

  return res.json({ success: true, alertsSent: 0, message: 'No alerts to send' });
});

app.post('/api/test', async (req, res) => {
  const message = `✅ <b>Test Message</b>\n\nWater Quality Monitoring System is connected!\n🕐 Time: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' })}`;
  
  const result = await sendTelegramMessage(message);
  
  if (result) {
    return res.json({ success: true, message: 'Test message sent' });
  } else {
    return res.status(500).json({ error: 'Failed to send test message' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    telegramConfigured: !!(TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID),
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Telegram ${TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID ? 'configured' : 'not configured'}`);
});
