const chromium = require('chrome-aws-lambda');
const { connect } = require('puppeteer-real-browser');

async function mmH(url) {
  let browser;
  try {
    browser = await chromium.puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: await chromium.executablePath,
      headless: false, // Set to true if you want headless mode
      ignoreDefaultArgs: ['--disable-extensions'],
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
      turnstile: true,
    });

    const page = await browser.newPage();

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        request.url().includes("workink.click") ||
        request.url().includes("youradexchange.com")
      ) {
        request.abort(); // Block ad requests
      } else {
        request.continue();
      }
    });

    await page.goto(url, { waitUntil: "networkidle2" });
    page.on("popup", async (popup) => {
      console.log("Popup appeared, closing it...");
      await popup.close();
    });

    await new Promise((r) => setTimeout(r, 10000)); // Wait for 10 seconds

    await page.waitForSelector('button[target="_blank"]');
    await page.click('button[target="_blank"]');

    await new Promise((r) => setTimeout(r, 5000)); // Wait for 5 seconds

    const pages = await browser.pages();
    const newPage = pages[pages.length - 1];
    console.log(`New URL: ${newPage.url()}`);

    const parsedUrl = new URL(newPage.url());
    const r = parsedUrl.searchParams.get("r");

    const linkvertise = decodeURIComponent(r);
    console.log(`Loot-link: ${linkvertise}`);

    const urlResult = Buffer.from(linkvertise, "base64").toString("utf-8");
    console.log(`${urlResult}`);

    await newPage.close();
    console.log("New page successfully closed.");

    return urlResult;
    browser.close();
  } catch (error) {
    console.error("An error occurred:", error);
    throw new Error("An error occurred while scraping.");
  } 
}

module.exports = mmH;
