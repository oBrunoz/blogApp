require('./models/Post');
require('./models/Categoria');
const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const handlebars = require('express-handlebars');
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
//const { config } = require("process");
const session = require('express-session');
const flash = require('connect-flash');
const Post = mongoose.model('postagens');
const Categoria = mongoose.model('categorias');
const moment = require('moment');
const usuarios = require('./routes/user');
const passport = require('passport');
require('./config/auth')(passport);
const db = require('./config/db');

//Config:
//Session
app.use(
    session({
        secret: 'secret@',
        resave: true,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());


app.use(flash());

//Middleware
app.use((req, res, next) => {
    res.locals.successMsg = req.flash('successMsg');
    res.locals.errorMsg = req.flash('errorMsg');
    res.locals.err = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//Template Engine
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

//BodyParser
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

//Mongoose
mongoose.set('strictQuery', true);
const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
        console.log(`Conectado ao Mongo!`);
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
}

//public
app.use(express.static(path.join(__dirname, 'public')));

//Route

app.get('/', (req, res) => {
    Post.find().lean()
    .populate('categoria')
    .sort({ date: 'desc' })
    .then((post) => {
        res.render('index', { postagens: post });
    }).catch((err) => {
        req.flash('errorMsg', 'Houve um erro!');
        res.redirect('/404');
    });
})

app.get('/posts/:slug', (req, res) => {
    Post.findOne({ slug: req.params.slug }).lean()
    .then((post) => {
        if(post){
            res.render('posts/index', {
                titulo: post.titulo,
                conteudo: post.conteudo,
                date: moment(post.date).format('DD/MM/YYYY hh:mm')
            });
        }else{
            req.flash('errorMsg', 'Essa postagem não existe!');
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash('errorMsg', 'Houve um erro!');
        res.redirect('/');
    })
});

app.get('/categorias', (req, res) => {
    Categoria.find().lean()
    .then((categorias) => {
        res.render('categorias/index', {categorias: categorias});
    }).catch((err) => {
        req.flash('errorMsg', 'Houve um erro!');
        res.redirect('/');
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean()
    .then((categorias) => {
        if(categorias){
            Post.find({ categoria: categorias._id }).lean()
            .then((postagens) => {
                res.render('categorias/posts', { postagens: postagens, categorias: categorias});
            }).catch((err) => {
                req.flash('errorMsg', 'Houve um erro ao listar as postagens!');
                res.redirect('/');
            })
        }else{
            req.flash('errorMsg', 'Essa categoria não existe!');
            res.redirect('/');
        }
    }).catch((err) => {
        req.flash('errorMsg', 'Houve um erro ao carregar a página de Categoria!');
        res.redirect('/');
    })
})

app.use(('/404'), (req, res) => {
    res.status(404).send('404: Page not found!')
})

app.use('/admin', admin);
app.use('/users', usuarios);

const PORT = process.env.PORT || 8081
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log('Servidor rodando na url http://localhost:8081');
    });
})
