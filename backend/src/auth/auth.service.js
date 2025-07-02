const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../user/user.model');

exports.registerUser = async (email, password) => {
  const hash = await bcrypt.hash(password, 10);
  // Save user to DB with hashed password
  const user = new User({ email, password: hash });
  await user.save();
  return user;
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Incorrect password');
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};
