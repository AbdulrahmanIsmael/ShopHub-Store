export function handleError(res, err = null) {
  console.log(err);
  res.render("404.ejs", {
    title: "Page Not Found",
  });
}
