const { connect } = require("puppeteer-real-browser");
const cheerio = require("cheerio");

async function mmH(url) {
  try {
    ({ browser, page } = await connect({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--ignore-certificate-errors",
      ],
      turnstile: true,
    }));

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().includes("workink.click") || request.url().includes("youradexchange.com")) {
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

    // Tunggu hingga tombol muncul
    const button = await page.$('button[target="_blank"]');

    if (button) {
      await button.click();
      console.log('Tombol diklik.');
    } else {
      console.log('Tombol tidak ditemukan. Mengambil konten halaman langsung...');
      function textReady(text){
        return `There is already a key, please check the URL ${text}`
      }
      
      await browser.close();
      const hh = page.url();
      return textReady(hh)
    }

    const pages = await browser.pages();
    const newPage = pages[pages.length - 1];
    console.log(`URL Baru: ${newPage.url()}`);

    const parsedUrl = new URL(newPage.url());
    const r = parsedUrl.searchParams.get("r");

    if (!r) {
      console.log('Parameter r tidak ditemukan di URL baru.');
      return null; // Mengembalikan jika r tidak ditemukan
    }   

    const linkvertise = decodeURIComponent(r);
    console.log(`Loot-link: ${linkvertise}`);

    let urlResult;
    try {
      urlResult = Buffer.from(linkvertise, "base64").toString("utf-8");
      console.log(`Decoded URL: ${urlResult}`);
    } catch (decodeError) {
      console.error('Error saat mendekode Base64:', decodeError);
      return null; // Mengembalikan jika ada kesalahan saat decoding
    }

    await newPage.close();
    console.log("Halaman baru berhasil ditutup.");

    return urlResult;
  } catch (error) {
    console.error("Kesalahan terjadi:", error);
    return null; // Mengembalikan null jika terjadi kesalahan
  } finally {
    // Pastikan browser ditutup jika belum ditutup
    if (browser) {
      await browser.close(); // Menutup browser
    }
  }
}

module.exports = mmH;
