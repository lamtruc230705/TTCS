const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

async function register(data) {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  const hashedPassword = await hashPassword(data.password);

  const userId = await userRepository.createUser({
    username: data.username,
    email: data.email,
    phone: data.phone,
    password: hashedPassword,
    role: data.role || 'user',
    profileImage: data.profileImage || null
  });

  return { userId };
}

async function login(data) {
  const user = await userRepository.findByEmail(data.email);
  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isMatch = await comparePassword(data.password, user.password);
  if (!isMatch) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = signToken({
    user_id: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      user_id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
}

module.exports = {
  register,
  login
};