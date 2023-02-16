const prompt = require('prompt-sync');
const Prompt = prompt();

var notas = [100.00, 50.00, 20.00, 10.00, 5.00, 2.00];
var coins = [1, 0.50, 0.25, 0.10, 0.05, 0.01];
var result, qtd;

var value = parseFloat(Prompt());

console.log('NOTAS:\n');
for(var i=0; i < length.notas[i]; i++)
{
    qtd = value/notas[i];
    value %= notas[i];

    console.log(`${qtd} nota(s) de R$ ${notas[i]}`);
}