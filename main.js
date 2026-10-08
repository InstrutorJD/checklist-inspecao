const itens = [
  { nome: 'Freios', critico: true, conforme: true },
  { nome: 'Limpeza', critico: true, conforme: false },
]
for (const item of itens) {
  console.log(item.nome + ': ' + item.conforme)
}
function avaliarInspecao(itens) {
  let resultado = 'APTO'
  // ...confere cada item...
  return resultado
}
console.log(avaliarInspecao(itens))
function avaliarInspecao(itens) {
  for (const item of itens) {
    if (item.critico && item.conforme === false) {
      return 'INAPTO'
    }
  }
  return 'APTO'
}
const botao = document.querySelector('#finalizar')
const saida = document.querySelector('#resultado')

botao.addEventListener('click', () => {
  saida.textContent = avaliarInspecao(itens)
})


