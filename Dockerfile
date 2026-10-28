FROM node:20-alpine
WORKDIR /app
COPY app/package.json ./
COPY app/ .
ENV PORT=3000
ENV DATA_DIR=/app/data
EXPOSE 3000
CMD ["node", "server.js"]
