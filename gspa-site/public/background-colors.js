
/* global window */
// فقط کدهای رنگ و عددهای brightness را در این فایل تغییر بدهید.
// مقدار اشتباه نادیده گرفته می‌شود تا بک‌گراند WebGL از کار نیفتد.
window.FARA_BACKGROUND_COLORS = {
  // Hero ــ بدون اسکرول و بدون نگه‌داشتن موس دیده می‌شوند.
  sceneBackground: '#000000',  // فضای خالی پشت کل صحنه WebGL
  skyDark: '#000000',          // بخش بالایی آسمان
  skyLight: '#000000',         // بخش پایینی آسمان
  stars: '#00ff66',            // ستاره‌ها و ذرات آسمان
  fixedHills: '#ff4fd8',       // سیلوئت تپه ثابت پشت هاله و خطوط
  mountainBackGlow: '#ffffff', // هاله بزرگ مرکزی پشت تپه
  horizonGlow: '#000000',      // روشنایی و سایه داخل سطح تپه
  risingLines: '#00ff66',      // نوارهای انرژی رو به بالا
  powerLines: '#00ff66',       // پرتوهای باریک متحرک
  pathLines: '#00ff66',        // خطوط کشیده روی زمین

  // بخش‌های پایین‌تر سایت ــ برای دیدن تغییر باید اسکرول کنید.
  mountain: '#777777',         // بافت مدل سه‌بعدی کوه در فصل‌های دیگر
  hologram: '#ffffff',         // بدنه مدل‌های سیمی
  hologramGlow: '#ffffff',     // هاله مدل‌های سیمی
  gridBackground: '#000000',   // سطح زیر شبکه
  gridLines: '#ffffff',        // خط‌های شبکه مربعی
  gridAccent: '#ffffff',       // تقاطع‌ها و خانه‌های تأکیدی
  gridPoints: '#ffffff',       // نقاط نورانی شبکه

  // روشنایی مستقل هر بخش: 1 = عادی، 0.5 = نصف، 2 = دو برابر
  brightness: {
    skyLight: 1,
    skyDark: 1,
    stars: 2,
    mountain: 1,
    fixedHills: 1,
    mountainBackGlow: 3,
    horizonGlow: 1,
    risingLines: 1.6,
    powerLines: 1.6,
    pathLines: 1.3,
    hologram: 1,
    hologramGlow: 1,
    gridBackground: 1,
    gridLines: 1,
    gridAccent: 1,
    gridPoints: 1,
  },
};
