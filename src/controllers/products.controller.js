import Product from "../models/product.model.js";

import { handleError } from "../utils/errorHandler.js";

// get products page
export const getProductsPage = async (req, res) => {
  try {
    const products = await Product.find();
    res.render("shop/products-list.ejs", {
      title: "Products Page",
      products,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// get product details page
export const getProductDetailsById = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    res.render("shop/product-details.ejs", {
      title: product.title,
      product,
    });
  } catch (err) {
    handleError(res, err);
  }
};
