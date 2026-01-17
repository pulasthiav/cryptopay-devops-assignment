# 1. පාවිච්චි කරන Node version එක
FROM node:18-alpine

# 2. Container එක ඇතුලේ project එක තියෙන තැන
WORKDIR /app


COPY package*.json ./


RUN npm install


COPY . .


EXPOSE 3001


CMD ["npm", "start"]