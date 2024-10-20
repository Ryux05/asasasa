const { connect } = require("puppeteer-real-browser");

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
    }**/

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
    throw new Error(
      "Terjadi kesalahan saat melakukan scraping."
    );
  }
}

module.exports = mmH;
