var Localize = require('localize');

const siteName = "مولیران | "

let titles = {
    "menuHome": {
        "en": "Home",
        "fa": "خانه"
    },
    "menuGames": {
        "en": "Games",
        "fa": "بازی‌ها"
    },
    "play": {
        "en": "Play",
        "fa": "شروع بازی"
    },
    "menuPlay": {
        "en": "Play",
        "fa": "شروع بازی"
    },
    "menuLogin": {
        "en": "Login",
        "fa": "ورود"
    },
    "menuRegister": {
        "en": "Register",
        "fa": "نام‌نویسی"
    },
    "winners":{
        "en":"Winners",
        "fa":"برندگان"
    },
    "phone": {
        "en": "Phone",
        "fa": "شماره همراه"
    },
    "submit": {
        "en": "Submit",
        "fa": "بفرست"
    },
    "sendSms": {
        "en": "Send the code",
        "fa": "ارسال پیامک"
    },
    "code": {
        "en": "Code",
        "fa": "رمز پیامک شده"
    },
    "textIsWrong": {
        "en": "Text is wrong!",
        "fa": "رمز را اشتباه وارد کرده‌اید!"
    },
    "profile": {
        "en": "Profile",
        "fa": "اکانت کاربری"
    },
    "menuLogout": {
        "en": "Logout",
        "fa": "خروج"
    },
    "menuProfile": {
        "en": "Profile",
        "fa": "صفحه‌ی من"
    },
    "menuRuls": {
        "en": "rules",
        "fa": "قانون‌ها"
    },
    "menuRecord": {
        "en": "Records",
        "fa": "جدول امتیازها"
    },
    "pickANickname": {
        "en": "You should pick a nickname to continue!",
        "fa": "برای ادامه می‌بایست یک نام مستعار انتخاب کنید!"
    },
    "nickname": {
        "en": "Nickname",
        "fa": "نام مستعار"
    },
    "caller": {
        "en": "caller",
        "fa": "نام مستعار دعوت کننده"
    },
    "gameDot": {
        "en": "Dot game",
        "fa": "نقطه-خط (۲ امتیاز)"
    },
    "gameXOt": {
        "en": "XO game",
        "fa": "دوز ساده (۱ امتیاز)"
    },
    "gameBattleship": {
        "en": "Battle ship",
        "fa": "جنگ کشتی"
    },
    "gameCard": {
        "en": "Card game",
        "fa": "کارت حافظه (۳ امتیاز)"
    },
    "paymentFailed": {
        "en": "Payment failed!",
        "fa": "پرداخت انجام نشد!"
    },
    "dobApiMsg1": {
        "en": "Successful Submit.",
        "fa": "درخواست با موفقیت ثبت شد."
    },
    "dobApiMsg10": {
        "en": "Exception Error!",
        "fa": "خطای سرویس پیامکی داب!"
    },
    "dobApiMsg11": {
        "en": "Invalid IP Address!",
        "fa": "آدرس ip معتبر نیست!"
    },
    "dobApiMsg12": {
        "en": "Invalid MerchantID/User or Password!",
        "fa": "نام‌کاربری و یا رمز ورود سامانه داب اشنباه است!"
    },
    "dobApiMsg13": {
        "en": "Invalid Input!",
        "fa": "شناسه وارد شده معتبر نیست!"
    },
    "dobApiMsg14": {
        "en": "Duplicate ID!",
        "fa": "شناسه تکراری فرستاده شده است!"
    },
    "dobApiMsg15": {
        "en": "Invalid Mobile Number!",
        "fa": "شماره پشتیبانی نمی‌شود!"
    },
    "dobApiMsg16": {
        "en": "Invalid Service!",
        "fa": "سرویس درخواستی معتبر نیست!"
    },
    "dobApiMsg17": {
        "en": "Required parameter missing!",
        "fa": "متغغیرهای مورد نیاز فرستاده نشده‌اند!"
    },
    "dobApiMsg18": {
        "en": "Mobile number reaches maximum subscription limit!",
        "fa": "این خط بیش از این نمیتواند از سرویس داب استفاده کند!"
    },
    "dobApiMsg19": {
        "en": "No permission to send such request type!",
        "fa": "اجازه چنین درخواستی را نداریم!"
    },
    "dobApiMsg20": {
        "en": "Blocked mobile number!",
        "fa": "این شماره مسدود شده است!"
    },
    "dobApiMsg21": {
        "en": "Service is not available for this operator!",
        "fa": "سرویس مورد نظر برای اپراتور وجود ندارد!"
    }
};

// for ( title in titles ) {

//     titles[title].fa =  siteName + titles[title].fa

// }

var localize = new Localize(titles);



localize.setLocale("fa");
localize.throwOnMissingTranslation(false);

module.exports = localize;
