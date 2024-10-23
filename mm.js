const { connect } = require("puppeteer-real-browser");

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

    await new Promise((resolve) => setTimeout(resolve, 9000));
    const startTime = performance.now();
    // Tunggu hingga tombol muncul
    const button = await page.$('button[target="_blank"]');

    if (button) {
      await button.click('button[target="_blank"]');
      console.log('Tombol diklik.');
      // Tunggu beberapa detik untuk memastikan halaman baru terbuka
      await new Promise((resolve) => setTimeout(resolve, 8000));
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
      return { result: null, time_taken: null } // Mengembalikan jika r tidak ditemukan
    }   

    const linkvertise = decodeURIComponent(r);
    console.log(`Loot-link: ${linkvertise}`);

    let urlResult;
    try {
      urlResult = Buffer.from(linkvertise, "base64").toString("utf-8");
      console.log(`Decoded URL: ${urlResult}`);
    } catch (decodeError) {
      console.error('Error saat mendekode Base64:', decodeError);
      return { result: null, time_taken: null } // Mengembalikan jika ada kesalahan saat decoding
    }

    await newPage.close();
    console.log("Halaman baru berhasil ditutup.");

    const endTime = performance.now();
    const timeTaken = endTime - startTime; // Calculate the time taken
    console.log(`Time taken: ${timeTaken.toFixed(2)} ms`); // Log the time taken

    return { result: urlResult, time_taken: timeTaken };
  } catch (error) {
    console.error("Kesalahan terjadi:", error);
    return { result: null, time_taken: null } // Mengembalikan null jika terjadi kesalahan
  } finally {
    // Pastikan browser ditutup jika belum ditutup
    if (browser) {
      await browser.close(); // Menutup browser
    }
  }
}

module.exports = mmH;
