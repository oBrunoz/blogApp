require('../models/User');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('user');
const bcrypt = require('bcryptjs');
const passport = require('passport');

router.get('/registro', (req, res) => {
    res.render('users/registro');
})

router.post('/registro', (req, res) => {

    const { nome, email, senha, senha2 } = req.body;
    const errors = [];
  
    if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
      errors.push({ texto: 'Por favor, insira seu nome.' });
    }
  
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push({ texto: 'Por favor, insira um endereço de e-mail válido.' });
    } else {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.push({ texto: 'Por favor, insira um endereço de e-mail válido.' });
      }
    }
  
    if (!senha || typeof senha !== 'string' || senha.trim().length === 0) {
      errors.push({ texto: 'Por favor, insira uma senha.' });
    } else if (senha.length < 8) {
      errors.push({ texto: 'A senha deve conter pelo menos 8 caracteres.' });
    }
  
    if (senha !== senha2) {
      errors.push({ texto: 'As senhas não correspondem.' });
    }
  
    if (errors.length > 0) {
      res.render('users/registro', { errors });
    } else {
    
        User.find({ email: req.body.email }).then((user) => {
            if(user.length > 0)
            {
                req.flash('errorMsg', 'Já existe uma conta cadastrada neste email!');
                res.redirect('/users/registro');
            }else{
                const newUser = new User({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.senha, salt, (err, hash) => {
                        if(err){
                            req.flash('errorMsg', 'Houve um erro no salvamento do usuário');
                            res.redirect('/');
                        }

                        newUser.senha = hash;
                        newUser.save().then(() => {
                            req.flash('successMsg', 'Usuário criado com sucesso!');
                            res.redirect('/');
                        }).catch((err) => {
                            req.flash('errorMsg', 'Houve um erro ao cadastrar usuário!');
                            res.redirect('/');
                        })
                    })
                })
            }
        })

    }
});

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})

router.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if(err){ return next(err) };
      req.flash('successMsg', 'Deslogado com sucesso!');
      res.redirect('/');
    });
})

module.exports = router;