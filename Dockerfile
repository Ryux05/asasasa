# Gunakan image Node.js versi terbaru sebagai base image
FROM node:latest

# Set registry dan bersihkan cache npm untuk kecepatan install
RUN npm config set registry https://registry.npmjs.org/ \
    && npm cache clean --force

# Install dependencies yang diperlukan untuk menjalankan Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    apt-transport-https \
    xvfb \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Set variabel lingkungan untuk Chrome Path
ENV CHROME_PATH=/usr/bin/google-chrome

# Tentukan direktori kerja di dalam container
WORKDIR /index

# Copy file package.json dan package-lock.json ke direktori kerja
COPY package*.json ./

# Install dependencies aplikasi
RUN npm install

# Copy semua file aplikasi ke dalam direktori kerja
COPY . .

# Expose port aplikasi (sesuai dengan port yang digunakan di aplikasi Node.js Anda, misalnya 8080)
EXPOSE 8080

# Jalankan Xvfb dan aplikasi Node.js
CMD ["sh", "-c", "Xvfb :99 & npm start"]
