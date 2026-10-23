/**
 * Gera uma folha de orientações em letra grande para imprimir e entregar ao paciente.
 * Abre uma janela própria para impressão, sem depender dos estilos da aplicação.
 */
function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderList(items, ordered = false) {
  if (!Array.isArray(items) || items.length === 0) return '';
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</${tag}>`;
}

export function printLargeSheet(data) {
  if (!data) return false;

  const {
    tipoDocumento,
    resumoSimples,
    acoesEssenciais = [],
    pontosDeAtencao = [],
    sinaisDeAlerta = [],
    detalhesReceita,
    alertaEtico
  } = data;

  const medicamentos = (detalhesReceita?.medicamentosIdentificados || []).map(
    (med) => `${med.nome} ${med.dosagem}: ${med.instrucao}`
  );

  const hoje = new Date().toLocaleDateString('pt-BR');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>${escapeHtml(tipoDocumento)}</title>
<style>
  @page { margin: 16mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 20pt; line-height: 1.45; color: #000; margin: 0; }
  h1 { font-size: 28pt; margin: 0 0 6pt; }
  h2 { font-size: 22pt; margin: 18pt 0 6pt; border-bottom: 2pt solid #000; padding-bottom: 3pt; }
  p, li { margin: 0 0 8pt; }
  ol, ul { padding-left: 28pt; margin: 0; }
  .data { font-size: 14pt; color: #333; }
  .alerta { border: 3pt solid #000; padding: 8pt 14pt; margin-top: 18pt; }
  .alerta h2 { border: 0; margin-top: 4pt; }
  .rodape { font-size: 12pt; color: #333; margin-top: 24pt; border-top: 1pt solid #999; padding-top: 6pt; }
  .anotacoes { margin-top: 18pt; }
  .linha { border-bottom: 1pt solid #666; height: 30pt; }
</style>
</head>
<body>
  <h1>${escapeHtml(tipoDocumento)}</h1>
  <p class="data">Entregue em: ${hoje}</p>
  <p>${escapeHtml(resumoSimples)}</p>
  ${acoesEssenciais.length ? `<h2>O que fazer</h2>${renderList(acoesEssenciais, true)}` : ''}
  ${medicamentos.length ? `<h2>Remédios</h2>${renderList(medicamentos)}` : ''}
  ${pontosDeAtencao.length ? `<h2>Atenção</h2>${renderList(pontosDeAtencao)}` : ''}
  ${sinaisDeAlerta.length ? `<div class="alerta"><h2>Procure atendimento se acontecer</h2>${renderList(sinaisDeAlerta)}<p><strong>Emergência: ligue 192 (SAMU)</strong></p></div>` : ''}
  <div class="anotacoes">
    <h2>Anotações do profissional</h2>
    <div class="linha"></div><div class="linha"></div><div class="linha"></div>
  </div>
  <p class="rodape">${escapeHtml(alertaEtico || 'Em caso de dúvida, fale com o profissional que atendeu você.')}<br>
  Folha gerada pelo Tradutor Cidadão (projeto de extensão). Não substitui a orientação do médico ou do dentista.</p>
  <script>window.onload = function () { window.focus(); window.print(); };</script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return false;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
}
