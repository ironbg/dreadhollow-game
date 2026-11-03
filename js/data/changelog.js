/* What changed, as the players read it in the "What's new" window after an update (newest first).
 * One entry per release that players should hear about; small fixes can wait for the next one. */
(function (DH) {
  'use strict';
  DH.changelog = [
    {
      v: '1.61.57',
      bg: [
        'Всички характеристики на реликвите (и бонусите на нивата им) са четири пъти по-малки: с рядкостта и нивата един предмет стигаше до +96% скорост на атака, +268% Многоудар, +339% критични щети или +230% огнени щети. Специалните ефекти на реликвите, чертите, уменията и благословиите дават колкото досега.',
        'Всяка екипирана реликва в Оръжейната показва червена значка с броя нива, с които можеш да я вдигнеш сега.',
      ],
      en: [
        'Every stat on relics (and their level bonuses) is a quarter of what it was: with rarity and levels one piece reached +96% attack speed, +268% Multistrike, +339% crit damage or +230% fire damage. Relic specials, traits, abilities and blessings give as much as before.',
        'Every worn relic in the Armory shows a red badge with how many levels you can raise it right now.',
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
