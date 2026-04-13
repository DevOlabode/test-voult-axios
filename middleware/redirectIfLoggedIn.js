/**
 * If the user already has a Voult session (profile stored), skip login/register.
 */
module.exports = (req, res, next) => {
  if (req.session && req.session.voultUser) {
    return res.redirect('/');
  }
  next();
};
