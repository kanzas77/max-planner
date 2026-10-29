const SECRET_KEY = 'MAX_PLANNER_SECRET_2026_CHANGE_THIS';

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function encodeDate(date: Date): string {
  const timestamp = date.getTime();
  return timestamp.toString(36);
}

function decodeDate(encoded: string): Date {
  const timestamp = parseInt(encoded, 36);
  return new Date(timestamp);
}

export function generateLicenseKey(days: number): string {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const encodedDate = encodeDate(expiryDate);
  const signature = simpleHash(encodedDate + SECRET_KEY);
  const rawKey = `MAX-${encodedDate}-${signature}`;
  const keyParts = rawKey.toUpperCase().match(/.{1,4}/g) || [];
  return keyParts.join('-');
}

export function validateLicenseKey(key: string): { valid: boolean; expiryDate?: Date; error?: string } {
  try {
    const cleanKey = key.replace(/\s/g, '').toUpperCase();
    if (!cleanKey.startsWith('MAX-')) {
      return { valid: false, error: 'Неверный формат ключа' };
    }
    const withoutPrefix = cleanKey.substring(4);
    const rawKey = withoutPrefix.replace(/-/g, '');
    let foundValid = false;
    let validEncodedDate = '';
    for (let dateLen = 5; dateLen <= rawKey.length - 3; dateLen++) {
      const testDate = rawKey.substring(0, dateLen).toLowerCase();
      const testSignature = rawKey.substring(dateLen).toLowerCase();
      const testTimestamp = parseInt(testDate, 36);
      if (isNaN(testTimestamp) || testTimestamp < 0) continue;
      const testDateObj = new Date(testTimestamp);
      if (isNaN(testDateObj.getTime())) continue;
      const expectedSignature = simpleHash(testDate + SECRET_KEY);
      if (testSignature === expectedSignature) {
        foundValid = true;
        validEncodedDate = testDate;
        break;
      }
    }
    if (!foundValid) {
      return { valid: false, error: 'Неверная подпись ключа' };
    }
    const expiryDate = decodeDate(validEncodedDate);
    const now = new Date();
    if (now > expiryDate) {
      return {
        valid: false,
        expiryDate,
        error: `Срок действия ключа истёк ${expiryDate.toLocaleDateString('ru-RU')}`
      };
    }
    return { valid: true, expiryDate };
  } catch (error) {
    return { valid: false, error: 'Ошибка проверки ключа' };
  }
}

export function getRemainingTime(expiryDate: Date): string {
  const now = new Date();
  const diff = expiryDate.getTime() - now.getTime();
  if (diff <= 0) return 'Истёк';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) {
    return `${days} дн. ${hours} ч.`;
  } else if (hours > 0) {
    return `${hours} ч.`;
  } else {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes} мин.`;
  }
}

export function generateKeyForSale(days: number): string {
  const key = generateLicenseKey(days);
  const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  console.log('====================================');
  console.log('🔑 Новый ключ активации сгенерирован');
  console.log('====================================');
  console.log(`Ключ: ${key}`);
  console.log(`Срок: ${days} дней`);
  console.log(`Действует до: ${expiryDate.toLocaleDateString('ru-RU')}`);
  console.log('====================================');
  return key;
}
