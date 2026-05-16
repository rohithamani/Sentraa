// Temporary in-memory user storage (for development/testing only)
const tempUsers = new Map();
let tempUserIdCounter = 1;

export const createTempUser = (userData) => {
  const userId = `temp_${tempUserIdCounter++}`;
  const user = {
    _id: userId,
    email: userData.email,
    password: userData.password, // In real app, this would be hashed
    profile: userData.profile || {},
    createdAt: new Date().toISOString()
  };
  
  tempUsers.set(userData.email, user);
  return user;
};

export const findTempUserByEmail = (email) => {
  return tempUsers.get(email) || null;
};

export const getTempUsersCount = () => {
  return tempUsers.size;
};