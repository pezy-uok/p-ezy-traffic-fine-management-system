import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../services/userService.js';

// Create a new user
const createUserController = async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    // Validate input
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const userData = {
      email,
      name,
      phone: phone || null,
      created_at: new Date(),
    };

    const result = await createUser(userData);

    res.status(201).json({
      message: 'User created successfully',
      data: result[0],
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all users
const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update user
const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, phone } = req.body;

    const userData = {};
    if (email) userData.email = email;
    if (name) userData.name = name;
    if (phone) userData.phone = phone;
    userData.updated_at = new Date();

    const result = await updateUser(id, userData);

    res.status(200).json({
      message: 'User updated successfully',
      data: result[0],
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteUser(id);

    res.status(200).json({
      message: 'User deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  updateUserController,
  deleteUserController,
};
