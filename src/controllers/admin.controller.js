import Product from "../models/product.model.js";

import { handleError } from "../utils/errorHandler.js";

// get the add product admin page
export const getAddProductPage = (req, res) => {
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
export const getEditProductPage = async (req, res) => {
  const editQuery = req.query.edit;
  if (!editQuery) return res.redirect("/");

  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

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
  } catch (err) {
    handleError(res, err);
  }
};

// get the products admin page
export const getAdminProductsPage = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.session.userId });
    res.render("admin/products.ejs", {
      title: "Admin - Products",
      products,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// Post request to edit an existing product
export const postEditProduct = async (req, res) => {
  try {
    const {
      productId,
      productName,
      productQuantity,
      productPrice,
      productImage,
      productDesc,
    } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.userId.toString() !== req.session.userId)
      return res.redirect("/");

    product.title = productName;
    product.price = productPrice;
    product.quantity = productQuantity;
    product.imageUrl = productImage;
    product.description = productDesc;
    await product.save();
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
  }
};

export const postDeleteProduct = async (req, res) => {
  try {
    const productId = req.params.productId;

    await Product.deleteOne({ _id: productId, userId: req.session.userId });
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
  }
};

// add new product (POST)
export const postProducts = async (req, res) => {
  try {
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

    await product.save();
    console.log("Created product!");
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
  }
};
