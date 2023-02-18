if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://alencarbdev:Alencar@21@blogapp-prod.6bufnl0.mongodb.net/?retryWrites=true&w=majority"}
}else{
    module.exports = {mongoURI: "mongodb://127.0.0.1/blogapp"}
}