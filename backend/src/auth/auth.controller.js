const AuthService = require('./auth.service');

exports.register = async (req, res) => {
  try {
    await AuthService.registerUser(req.body.email, req.body.password);
    res.status(201).json({ message: 'Registered!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const token = await AuthService.loginUser(req.body.email, req.body.password);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};
