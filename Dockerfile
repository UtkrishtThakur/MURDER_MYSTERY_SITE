# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install

# Copy rest of the app
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]