/* =====================================================================================
 * MC.course — программа курса: части, уроки, их метаданные. Источник истины для главной
 * страницы (программа, поиск, прогресс), каркаса урока (шапка, цели, соседние уроки)
 * и ИИ-ассистента (какой урок читает ученик и что в нём должно получиться).
 *
 * Урок со status: 'ready' лежит в lessons/lesson_X_Y/index.html; 'soon' — в планах.
 * Порядок уроков — порядок в массиве parts[].lessons.
 * ===================================================================================== */
(function (root) {
  'use strict';
  const MC = root.MC || (root.MC = {});

  const parts = [
    {
      id: 'I', title: 'Числа и функции',
      summary: 'Язык, на котором написано всё остальное: числа, множества, функции и их графики.',
      lessons: [
        { id: '1.1', title: 'Числа и множества', summary: 'Натуральные, целые, рациональные и действительные числа; интервалы и окрестности.', minutes: 25, level: 1 },
        { id: '1.2', title: 'Функция', summary: 'Правило, которое каждому входу ставит ровно один выход. Область определения, график.', minutes: 30, level: 1 },
        { id: '1.3', title: 'Преобразования графиков', summary: 'Сдвиги, растяжения и отражения: как формула меняет картинку.', minutes: 30, level: 1 },
        { id: '1.4', title: 'Показательная функция и логарифм', summary: 'Рост с постоянной скоростью в процентах, число e и обратная к нему операция.', minutes: 35, level: 1 },
      ],
    },
    {
      id: 'II', title: 'Анализ: изменение',
      summary: 'Как измерить скорость изменения в одной точке — и почему на этом держится обучение моделей.',
      lessons: [
        { id: '2.1', title: 'Предел', summary: 'К чему стремится величина, если подходить к точке всё ближе. Определение «эпсилон — дельта».', minutes: 40, level: 2 },
        {
          id: '2.2', status: 'ready', title: 'Производная', short: 'Производная',
          subtitle: 'Мгновенная скорость изменения: от секущей к касательной',
          summary: 'Наклон секущей, предел при h → 0, касательная, производная как новая функция и линейное приближение.',
          minutes: 40, level: 2,
          objectives: [
            'объяснить производную как предел наклона секущих и как наклон касательной',
            'вычислить производную по определению для $x^2$, $x^3$ и $1/x$',
            'пользоваться таблицей производных и линейным приближением $f(x_0+h) \\approx f(x_0) + f\'(x_0)\\,h$',
            'отличить непрерывную функцию от дифференцируемой на примере $|x|$',
          ],
          keywords: ['производная', 'касательная', 'секущая', 'предел', 'дифференцируемость', 'линейное приближение', 'derivative'],
        },
        { id: '2.3', title: 'Правила дифференцирования', summary: 'Сумма, произведение, частное: как собирать производные из готовых кусков.', minutes: 35, level: 2 },
        { id: '2.4', title: 'Цепное правило', summary: 'Производная сложной функции — сердце обратного распространения ошибки.', minutes: 40, level: 2 },
        { id: '2.5', title: 'Ряд Тейлора', summary: 'Как многочлен притворяется синусом: приближение функции в окрестности точки.', minutes: 45, level: 3 },
      ],
    },
    {
      id: 'III', title: 'Линейная алгебра',
      summary: 'Векторы и матрицы: как модели хранят данные и как преобразуют пространство.',
      lessons: [
        { id: '3.1', title: 'Векторы', summary: 'Стрелка, список чисел и точка пространства одновременно. Сумма, умножение на число, длина.', minutes: 35, level: 1 },
        {
          id: '3.2', status: 'ready', title: 'Матрица как преобразование', short: 'Матрица',
          subtitle: 'Четыре числа, которые двигают всю плоскость',
          summary: 'Линейное отображение, столбцы как образы базисных векторов, умножение матрицы на вектор и определитель как коэффициент площади.',
          minutes: 45, level: 2,
          objectives: [
            'понимать матрицу $2\\times 2$ как преобразование плоскости и читать её по столбцам',
            'умножать матрицу на вектор двумя способами — по столбцам и по строкам',
            'узнавать поворот, растяжение, сдвиг, отражение и проекцию по их матрицам',
            'объяснить определитель как коэффициент изменения площади и смысл $\\det A = 0$',
          ],
          keywords: ['матрица', 'вектор', 'линейное преобразование', 'определитель', 'базис', 'поворот', 'matrix', 'determinant'],
        },
        { id: '3.3', title: 'Умножение матриц', summary: 'Композиция преобразований — и почему AB ≠ BA.', minutes: 40, level: 2 },
        { id: '3.4', title: 'Определитель и обратная матрица', summary: 'Когда преобразование можно отменить и как это сделать.', minutes: 40, level: 2 },
        { id: '3.5', title: 'Собственные векторы', summary: 'Направления, которые преобразование только растягивает. Основа PCA.', minutes: 45, level: 3 },
      ],
    },
    {
      id: 'IV', title: 'Интеграл',
      summary: 'Накопление: площадь под кривой, сумма бесконечно малых и связь с производной.',
      lessons: [
        { id: '4.1', title: 'Площадь под кривой', summary: 'Суммы Римана: делим на полоски и уменьшаем их ширину.', minutes: 40, level: 2 },
        { id: '4.2', title: 'Формула Ньютона — Лейбница', summary: 'Почему интеграл и производная — две стороны одной монеты.', minutes: 40, level: 2 },
      ],
    },
    {
      id: 'V', title: 'Вероятность и статистика',
      summary: 'Язык неопределённости: откуда берутся функции потерь и почему модели «верят» данным.',
      lessons: [
        { id: '5.1', title: 'Вероятность', summary: 'События, частоты и аксиомы Колмогорова; условная вероятность и формула Байеса.', minutes: 40, level: 2 },
        { id: '5.2', title: 'Случайная величина', summary: 'Распределение, математическое ожидание и дисперсия.', minutes: 40, level: 2 },
        { id: '5.3', title: 'Нормальное распределение', summary: 'Колокол Гаусса и центральная предельная теорема.', minutes: 40, level: 2 },
        { id: '5.4', title: 'Правдоподобие', summary: 'Метод максимального правдоподобия: откуда берутся MSE и log-loss.', minutes: 45, level: 3 },
      ],
    },
    {
      id: 'VI', title: 'Оптимизация',
      summary: 'Как найти минимум функции, которую нельзя нарисовать: градиент, шаг и сходимость.',
      lessons: [
        {
          id: '6.1', status: 'ready', title: 'Градиент и градиентный спуск', short: 'Градиентный спуск',
          subtitle: 'Спуск с горы в тумане: шаг против градиента',
          summary: 'Шаг градиентного спуска в одномерном случае, частные производные, градиент как направление наискорейшего роста и выбор темпа обучения.',
          minutes: 50, level: 2,
          objectives: [
            'записать и объяснить шаг $x_{t+1} = x_t - \\eta\\, f\'(x_t)$',
            'вычислять частные производные и градиент функции двух переменных',
            'доказать, что градиент — направление наискорейшего роста',
            'предсказать по темпу обучения $\\eta$, сойдётся спуск, будет колебаться или разойдётся',
          ],
          keywords: ['градиент', 'градиентный спуск', 'частная производная', 'темп обучения', 'learning rate', 'линии уровня', 'минимум', 'gradient descent'],
        },
        { id: '6.2', title: 'Выпуклость', summary: 'Функции с единственным минимумом и почему с ними так легко.', minutes: 40, level: 3 },
        { id: '6.3', title: 'Стохастический спуск', summary: 'Шаг по случайной пачке данных: шумно, но быстро.', minutes: 40, level: 3 },
        { id: '6.4', title: 'Метод Ньютона', summary: 'Шаг с учётом кривизны: вторая производная и гессиан.', minutes: 45, level: 4 },
      ],
    },
    {
      id: 'VII', title: 'Алгебра по Куликову',
      summary: 'Разбор учебника Л. Я. Куликова «Алгебра и теория чисел»: отношения, операции и алгебры — строго, с доказательствами и десятками примеров.',
      lessons: [
        { id: '7.1', title: 'Отношение эквивалентности и фактор-множество', summary: 'Рефлексивность, симметричность, транзитивность; классы a/R и разбиение множества на них.', minutes: 40, level: 2 },
        { id: '7.2', title: 'Бинарные операции', summary: 'Операция как отображение A × A → A; коммутативность, ассоциативность, нейтральный и симметричный элементы.', minutes: 40, level: 2 },
        {
          id: '7.3', status: 'ready', title: 'Конгруэнция', short: 'Конгруэнция',
          subtitle: 'Когда операцию можно перенести с элементов на их классы: Куликов, гл. 3, § 1, теорема 1.9',
          summary: 'Отношение эквивалентности, согласованное с операцией; теорема 1.9 об ассоциированной операции на фактор-множестве, обратная теорема, критерий и 81 пример — от часов и контрольных цифр до криптографии и метрик в ML.',
          minutes: 70, level: 3,
          objectives: [
            'проверять, является ли эквивалентность $R$ конгруэнцией относительно операции $\\top$, и строить контрпример, если нет',
            'доказать теорему 1.9: для конгруэнции равенство $(a/R) \\top^* (b/R) = (a \\top b)/R$ корректно задаёт операцию на $A/R$, — и обратное утверждение',
            'строить таблицы ассоциированных операций: вычеты по модулю $n$, правило знаков, длины слов, дроби',
            'узнавать конгруэнции в жизни и технике: часы и календарь, контрольные цифры, хеши, криптография, слияние статистик в машинном обучении',
          ],
          keywords: ['конгруэнция', 'куликов', 'фактор-множество', 'класс эквивалентности', 'бинарная операция', 'ассоциированная операция', 'фактор-операция', 'сравнение по модулю', 'вычеты', 'теорема 1.9', 'congruence', 'quotient'],
        },
        { id: '7.4', title: 'Гомоморфизмы и фактор-алгебры', summary: 'Отображения, сохраняющие операции; ядро гомоморфизма — конгруэнция, и наоборот.', minutes: 45, level: 3 },
      ],
    },
  ];

  /* ---------------------------------------------------------------------------------
   * Переводы программы. Русский текст — выше, в parts; здесь — английский и узбекский
   * (латиница). На странице с <html lang="en|uz"> поля частей и уроков подменяются
   * переводом; тест course.test.js проверяет, что переведено всё.
   * --------------------------------------------------------------------------------- */
  const TR = {
    en: {
      course: { title: 'Math, bone by bone', subtitle: 'Mathematics for machine learning — from numbers to the gradient' },
      parts: {
        I: { title: 'Numbers and functions', summary: 'The language everything else is written in: numbers, sets, functions and their graphs.' },
        II: { title: 'Calculus: change', summary: 'How to measure the rate of change at a single point — and why training models rests on it.' },
        III: { title: 'Linear algebra', summary: 'Vectors and matrices: how models store data and how they transform space.' },
        IV: { title: 'The integral', summary: 'Accumulation: the area under a curve, a sum of infinitely small pieces and the link to the derivative.' },
        V: { title: 'Probability and statistics', summary: 'The language of uncertainty: where loss functions come from and why models “trust” data.' },
        VI: { title: 'Optimization', summary: 'How to find the minimum of a function you cannot draw: the gradient, the step and convergence.' },
        VII: { title: 'Algebra after Kulikov', summary: 'A walkthrough of L. Ya. Kulikov’s textbook “Algebra and Number Theory”: relations, operations and algebras — rigorously, with proofs and dozens of examples.' },
      },
      lessons: {
        '1.1': { title: 'Numbers and sets', summary: 'Natural, integer, rational and real numbers; intervals and neighborhoods.' },
        '1.2': { title: 'Functions', summary: 'A rule that assigns exactly one output to every input. Domain and graph.' },
        '1.3': { title: 'Transforming graphs', summary: 'Shifts, stretches and reflections: how the formula changes the picture.' },
        '1.4': { title: 'The exponential function and the logarithm', summary: 'Growth at a constant percentage rate, the number e and the operation that undoes it.' },
        '2.1': { title: 'Limits', summary: 'What a quantity approaches as we get ever closer to a point. The epsilon–delta definition.' },
        '2.2': {
          title: 'The derivative', short: 'Derivative',
          subtitle: 'The instantaneous rate of change: from the secant to the tangent',
          summary: 'The slope of a secant, the limit as h → 0, the tangent line, the derivative as a new function and linear approximation.',
          objectives: [
            'explain the derivative as the limit of secant slopes and as the slope of the tangent line',
            'compute the derivative from the definition for $x^2$, $x^3$ and $1/x$',
            'use the table of derivatives and the linear approximation $f(x_0+h) \\approx f(x_0) + f\'(x_0)\\,h$',
            'tell a continuous function from a differentiable one using $|x|$ as the example',
          ],
          keywords: ['derivative', 'tangent', 'secant', 'limit', 'differentiability', 'linear approximation'],
        },
        '2.3': { title: 'Differentiation rules', summary: 'Sum, product, quotient: assembling derivatives from ready-made pieces.' },
        '2.4': { title: 'The chain rule', summary: 'The derivative of a composite function — the heart of backpropagation.' },
        '2.5': { title: 'Taylor series', summary: 'How a polynomial impersonates a sine: approximating a function near a point.' },
        '3.1': { title: 'Vectors', summary: 'An arrow, a list of numbers and a point in space all at once. Addition, scaling, length.' },
        '3.2': {
          title: 'The matrix as a transformation', short: 'Matrix',
          subtitle: 'Four numbers that move the whole plane',
          summary: 'Linear maps, columns as images of the basis vectors, matrix–vector multiplication and the determinant as the area factor.',
          objectives: [
            'see a $2\\times 2$ matrix as a transformation of the plane and read it column by column',
            'multiply a matrix by a vector in two ways — by columns and by rows',
            'recognize a rotation, a stretch, a shear, a reflection and a projection by their matrices',
            'explain the determinant as the factor by which area changes, and what $\\det A = 0$ means',
          ],
          keywords: ['matrix', 'vector', 'linear transformation', 'determinant', 'basis', 'rotation'],
        },
        '3.3': { title: 'Matrix multiplication', summary: 'Composition of transformations — and why AB ≠ BA.' },
        '3.4': { title: 'The determinant and the inverse matrix', summary: 'When a transformation can be undone, and how to undo it.' },
        '3.5': { title: 'Eigenvectors', summary: 'Directions that a transformation only stretches. The foundation of PCA.' },
        '4.1': { title: 'The area under a curve', summary: 'Riemann sums: cut into strips and make them ever thinner.' },
        '4.2': { title: 'The Newton–Leibniz formula', summary: 'Why the integral and the derivative are two sides of the same coin.' },
        '5.1': { title: 'Probability', summary: 'Events, frequencies and Kolmogorov’s axioms; conditional probability and Bayes’ formula.' },
        '5.2': { title: 'Random variables', summary: 'Distribution, expected value and variance.' },
        '5.3': { title: 'The normal distribution', summary: 'The Gaussian bell curve and the central limit theorem.' },
        '5.4': { title: 'Likelihood', summary: 'Maximum likelihood estimation: where MSE and log-loss come from.' },
        '6.1': {
          title: 'The gradient and gradient descent', short: 'Gradient descent',
          subtitle: 'Walking down a mountain in fog: a step against the gradient',
          summary: 'The gradient-descent step in one dimension, partial derivatives, the gradient as the direction of steepest ascent and choosing the learning rate.',
          objectives: [
            'write down and explain the step $x_{t+1} = x_t - \\eta\\, f\'(x_t)$',
            'compute partial derivatives and the gradient of a function of two variables',
            'prove that the gradient is the direction of steepest ascent',
            'predict from the learning rate $\\eta$ whether descent converges, oscillates or diverges',
          ],
          keywords: ['gradient', 'gradient descent', 'partial derivative', 'learning rate', 'level curves', 'minimum'],
        },
        '6.2': { title: 'Convexity', summary: 'Functions with a single minimum, and why they are so easy.' },
        '6.3': { title: 'Stochastic gradient descent', summary: 'A step on a random mini-batch of data: noisy, but fast.' },
        '6.4': { title: 'Newton’s method', summary: 'A step that accounts for curvature: the second derivative and the Hessian.' },
        '7.1': { title: 'Equivalence relations and quotient sets', summary: 'Reflexivity, symmetry, transitivity; the classes a/R and the partition of a set into them.' },
        '7.2': { title: 'Binary operations', summary: 'An operation as a map A × A → A; commutativity, associativity, neutral and symmetric elements.' },
        '7.3': {
          title: 'Congruence', short: 'Congruence',
          subtitle: 'When an operation can be carried over from elements to their classes: Kulikov, ch. 3, § 1, Theorem 1.9',
          summary: 'An equivalence relation compatible with an operation; Theorem 1.9 on the associated operation on the quotient set, its converse, a criterion and 81 examples — from clocks and check digits to cryptography and ML metrics.',
          objectives: [
            'check whether an equivalence $R$ is a congruence with respect to an operation $\\top$, and build a counterexample if it is not',
            'prove Theorem 1.9: for a congruence, $(a/R) \\top^* (b/R) = (a \\top b)/R$ well-defines an operation on $A/R$ — and the converse',
            'build tables of associated operations: residues modulo $n$, the rule of signs, word lengths, fractions',
            'recognize congruences in everyday life and technology: clocks and calendars, check digits, hashes, cryptography, merging statistics in machine learning',
          ],
          keywords: ['congruence', 'kulikov', 'quotient set', 'equivalence class', 'binary operation', 'associated operation', 'quotient operation', 'congruent modulo', 'residues', 'theorem 1.9'],
        },
        '7.4': { title: 'Homomorphisms and quotient algebras', summary: 'Maps that preserve operations; the kernel of a homomorphism is a congruence, and vice versa.' },
      },
    },
    uz: {
      course: { title: 'Matematika: mayda detallarigacha', subtitle: 'Mashinaviy o‘qitish uchun matematika — sondan gradiyentgacha' },
      parts: {
        I: { title: 'Sonlar va funksiyalar', summary: 'Qolgan hamma narsa yozilgan til: sonlar, to‘plamlar, funksiyalar va ularning grafiklari.' },
        II: { title: 'Analiz: o‘zgarish', summary: 'Bitta nuqtadagi o‘zgarish tezligini qanday o‘lchash mumkin — va modellarni o‘qitish nega aynan shunga tayanadi.' },
        III: { title: 'Chiziqli algebra', summary: 'Vektorlar va matritsalar: modellar ma’lumotni qanday saqlaydi va fazoni qanday almashtiradi.' },
        IV: { title: 'Integral', summary: 'To‘planish: egri chiziq ostidagi yuza, cheksiz kichik bo‘laklar yig‘indisi va hosila bilan bog‘liqlik.' },
        V: { title: 'Ehtimollar nazariyasi va statistika', summary: 'Noaniqlik tili: yo‘qotish funksiyalari qayerdan kelib chiqadi va modellar nega ma’lumotlarga «ishonadi».' },
        VI: { title: 'Optimallashtirish', summary: 'Chizib bo‘lmaydigan funksiyaning minimumini qanday topish mumkin: gradiyent, qadam va yaqinlashish.' },
        VII: { title: 'Kulikov bo‘yicha algebra', summary: 'L. Ya. Kulikovning «Algebra va sonlar nazariyasi» darsligi tahlili: munosabatlar, amallar va algebralar — qat’iy, isbotlar va o‘nlab misollar bilan.' },
      },
      lessons: {
        '1.1': { title: 'Sonlar va to‘plamlar', summary: 'Natural, butun, ratsional va haqiqiy sonlar; intervallar va atroflar.' },
        '1.2': { title: 'Funksiya', summary: 'Har bir kirishga aynan bitta chiqishni mos qo‘yuvchi qoida. Aniqlanish sohasi, grafik.' },
        '1.3': { title: 'Grafiklarni almashtirish', summary: 'Siljitish, cho‘zish va aks ettirish: formula rasmni qanday o‘zgartiradi.' },
        '1.4': { title: 'Ko‘rsatkichli funksiya va logarifm', summary: 'O‘zgarmas foiz tezligidagi o‘sish, e soni va unga teskari amal.' },
        '2.1': { title: 'Limit', summary: 'Nuqtaga tobora yaqinlashganda kattalik nimaga intiladi. «Epsilon — delta» ta’rifi.' },
        '2.2': {
          title: 'Hosila', short: 'Hosila',
          subtitle: 'Oniy o‘zgarish tezligi: kesuvchidan urinmaga',
          summary: 'Kesuvchining qiyaligi, h → 0 dagi limit, urinma, hosila yangi funksiya sifatida va chiziqli yaqinlashtirish.',
          objectives: [
            'hosilani kesuvchilar qiyaligining limiti va urinmaning qiyaligi sifatida tushuntirish',
            '$x^2$, $x^3$ va $1/x$ uchun hosilani ta’rif bo‘yicha hisoblash',
            'hosilalar jadvali va $f(x_0+h) \\approx f(x_0) + f\'(x_0)\\,h$ chiziqli yaqinlashtirishdan foydalanish',
            '$|x|$ misolida uzluksiz funksiyani differensiallanuvchi funksiyadan ajrata olish',
          ],
          keywords: ['hosila', 'urinma', 'kesuvchi', 'limit', 'differensiallanuvchanlik', 'chiziqli yaqinlashtirish', 'derivative'],
        },
        '2.3': { title: 'Differensiallash qoidalari', summary: 'Yig‘indi, ko‘paytma, bo‘linma: hosilalarni tayyor bo‘laklardan yig‘ish.' },
        '2.4': { title: 'Zanjir qoidasi', summary: 'Murakkab funksiyaning hosilasi — xatoni teskari tarqatishning yuragi.' },
        '2.5': { title: 'Teylor qatori', summary: 'Ko‘phad o‘zini qanday qilib sinusdek tutadi: funksiyani nuqta atrofida yaqinlashtirish.' },
        '3.1': { title: 'Vektorlar', summary: 'Bir vaqtning o‘zida strelka, sonlar ro‘yxati va fazodagi nuqta. Yig‘indi, songa ko‘paytirish, uzunlik.' },
        '3.2': {
          title: 'Matritsa almashtirish sifatida', short: 'Matritsa',
          subtitle: 'Butun tekislikni harakatlantiradigan to‘rtta son',
          summary: 'Chiziqli akslantirish, ustunlar — bazis vektorlarining tasvirlari, matritsani vektorga ko‘paytirish va determinant — yuza koeffitsienti.',
          objectives: [
            '$2\\times 2$ matritsani tekislikni almashtirish sifatida tushunish va uni ustunlar bo‘yicha o‘qish',
            'matritsani vektorga ikki usulda — ustunlar va satrlar bo‘yicha — ko‘paytirish',
            'burish, cho‘zish, siljitish, aks ettirish va proyeksiyani ularning matritsalaridan tanib olish',
            'determinantni yuzaning o‘zgarish koeffitsienti sifatida va $\\det A = 0$ ning ma’nosini tushuntirish',
          ],
          keywords: ['matritsa', 'vektor', 'chiziqli almashtirish', 'determinant', 'bazis', 'burish', 'matrix'],
        },
        '3.3': { title: 'Matritsalarni ko‘paytirish', summary: 'Almashtirishlar kompozitsiyasi — va nega AB ≠ BA.' },
        '3.4': { title: 'Determinant va teskari matritsa', summary: 'Almashtirishni qachon bekor qilish mumkin va buni qanday qilish kerak.' },
        '3.5': { title: 'Xos vektorlar', summary: 'Almashtirish faqat cho‘zadigan yo‘nalishlar. PCA ning asosi.' },
        '4.1': { title: 'Egri chiziq ostidagi yuza', summary: 'Riman yig‘indilari: yo‘laklarga bo‘lamiz va ularni toraytirib boramiz.' },
        '4.2': { title: 'Nyuton — Leybnits formulasi', summary: 'Nega integral va hosila bir tanganing ikki tomoni.' },
        '5.1': { title: 'Ehtimollik', summary: 'Hodisalar, chastotalar va Kolmogorov aksiomalari; shartli ehtimollik va Bayes formulasi.' },
        '5.2': { title: 'Tasodifiy miqdor', summary: 'Taqsimot, matematik kutilma va dispersiya.' },
        '5.3': { title: 'Normal taqsimot', summary: 'Gauss qo‘ng‘irog‘i va markaziy limit teoremasi.' },
        '5.4': { title: 'Haqiqatga o‘xshashlik', summary: 'Maksimal haqiqatga o‘xshashlik usuli: MSE va log-loss qayerdan kelib chiqadi.' },
        '6.1': {
          title: 'Gradiyent va gradiyent tushish', short: 'Gradiyent tushish',
          subtitle: 'Tumanda tog‘dan tushish: gradiyentga qarshi qadam',
          summary: 'Bir o‘lchovli holda gradiyent tushish qadami, xususiy hosilalar, gradiyent — eng tez o‘sish yo‘nalishi va o‘rganish tezligini tanlash.',
          objectives: [
            '$x_{t+1} = x_t - \\eta\\, f\'(x_t)$ qadamini yozish va tushuntirish',
            'ikki o‘zgaruvchili funksiyaning xususiy hosilalari va gradiyentini hisoblash',
            'gradiyent eng tez o‘sish yo‘nalishi ekanini isbotlash',
            'o‘rganish tezligi $\\eta$ bo‘yicha tushish yaqinlashadimi, tebranadimi yoki uzoqlashadimi — oldindan aytish',
          ],
          keywords: ['gradiyent', 'gradiyent tushish', 'xususiy hosila', 'o‘rganish tezligi', 'learning rate', 'sath chiziqlari', 'minimum', 'gradient descent'],
        },
        '6.2': { title: 'Qavariqlik', summary: 'Yagona minimumli funksiyalar va ular bilan ishlash nega shunchalik oson.' },
        '6.3': { title: 'Stoxastik gradiyent tushish', summary: 'Tasodifiy ma’lumotlar to‘plamchasi bo‘yicha qadam: shovqinli, lekin tez.' },
        '6.4': { title: 'Nyuton usuli', summary: 'Egrilikni hisobga oluvchi qadam: ikkinchi hosila va gessian.' },
        '7.1': { title: 'Ekvivalentlik munosabati va faktor-to‘plam', summary: 'Refleksivlik, simmetriklik, tranzitivlik; a/R sinflar va to‘plamni ularga bo‘laklash.' },
        '7.2': { title: 'Binar amallar', summary: 'Amal A × A → A akslantirish sifatida; kommutativlik, assotsiativlik, neytral va simmetrik elementlar.' },
        '7.3': {
          title: 'Kongruensiya', short: 'Kongruensiya',
          subtitle: 'Amalni qachon elementlardan ularning sinflariga ko‘chirish mumkin: Kulikov, 3-bob, 1-§, 1.9-teorema',
          summary: 'Amal bilan moslashgan ekvivalentlik munosabati; faktor-to‘plamdagi assotsiatsiyalangan amal haqidagi 1.9-teorema, teskari teorema, alomat va 81 ta misol — soat va nazorat raqamlaridan kriptografiya va ML metrikalarigacha.',
          objectives: [
            '$R$ ekvivalentlik $\\top$ amalga nisbatan kongruensiya ekanini tekshirish, agar bunday bo‘lmasa — kontrmisol tuzish',
            '1.9-teoremani isbotlash: kongruensiya uchun $(a/R) \\top^* (b/R) = (a \\top b)/R$ tenglik $A/R$ da amalni to‘g‘ri aniqlaydi — va teskari tasdiqni',
            'assotsiatsiyalangan amallar jadvallarini tuzish: $n$ modul bo‘yicha chegirmalar, ishoralar qoidasi, so‘zlar uzunligi, kasrlar',
            'hayotda va texnikada kongruensiyalarni tanib olish: soat va kalendar, nazorat raqamlari, xeshlar, kriptografiya, mashinaviy o‘qitishda statistikalarni birlashtirish',
          ],
          keywords: ['kongruensiya', 'kulikov', 'faktor-to‘plam', 'ekvivalentlik sinfi', 'binar amal', 'assotsiatsiyalangan amal', 'faktor-amal', 'modul bo‘yicha taqqoslama', 'chegirmalar', '1.9-teorema', 'congruence'],
        },
        '7.4': { title: 'Gomomorfizmlar va faktor-algebralar', summary: 'Amallarni saqlovchi akslantirishlar; gomomorfizm yadrosi — kongruensiya va aksincha.' },
      },
    },
  };
  const LANG = MC.lang || 'ru';
  const tr = TR[LANG] || null;

  const lessons = [];
  for (const p of parts) {
    if (tr && tr.parts[p.id]) Object.assign(p, tr.parts[p.id]);
    for (const l of p.lessons) {
      if (tr && tr.lessons[l.id]) Object.assign(l, tr.lessons[l.id]);
      l.part = p.id;
      l.status = l.status || 'soon';
      l.folder = 'lesson_' + l.id.replace('.', '_');
      lessons.push(l);
    }
  }
  const byId = (id) => lessons.find((l) => l.id === id) || null;
  const langPrefix = (lang) => {
    const L = lang || MC.lang || 'ru';
    return L === 'ru' ? '' : L + '/';
  };
  const ready = () => lessons.filter((l) => l.status === 'ready');

  MC.course = {
    title: tr ? tr.course.title : 'Математика по косточкам',
    subtitle: tr ? tr.course.subtitle : 'Математика для машинного обучения — от числа до градиента',
    author: 'Javharbek Abdulatipov',
    links: {
      blog: 'https://javharbek.uz/' + LANG + '/',
      boosting: 'https://jakharbek.github.io/ml_gradient_boosting/',
      repo: 'https://github.com/jakharbek/math_lessons',
    },
    parts,
    lessons,
    /** Переводы программы (для тестов полноты; на странице уже применены). */
    translations: TR,
    byId,
    ready,
    part: (id) => parts.find((p) => p.id === id) || null,
    /** Ссылка на урок относительно корня курса; lang — язык страницы урока (по умолчанию — текущий). */
    href: (id, rootPath = '', lang) => rootPath + langPrefix(lang) + 'lessons/' + byId(id).folder + '/index.html',
    /** Главная страница языка относительно корня курса. */
    home: (rootPath = '', lang) => rootPath + langPrefix(lang) + 'index.html',
    /** Соседние готовые уроки: {prev, next}. */
    neighbours(id) {
      const list = ready();
      const i = list.findIndex((l) => l.id === id);
      return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null };
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
