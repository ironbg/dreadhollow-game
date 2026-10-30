/* What changed, as the players read it in the "What's new" window after an update (newest first).
 * One entry per release that players should hear about; small fixes can wait for the next one. */
(function (DH) {
  'use strict';
  DH.changelog = [
    {
      v: '1.61.50',
      bg: [
        'Магазинът е подреден по табове: Оферти, Дневни, Ковачница, Сандъци, Диаманти, Злато и Безплатно. Червена точка показва къде има нещо безплатно, а офертите са по-компактни.',
      ],
      en: [
        'The shop is sorted into tabs: Offers, Daily, Forge, Chests, Gems, Gold and Free. A red dot shows where something free waits, and the offers are more compact.',
      ],
    },
    {
      v: '1.61.48',
      bg: [
        'Поправено: дневната награда (и другите дневни неща) понякога не можеше да се вземе след полунощ. Новият ден вече започва за всички в полунощ българско време, еднакво на телефона и на сървъра.',
        'Стрелката към разлома след Лорда вече показва самия червен разлом.',
      ],
      en: [
        'Fixed: the daily reward (and the other dailies) sometimes could not be claimed after midnight. The new day now starts for everyone at midnight Bulgarian time, the same on the phone and on the server.',
        'The arrow pointing to the rift after the Lord now shows the red rift itself.',
      ],
    },
    {
      v: '1.61.47',
      bg: [
        'Победата вече не може да се изгуби: ако не влезеш в разлома, той те прибира сам след минута (последните 10 секунди се отброяват). Изходът през паузата след Лорда също се брои за победа, а след него нищо не може да те нарани.',
      ],
      en: [
        'A victory can no longer be lost: if you do not step into the rift, it draws you in after a minute (the last ten seconds are counted down). Leaving from the pause menu after the Lord also counts as a victory, and nothing can hurt you once he falls.',
      ],
    },
    {
      v: '1.61.45',
      bg: [
        'В Склада с ресурси вече има и пет пакета със злато и метали за ковачницата, с до 50% повече отколкото поотделно.',
      ],
      en: [
        'The Resource Store now also sells five packs of gold and forging metals, holding up to 50% more than bought on their own.',
      ],
    },
    {
      v: '1.61.44',
      bg: [
        'Нов „Склад с ресурси“ в Оръжейната (бутонът горе вдясно до героя): всеки ден безплатно 1000 злато и 10 желязо, а после още три пъти по 1500 злато и 15 желязо срещу реклама.',
      ],
      en: [
        'A new Resource Store in the Armory (the button at the top right by the hero): every day 1000 gold and 10 iron for free, then three more of 1500 gold and 15 iron for watching an ad.',
      ],
    },
    {
      v: '1.61.41',
      bg: [
        'Ковачницата при сливане е прерисувана в стила на залите: каменно огнище с жив огън и тлеещи въглени, наковалня на каменен блок и тежък ковашки чук, на пода на криптата и на светлината на огъня.',
      ],
      en: [
        'The forge scene for merging is redrawn in the style of the halls: a stone hearth with a living fire and glowing coals, an anvil on a stone block and a heavy smith\'s sledge, on the crypt\'s floor in the firelight.',
      ],
    },
    {
      v: '1.61.39',
      bg: [
        'Оръжейната е преработена и е много по-компактна: героят стои в средата, а екипировката му е от двете страни. Материалите са на един ред, а реликвите са в решетка с по 5 на ред.',
        'Сливането на реликви вече става в ковачницата: трите предмета падат на наковалнята, чукът удря три пъти сред дъжд от искри и новият предмет изгрява в цвета на рядкостта си.',
      ],
      en: [
        'The Armory is redone and far more compact: the hero stands in the middle with their gear on both sides, the materials sit on one line, and the relics fill a grid five to a row.',
        'Merging relics now happens at the forge: the three pieces drop onto the anvil, the hammer strikes three times in a shower of sparks, and the new piece rises in its rarity\'s light.',
      ],
    },
    {
      v: '1.61.36',
      bg: [
        'Настройките са преработени: табове „Общи“, „Игра“ и „Интерфейс“, бързи плочки за музика, звуци, вибрация и качество, и по-кратко меню с икони.',
      ],
      en: [
        'Settings redone: General, Game and Interface tabs, quick tiles for music, sounds, vibration and quality, and a shorter menu with icons.',
      ],
    },
    {
      v: '1.61.35',
      bg: [
        'Поправено: влизането в разлома след Лорда вече работи от всяка посока — стъпи където и да е в него и идва екранът за победа с наградите. Подсказката „Влез в разлома“ се показва отново на няколко секунди.',
      ],
      en: [
        'Fixed: stepping into the rift after the Lord now works from any side — walk in anywhere and the victory screen with your rewards follows. The "Step into the rift" hint repeats every few seconds.',
      ],
    },
    {
      v: '1.61.34',
      bg: [
        'Приложението само проверява в Google Play за нова версия при пускане и при връщане в играта, и я инсталира (никога по време на битка).',
      ],
      en: [
        'The app now checks Google Play for a new version when it starts and when you come back to it, and installs it (never during a fight).',
      ],
    },
    {
      v: '1.61.33',
      bg: [
        'Акведукт: двата тома на моста вече са в противоположни посоки — един нагоре и един надолу — и по-близо (около 180 м).',
      ],
      en: [
        'Aqueduct: the two tomes on the bridge now lie in opposite directions — one up, one down — and closer (about 180 m).',
      ],
    },
    {
      v: '1.61.32',
      bg: [
        'Тайнственият том вече може да се откаже: вместо ново умение вземи 250 злато или половин ниво опит. Така постижението „Адепт“ (само с основното оръжие) не се разваля от том, паднал до теб.',
      ],
      en: [
        'An Arcane Tome can now be turned down: take 250 gold or half a level of experience instead of a new ability. A tome landing at your feet no longer spoils the Adept quest (main weapon only).',
      ],
    },
    {
      v: '1.61.31',
      bg: [
        'Призованите помощници (вълци, големи, фантоми и др.) вече ловуват в малко по-широк кръг около героя.',
      ],
      en: [
        'Summoned helpers (wolves, golems, phantoms and the like) now hunt a little further around the hero.',
      ],
    },
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
