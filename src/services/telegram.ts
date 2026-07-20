const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN || '8916913132:AAHocCFu6TClwMy-F3yc_qbg60MEvE1Wi34';
const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || '7889146902';

const PARAM_NAMES_TH: Record<string, string> = {
  ph: 'ค่าความเป็นกรด-ด่าง (pH)',
  temperature: 'อุณหภูมิ',
  conductivity: 'ค่าการนำไฟฟ้า (TDS)',
  turbidity: 'ความขุ่น',
  do: 'ออกซิเจนละลายน้ำ (DO)',
  cod: 'สารอินทรีย์ปนเปื้อน (COD)',
  bod5: 'จุลินทรีย์ย่อยสลาย (BOD5)',
};

const PARAM_UNITS: Record<string, string> = {
  ph: '',
  temperature: '°C',
  conductivity: 'μS/cm',
  turbidity: 'NTU',
  do: 'mg/L',
  cod: 'mg/L',
  bod5: 'mg/L',
};

const STATUS_TH: Record<string, string> = {
  critical: '⚠️ วิกฤต - เกินเกณฑ์มาตรฐาน',
  warning: '⚡ เตือน - ใกล้เกณฑ์มาตรฐาน',
};

const LEGAL_LIMITS: Record<string, { low: number; high: number }> = {
  ph: { low: 6.0, high: 9.0 },
  temperature: { low: 0, high: 40 },
  conductivity: { low: 0, high: 5000 },
  turbidity: { low: 0, high: 100 },
  do: { low: 2, high: 20 },
  cod: { low: 0, high: 120 },
  bod5: { low: 0, high: 20 },
};

interface AlertParam {
  id: string;
  value: number;
  status: string;
}

function formatAlertMessage(stationName: string, alerts: AlertParam[]): string {
  let message = `🚨 <b>แจ้งเตือนคุณภาพน้ำ</b>\n\n`;
  message += `📍 สถานี: <b>${stationName}</b>\n`;
  message += `🕐 เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}\n\n`;

  alerts.forEach(alert => {
    const icon = alert.status === 'critical' ? '🔴' : '🟡';
    const statusText = STATUS_TH[alert.status] || alert.status;
    const paramName = PARAM_NAMES_TH[alert.id] || alert.id;
    const unit = PARAM_UNITS[alert.id] || '';
    const limits = LEGAL_LIMITS[alert.id];
    message += `${icon} <b>${statusText}</b>\n`;
    message += `   ตรวจวัด: ${paramName}\n`;
    message += `   ค่าปัจจุบัน: ${alert.value} ${unit}\n`;
    if (limits) {
      message += `   เกณฑ์มาตรฐาน: ${limits.low} - ${limits.high} ${unit}\n\n`;
    }
  });

  message += `🌐 ดูรายละเอียด: https://akradechlao.github.io/wq-dashboard/`;

  return message;
}

export async function sendTelegramAlert(
  stationName: string,
  alerts: AlertParam[]
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram not configured. Set VITE_TELEGRAM_BOT_TOKEN and VITE_TELEGRAM_CHAT_ID in .env');
    return false;
  }

  const message = formatAlertMessage(stationName, alerts);
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    console.log('Telegram response:', data.ok);
    return data.ok === true;
  } catch (error) {
    console.error('Error sending Telegram:', error);
    return false;
  }
}

export async function sendTelegramTest(): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram not configured');
    return false;
  }

  const message = `✅ <b>ทดสอบระบบสำเร็จ</b>\n\nระบบแจ้งเตือนคุณภาพน้ำเชื่อมต่อเรียบร้อยแล้ว!\n🕐 เวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Error sending test Telegram:', error);
    return false;
  }
}

export function isTelegramConfigured(): boolean {
  return !!TELEGRAM_BOT_TOKEN && !!TELEGRAM_CHAT_ID;
}
