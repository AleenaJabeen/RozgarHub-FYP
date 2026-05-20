import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index:true
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === "email";
      },
    },
    role: {
      type: String,
      enum: ["pending", "customer", "serviceprovider"],
      default: "pending",
    },
    authProvider: { type: String, enum: ["email", "google"], required: true },
    googleId: {
      type: String,
      unique:true,
      sparse: true 
    },
    // --- Email verification ---
    emailOTP: {
      hash: {
        type: String,
      },
      expiry: {
        type: Date,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // --- FORGOT PASSWORD LINK LOGIC ---
    resetPasswordToken: {
        type:String
    },
    resetPasswordExpiry:{
        type:Date
    },
    // -- Phone verification --
    phone: String,
    phoneOTP: {
      hash: {
        type: String,
      },
      expiry: {
        type: Date,
      },
      attempts: {
        type: Number,
        default: 0,
      },
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    avatar:{
        type:String
    },
    location: {
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  currentLocation: {
  type: {
    type: String,
    enum: ["Point"],
    // Remove default: "Point" 
    required: function() {
      // Only require 'Point' if coordinates are actually provided
      return this.location?.currentLocation?.coordinates?.length > 0;
    }
  },
  coordinates: {
    type: [Number],
    default: undefined, 
    validate: {
      validator: function (v) {
        if (!v || v.length === 0) return true; // Allow empty/null
        return (
          Array.isArray(v) && 
          v.length === 2 &&
          v[0] >= -180 && v[0] <= 180 && // Longitude
          v[1] >= -90 && v[1] <= 90      // Latitude
        );
      },
      message: "Coordinates must be a valid [longitude, latitude] array",
    },
  },
},
},
    isOnline: { type: Boolean, default: false },
    lastActiveAt: { type: Date, default: Date.now },
    refreshToken: {
        type:String
    }
  },
  {
    timestamps: true,
  },
);

userSchema.index({ isOnline: 1 });
userSchema.index({ "location.currentLocation": "2dsphere" });

userSchema.pre("save", async function() {
  // If the password isn't modified, just exit the function
  if (!this.isModified("password") || !this.password) {
    return; 
  }

  // Hash the password and let the function finish
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){
  return jwt.sign({
    _id:this._id,
    role:this.role
  },process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  });
}

userSchema.methods.generateRefreshToken=function(){
  return jwt.sign({
    _id:this._id,
    role:this.role
  },process.env.REFRESH_TOKEN_SECRET,{
    expiresIn:process.env.REFRESH_TOKEN_EXPIRY
  });
}

export const User = mongoose.model("User", userSchema);
