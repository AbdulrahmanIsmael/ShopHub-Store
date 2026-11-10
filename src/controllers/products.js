import Product from "../models/product.js";

import { handleError } from "../utils/errorHandler.js";

// get products page
export const getProductsPage = (req, res) => {
  Product.find()
    .then((products) => {
      res.render("shop/products-list.ejs", {
        title: "Products Page",
        products,
      });
    })
    .catch((err) => handleError(res, err));
};

// get product details page
export const getProductDetailsById = (req, res) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-details.ejs", {
        title: product.title,
        product,
      });
    })
    .catch((err) => handleError(res, err));
};
