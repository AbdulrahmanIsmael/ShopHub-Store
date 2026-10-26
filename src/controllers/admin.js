const Product = require("../models/product");

const { handleError } = require("../utils/errorHandler");

// get the add product admin page
exports.getAddProductPage = (req, res) => {
  res.render("admin/form-product.ejs", {
    title: "Admin - Add Product",
    editing: false,
    product: {},
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
      if (!product) return res.redirect("/");
      res.render("admin/form-product.ejs", {
        title: "Admin - Edit Product",
        editing: editQuery,
        product,
      });
    })
    .catch((err) => err && handleError(res, err));
};

// get the products admin page
exports.getAdminProductsPage = (req, res) => {
  Product.find()
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

  Product.findByIdAndUpdate(
    productId,
    {
      title: productName,
      price: productPrice,
      quantity: productQuantity,
      imageUrl: productImage,
      description: productDesc,
    },
    {
      runValidators: true,
    },
  )
    .then(() => res.redirect("/admin/products"))
    .catch((err) => handleError(res, err));
};

exports.postDeleteProduct = (req, res) => {
  const productId = req.params.productId;
  Product.findByIdAndDelete(productId)
    .then(() => res.redirect("/products"))
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
