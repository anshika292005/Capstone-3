const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let User;
let mockDB = null;

// Try to use Mongoose, fall back to mock if connection fails
const getUserModel = () => {
  if (mockDB) return mockDB;
  
  // If mongoose is connected, use it
  if (mongoose.connection.readyState === 1) {
    if (User) return User;
    
    const userSchema = new mongoose.Schema(
      {
        name: {
          type: String,
          required: [true, 'Please provide a name'],
          trim: true,
          maxlength: [50, 'Name cannot be more than 50 characters']
        },
        email: {
          type: String,
          required: [true, 'Please provide an email'],
          unique: true,
          lowercase: true,
          match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
          ]
        },
        password: {
          type: String,
          required: [true, 'Please provide a password'],
          minlength: 6,
          select: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      },
      { timestamps: true }
    );

    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) {
        next();
      }
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    });

    userSchema.methods.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };

    User = mongoose.model('User', userSchema);
    return User;
  }
  
  // Fall back to mock database
  if (!mockDB) {
    mockDB = require('../mockDB');
  }
  return mockDB;
};

// Export a proxy that handles both MongoDB and mock DB
module.exports = new Proxy({}, {
  get: (target, prop) => {
    const model = getUserModel();
    return model[prop];
  }
});