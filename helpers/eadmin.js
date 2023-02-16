module.exports = {
    eAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash('errorMsg', 'Você precisa ser um administrador para ter acesso!');
        res.redirect('/');
    }
}