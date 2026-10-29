const { validationResult } = require("express-validator");

const Product = require("../models/product");

const { handleError } = require("../utils/errorHandler");

// get the add product admin page
exports.getAddProductPage = (req, res) => {
  res.render("admin/form-product.ejs", {
    title: "Admin - Add Product",
    editing: false,
    product: {},
    errorMessage: req.flash("error"),
    oldInputs: {
      productName: "",
      productQuantity: "",
      productPrice: "",
      productImage: "",
      productDesc: "",
    },
    validationErrors: [],
  });
};

// get the edit product admin page
exports.getEditProductPage = (req, res) => {
  const editQuery = req.query.edit;
  if (!editQuery) {
    return res.redirect("/");
  }

  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      if (!product || product.userId.toString() !== req.session.userId)
        return res.redirect("/");
      res.render("admin/form-product.ejs", {
        title: "Admin - Edit Product",
        editing: editQuery,
        product,
        errorMessage: req.flash("error"),
        oldInputs: {
          productName: "",
          productQuantity: "",
          productPrice: "",
          productImage: "",
          productDesc: "",
        },
        validationErrors: [],
      });
    })
    .catch((err) => err && handleError(res, err));
};

// get the products admin page
exports.getAdminProductsPage = (req, res) => {
  Product.find({ userId: req.session.userId })
    .then((products) => {
      res.render("admin/products.ejs", {
        title: "Admin - Products",
        products,
      });
    })
    .catch((err) => handleError(res, err));
};

// Post request to edit an existing product
exports.postEditProduct = (req, res) => {
  const {
    productId,
    productName,
    productQuantity,
    productPrice,
    productImage,
    productDesc,
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/form-product.ejs", {
      title: "Admin - Edit Product",
      editing: true,
      product: {
        _id: productId,
        title: productName,
        price: productPrice,
        quantity: productQuantity,
        imageUrl: productImage,
        description: productDesc,
      },
      oldInputs: {},
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array().map((e) => e.path),
    });
  }

  Product.findById(productId)
    .then((product) => {
      if (!product || product.userId.toString() !== req.session.userId)
        return res.redirect("/");
      product.title = productName;
      product.price = productPrice;
      product.quantity = productQuantity;
      product.imageUrl = productImage;
      product.description = productDesc;
      return product
        .save()
        .then(() => res.redirect("/admin/products"))
        .catch((err) => console.log(err));
    })
    .catch((err) => handleError(res, err));
};

exports.postDeleteProduct = (req, res) => {
  const productId = req.params.productId;
  Product.deleteOne({ _id: productId, userId: req.session.userId })
    .then(() => res.redirect("/admin/products"))
    .catch((err) => err && handleError(res, err));
};

// add new product (POST)
exports.postProducts = (req, res) => {
  const {
    productName,
    productQuantity,
    productPrice,
    productImage,
    productDesc,
  } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/form-product.ejs", {
      title: "Admin - Add Product",
      editing: false,
      product: {},
      oldInputs: {
        productName,
        productQuantity,
        productPrice,
        productImage,
        productDesc,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array().map((e) => e.path),
    });
  }

  const product = new Product({
    title: productName,
    price: productPrice,
    quantity: productQuantity,
    imageUrl: productImage,
    description: productDesc,
    userId: req.session.userId,
  });

  product
    .save()
    .then(() => {
      console.log("Created product!");
      res.redirect("/admin/products");
    })
    .catch((err) => handleError(res, err));
};
