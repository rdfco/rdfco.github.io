
/* global window */
// فقط کدهای رنگ و عددهای brightness را در این فایل تغییر بدهید.
// مقدار اشتباه نادیده گرفته می‌شود تا بک‌گراند WebGL از کار نیفتد.
window.FARA_BACKGROUND_COLORS = {
  // Hero ــ بدون اسکرول و بدون نگه‌داشتن موس دیده می‌شوند.
  sceneBackground: '#000000',  // فضای خالی پشت کل صحنه WebGL
  skyDark: '#000000',          // بخش بالایی آسمان
  skyLight: '#37b478',         // بخش پایینی آسمان؛ فقط بالای تپه اعمال می‌شود
  stars: '#b4dcc3',            // ستاره‌ها و ذرات آسمان
  fixedHills: '#000000',       // سیلوئت تپه ثابت پشت هاله و خطوط
  mountainBackGlow: '#37b478', // هاله زمردی مرکزی پشت تپه
  horizonGlow: '#37b478',      // روشنایی و سایه داخل سطح تپه
  risingLines: '#37b478',      // نوارهای انرژی رو به بالا
  powerLines: '#37b478',       // پرتوهای باریک متحرک
  pathLines: '#ffffff',        // خطوط کشیده روی زمین
  terrainBase: '#000000',      // رنگ مستقل پایین تپه و زمین؛ از skyLight/skyDark تأثیر نمی‌گیرد

  // بخش‌های پایین‌تر سایت ــ برای دیدن تغییر باید اسکرول کنید.
  mountain: '#000000',         // بافت مدل سه‌بعدی کوه در فصل‌های دیگر
  hologram: '#37b478',         // بدنه مدل‌های سیمی
  hologramGlow: '#37b478',     // هاله مدل‌های سیمی
  gridBackground: '#000000',   // سطح زیر شبکه
  gridLines: '#ffffff',        // خط‌های شبکه مربعی
  gridAccent: '#ffffff',       // تقاطع‌ها و خانه‌های تأکیدی
  gridPoints: '#ffffff',       // نقاط نورانی شبکه

  // روشنایی مستقل هر بخش: 1 = عادی، 0.5 = نصف، 2 = دو برابر
  brightness: {
    skyLight: 0.5,
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
