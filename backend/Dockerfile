FROM node:20-alpine AS development

WORKDIR /usr/src/app

# 1. Copia arquivos de dependência e instala
COPY package*.json ./
RUN npm install

# 2. COPIA O ARQUIVO DO PRISMA SCHEMA antes de gerar
# Assume que o schema está em 'backend/prisma/schema.prisma' no seu host
COPY prisma/ ./prisma/ 

# 3. Gera o motor de consulta (Query Engine) para o ambiente Linux
RUN npx prisma generate 

# 4. Copia o restante do código (services, controllers, etc.)
COPY . .

# Comando de inicialização
CMD ["npm", "run", "start:dev"]