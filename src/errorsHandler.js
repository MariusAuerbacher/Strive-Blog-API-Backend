export const errorsHandler = (err, req, res, next) => {
  res.status(err.status? err.status : 400).send(err.message);
};
