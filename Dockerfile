FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source code
COPY server.js ./

EXPOSE 8280
CMD ["npm", "start"]
