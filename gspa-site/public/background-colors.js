
/* global window */
// فقط کدهای رنگ و عددهای brightness را در این فایل تغییر بدهید.
// مقدار اشتباه نادیده گرفته می‌شود تا بک‌گراند WebGL از کار نیفتد.
window.FARA_BACKGROUND_COLORS = {
  sceneBackground: '#000000', // فضای خالی/مشکی پشت صحنه‌های میانی و مدل‌ها
  skyLight: '#000000',       // بخش روشن و پایین آسمان Hero (علامت # الزامی است)
  skyDark: '#000000',        // آسمان مشکی
  stars: '#00ff66',          // ستاره‌ها سبز
  aurora: '#000000',         // هاله آسمان مشکی
  mountain: '#777777',       // بافت مدل سه‌بعدی کوه در بخش‌های دیگر سایت
  fixedHills: '#ff4fd8',     // سیلوئت تپه ثابت Hero؛ مستقل از هاله، افق و نگه‌داشتن موس
  mountainFog: '#000000',    // مه اطراف کوه مشکی
  mountainBackGlow: '#ffffff', // هاله سفید و پرنور وسط، پشت کوه و خطوط
  horizonGlow: '#000000',    // نوار افقی زیر سیلوئت مشکی
  horizonDark: '#000000',    // بخش تیره زیر همان نوار افقی
  risingLines: '#00ff66',    // نورهای عمودی و رو به بالا سبز
  powerLines: '#00ff66',     // پرتوهای باریک متحرک سبز
  pathLines: '#00ff66',      // امتداد و انعکاس خطوط انرژی سبز
  hologram: '#ffffff',       // مدل‌های سیمی و شکل‌ها سفید
  hologramGlow: '#ffffff',   // هاله مدل‌ها سفید
  gridBackground: '#000000', // سطح/هاله زیر شبکه؛ مشکی، بدون حذف خطوط شبکه
  gridLines: '#ffffff',      // تمام خط‌های شبکه مربعی سفید
  gridAccent: '#ffffff',     // تقاطع‌ها و خانه‌های تأکیدی شبکه سفید
  gridPoints: '#ffffff',     // نقاط نورانی روی شبکه سفید
  transition: '#000000',     // موج جابه‌جایی مشکی

  // روشنایی مستقل هر بخش: 1 = عادی، 0.5 = نصف، 2 = دو برابر
  brightness: {
    sceneBackground: 1,
    skyLight: 1,
    skyDark: 1,
    stars: 2,
    aurora: 1,
    mountain: 1,
    fixedHills: 1,
    mountainFog: 1,
    mountainBackGlow: 3,
    horizonGlow: 1,
    horizonDark: 1,
    risingLines: 1.6,
    powerLines: 1.6,
    pathLines: 1.3,
    hologram: 1,
    hologramGlow: 1,
    gridBackground: 1,
    gridLines: 1,
    gridAccent: 1,
    gridPoints: 1,
    transition: 1,
  },
};
