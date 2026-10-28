/* What changed, as the players read it in the "What's new" window after an update (newest first).
 * One entry per release that players should hear about; small fixes can wait for the next one. */
(function (DH) {
  'use strict';
  DH.changelog = [
    {
      v: '1.61.29',
      bg: [
        'Под всяко умение вече пише типа му щета (Физическо, Магия, Огън, Мълния, Лед), всеки в свой цвят — за да е ясно кой бонус го вдига. По-бледо и в скоби се вижда тип, който ъпгрейд може да добави по-късно, и на кое ниво на умението.',
      ],
      en: [
        'Every ability now shows its damage type under its name (Physical, Magic, Fire, Lightning, Ice), each in its own colour, so it is clear which bonus raises it. Fainter, in brackets: a type an upgrade can add later, and at which ability level.',
      ],
    },
    {
      v: '1.61.28',
      bg: [
        'Разломът след Лорда вече се отваря встрани от плячката (не върху нея), малко по-малък е и се движи по-бавно и плавно.',
      ],
      en: [
        'The rift after the Lord now opens beside its spoils (not on top of them), a little smaller, and moves slower and smoother.',
      ],
    },
    {
      v: '1.61.27',
      bg: [
        'Всяко умение вече има собствен цвят: иконата му, искрите от ударите, следите и светлината на снарядите. Уменията не се сливат в едно лилаво и се различават от пръв поглед.',
        'Томовете на земята светят по-силно — с ореол и светъл лъч, и се виждат отдалеч.',
      ],
      en: [
        'Every ability now has its own colour: its icon, the sparks of its hits, the trails and light of its missiles. Abilities no longer blur into one violet and tell apart at a glance.',
        'Tomes on the ground glow much brighter, with a halo and a beam of light, and are easy to spot from afar.',
      ],
    },
    {
      v: '1.61.26',
      bg: [
        'Призованите помощници вече имат тяло: вълците, големите и фантомите не се струпват един върху друг, обграждат врага от различни страни и не влизат в телата на враговете.',
      ],
      en: [
        'Summoned helpers now have bodies: wolves, golems and phantoms no longer pile onto one another, they surround a foe from different sides and stop at its body instead of inside it.',
      ],
    },
    {
      v: '1.61.24',
      bg: [
        'Победата вече не те изхвърля веднага: щом Лордът падне, се отваря разлом. Събери плячката му (златния сандък, тома и останалото) и влез в разлома, за да напуснеш — важи за всички нива.',
        'Призованите помощници (вълците на Ловджийката и подобни) вече тичат поне колкото героя и се навъртат около него, вместо да изостават в другия край на екрана.',
      ],
      en: [
        'Victory no longer snatches you away at once: when the Lord falls, a rift opens. Gather its spoils (the gold chest, the tome and the rest) and step into the rift to leave — on every hall.',
        'Summoned helpers (the Huntress\'s wolves and the like) now keep up with the hero and stay at their side instead of trailing off across the screen.',
      ],
    },
    {
      v: '1.61.23',
      bg: [
        'Agony: тълпата е по-гъста от първата вълна (двойно повече в началото, повече прииждащи през цялата битка), но враговете удрят с 25% по-меко, а Босовете имат двойно повече кръв. Опитът е наполовина, за да остане изравняването равномерно.',
      ],
      en: [
        'Agony: the horde is denser from the first wave (twice as many early on, more pouring in throughout), but foes hit 25% softer and Bosses carry double health. XP is halved so leveling stays steady.',
      ],
    },
    {
      v: '1.61.19',
      bg: [
        'Поправено: бутонът „Изход" вече наистина излиза от акаунта (можеше да увисне).',
      ],
      en: [
        'Fixed: the Sign out button now actually signs you out (it could hang before).',
      ],
    },
    {
      v: '1.61.15',
      bg: [
        'Гледането на реклама вече коректно отчита куестовете „Изгледай N реклами" (и в Седемте Нощи).',
        'Поправка при удвояване на златото от реклама — бързото двойно натискане вече не го задейства два пъти.',
      ],
      en: [
        'Watching an ad now correctly counts toward the "watch N ads" tasks (Seven Nights included).',
        'Doubling run gold with an ad no longer fires twice on a quick double-tap.',
      ],
    },
    {
      v: '1.61.14',
      bg: [
        'Премахната е рекламата на цял екран след битка.',
      ],
      en: [
        'Removed the full-screen ad shown after battles.',
      ],
    },
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
