# Menggunakan base image Node.js versi stabil dengan Debian
FROM node:16-buster

# Update paket sistem dan install xvfb
RUN apt-get update && apt-get install -y xvfb

# Set direktori kerja di dalam container
WORKDIR /index

# Copy file package.json dan package-lock.json untuk menginstall dependencies
COPY package*.json ./

# Install dependencies aplikasi (express dan puppeteer-real-browser)
RUN npm install express puppeteer-real-browser

# Copy semua file dari proyek ke dalam direktori kerja
COPY . .

# Expose port aplikasi (sesuaikan dengan port yang digunakan)
EXPOSE 8080

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]
