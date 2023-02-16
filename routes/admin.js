const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
require("../models/Post");
const Categoria = mongoose.model("categorias");
const Post = mongoose.model("postagens");
const {eAdmin} = require('../helpers/eadmin');

router.get("/", eAdmin, (req, res) => {
  res.render("admin/index");
});

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find()
    .sort({ date: "desc" })
    .lean()
    .then((categorias) => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("errorMsg", "Houve um erro ao listar categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, (req, res) => {
  //Create
  var errors = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    errors.push({ text: "Nome inválido!" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    errors.push({ text: "Slug inválido!" });
  }
  if (req.body.nome.length < 5) {
    errors.push({ text: "Nome muito pequeno!" });
  }
  if (errors.length > 0) {
    res.render("admin/addcategorias", { errors: errors });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
    };
    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.flash("successMsg", "Categoria cadastrada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch((err) => {
        req.flash("errorMsg", "Erro ao cadastrar categoria, tente novamente!");
        res.redirect("/admin");
      });
  }
});

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.flash("errorMsg", "Está categoria não existe!");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, (req, res) => {
  //Update
  Categoria.findOne({ _id: req.body.id })
    .then((categoria) => {
      const err = [];

      if (
        !req.body.nome ||
        typeof req.body.nome == undefined ||
        req.body.nome == null
      ) {
        err.push({ texto: "Nome invalido" });
      }
      if (
        !req.body.slug ||
        typeof req.body.slug == undefined ||
        req.body.slug == null
      ) {
        err.push({ texto: "Slug invalido" });
      }
      if (req.body.nome.length < 5) {
        err.push({ texto: "Nome da categoria muito pequeno" });
      }
      if (err.length > 0) {
        Categoria.findOne({ _id: req.body.id })
          .lean()
          .then((categoria) => {
            res.render("admin/editcategorias", { categoria: categoria });
          })
          .catch((err) => {
            req.flash("errorMsg", "Erro ao pegar os dados");
            res.redirect("admin/categorias");
          });
      } else {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria
          .save()
          .then(() => {
            req.flash("successMsg", "Categoria editada com sucesso!");
            res.redirect("/admin/categorias");
          })
          .catch((err) => {
            req.flash("errorMsg", "Erro ao salvar a edição da categoria");
            res.redirect("admin/categorias");
          });
      }
    })
    .catch((err) => {
      req.flash("erroMsg", "Erro ao editar a categoria");
      req.redirect("/admin/categorias");
    });
});

router.post("/categorias/delet", eAdmin, (req, res) => {
  //Delete
  Categoria.remove({ _id: req.body.id })
    .then(() => {
      req.flash("successMsg", "Categoria deletada com sucesso!");
      res.redirect("/admin/categorias");
    })
    .catch((err) => {
      req.flash("errorMsg", "Não foi possível deletar a categoria!");
      res.redirect("/admin/categorias");
    });
});

router.get("/post", eAdmin, (req, res) => {
  Post.find().populate('categoria').sort({date: 'desc'}).lean().then((post) => {
    res.render("admin/post", {postagens: post});
  }).catch((err) => {
    req.flash('errorMsg', 'Houve um erro ao postar');
    res.redirect('/admin/post');
  })
});

router.get("/post/add", eAdmin, (req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("admin/addpost", { categorias: categorias });
    })
    .catch((err) => {
      req.flash("errorMsg", "Houve um erro ao cadastrar uma postagem");
      res.redirect("/admin/post");
    });
});

router.post("/post/nova", eAdmin, (req, res) => {
  var err = [];

  if (req.body.categoria == "0") {
    err.push({ texto: "Categoria inválida, registre uma categoria!" });
  }

  if(!req.body.titulo || req.body.titulo == undefined || req.body.titulo == null){
    err.push({ texto: 'Título inválido!' });
  }
  
  if(!req.body.slug || req.body.slug == undefined || req.body.slug == null){
    err.push({ texto: 'Slug inválido!' });
  }

  if(!req.body.desc || req.body.desc == undefined || req.body.desc == null){
    err.push({ texto: 'Descrição inválida!' });
  }

  if(!req.body.conteudo || req.body.conteudo == undefined || req.body.conteudo == null || req.body.conteudo.length < 10){
    // res.redirect('/admin/post/add')
    err.push({ texto: 'Conteúdo inválido!' });
  } 

  if (err.length > 0) res.render("admin/addpost", { errors: err });

  else {
    const newPost = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      desc: req.body.desc,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
    };

    new Post(newPost)
      .save()
      .then(() => {
        req.flash("successMsg", "Postagem criada com sucesso!");
        res.redirect("/admin/post");
      })
      .catch((err) => {
        req.flash("errorMsg", "Houve um problema na postagem.");
        res.redirect("/admin/post");
      });
  }
});

router.get('/post/edit/:id', eAdmin, (req, res) => {
  Post.findOne({ _id: req.params.id }).lean().then((post) => {
    Categoria.find().lean().then((categorias) => {
      res.render('admin/editpost', { categorias: categorias, postagens: post });
    }).catch((err) => {
      req.flash('errorMsg', 'Houve um erro ao listar as categorias!');
      res.redirect('/admin/post');
    })
  }).catch((err) => {
    req.flash('errorMsg', 'Houve um erro ao carregar o formulário!');
    res.redirect('/admin/post');
  })
})

router.post('/post/edit', eAdmin, (req, res) => {
  Post.findOne({_id: req.body.id}).lean()
  .then(() => {
    var post = new Post();

    post.titulo = req.body.titulo;
    post.slug = req.body.slug;
    post.desc = req.body.desc;
    post.conteudo = req.body.conteudo;
    post.categoria = req.body.categoria;

    post.save().then(() => {
      req.flash('successMsg', 'Postagem editada com sucesso!');
      res.redirect('/admin/post');
    }).catch((err) => {
      req.flash('errorMsg', 'Houve um erro ao editar!');
      res.redirect('/admin/post');
    })
  }).catch((err) => {
    console.log(err);
    req.flash('errorMsg', 'Houve um erro ao editar!');
    res.redirect('/admin/post');
  })
})

router.post('/post/delet/:id', eAdmin, (req, res) => { //DELETE
  Post.findByIdAndDelete({_id: req.params.id})
  .then(() => {
    req.flash('successMsg', 'Postagem deletada com sucesso!');
    res.redirect('/admin/post');
  }).catch((err) => {
    req.flash('errorMsg', 'Houve um erro ao deletar a postagem');
    res.redirect('/admin/post');
  })
}) 

module.exports = router;
