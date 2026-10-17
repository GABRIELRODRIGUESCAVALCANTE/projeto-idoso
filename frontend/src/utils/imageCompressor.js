/**
 * Utilitário de compressão acessível de imagens no cliente (Canvas API nativa)
 * Reduz fotos de alta resolução de smartphones (ex: 4000x3000 de 5-10MB)
 * para um tamanho balanceado (~1600-1920px, ~300-500KB) preservando 100%
 * da legibilidade de textos, códigos de barra e caligrafias de receitas.
 */

export async function compressImageIfNeeded(file, maxDimension = 1920, quality = 0.85) {
  if (!file) return file;

  // PDFs não passam por compressão de imagem via canvas
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return file;
  }

  // Se o arquivo já for leve (menor que 700KB), não precisa recomprimir
  if (file.size < 700 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Redimensionamento proporcional mantendo a proporção exata
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback seguro se canvas 2d falhar
        }

        // Desenha a imagem redimensionada com suavização
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file); // Mantém o original se a compressão não reduzir o tamanho
            }

            // Cria um novo File mantendo o nome do arquivo com extensão .jpg
            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });

            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => resolve(file); // Fallback caso ocorra erro ao decodificar imagem
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
