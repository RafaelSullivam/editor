// Debug script para testar o problema de export
console.log('=== DEBUG SCRIPT ===');

// Função para testar o estado atual
function debugCurrentState() {
  console.log('Estado atual');
  
  // Tentar acessar o store via React
  try {
    const appElement = document.querySelector('#root');
    if (appElement) {
      console.log('App element encontrado');
    }
  } catch (e) {
    console.error('Erro ao acessar elementos:', e);
  }
}

// Executar debug inicial
debugCurrentState();

// Disponibilizar funções globalmente
window.debugCurrentState = debugCurrentState;

console.log('Debug script carregado. Execute debugCurrentState() no console.');
