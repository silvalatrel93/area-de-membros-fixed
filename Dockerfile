FROM node:20-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Build da aplicação
RUN npm run build

# Expor porta
EXPOSE 5000

# Comando para iniciar
CMD ["npm", "start"]