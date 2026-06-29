function cleanQuery(rawDescription, maxWords = 10) {
  if (!rawDescription || typeof rawDescription !== 'string') {
    return { cleaned: "", keywords: [] };
  }

  // 1. Remove acentos e joga para minúsculo
  let text = rawDescription.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  // 2. A MÁGICA: "Cola" números com suas medidas se estiverem separados por espaço
  // Ex: "50 mm" vira "50mm" / "5 ml" vira "5ml"
  text = text.replace(/(\d+)\s+(mm|cm|m|ml|l|mg|g|kg|v|w|un|pc|cx)\b/gi, '$1$2');

  // 3. Troca pontuações por espaço em branco
  text = text.replace(/[.,:;()\/\\-]/g, ' ');

  // 4. Separa as palavras (o \s+ garante que espaços múltiplos não quebrem a lógica)
  let words = text.split(/\s+/).filter(Boolean);

  // Lista negra de palavras inúteis de licitação
  const stopwords = new Set([
    'conforme', 'nbr', 'abnt', 'iso', 'norma', 'embalagem', 'caixa',
    'unidade', 'unidades', 'pacote', 'pacotes', 'rolo', 'rolos',
    'material', 'composicao', 'fabricacao', 'tipo', 'modelo', 'marca',
    'cor', 'carga', 'sextavado', 'processo', 'registro', 'item',
    'anvisa', 'inmetro', 'certificado', 'aprovado', 'homologado',
    'minimo', 'minima', 'maximo', 'maxima', 'aproximadamente',
    'medindo', 'medidas', 'dimensoes', 'caracteristicas', 'tecnica',
    'com', 'para', 'por', 'entre', 'cada', 'ou', 'e', 'de', 'do',
    'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma',
    'uns', 'umas', 'a', 'o', 'as', 'os', 'que', 'ao', 'aos', 
    'composta', 'permite', 'deve', 'junto', 'fabricante', 'amostra', 'declaracao'
  ]);

  const keywords = [];

  for (let w of words) {
    if (stopwords.has(w)) continue;

    const isPureNumber = /^\d+$/.test(w);
    const hasNumber = /\d/.test(w); // Palavra que tem número e letra misturado (ex: 50mm, 3d)

    if (isPureNumber) {
      // Se for número puro, SÓ MANTÉM se for curto (tamanhos de 1 a 4 dígitos como 10, 45, 50).
      // Descarta códigos gigantes (ex: 15236, 2024001).
      if (w.length <= 4) {
        keywords.push(w);
      }
    } else if (hasNumber) {
      // Palavra contém número colado com letra (ex: 50mm) -> é medida, guarda!
      keywords.push(w);
    } else if (w.length > 2) {
      // Palavra normal de texto (ex: placa, bolsa, colostomia)
      keywords.push(w);
    }
  }

  // Remove palavras duplicadas e corta no limite que definimos
  const finalKeywords = [...new Set(keywords)].slice(0, maxWords);

  return {
    cleaned: finalKeywords.join(' '), // O espaço aqui garante que as palavras não colem!
    keywords: finalKeywords
  };
}

module.exports = { cleanQuery };