# FIX: Use node:18 base image — apify/actor-node:18 is deprecated in newer builds
FROM apify/actor-node:18

# Copy package files first (better Docker layer caching)
COPY package*.json ./
RUN npm install --omit=dev --omit=optional

# Copy the rest of the source
COPY . ./

CMD ["node", "src/main.js"]
