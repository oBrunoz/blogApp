const http = require('http');

http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });

    if(req === "/card"){
        res.end(JSON.stringify({
            message: "Rota card rodandO!"
        }))
    }

    if(req === "/buy"){
        res.end(JSON.stringify({
            message: "Rota buy rodando!"
        }))
    }

    res.end(JSON.stringify({
        message: "Qualquer outra rota",
    }))
}).listen(8080, () => console.log("Servidor rodando na porta 8080"));