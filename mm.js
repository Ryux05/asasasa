const { connect } = require("puppeteer-real-browser");

async function mmH(url) {
  try {
    const { browser, page } = await connect({
      headless: false,
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

    await new Promise((resolve) => setTimeout(resolve, 10000));

    const button = await page.$('button[target="_blank"]');
    if (button) {
      await page.click('button[target="_blank"]');
      console.log('Tombol diklik.');
    } else {
      console.log('Tombol tidak ditemukan.');
      await browser.close();
      return null; // Kembali jika tombol tidak ditemukan
    }

    await new Promise((resolve) => setTimeout(resolve, 5000)); // Tunggu 5 detik

    const pages = await browser.pages();
    const newPage = pages[pages.length - 1];
    console.log(`URL Baru: ${newPage.url()}`);

    const parsedUrl = new URL(newPage.url());
    const r = parsedUrl.searchParams.get("r");

    if (!r) {
      console.log('Parameter r tidak ditemukan di URL baru.');
      await newPage.close();
      await browser.close();
      return null; // Kembali jika r tidak ditemukan
    }

    const linkvertise = decodeURIComponent(r);
    console.log(`Loot-link: ${linkvertise}`);

    let urlResult;
    try {
      urlResult = Buffer.from(linkvertise, "base64").toString("utf-8");
      console.log(`Decoded URL: ${urlResult}`);
    } catch (decodeError) {
      console.error('Error saat mendekode Base64:', decodeError);
      await newPage.close();
      await browser.close();
      return null; // Kembali jika ada kesalahan saat decoding
    }

    await newPage.close();
    console.log("Halaman baru berhasil ditutup.");

    await browser.close();
    return urlResult;
  } catch (error) {
    console.error("Kesalahan terjadi:", error);
    return null; // Kembali null jika terjadi kesalahan
  }
}

module.exports = mmH;
