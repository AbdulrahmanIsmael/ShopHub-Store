// get the error page
exports.getErrorPage = (req, res) => {
  res.render("404.ejs", {
    title: "Page Not Found",
  });
};
