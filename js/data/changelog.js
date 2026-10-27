/* What changed, as the players read it in the "What's new" window after an update (newest first).
 * One entry per release that players should hear about; small fixes can wait for the next one. */
(function (DH) {
  'use strict';
  DH.changelog = [
    {
      v: '1.61.13',
      bg: [
        'Поправен срив при гледане на реклама за съживяване (на устройства с малко памет).',
      ],
      en: [
        'Fixed a crash when watching a revive ad on low-memory devices.',
      ],
    },
    {
      v: '1.61.12',
      bg: [
        'Враговете вече не се сбиват в една буца — тълпата се разгръща в обсаждащ пръстен около теб.',
      ],
      en: [
        'Enemies no longer clump into one mass — the horde fans out into a besieging ring around you.',
      ],
    },
    {
      v: '1.61.11',
      bg: [
        'Повече тежест в боя: разтърсването на екрана е по-плавно, а убийството на Лорд спира времето за миг.',
      ],
      en: [
        'More impact in battle: screen shake is smoother, and slaying a Lord freezes time for a beat.',
      ],
    },
    {
      v: '1.61.6',
      bg: [
        'По-гладко: нова земя вече не причинява забиване при движение (особено в Бездната).',
      ],
      en: [
        'Smoother play: reaching fresh ground no longer causes a hitch while moving (the Abyss most of all).',
      ],
    },
    {
      v: '1.61.0',
      bg: [
        'Нов бутон „Изпрати отзив“ в Настройки: пиши ни какво да подобрим.',
        'Тайнствените отломки вече удрят и враговете близо до героя.',
        'Многоударът и бройката са по-балансирани. Залп дава +10% многоудар на уменията със снаряди.',
        'Метеоритите на Звездопад се разпръскват по различни врагове.',
        'Уменията се отключват със задачи на героя, който ги владее (например Драконов огън с Пироманта).',
        'Сенките започват точно от краката на героите и враговете.',
        'Рекламите за награда се зареждат предварително и излизат веднага.',
        'Големият шрифт от настройките на телефона вече не разваля прозорците.',
        'Изпълнените мисии и трофеи излизат най-отгоре.',
      ],
      en: [
        'A new "Send feedback" button in Settings: tell us what to improve.',
        'Arcane Shards now hit the foes close to the hero too.',
        'Multistrike and Amount are better balanced. Volley gives +10% Multistrike to projectile abilities.',
        'Skyfall\'s meteors spread across different foes.',
        'Abilities unlock through the quests of the hero who masters them (Wyrmfire with the Pyromancer, for one).',
        'Shadows start right at the feet of heroes and foes.',
        'Rewarded ads load ahead and show at once.',
        'A large font size in the phone\'s settings no longer breaks the windows.',
        'Finished missions and trophies are listed first.',
      ],
    },
  ];
})(window.DH);
