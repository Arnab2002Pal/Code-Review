FROM node:alpine

WORKDIR /app

# Install required dependencies, including OpenSSL
RUN apk add --no-cache openssl

# Set up the app
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run db:generate
RUN npm run build

EXPOSE 3001 5555
CMD ["npm", "start"]
