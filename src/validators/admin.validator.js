import { addProductSchema } from "../schemas/admin.schema.js";

export const addProductValidator = (req, res, next) => {
  const result = addProductSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues;
    const {
      productId,
      productName,
      productQuantity,
      productPrice,
      productImage,
      productDesc,
    } = req.body;

    return res.status(400).render("admin/form-product.ejs", {
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
      oldInputs: req.body,
      errorMessage: errors[0].message,
      validationErrors: errors.map((issue) => issue.path[0]),
    });
  }

  req.body = result.data;
  next();
};
