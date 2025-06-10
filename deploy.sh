
#!/bin/bash

echo "🚀 Iniciando deploy para Netlify..."

# Build da aplicação
echo "📦 Fazendo build..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Deploy para Netlify
    echo "🌐 Fazendo deploy..."
    netlify deploy --prod --dir=client/dist --functions=netlify/functions
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deploy concluído com sucesso!"
        echo "🌍 Sua aplicação está online!"
    else
        echo "❌ Erro no deploy!"
    fi
else
    echo "❌ Erro no build! Deploy cancelado."
fi
