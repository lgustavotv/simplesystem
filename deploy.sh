#!/bin/bash

echo "🎄 Bingo Natalício 2025 - Deploy Script 🎄"
echo ""
echo "Instalando dependências..."
npm install

echo ""
echo "Fazendo deploy no Vercel..."
npx vercel --prod

echo ""
echo "✅ Deploy concluído!"
echo "🎉 Seu site está no ar!"
