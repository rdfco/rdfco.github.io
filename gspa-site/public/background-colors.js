
/* global window */
// فقط کدهای رنگ و عددهای brightness را در این فایل تغییر بدهید.
// مقدار اشتباه نادیده گرفته می‌شود تا بک‌گراند WebGL از کار نیفتد.
window.FARA_BACKGROUND_COLORS = {
  // Hero ــ بدون اسکرول و بدون نگه‌داشتن موس دیده می‌شوند.
  sceneBackground: '#000000',  // فضای خالی پشت کل صحنه WebGL
  skyDark: '#000000',          // بخش بالایی آسمان
  skyLight: '#07100f',         // بخش پایینی آسمان؛ فقط بالای تپه اعمال می‌شود
  stars: '#b4dcc3',            // ستاره‌ها و ذرات آسمان
  fixedHills: '#000000',       // سیلوئت تپه ثابت پشت هاله و خطوط
  mountainBackGlow: '#19c6a3', // هاله زمردی مرکزی پشت تپه
  horizonGlow: '#55a078',      // روشنایی و سایه داخل سطح تپه
  risingLines: '#37b478',      // نوارهای انرژی رو به بالا
  powerLines: '#37b478',       // پرتوهای باریک متحرک
  pathLines: '#000000',        // خطوط کشیده روی زمین
  terrainBase: '#020605',      // رنگ مستقل پایین تپه و زمین؛ از skyLight/skyDark تأثیر نمی‌گیرد

  // بخش‌های پایین‌تر سایت ــ برای دیدن تغییر باید اسکرول کنید.
  mountain: '#000000',         // بافت مدل سه‌بعدی کوه در فصل‌های دیگر
  hologram: '#000000',         // بدنه مدل‌های سیمی
  hologramGlow: '#000000',     // هاله مدل‌های سیمی
  gridBackground: '#000000',   // سطح زیر شبکه
  gridLines: '#000000',        // خط‌های شبکه مربعی
  gridAccent: '#000000',       // تقاطع‌ها و خانه‌های تأکیدی
  gridPoints: '#000000',       // نقاط نورانی شبکه

  // روشنایی مستقل هر بخش: 1 = عادی، 0.5 = نصف، 2 = دو برابر
  brightness: {
    skyLight: 1,
    skyDark: 1,
    stars: 2,
    mountain: 1,
    fixedHills: 1,
    mountainBackGlow: 1.4,
    horizonGlow: 1,
    risingLines: 1.6,
    powerLines: 1.6,
    pathLines: 1.3,
    terrainBase: 1,
    hologram: 1,
    hologramGlow: 1,
    gridBackground: 1,
    gridLines: 1,
    gridAccent: 1,
    gridPoints: 1,
  },
};
