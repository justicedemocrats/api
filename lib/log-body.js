module.exports = (req, res, next) => {
  console.log(`Got body: ${JSON.stringify(req.body)}`);
  next();
};
