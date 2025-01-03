import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";


export interface IUser {
    email: string;
    password: string;
    role: "user" | "admin";
    _id?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
};



const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String, 
        enum: ["user", "admin"],
        default: "user",
    },

}, {timestamps: true});

UserSchema.pre("save", async function(next){
    if(this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
    }
    next();
})

const User = models.User || model("User", UserSchema);

export default User;
