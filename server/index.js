require('dotenv').config({ path: __dirname + '/.env' });
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

const PARAM_NAMES_TH = {
  ph: 'ค่าความเป็นกรด-ด่าง (pH)',
  temperature: 'อุณหภูมิ',
  conductivity: 'ค่าการนำไฟฟ้า (TDS)',
  turbidity: 'ความขุ่น',
  do: 'ออกซิเจนละลายน้ำ (DO)',
  cod: 'สารอินทรีย์ปนเปื้อน (COD)',
  bod5: 'จุลินทรีย์ย่อยสลาย (BOD5)',
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

const STATUS_TH = {
  critical: '⚠️ วิกฤต - เกินเกณฑ์มาตรฐาน',
  warning: '⚡ เตือน - ใกล้เกณฑ์มาตรฐาน',
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
  let message = `🚨 <b>แจ้งเตือนคุณภาพน้ำ</b>\n\n`;
  message += `📍 สถานี: <b>${stationName}</b>\n`;
  message += `🕐 เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}\n\n`;
  
  alerts.forEach(alert => {
    const icon = alert.status === 'critical' ? '🔴' : '🟡';
    const statusText = STATUS_TH[alert.status] || alert.status;
    const paramNameThai = PARAM_NAMES_TH[alert.id] || alert.name;
    message += `${icon} <b>${statusText}</b>\n`;
    message += `   ตรวจวัด: ${paramNameThai}\n`;
    message += `   ค่าปัจจุบัน: ${alert.value} ${alert.unit}\n`;
    message += `   เกณฑ์มาตรฐาน: ${alert.legalLow} - ${alert.legalHigh} ${alert.unit}\n\n`;
  });
  
  message += `🌐 ดูรายละเอียด: https://akradechlao.github.io/wq-dashboard/`;
  
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
  const message = `✅ <b>ทดสอบระบบสำเร็จ</b>\n\nระบบแจ้งเตือนคุณภาพน้ำเชื่อมต่อเรียบร้อยแล้ว!\n🕐 เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;
  
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
