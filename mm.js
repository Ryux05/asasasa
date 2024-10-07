const chromium = require('chrome-aws-lambda');
const { connect } = require('puppeteer-real-browser');

async function mmH(url) {
  let browser;
  try {
    browser = await chromium.puppeteer.launch({
      args: [...chromium.args, "--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: await chromium.executablePath,
      headless: true, // Diatur ke true untuk deployment di Vercel
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
        request.abort(); // Memblokir permintaan iklan
      } else {
        request.continue();
      }
    });

    // Meningkatkan timeout untuk pemuatan halaman
    await page.goto(url, { waitUntil: "domcontentloaded" });

    page.on("popup", async (popup) => {
      console.log("Popup muncul, menutupnya...");
      await popup.close();
    });

    await page.waitForTimeout(10000); // Tunggu selama 10 detik

    await page.waitForSelector('button[target="_blank"]');
    await page.click('button[target="_blank"]');

    await page.waitForTimeout(5000); // Tunggu selama 5 detik

    const pages = await browser.pages();
    const newPage = pages[pages.length - 1];
    console.log(`URL Baru: ${newPage.url()}`);

    const parsedUrl = new URL(newPage.url());
    const r = parsedUrl.searchParams.get("r");

    const linkvertise = decodeURIComponent(r);
    console.log(`Loot-link: ${linkvertise}`);

    const urlResult = Buffer.from(linkvertise, "base64").toString("utf-8");
    console.log(`${urlResult}`);

    await newPage.close();
    console.log("Halaman baru berhasil ditutup.");

    return urlResult;
    
  } catch (error) {
     console.error("Terjadi kesalahan:", error.message); // Menampilkan pesan kesalahan yang lebih spesifik
    console.error(error.stack);
    throw new Error("Terjadi kesalahan saat melakukan scraping.");
  } finally {
    if (browser) {
      await browser.close(); // Pastikan browser ditutup
    }
  }
}

module.exports = mmH;
