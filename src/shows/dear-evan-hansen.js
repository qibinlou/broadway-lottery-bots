const puppeteer = require('puppeteer');
const getPropertyOrDefault = require('../utils/getPropertyOrDefault');
const TelegramMessenger = require('../messenger/TelegramMessenger');

const UNAVAILAIBLE_MESSAGE = 'there are no available drawings at this time';

async function fbLogin(fbLoginPage) {
    await fbLoginPage.type('input#email', getPropertyOrDefault('FB_USERNAME'));
    await fbLoginPage.type('input#pass', getPropertyOrDefault('FB_PASSWORD'));
    await fbLoginPage.click('#loginbutton');

    await fbLoginPage.waitFor(2000);
    fbLoginPage.click('button[type=submit]');
}

function isLotteryAvailaible(content) {
    return content.includes(UNAVAILAIBLE_MESSAGE);
}

function logAndNotify(message) {
    console.log(message);
    TelegramMessenger.sendMessage(message);
}

(async () => {
    const browser = await puppeteer.launch({
        headless: getPropertyOrDefault('HEADLESS') === 'true',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    let page = await browser.newPage();

    logAndNotify('Ready to start for dear-evan-hansen!');

    await page.goto('https://my.socialtoaster.com/st/campaign_landing/?key=dearevanhansenlottery&source=iframe', {waitUntil: 'networkidle2'});
    page.click('#st_sign_in');
    await page.waitFor(2000);
    await page.click('#st_campaign_social_media_button_long_facebook');

    await page.waitFor(2000);

    let pages = await browser.pages();
    const fbLoginPage = pages[pages.length - 1];
    await fbLogin(fbLoginPage);

    await page.waitFor(2000);

    logAndNotify('Successfully login with FB account.');

    const content = await page.$eval('#st_campaign_content', el => el.innerText);
    if (isLotteryAvailaible(content)) {
        logAndNotify('Lottery is not available!');
        await browser.close();
        return;
    }

    const lotteryButtons = await page.$$('.lottery_show_button .st_campaign_button');
    if (!lotteryButtons || lotteryButtons.length === 0) {
        logAndNotify('You may already checked in for the lottery today!');
        await browser.close();
        return;
    }
    for (let button of lotteryButtons) {
        button.click();
        await page.waitFor(1000);
    }
    logAndNotify('Successfully checked in for today\'s lottery');

    await browser.close();
})();