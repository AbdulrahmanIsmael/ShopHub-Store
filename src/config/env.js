const env = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  sessionSecret: process.env.SESSION_SECRET,
  csrfSecret: process.env.CSRF_SECRET,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
};

export const { port, mongodbUri, sessionSecret, csrfSecret, sendgridApiKey } =
  env;
