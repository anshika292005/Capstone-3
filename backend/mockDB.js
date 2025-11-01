// Mock in-memory database for testing without MongoDB
const mockUsers = [];

class MockUser {
  constructor(data) {
    this._id = Math.random().toString(36).substr(2, 9);
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.createdAt = new Date();
  }

  async matchPassword(enteredPassword) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(enteredPassword, this.password);
  }
}

// Helper to create a chainable/thenable query object
class MockQuery {
  constructor(queryFn) {
    this.queryFn = queryFn;
    this.selectFields = null;
  }

  select(fields) {
    this.selectFields = fields;
    return this; // Return self for chaining
  }

  async exec() {
    let user = await this.queryFn();
    if (!user) return null;
    
    // Handle field selection
    if (this.selectFields) {
      if (this.selectFields.startsWith('-')) {
        // Exclude fields (e.g., '-password')
        const field = this.selectFields.slice(1);
        const result = { ...user };
        delete result[field];
        return result;
      } else if (this.selectFields.startsWith('+')) {
        // Include field (e.g., '+password')
        return { ...user };
      }
    }
    
    // Default: exclude password
    const result = { ...user };
    delete result.password;
    return result;
  }

  // Make it thenable
  then(resolve, reject) {
    const promise = this.exec();
    return promise.then(resolve, reject);
  }

  catch(reject) {
    const promise = this.exec();
    return promise.catch(reject);
  }
}

const mockUserModel = {
  findOne: (query) => {
    const queryFn = async () => {
      return mockUsers.find(u => {
        if (query.email) return u.email === query.email;
        if (query._id) return u._id === query._id;
        return false;
      });
    };
    return new MockQuery(queryFn);
  },

  findById: (id) => {
    const queryFn = async () => {
      return mockUsers.find(u => u._id === id);
    };
    return new MockQuery(queryFn);
  },

  create: async (userData) => {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    const newUser = new MockUser({
      ...userData,
      password: hashedPassword
    });
    mockUsers.push(newUser);
    
    // Return user without password
    const result = { ...newUser };
    delete result.password;
    return result;
  }
};

module.exports = mockUserModel;