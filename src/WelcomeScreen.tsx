import { useState } from 'react';

interface WelcomeScreenProps {
  onGoToActivation: () => void;
}

export default function WelcomeScreen({ onGoToActivation }: WelcomeScreenProps) {
  const [activeTariff, setActiveTariff] = useState<number | null>(null);

  const advantages = [
    { icon: '🔒', title: '100% приватность', desc: 'Данные только на вашем устройстве. Никаких облаков и утечек.' },
    { icon: '⚡', title: 'Мгновенная скорость', desc: 'Отклик менее 10 мс. Нет задержек на серверные запросы.' },
    { icon: '📵', title: 'Работа офлайн', desc: 'Функционирует без интернета. Даже в самолёте.' },
    { icon: '💰', title: 'Без подписок', desc: 'Одна покупка — и пользуйтесь весь оплаченный срок.' },
    { icon: '🚫', title: 'Без регистрации', desc: 'Не нужен email, телефон или аккаунт.' },
    { icon: '💾', title: 'Контроль данных', desc: 'Экспорт и импорт в один клик. Перенос между устройствами.' },
  ];

  const features = [
    {
      icon: '📋',
      title: 'Задачи',
      items: ['3 уровня приоритета', '6 категорий', 'Поиск и фильтры', 'Прогресс-бар'],
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: '📝',
      title: 'Заметки',
      items: ['6 цветовых вариантов', 'Адаптивная сетка', 'Быстрое создание', 'Удобное удаление'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '📊',
      title: 'Статистика',
      items: ['Общая сводка', 'По категориям', 'По приоритетам', 'Визуальные графики'],
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const tariffs = [
    { days: 7, price: 299, label: 'Пробный', period: 'неделя', popular: false },
    { days: 30, price: 499, label: 'Базовый', period: 'месяц', popular: true },
    { days: 90, price: 1199, label: 'Про', period: '3 месяца', popular: false },
    { days: 365, price: 2499, label: 'Премиум', period: 'год', popular: false },
    { days: 36500, price: 4999, label: 'Навсегда', period: 'бессрочно', popular: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-extrabold text-base shadow-lg shadow-purple-500/30">
              MP
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                MAX Planner
              </h1>
              <p className="text-xs text-slate-400">Персональный планировщик</p>
            </div>
          </div>
          <button
            onClick={onGoToActivation}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all text-sm"
          >
            🔑 У меня есть ключ
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-6">
          ✨ Версия 1.0 • Работает офлайн
        </div>
        <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent leading-tight">
          Ваш планировщик.<br/>Ваши данные. Ваши правила.
        </h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
          Персональный планировщик задач и заметок, работающий полностью в браузере.
          Без серверов. Без регистрации. Без подписок.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => document.getElementById('tariffs')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition-all"
          >
            💳 Выбрать тариф
          </button>
          <button
            onClick={onGoToActivation}
            className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all"
          >
            🔑 Активировать ключ
          </button>
        </div>
      </section>

      {/* Advantages */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Почему MAX Planner?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {advantages.map((adv, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-4xl mb-3">{adv.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{adv.title}</h4>
              <p className="text-sm text-slate-400">{adv.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Что умеет приложение
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                {feat.icon}
              </div>
              <h4 className="text-2xl font-bold text-white mb-4">{feat.title}</h4>
              <ul className="space-y-2">
                {feat.items.map((item, j) => (
                  <li key={j} className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="text-purple-400">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Tariffs */}
      <section id="tariffs" className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          Тарифы
        </h3>
        <p className="text-center text-slate-400 mb-10">
          Выберите подходящий срок. Один ключ = доступ на всех устройствах.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {tariffs.map((tariff, i) => (
            <div
              key={i}
              onClick={() => setActiveTariff(i)}
              className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
                tariff.popular
                  ? 'border-purple-500/50 shadow-lg shadow-purple-500/20'
                  : activeTariff === i
                  ? 'border-purple-500/50'
                  : 'border-white/10 hover:border-purple-500/30'
              }`}
            >
              {tariff.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-xs font-bold">
                  Популярный
                </div>
              )}
              <h4 className="text-lg font-bold text-white mb-1">{tariff.label}</h4>
              <p className="text-xs text-slate-400 mb-4">{tariff.period}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {tariff.price}
                </span>
                <span className="text-sm text-slate-400 ml-1">₽</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGoToActivation();
                }}
                className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
                  tariff.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                }`}
              >
                Купить
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">
          ⚠️ После оплаты вы получите ключ активации формата MAX-XXXX-XXXX-XXXX-XXXX
        </p>
      </section>

      {/* Contacts */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Как купить лицензию
          </h3>
          <p className="text-center text-slate-400 mb-6">
            Свяжитесь со мной любым удобным способом. Отвечаю в течение часа.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://max.ru/u/f9LHodD0cOLGK0MEDW7ckDw4dWKV1q6HHlltzT0qiLdaA0zezeURx_b2tKk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                💬
              </div>
              <div>
                <div className="font-bold text-white">MAX</div>
                <div className="text-sm text-slate-400">Написать в мессенджере</div>
              </div>
            </a>
            <a
              href="https://vk.ru/yaros79"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
                🌐
              </div>
              <div>
                <div className="font-bold text-white">ВКонтакте</div>
                <div className="text-sm text-slate-400">Личное сообщение</div>
              </div>
            </a>
            <a
              href="mailto:maxkan77@yandex.ru"
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-xl">
                ✉️
              </div>
              <div>
                <div className="font-bold text-white">Email</div>
                <div className="text-sm text-slate-400">maxkan77@yandex.ru</div>
              </div>
            </a>
            <a
              href="https://t.me/YaroslavNeuroBot"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xl">
                ✈️
              </div>
              <div>
                <div className="font-bold text-white">Telegram</div>
                <div className="text-sm text-slate-400">YaroslavNeuroBot</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Warning */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <h4 className="font-bold text-yellow-300 mb-2">Для начала работы нужен ключ активации</h4>
          <p className="text-sm text-yellow-200/70">
            Без ключа приложение не откроется. Ключ выдаётся после оплаты выбранного тарифа.
            Один ключ работает на всех ваших устройствах.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center border-t border-white/10 mt-8">
        <p className="text-slate-500 text-sm">
          MAX Planner • © 2026 • Все данные хранятся локально
        </p>
        <p className="text-slate-600 text-xs mt-2">
          Сделано с ❤️ в России
        </p>
      </footer>
    </div>
  );
}
