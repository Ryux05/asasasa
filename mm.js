/*const { connect } = require("puppeteer-real-browser");

async function mmH(url) {
  try {
    const { browser, page } = await connect({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
      ],
      turnstile: true,
    });

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (
        request.url().includes("workink.click") ||
        request.url().includes("youradexchange.com")
      ) {
        request.abort(); // Memblokir permintaan ke iklan
      } else {
        request.continue();
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded" });
    page.on("popup", async (popup) => {
      console.log("Pop-up muncul, menutupnya...");
      await popup.close();
    });
    await new Promise((r) => setTimeout(r, 10000));

    await page.waitForSelector('button[target="_blank"]');
    await page.click('button[target="_blank"]');

    await new Promise((r) => setTimeout(r, 5000)); // Tunggu 5 detik

    const pages = await browser.pages();
    const newPage = pages[pages.length - 1];
    console.log(`URL Baru: ${newPage.url()}`);

    // Menunggu navigasi dengan penanganan kesalahan
    /*try {
      await newPage.waitForNavigation({
        waitUntil: "networkidle2",
        timeout: 60000,
      });
    } catch (navigationError) {
      console.error(
        "Kesalahan saat menunggu navigasi:",
        navigationError
      );
    }

    const parsedUrl = new URL(newPage.url());
    const r = parsedUrl.searchParams.get("r");

    const linkvertise = decodeURIComponent(r);
    console.log(`Loot-link: ${linkvertise}`);

    const urlResult = Buffer.from(
      linkvertise,
      "base64"
    ).toString("utf-8");
    console.log(`${urlResult}`);

    await newPage.close();
    console.log("Halaman baru berhasil ditutup.");

    await browser.close();
    return urlResult;
  } catch (error) {
    console.error("Kesalahan terjadi:", error);
    return error;
  }
}

module.exports = mmH;
*/

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chromium = require('chrome-aws-lambda');

// Menggunakan plugin stealth untuk menyembunyikan jejak bot
puppeteer.use(StealthPlugin());

async function mmH(url) {
  try {
    // Meluncurkan browser menggunakan chrome-aws-lambda dan puppeteer-extra
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--ignore-certificate-errors',
      ],
      executablePath: await chromium.executablePath || '/usr/bin/chromium-browser',
      headless: false, // Gunakan mode non-headless untuk menghindari deteksi bot
    });

    const page = await browser.newPage();

    // Mengatur User-Agent agar lebih menyerupai browser biasa
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36');

    // Nonaktifkan deteksi WebDriver
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
      });
    });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (
        request.url().includes('workink.click') ||
        request.url().includes('youradexchange.com')
      ) {
        request.abort(); // Memblokir permintaan ke iklan
      } else {
        request.continue();
      }
    });

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    page.on('popup', async (popup) => {
      console.log('Pop-up muncul, menutupnya...');
      await popup.close();
    });

    await new Promise((r) => setTimeout(r, 10000)); // Tunggu 10 detik

    await page.waitForSelector('button[target="_blank"]');
    await page.click('button[target="_blank"]');

    await new Promise((r) => setTimeout(r, 5000)); // Tunggu 5 detik

    const pages = await browser.pages();
    const newPage = pages[pages.length - 1];
    console.log(`URL Baru: ${newPage.url()}`);

    const parsedUrl = new URL(newPage.url());
    const r = parsedUrl.searchParams.get('r');

    const linkvertise = decodeURIComponent(r);
    console.log(`Loot-link: ${linkvertise}`);

    const urlResult = Buffer.from(linkvertise, 'base64').toString('utf-8');
    console.log(`${urlResult}`);

    await newPage.close();
    console.log('Halaman baru berhasil ditutup.');

    await browser.close();
    return urlResult;
  } catch (error) {
    console.error('Kesalahan terjadi:', error);
    return error;
  }
}

module.exports = mmH;
