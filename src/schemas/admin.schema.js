import { z } from "zod";

export const addProductSchema = z.looseObject({
  productName: z.string().trim().min(2, "Please enter a valid Product Name!"),
  productQuantity: z.coerce
    .number()
    .positive("Please enter the Product Quantity!"),
  productPrice: z.coerce.number().positive("Please enter the Product Price!"),
});
