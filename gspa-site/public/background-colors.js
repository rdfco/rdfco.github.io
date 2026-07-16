
// فقط کدهای رنگ و عددهای brightness را در این فایل تغییر بدهید.
// مقدار اشتباه نادیده گرفته می‌شود تا بک‌گراند WebGL از کار نیفتد.
window.FARA_BACKGROUND_COLORS = {
  sceneBackground: '#000000', // فضای خالی/مشکی پشت صحنه‌های میانی و مدل‌ها
  skyLight: '#000000',       // بخش روشن و پایین آسمان Hero (علامت # الزامی است)
  skyDark: '#000000',        // آسمان مشکی
  stars: '#ffffff',          // ستاره‌ها سفید
  aurora: '#000000',         // هاله آسمان مشکی
  mountain: '#ffffff',       // بافت خود کوه؛ سفید ظاهر اصلی را حفظ می‌کند
  mountainFog: '#000000',    // مه اطراف کوه مشکی
  mountainBackGlow: '#000000', // هاله پشت کوه مشکی
  horizonGlow: '#ffffff',    // نوار نورانی افقی زیر سیلوئت کوه (قسمت مشخص‌شده در تصویر)
  horizonDark: '#000000',    // بخش تیره زیر همان نوار افقی
  risingLines: '#ffffff',    // نورهای عمودی و رو به بالا سفید
  powerLines: '#ffffff',     // پرتوهای باریک متحرک سفید
  pathLines: '#ffffff',      // خطوط مسیر روی زمین سفید
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
    mountainFog: 1,
    mountainBackGlow: 1,
    horizonGlow: 1,
    horizonDark: 1,
    risingLines: 1,
    powerLines: 1,
    pathLines: 1,
    hologram: 1,
    hologramGlow: 1,
    gridBackground: 1,
    gridLines: 1,
    gridAccent: 1,
    gridPoints: 1,
    transition: 1,
  },
};
