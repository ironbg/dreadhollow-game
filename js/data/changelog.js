/* What changed, as the players read it in the "What's new" window after an update (newest first).
 * One entry per release that players should hear about; small fixes can wait for the next one. */
(function (DH) {
  'use strict';
  DH.changelog = [
    {
      v: '1.61.61',
      bg: [
        'Поправено: в 1.61.60 битка, в която си взел метал, замръзваше в края (след „Откажи се“ или победа) вместо да покаже резултатите. Наградите от тези битки са записани. Ако прозорецът с резултатите някога не може да се покаже, играта се връща в менюто, а не остава на битката.',
        'По-ясно име: „Шанс за свитък“ вече е „Шанс за Тайнствен том от елитите“ – благословията „Учен“, Съзвездието, статистиките и Данъкът на учения. Това е томът, от който избираш ново умение.',
      ],
      en: [
        'Fixed: in 1.61.60 a fight in which you picked up a metal froze at the end (after Give up or a victory) instead of showing the results. The rewards of those fights were kept. Should the results window ever fail to show, the game returns to the menus instead of staying on the fight.',
        'A clearer name: “Scroll drop chance” is now “Arcane Tome chance from Elites” (the Scholar blessing, the Constellation, the stats and the tribute of the Scholar). It is the tome you pick a new ability from.',
      ],
    },
    {
      v: '1.61.60',
      bg: [
        'Наградата на приключенеца: иконите са ясни (вече не са размазани), „Вземи“ е зелен, а под него има червен „Откажи“. В Ямата също може да избереш дървен сандък (предметът от него е само за тази битка). Предложението идва във всяка битка след първата; ако тогава е отворен друг прозорец (ниво, сандък), изчаква да се затвори.',
        'Поправено: след избор на предмет от сандък (на боса, шампиона или дървен) битката понякога оставаше спряна и екранът изглеждаше замръзнал. Грешката идваше от 1.61.58.',
        'Защита срещу замръзване на битката: всички цикли, които при рядко стечение могат да не спрат (поява на врагове и глутници, опит, плячка, мълнии, призовани, частици), имат граница. Ако битка все пак спре да отговаря, при следващото пускане играта предлага да изпрати кратък отчет на разработчика.',
        'Всички бутони за информация („i“) изглеждат еднакво – като този в Ямата: квадрат с ръкописно златно „i“ (Олтарът, героите, реликвите, Майсторството).',
        'Нова икона на „Изпитания“ в началния екран, като иконата на играта: готическа арка с червен витраж, череп с горящи очи и кулички.',
        'Боен пропуск: отваря се превъртян до сегашното ти ниво, а линията между нивата в средата е непрекъсната.',
        'Лечението в битка е по-силно: храната (супа, морков, сирене) пълни 5% от живота, новият хляб – 8%, а лековитата отвара – 15%. Хлябът пада от урните.',
        'Бъфовете от руните в битка са големи колкото иконите на уменията, подредени в ред под тях. Оставащите секунди са в иконата, а цветна рамка около нея се топи с времето.',
        'Майсторството расте с 20% по-бавно: 0,8 опит на вълна вместо 1. Събраният опит и нивата остават.',
        'Съзвездие, клон Плячка – специалностите са подредени наново: 1) кесия злато от елитите (5 монети вместо 6), 2) Позлатената слуз по-често (около 1,5 пъти, вместо 2), 3) металите по два (20% вместо 30%), 4) +10% Есенция от Ямата (вместо 20%), 5) +1 влизане в Ямата на ден.',
        'Настройки: слайдерът за качество е центриран в полето, а нивото му е вдясно от него.',
        'Металите и билките от битките са наполовина: шампионите и босовете пускат половината материали, а урните – билка два пъти по-рядко. Дневната мисия за материали иска 10 вместо 20.',
        'Сандъците за активност в дневните мисии: готов сандък се взима с едно докосване и излиза само прозорецът с наградите (вместо прозорец със сандъка и после втори с наградите).',
        'Календар за вход: натисни реда на деня, за да вземеш наградите му – безплатната и премиум наведнъж, в един прозорец. Разделите „Седмичен“ и „Месечен“ имат червена значка в ъгъла с броя на чакащите награди.',
        'Бутонът „Подвизи“ в началния екран показва червена значка с трофеите, готови за взимане, и ги отваря направо. „Пропуск“ и „Календар“ светват, когато има награда.',
        'След битка в Ямата „Продължи“ те връща в прозореца на Ямата, готов за следващото влизане, а не на началния екран.',
      ],
      en: [
        'The adventurer\'s reward: sharp icons (no longer blurry), a green Claim and a red No, thanks below it. In the Pit you may take the wooden chest too (its piece serves that fight only). It is offered in every fight after the first; if another window (a level, a chest) is open then, it waits for it to close.',
        'Fixed: after taking an item from a chest (a boss\'s, a champion\'s or a wooden one) the fight could stay stopped and the screen looked frozen. The bug came with 1.61.58.',
        'Guards against a frozen fight: every loop that could fail to end in a rare case (foes and packs arriving, experience, loot, lightning, summons, particles) has a limit. If a fight still stops responding, the game offers to send the developer a short report at the next start.',
        'Every info button ("i") looks the same – like the Pit\'s: a square with a handwritten gold "i" (the Altar, heroes, relics, Mastery).',
        'A new "Trials" icon on the main screen, like the game\'s own icon: a gothic arch with a red window, a skull with burning eyes and spires.',
        'Battle Pass: it opens scrolled to your current level, and the track between the levels in the middle is unbroken.',
        'Healing in a fight is stronger: food (soup, carrot, cheese) restores 5% of your life, the new bread 8%, and a Health Potion 15%. Bread drops from urns.',
        'Rune buffs in a fight are as big as the ability icons, in a row under them. The seconds left are inside the icon, and a coloured frame round it runs out with the time.',
        'Mastery grows 20% slower: 0.8 experience per wave instead of 1. Experience and levels already earned stay.',
        'Constellation, Plunder branch – its Specialties in a new order: 1) elites drop a purse of gold (5 coins, was 6), 2) the Gilded Ooze more often (about 1.5x, was 2x), 3) metals in pairs (20%, was 30%), 4) +10% Essence from the Pit (was 20%), 5) +1 Pit entry a day.',
        'Settings: the quality slider is centred in its band, with its level to its right.',
        'Metals and herbs from fights are halved: champions and bosses drop half the materials, and urns give a herb half as often. The daily materials mission asks for 10 instead of 20.',
        'Daily activity chests: a ready chest is taken with one tap and only the window with its rewards shows (instead of a chest window and then a second one with the rewards).',
        'Sign-in calendar: tap a day\'s row to take its rewards – the free one and the premium one together, in one window. The "Weekly" and "Monthly" tabs carry a red badge in the corner with the rewards waiting.',
        'The "Deeds" button on the main screen shows a red badge with the trophies ready to claim and opens them directly. "Pass" and "Calendar" glow when a reward waits.',
        'After a Pit fight, "Continue" takes you back to the Pit\'s window, ready for the next entry, not to the main screen.',
      ],
    },
    {
      v: '1.61.59',
      bg: [
        'Наградите също без чакане: мисии, трофеи, Пропуск, подвизи, сандъци за активност, Път на нивата и покупките за камъни се взимат веднага. Наградите със сандък или реликва все още чакат сървъра, за да е честно тегленето.',
        'Изпитанията се отварят веднага: картините им се рисуват веднъж, докато си в менюто, и се пазят на телефона.',
        'Екранът се преначертава веднъж след действие, а не два пъти, и сървърът не проверява класациите за действия, които не ги засягат.',
        'Подвизите, които вече си изпълнил (вълна или ниво на Майсторството), се дават още при пускане на играта, без да чакаш следваща битка в Ямата.',
        'Подвигът и трофеят за Есенция от Ямата броят всичко, спечелено в Ямата от самото начало, а не само от последната версия.',
        'Ямата: бутонът „АВТО“ избира по-умно – умения със същия вид щети като оръжието, Елементалист за герои с огън, лед или мълния, Призоваване само ако имаш призовани.',
        'Без чакане при натискане: картите на Майсторството, звездите на Съзвездието, благословиите, Архивът, вдигането и слагането на реликви се променят веднага, а сървърът ги потвърждава зад тях. Ако откаже, играта се връща към неговата версия и казва това.',
        'Съзвездие: надписите „Магазин“ и „Статистики“ са под бутоните, защото не се събираха в рамката.',
        'Съзвездието е много по-леко: на по-слаби телефони се движеше на пресекулки и всяко натискане там (+, −, звезда) чакаше около 2 секунди. Сега реагира веднага.',
        'Сандъците за активност в дневните мисии показват наградата в същия прозорец, вместо да отварят втори със същото заглавие (изглеждаше като два пъти отваряне).',
        'Фонът на менюто се рисува по-пестеливо, така че бутоните отговарят по-бързо.',
        'По-бързи бутони: сървърът отговаря на всяко действие (купуване, вдигане, награди) няколко пъти по-бързо, а играта тръгва по-бързо.',
        'Ако сървърът все пак се бави, горе в средата се върти малък знак, за да се вижда, че действието е в ход.',
      ],
      en: [
        'Rewards without waiting too: missions, trophies, the Battle Pass, Deeds, activity chests, the Level Road and gem purchases are taken at once. Rewards with a chest or a relic still wait for the server, to keep the draw fair.',
        'The Trials open at once: their pictures are painted once while you are in the menus and kept on the phone.',
        'The screen is redrawn once after an action, not twice, and the server no longer checks the leaderboards for actions that cannot change them.',
        'Deeds you have already done (a wave or a Mastery level) are given when the game starts, without waiting for your next Pit fight.',
        'The Pit Essence Deed and trophy count everything the Pit has paid from the very start, not only since the last version.',
        'The Pit: the AUTO button chooses more wisely – abilities of the weapon\'s own kind of damage, Elementalist for fire, ice or lightning heroes, Summoner only with summons.',
        'No waiting on taps: Mastery cards, Constellation stars, Blessings, the Archive, levelling and equipping relics change at once, and the server confirms them behind you. If it refuses, the game goes back to its copy and says so.',
        'Constellation: the "Shop" and "Stats" labels sit under their buttons, as they did not fit inside the frame.',
        'The Constellation is far lighter: on weaker phones it stuttered and every tap there (+, −, a star) waited about 2 seconds. It now answers at once.',
        'The daily activity chests show what they gave in the same window instead of opening a second one with the same title (it looked like opening twice).',
        'The menus\' backdrop is drawn more sparingly, so buttons answer sooner.',
        'Faster buttons: the server answers every action (buying, upgrading, rewards) several times faster, and the game starts faster.',
        'If the server is still slow, a small ring turns at the top centre so you can see the action is on its way.',
      ],
    },
    {
      v: '1.61.58',
      bg: [
        'Пет нови трофея за Изпитанията (по 4–5 звезди, с камъни): Дълбините на Ямата (вълна), Боец от Ямата (битки), Майстор на Изпитанията (ниво на Майсторството), Пазител на Есенцията и Звездоброец (рангове в Съзвездието).',
        'Нова дневна мисия всеки ден: влез в Ямата (битка или бързо минаване) за 10 точки активност, злато и опит за Пропуска.',
        'Осем нови подвига в нов раздел „Изпитания“: първа битка, вълни 100, 500 и 1000, 50 вълни в една битка, ниво 25 и 100 на Майсторството и 100 000 Есенция от Ямата.',
        'Майсторството расте много по-бавно: 1 опит на вълна (досега 5) и по-стръмни нива (ниво 139 иска 7520 опит). Ниво 200 вече е цел за около година. Събраният опит е преизчислен по новите правила (една пета), а картите се връщат, за да разпределиш точките отново. „Още влизане“ остава.',
        'Ямата: през първата минута опитът е тройно повече, за да стигнеш бързо силата си.',
        'Ямата: бутон „АВТО“ под лентата на вълната (и в прозорците за ново ниво и том) избира новите умения и черти сам. Запомня се за следващите битки.',
        'Ямата: героят започва от ниво 1 с един Тайнствен том на земята до него (и още един за реклама). Вече няма наваксващи нива и томове при старт от по-далечна точка.',
        'Ямата: след „Готов“ и тома за реклама битката започва с отброяване 3, 2, 1.',
      ],
      en: [
        'Five new Trials trophies (4–5 stars each, paid in gems): Depths of the Pit (wave), Pit Fighter (fights), Master of Trials (Mastery level), Keeper of Essence and Stargazer (Constellation ranks).',
        'A new mission every day: enter the Pit (a fight or a sweep) for 10 activity points, gold and Battle Pass experience.',
        'Eight new Deeds in a new "Trials" tab: a first fight, waves 100, 500 and 1000, 50 waves in one fight, Mastery levels 25 and 100, and 100,000 Essence from the Pit.',
        'Mastery grows far slower: 1 experience per wave (was 5) and steeper levels (level 139 needs 7520). Level 200 is now a goal of about a year. Experience already earned is recalculated by the new rules (a fifth), and the cards come back so you can spend the points again. Extra Entry stays.',
        'The Pit: experience is tripled in the first minute, so you reach your strength quickly.',
        'The Pit: an AUTO button under the wave bar (and in the level-up and tome windows) chooses new abilities and traits for you. It is remembered for the next fights.',
        'The Pit: the hero starts at level 1 with one Arcane Tome on the ground beside them (and one more for an ad). No more catch-up levels and tomes when starting from a later checkpoint.',
        'The Pit: after Ready and the ad\'s tome, the fight begins with a 3, 2, 1 countdown.',
      ],
    },
    {
      v: '1.61.57',
      bg: [
        'Издигнатата черта Залп (Многоудар за снаряди) се предлага само ако основното оръжие на героя е със снаряди. Досега идваше и при герои с оръжие за близък бой, щом имат друго умение със снаряди.',
        'Поправено: Сърцето на порока отнемаше повече от 1 максимален живот на ниво (с бонусите за живот ставаше към 3). Сега е точно по 1 на ниво.',
        'Информацията за умение показва общата му скорост на атака (с бонусите само за оръжието, напр. от майсторството на героя), а шансът за крит се казва „Краен шанс за крит“, защото е собственият шанс на умението, вече умножен по Шанса за крит на героя.',
        'Всички характеристики на реликвите (и бонусите на нивата им) са четири пъти по-малки: с рядкостта и нивата един предмет стигаше до +96% скорост на атака, +268% Многоудар, +339% критични щети или +230% огнени щети. Специалните ефекти на реликвите, чертите, уменията и благословиите дават колкото досега.',
        'Всяка екипирана реликва в Оръжейната показва червена значка с броя нива, с които можеш да я вдигнеш сега.',
        'Нов Път на нивата в профила: на всеки 5 нива на профила те чака голяма награда – сребърен или златен сандък, сигурна епична (от ниво 60 легендарна) реликва, скъпоценни камъни, метали и на всеки 25 нива факли. Наградите за вече минатите нива също могат да се вземат.',
        'Профилът е с еднаква височина във всеки раздел; аватарите са по пет на ред.',
        'Нов бутон „Изпитания“ в главното меню (на мястото на „Безплатно“ – безплатните камъни остават в Магазина) с прозорец за игрови режими.',
        'Първото изпитание – Ямата: вълни врагове за 3 минути, без бос и без плячка. Всяка изчистена вълна дава Есенция, а при влизане веднага получаваш Есенцията до точката си за продължаване. Три влизания на ден, бързо минаване и две случайни опасности всеки път (Дъжд от остриета, Преследвач, Падащи звезди, Лъчи на олтара, Окована плът, Каменна кожа, Отровна мъгла).',
        'Съзвездието: голямо дърво от звезди, които се купуват с Есенция и дават сила на всички герои, в три клона – Ярост (атака), Бастион (защита) и Плячка (награди). Всеки клон отключва пет специални умения според вложените точки (Звезда на гнева, Пулс на бастиона, повече Есенция и влизания и др.). Нулирането е безплатно и връща цялата Есенция.',
        'Съзвездието е подредено наново с равни разстояния между звездите. Всяка звезда е медалът на благословията (или на Архива), която дава същото; огънят, ледът, мълнията и Есенцията имат свои медали. Клоновете са в тъмночервено, патинирано зелено и старо злато, а в средата е знакът на Съзвездието с похарчената Есенция под него.',
        'Съзвездие: дърветата се вият и разклоняват, с нови пътища встрани (още звезди във всеки клон), върху ново дълбоко звездно небе – мъглявини, галактическа ивица, трепкащи звезди на три дълбочини и падащи звезди. Профили: до 5 запазени разпределения с име; смяната е безплатна (Есенцията се връща и звездите се купуват наново). Бутоните долу са на цяла ширина.',
        'Съзвездие: всяка точка струва със 100 Есенция повече от предишната в същия клон (100, 200, 300…, най-много 25 000 за точка), а всеки клон брои отначало. Звездите, купени по старите цени, се изпразват и цялата Есенция се връща.',
        'Съзвездие: докосната звезда показва табло над себе си в цвета на клона – бонус на ранг, общо сега → след следващия ранг, бутони −, +, „до края“ и цената на следващата точка. „−“ на звезда, от която висят други, пита „Сигурен ли си?“ и маха и тях (с цялата им Есенция). Мащабът е с вертикален плъзгач вдясно.',
        'Класации за Ямата – седмична и за всички времена, по най-далечната вълна в битка (бързото минаване не се брои).',
        'Пропуск за Ямата: +50% Есенция и +1 влизане на ден, завинаги, с еднократно плащане.',
        'Майсторство в Ямата: всяка битка и бързо минаване дават опит за всяка достигната вълна; всяко ниво (до 100) дава точка за карти – Сила, Броня, Укрепление, Довършване, Повече време, Повече Есенция, Пълно минаване и Още влизане. Картите са в сини, лилави, златни и червени рамки, а пълната карта е със зелено име. Докосната карта показва табло над себе си в своя цвят – ниво, какво дава (числото в зелено), цената на ниво и бутони − и + точно над картата. Нулирането е безплатно.',
        'Ямата плаща 14,4 Есенция на вълна (досега 10); с Пропуска – 21,6. При влизане на вълна 1450 това са 31 320 Есенция.',
        'Нова карта в Майсторството – Майстор на комбото: комбото в Ямата изчаква с 10% по-дълго на ранг (3 ранга по 4 точки). Майсторството стига до ниво 135 – точно колкото точки искат всички карти.',
        'Новите прозорци на Изпитанията (Ямата, Майсторството, Съзвездието, магазинът, панелът в битка) са в готическия стил на играта: каменни рамки, ковани ъгли и същите бутони. Всяка карта в Майсторството има готически фон – ниша с остра арка и колони в цвета на картата.',
        'Пропускът на мъчението дава и Есенция (на всяко 7-мо ниво, в безплатния и в премиум реда), а премиум Пропускът дава +1 влизане в Ямата на ден за сезона. Нивата се купуват с камъни от цената върху следващото ниво в пътеката: 500 за ниво 1 и с 20 повече за всяко следващо.',
        'Майсторството е преработено: започва от ниво 1 с 1 точка, всяко ниво дава още една, до ниво 200; Ямата дава +30% опит за Майсторството. Всяка карта се отключва на свое ниво (заключените са сиви с катинар и нужното ниво), а цената на ранг зависи от цвета: синя 1, лилава 5, златна 10, червена 35 точки. „Още влизане“ остава при нулиране, а махането му струва 100 000 камъка. Вложените досега точки се връщат веднъж, за да се разпределят по новите цени.',
        'Пропуск за Майсторство (отделна покупка): двоен опит за Майсторството във всички Изпитания, завинаги.',
        'Бързото минаване плаща половината от най-добрата вълна; картата „Пълно минаване“ в Майсторството го вдига до цялата. С плъзгач под бутона минаваш няколко влизания наведнъж.',
        'Магазинът на Ямата (горе вдясно на картината): безплатна Есенция всеки ден, още три за реклама и пакети Есенция (от $0.99 до $49.99).',
        'Ямата: всяка вълна е голяма орда (лентата горе вдясно показва колко от нея е избита). Убивай бързо и подред, за да трупаш Комбо: на всеки 12 убийства в комбото прескачаш една вълна (до 15 наведнъж), когато вълната падне. Ако комбото прекъсне за 2,5 с, натрупаното се губи. Горе вдясно се виждат Есенцията от битката, вълната, комбото с таймера му и колко вълни ще прескочиш.',
        'Ямата започва с начален екран: вълната, от която тръгваш, и паднатите опасности (докосни ги, за да видиш какво правят), и бутон „Готов“. В началото на битката може да се вземе Тайнствен том срещу реклама, както в залите (и по един том за всеки 10 прескочени вълни до точката за продължаване). Ямата има нова готическа картина (в Изпитанията и в прозореца ѝ), в квадратни каменни рамки с ковани ъгли. Прозорецът „Специални“ е с еднаква височина на всеки таб, а клоновете имат свои икони (в табовете, редовете и лентите с точките). В Съзвездието долу вдясно има Магазин за Есенция и Статистики на героя.',
        'Ямата има своя арена, като на картината ѝ: по-малка дълбока яма с високи скални стени от колони и первази с вградени канари, прорязани от светещи пукнатини, три потока течаща лава, които падат в огнени езера с плаваща кора, камъни в основата, вериги и железни колове по ръба, факли и камъни, които от време на време падат от ръба. Враговете слизат от стените.',
      ],
      en: [
        'The elevated trait Volley (projectile Multistrike) is offered only when the hero\'s main weapon shoots projectiles. Before, melee heroes got it too as soon as they had another projectile ability.',
        'Fixed: Heart of Vice took more than 1 max HP per level (with max-HP bonuses it was about 3). It is now exactly 1 per level.',
        'An ability\'s details show its total attack speed (including weapon-only bonuses such as the hero\'s class traits), and its crit is now labelled "Final crit chance": the ability\'s own chance already multiplied by the hero\'s Crit Chance.',
        'Every stat on relics (and their level bonuses) is a quarter of what it was: with rarity and levels one piece reached +96% attack speed, +268% Multistrike, +339% crit damage or +230% fire damage. Relic specials, traits, abilities and blessings give as much as before.',
        'Every worn relic in the Armory shows a red badge with how many levels you can raise it right now.',
        'A new Path in the profile: every 5 profile levels a big reward awaits – a Silver or Gold chest, a sure Epic (Legendary from level 60) relic, gems, metals and, every 25 levels, torches. Rewards for levels already passed can be claimed too.',
        'The profile window keeps one height on every tab; avatars sit five to a row.',
        'A new Trials button on the main menu (in place of Free – the free gems are still in the Shop) opens the game modes.',
        'The first trial – the Pit: waves of foes for 3 minutes, no boss and no loot. Every wave cleared pays Essence, and entering pays at once the Essence up to your checkpoint. Three entries a day, Sweep, and two random hazards each time (Rain of Blades, Stalker, Falling Stars, Altar Beams, Chained Flesh, Stoneskin, Poison Mist).',
        'The Constellation: a great tree of stars bought with Essence that strengthen every hero, in three branches – Fury (attack), Bastion (defence) and Plunder (rewards). Each branch unlocks five Specialties by the points put in it (the Wrath Star, the Bastion Pulse, more Essence and entries, and more). Resetting is free and gives all the Essence back.',
        'The Constellation is laid out anew with even gaps between its stars. Every star is the medal of the Blessing (or Archive upgrade) that gives the same; fire, ice, lightning and Essence have medals of their own. The branches are in dark crimson, verdigris and old gold, and the middle holds the Constellation\'s sign with the Essence spent under it.',
        'Constellation: the trees wind and branch, with new paths out to the sides (more stars in every branch), over a new deep starry sky – nebulae, the galaxy\'s band, twinkling stars at three depths and falling stars. Loadouts: up to 5 named setups; switching is free (the Essence comes back and the stars are bought again). The buttons below run the full width.',
        'Constellation: every point costs 100 Essence more than the one before in its branch (100, 200, 300…, at most 25 000 a point), and each branch counts from its own start. Stars bought at the old prices are emptied and all their Essence comes back.',
        'Constellation: a tapped star shows a panel over itself in its branch\'s colour – the bonus per rank, the total now → after the next rank, −, +, all the way, and the next point\'s price. “−” on a star others hang on asks “Are you sure?” and takes them back too (with all their Essence). Zoom is a vertical slider on the right.',
        'Pit leaderboards – weekly and all time, by the farthest wave reached in a fight (Sweep does not count).',
        'The Pit Pass: +50% Essence and +1 entry a day, forever, for a single payment.',
        'Pit Mastery: every fight and sweep gives XP for each wave reached; every level (up to 100) gives a point for cards – Power, Armor, Fortify, Finishing Blow, More Time, More Essence, Full Sweep and Extra Entry. The cards come in blue, purple, gold and red frames, and a full card\'s name turns green. A tapped card shows a panel over itself in its colour – its level, what it gives (the number in green), the price per level, and − and + buttons right over the card. Resetting is free.',
        'The Pit pays 14.4 Essence a wave (it was 10); 21.6 with the Pass. Entering at wave 1450 that is 31 320 Essence.',
        'A new Mastery card – Combo Master: the Pit\'s combo waits 10% longer per rank (3 ranks of 4 points). Mastery now goes up to level 135 – exactly the points every card needs.',
        'The Trials\' new windows (the Pit, Mastery, the Constellation, the shop, the fight panel) are in the game\'s gothic style: stone frames, forged corners and the same buttons. Every Mastery card has a gothic ground – a pointed-arch niche with columns in the card\'s colour.',
        'The Torment Pass gives Essence too (every 7th level, on the free and the premium rows), and the premium pass gives +1 Pit entry a day for its season. Levels are bought with gems from the price on the next level of the track: 500 for level 1 and 20 more for each after it.',
        'Mastery reworked: it starts at level 1 with 1 point, every level gives one more, up to level 200; the Pit gives +30% Mastery XP. Each card unlocks at its own level (locked ones are grey with a lock and the level needed), and the cost per rank follows the colour: blue 1, purple 5, gold 10, red 35 points. Extra Entry stays through a reset, and taking it back costs 100,000 gems. Points spent so far come back once, to be spent at the new prices.',
        'The Mastery Pass (bought on its own): double Mastery XP in every Trial, forever.',
        'Sweep pays half of your best wave; the Full Sweep card in Mastery raises it to all of it. A slider under the button sweeps several entries at once.',
        'The Pit\'s Shop (top right of its picture): free Essence every day, three more for ads, and Essence packs for real money.',
        'The Pit: every wave is a great horde (the bar at the top right shows how much of it is down). Kill fast and without a break to build a Combo: every 12 kills of it skip one wave (up to 15 at once) when the wave falls. If the combo breaks for 2.5 s, what it built is lost. The top right shows the fight\'s Essence, the wave, the combo with its timer and how many waves you will skip.',
        'The Pit begins with a start screen: the wave you start at and the hazards rolled (tap them to read what they do), and a Ready button. As a fight begins an Arcane Tome can be had for an ad, as in the halls (and one tome for every 10 waves skipped up to the checkpoint). The Pit has a new gothic picture (in the Trials and in its window), in square stone frames with forged corners. The Specialties window keeps one height on every tab, and the branches have their own icons (in the tabs, the rows and the point bars). The Constellation has the Essence Shop and the hero\'s Stats at its bottom right.',
        'The Pit has an arena of its own, as in its picture: a smaller deep pit with high rock walls of columns and ledges with boulders bedded in them, cut by glowing cracks, three falls of running lava into pools of fire under a floating crust, rubble at the foot, chains and iron spikes on the rim, torches, and stones now and then falling from the rim. The foes come down off the walls.',
      ],
    },
    {
      v: '1.61.56',
      bg: [
        'Намерен предмет вече не сменя сам по-силния, който носиш: със същата рядкост се слага само ако е поне на същото ниво (по-рядък предмет се слага както досега).',
        'Поправено: бързите изстрели вече не прескачат враговете при по-нисък брой кадри, а аркебузът уцелва и враг плътно до героя (преди не го уцелваше изобщо).',
        'Разглобяването на реликва връща четвърт от златото, вложено в нивата ѝ, вместо малка част.',
        'Наградата за победа расте с всяка зала: от третата нататък шансът за легендарна реликва се вдига от 7,5% до 15%, а за митична от 0,5% до 2% в седмата.',
        'Всяка следваща зала дава с 10% повече опит за акаунта и за Бойния пропуск.',
        'Реликварият плаща малко по-малко злато (беше двойно повече от Блатото): съкровището на Мимика пада понякога, а множителят на златото е 5,2.',
        'Факлите се възстановяват по една на 12 минути (бяха 6).',
        'Режимът „Убийства“ е премахнат: последният Владетел във всяка зала идва по нейния обичаен начин.',
        'Характеристиките на героя се натискат: всяка показва какво точно прави. Добавени са Многоудар, Опит и шансовете за ефекти (Изгаряне, Искра, Замръзване, Разлагане, Крехкост, Страдание).',
        'Нов лист с характеристики в паузата и в прозореца „Герой“: Атака, Ефекти, Защита и Полезни, в две колони; подобреното спрямо основата е в зелено. В паузата се превърта, а бутоните остават на място.',
        'Бутон „Статистики“ в Оръжейната (Реликви): листът с характеристиките на героя с всичко, което носи.',
        'Бутоните на прозорците стоят закрепени долу и винаги се виждат; дългото съдържание се превърта зад тях.',
        'Тайнственият том вече не дава злато, докато уменията ти могат да се подобряват: подобрява ги и над лимита за нивото ти, без да отнема от подобренията при ниво.',
        'Агонията е по-трудна: враговете получават +35% живот и +15% щети за всеки ранг Агония (бяха +25% и +10%), босовете носят 2,5 пъти живот (бяха 2), а гъстата орда удря с 15% по-слабо (беше 25%).',
        'Рангът на мъчението е по-труден: +13% живот, +3% щети и +2% скорост на враговете за всеки ранг (бяха 11%, 2% и 1,5%). В Олтара обяснението е кратко, а подробностите са зад бутона „i“.',
        'Пламтящата черупка вече пише ясно, че дава Изгаряне.',
        'Повече врагове в първите минути: появяват се почти двойно повече в началото, така че екранът е пълен от първите секунди.',
        'Всяка зала вече е по-трудна от предишната във всяка минута: враговете на залата имат силата на врага, когото заместват (вид, скорост и поведение остават свои), а Катакомбите и Залите на раздора са малко по-силни.',
        'Баланс на уменията след измерване в битка. По-слаби: Пламтящ удар (по-малко горене), Трънлив корен, Сияен ореол (по-бавно презареждане), Драконов огън (по-малко горене), Убийствен риф, Кървав пулс, Присъда, Огнена струя, Блатни растения. По-силни: Дълъг лък, Призрачни игли, Въртящи се чакрами и Градушка.',
        'Звездопад вече започва с един метеор (преди три); всеки Брой добавя още един.',
        'Прозорецът на умение показва истинския шанс за критичен удар: базовият шанс по бонуса от героя, и над 100% (всеки пълни 100% са сигурен крит).',
      ],
      en: [
        'A piece you find no longer replaces a stronger one you wear: of the same rarity it is put on only at the same level or above (a rarer piece is put on as before).',
        'Fixed: fast shots no longer skip over foes at a lower frame rate, and the arquebus hits a foe right next to the hero too (it used to miss it entirely).',
        'Salvaging a relic gives back a quarter of the gold put into its levels, not a small part.',
        'The victory reward grows with every hall: from the third on, the chance of a Legendary relic rises from 7.5% to 15% and of a Mythic from 0.5% to 2% in the seventh.',
        'Each deeper hall gives 10% more account and Battle Pass XP.',
        'The Reliquary pays a little less gold (it paid twice the Blightmire): a Mimic\'s hoard drops now and then, and its gold multiplier is 5.2.',
        'Torches come back one every 12 minutes (was 6).',
        'Kill Mode is removed: each hall\'s final Lord comes in the hall\'s usual way.',
        'The hero\'s stats can be tapped: each shows what it does. Multistrike, XP and the effect chances (Burn, Spark, Frost, Decay, Fragile, Affliction) are now listed.',
        'A new stat sheet in the pause and Character windows: Attack, Effects, Defense and Utility in two columns, with gains over the base in green. In the pause it scrolls and the buttons stay in place.',
        'A Stats button in the Armory (Relics): the hero\'s stat sheet with everything they wear.',
        'Window buttons stay pinned at the bottom and always in view; long content scrolls behind them.',
        'An Arcane Tome no longer gives gold while your abilities can still improve: it upgrades them past your level\'s limit, without taking from your level-up upgrades.',
        'Agony is harder: foes gain +35% health and +15% damage per Agony rank (was +25% and +10%), bosses carry 2.5x health (was 2x), and the denser horde hits 15% softer (was 25%).',
        'The Torment Rank is harder: foes gain +13% health, +3% damage and +2% speed per rank (was 11%, 2% and 1.5%). The Altar gives the short version, with the details behind the "i" button.',
        'The Blazing Shell now says plainly that it gives Burn.',
        'More foes in the first minutes: almost twice as many appear at the start, so the screen is full from the first seconds.',
        'Every hall is now harder than the one before it at every minute: a hall\'s own foes have the strength of the foe they stand in for (their look, pace and way of fighting stay their own), and the Catacombs and the Halls of Discord are a little stronger.',
        'Ability balance after measuring them in fights. Weaker: Searing Smite (less burn), Thornroot, Radiant Halo (slower), Wyrmfire (less burn), Killer Riff, Blood Pulse, Judgment, Flame Jet, Bog Plants. Stronger: Longbow, Ghost Darts, Whirling Chakrams and Hail.',
        'Skyfall now starts with one meteor (it was three); every Amount adds one more.',
        'An ability\'s window shows the true critical chance: the base chance times the hero\'s bonus, past 100% too (every full 100% is a sure crit).',
      ],
    },
    {
      v: '1.61.55',
      bg: [
        'Стрелките към целите извън екрана вече не се крият под джойстика: стрелка под него се плъзга встрани по ръба. Разстоянието стои центрирано под значката (над нея, когато стрелката сочи надолу).',
        'Червеното число на Оръжейната вече брои само екипираните предмети, които можеш да подобриш сега (ниво или сливане). Новите предмети се отбелязват само с червена точка.',
        'Съобщения и подаръци от екипа: те идват в играта с прозорец и се взимат с едно докосване. Новините също се показват веднъж в менюто.',
        'Бутонът „Дневни“ вече се казва „Календар“, а прозорецът – „Календар за вход“.',
        'Кладенецът вече иска повече за пратените предмети и цената расте силно с рядкостта: от 500 злато / 15 диаманта за обикновен до 90 000 злато / 2000 диаманта за митичен.',
      ],
      en: [
        'Arrows to targets off the screen no longer hide under the joystick: one under it slides along the edge. The distance sits centred under the badge (over it when the arrow points down).',
        'The Armory\'s red number now counts only the worn pieces you can improve now (a level or a merge). New pieces show just a red dot.',
        'Messages and gifts from the team now arrive in the game in a window and are taken with one tap; news shows once in the menus.',
        'The Daily button is now called Calendar, and its window Sign-In Calendar.',
        'The Well now asks more for the pieces sent up, and the price climbs steeply with rarity: from 500 gold / 15 gems for a Common to 90,000 gold / 2000 gems for a Mythic.',
      ],
    },
    {
      v: '1.61.54',
      bg: [
        'Лентата на боса вече стои горе точно под уменията, без да ги застъпва (мисията се мести под нея), нарисувана в стила на играта: името отгоре, бронзова рамка с върхове като копие и филигран, и тънка линия кръв.',
        'Докосни иконата на умение (горе в битката или в прозореца за ниво), за да видиш какво прави: щети на удар, презареждане, брой, обхват, щети в секунда и чертите, взети в тази битка.',
        'Нов „Ежедневен вход“ със седмичен и месечен календар: награда за всеки ден, която се взима с докосване, и премиум ред с по-големи награди, отключен с Премиум бойния пропуск. Пропуснат ден остава пропуснат.',
        'Бойният пропуск вече има 60 нива с повече награди, лента с опита до следващото ниво и пътечка по нивата. Премиумът вече включва и без реклами, +20% злато от битки и +25% опит за пропуска; „Какво включва“ показва всичко. След последното ниво всеки 1000 опит носи бонус злато и диаманти, а герой, който вече имаш, се дава като 300 диаманта.',
        'По-добра производителност в големи битки: числата на щетите се рисуват от готови картинки, по-малко частици, екранът не се рисува на повече от двойна плътност, а при спад на кадрите логиката вече не се смята двойно.',
        'Звукът вече не пращи в големи битки: ефектите имат таван на едновременните гласове (тихите дреболии отпадат първи, а честите удари се разреждат), на Android звукът ползва по-голям буфер и по-кратко ехо, а промяната на силата е плавна. В менюто смяната на залата вече спира и дългите ноти на предишната музика (преди звучаха нечути още до 10 секунди и се трупаха), а при бързо прелистване музиката тръгва само за залата, на която спреш.',
        'Поправено: битка, в която в Кладенеца е пратен митичен предмет, вече не остава без награда. Сървърът вече не отхвърля цяла битка заради непознат предмет, а само го пропуска.',
        'Докато си неуязвим (руната-призрак, мигът след съживяване или след падането на Владетеля), нищо не те дърпа, не те задържа и не те забавя: езикът на жабата, корените, лъчът на сифона, разломите и локвите.',
        'Чертите „Призоваване“ и „Залп“ вече се предлагат само ако имаш умение, което има полза от тях.',
        'Два еднакви пръстена вече не могат да се носят заедно: второто място за пръстен не приема пръстен от вид, който вече носиш (може само да го смениш на същото място), и в Оръжейната, и в битка.',
        'Поправено: бутонът „Презавърти“ вече се побира в прозореца за ниво.',
      ],
      en: [
        'The boss bar now sits at the top just under the abilities, never over them (the quest moves down beneath it), drawn in the game\'s own style: the name above, a bronze frame with spear-tip ends and a filigree, and a thin line of blood.',
        'Tap an ability\'s icon (at the top in a fight or in the level-up window) to see what it does: damage per hit, cooldown, amount, area, damage per second and the traits taken this fight.',
        'A new Sign-In with a weekly and a monthly calendar: a reward for every day, taken with a tap, and a premium row with bigger rewards, opened by the Premium Battle Pass. A day missed stays missed.',
        'The Battle Pass now has 60 levels with more rewards, an XP bar to the next level and a track down the levels. Premium now also brings no ads, +20% gold from fights and +25% pass XP; "What it gives" shows it all. Past the last level every 1000 XP brings bonus gold and gems, and a hero you already own comes as 300 gems.',
        'Smoother big fights: damage numbers are drawn from ready-made images, fewer particles, the screen is never drawn above double density, and a slow frame no longer runs the game logic twice.',
        'The sound no longer crackles in big fights: effects have a cap on voices playing at once (quiet details go first, frequent hits are spaced out), on Android the sound uses a larger buffer and a shorter echo, and volume changes glide. In the menu, changing the hall now also stops the long notes of the previous score (they used to ring on unheard for up to 10 seconds and pile up), and when flipping quickly the music starts only for the hall you stop on.',
        'Fixed: a fight in which a Mythic piece was sent down the Well no longer goes unrewarded; the server no longer refuses a whole fight over a piece it does not know, it only leaves that piece out.',
        'While you are invulnerable (the wraith rune, the moment after a revive or after the Lord falls) nothing drags, holds or slows you: the toad\'s tongue, roots, the syphon\'s beam, rifts and puddles.',
        'The Summoner and Volley traits are now offered only when you have an ability they work on.',
        'Two rings of the same kind can no longer be worn together: the other ring slot refuses a ring of a kind you already wear (you can only swap it in the same slot), in the Armory and in a fight.',
        'Fixed: the Reroll button now fits in the level-up window.',
      ],
    },
    {
      v: '1.61.53',
      bg: [
        'Поправено: сцената с ковачницата при сливане понякога показваше само пода и спираше.',
      ],
      en: [
        'Fixed: the forge scene when merging sometimes showed only the floor and stopped.',
      ],
    },
    {
      v: '1.61.52',
      bg: [
        'По-силен ефект при ново ниво: под героя се отваря златен руничен кръг, зад него се разтварят и издигат криле от светлина, със стълб светлина и вълна около него.',
      ],
      en: [
        'A grander level-up: a golden rune circle opens under the hero, wings of light unfold and rise behind them, with a column of light and a ring rolling outward.',
      ],
    },
    {
      v: '1.61.51',
      bg: [
        'Нов враг: скелет-стрелец. От 2-рата минута идват групи стрелци, които стоят на разстояние, обикалят около теб и стрелят със стрели, във всяка зала в нейните цветове.',
        'Отряди: от 3-тата минута на около минута и четвърт нахлува отряд от 10–20 врага в редици от една посока, с предупреждение и стрелка накъде е.',
        'При ново ниво: катинар на всяка карта (заключената остава при „Презавърти“) и бутон „Статистики“.',
        'По-четими щети: ударите по един враг се събират в едно число, критичните са големи и червени, а горенето и отровата са по-дребни.',
      ],
      en: [
        'New foe: the skeleton archer. From the second minute groups of archers keep their distance, circle you and loose arrows, in every hall in its colours.',
        'Squads: from the third minute, about every minute and a quarter, a squad of 10–20 foes marches in ranks from one side, with a warning and an arrow showing where.',
        'On level-up: a lock on every card (a locked one stays through a reroll) and a Stats button.',
        'Clearer damage: hits on one foe add up into one number, crits are big and red, and burns and poisons are smaller.',
      ],
    },
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
