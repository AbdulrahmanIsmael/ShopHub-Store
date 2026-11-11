import { z } from "zod";
import User from "../models/user.model.js";

export const signupSchema = z
  .object({
    email: z
      .email("Please enter a valid email address!")
      .trim()
      .toLowerCase()
      .superRefine(async (email, ctx) => {
        let user;
        try {
          user = await User.findOne({ email });
        } catch (err) {
          console.error(err);
          ctx.addIssue({
            code: "custom",
            message: "Something went wrong, please try again",
          });
          return;
        }

        if (user) {
          ctx.addIssue({
            code: "custom",
            message: "Email address already exists!",
          });
        }
      }),
    password: z
      .string()
      .trim()
      .min(6, "Password must be at least 6 characters!")
      .regex(/^[0-9a-z]+$/i, "Password must be alphanumeric only!"),
    confirmPassword: z.string(),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    "Passwords don't match",
  );

export const loginSchema = z.object({
  email: z.email("This is not a valid email").trim().toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required!")
    .min(6, "Password must be at least 6 characters!"),
});
