import { loginSchema, signupSchema } from "../schemas/auth.schema.js";

export const signupValidator = async (req, res, next) => {
  const result = await signupSchema.safeParseAsync(req.body);

  if (!result.success) {
    const errors = result.error.issues;
    return res.status(400).render("auth/signup", {
      title: "Signup",
      errorMessage: errors[0].message,
      oldInput: { email: req.body.email },
      validationErrors: errors.map((issue) => issue.path[0]),
    });
  }

  req.body = result.data;
  next();
};

export const loginValidator = (req, res, next) => {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.issues;
    return res.status(400).render("auth/login", {
      title: "Login",
      errorMessage: errors[0].message,
      oldInputs: { email: req.body.email },
      validationErrors: errors.map((issue) => issue.path[0]),
    });
  }

  req.body = result.data;
  next();
};
