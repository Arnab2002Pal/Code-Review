FROM node:20

WORKDIR /app

# Install required dependencies, including OpenSSL
RUN apt-get update && apt-get install -y \
    openssl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set up the app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run db:generate
RUN npm run build

EXPOSE 3001 5555
CMD ["npm", "start"]
