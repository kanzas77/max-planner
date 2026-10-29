import { useState } from 'react';
import { validateLicenseKey } from './license';

interface LicenseScreenProps {
  onActivate: (expiryDate: Date) => void;
}

export default function LicenseScreen({ onActivate }: LicenseScreenProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = () => {
    if (!licenseKey.trim()) {
      setError('Введите ключ активации');
      return;
    }
    setIsLoading(true);
    setError('');
    setTimeout(() => {
      const result = validateLicenseKey(licenseKey);
      if (result.valid && result.expiryDate) {
        onActivate(result.expiryDate);
      } else {
        setError(result.error || 'Неверный ключ активации');
      }
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleActivate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-3xl shadow-2xl shadow-purple-500/50 mb-4">
            M
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            MAX Planner
          </h1>
          <p className="text-slate-400 mt-2">Персональный планировщик задач</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="text-xl font-bold text-white mb-2">Активация лицензии</h2>
            <p className="text-sm text-slate-400">
              Введите ключ активации для доступа к приложению
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Ключ активации</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => {
                  setLicenseKey(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="MAX-XXXX-XXXX-XXXX-XXXX"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-mono text-center tracking-wider"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm text-center">
                ❌ {error}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={isLoading || !licenseKey.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Проверка...
                </span>
              ) : (
                '🔓 Активировать'
              )}
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-blue-300 text-center">
              💡 Ключ активации выдаётся при покупке лицензии.<br/>
              Один ключ = доступ на определённый срок (7, 30, 365 дней).
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500">
            Нет ключа?{' '}
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
              Купить лицензию
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
