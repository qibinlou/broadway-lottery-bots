const puppeteer = require('puppeteer');

const UNAVAILAIBLE_MESSAGE = 'there are no available drawings at this time';

function getPropertyOrDefault(key, defaultValue) {
    return process.env[key] || defaultValue;
}

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

(async () => {
    const browser = await puppeteer.launch({headless: false});
    let page = await browser.newPage();
    await page.goto('https://my.socialtoaster.com/st/campaign_landing/?key=dearevanhansenlottery&source=iframe', {waitUntil: 'networkidle2'});
    page.click('#st_sign_in');
    await page.waitFor(2000);
    await page.click('#st_campaign_social_media_button_long_facebook');

    await page.waitFor(2000);

    let pages = await browser.pages();
    const fbLoginPage = pages[pages.length - 1];
    await fbLogin(fbLoginPage);

    await page.waitFor(2000);
    const content = await page.$eval('#st_campaign_content', el => el.innerText);
    if (isLotteryAvailaible(content)) {
        console.warn('Lottery is not available!');
        return;
    }

    const lotteryButtons = await page.$$('.lottery_show_button .st_campaign_button');
    if (!lotteryButtons || lotteryButtons.length === 0) {
        console.log('You may already checked in for the lottery today!');
        return;
    }
    for (let button of lotteryButtons) {
        button.click();
    }
    console.log('Successfully checked in for today\'s lottery');

    await browser.close();
})();