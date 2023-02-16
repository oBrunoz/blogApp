const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');

//Model de user
require('../models/User');
const User = mongoose.model('user');

module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        User.findOne({ email: email }).then((user) => {
            if(!user){
                return done(null, false, { message: 'Essa conta não existe!' });
            }

            bcrypt.compare(senha, user.senha, (error, batem) => {
                if(batem){
                    return done(null, user);
                }else{
                    return done(null, false, { message: 'Senha incorreta!' });
                }
            })
        })
    })
)}

passport.serializeUser((user, done) => { //A serialização transforma um objeto de usuário em uma chave (no caso, o user.id) que é armazenada na sessão do usuário. 
    done(null, user.id);
})

passport.deserializeUser((id, done) => { //A desserialização busca o usuário na sessão com base na chave armazenada, e o retorna ao Passport.
    User.findById(id, (err, user) => {
        done(err, user);
    })
})