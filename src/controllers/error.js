// get the error page
export const getErrorPage = (req, res) => {
  res.render("404.ejs", {
    title: "Page Not Found",
  });
};
