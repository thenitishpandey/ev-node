import { Router } from "express";
import {
    createUser,
    login,
    logout,
    fetchProfile,
    updateProfile,
    updatePassword,
    AcceptInvite,
    RejectInvite,
} from "../controllers/user-controller";

const userRouter = Router({ mergeParams: true });

userRouter.post("/register", createUser);
userRouter.post("/login", login);
userRouter.post("/logout", logout);
userRouter.get("/profile", fetchProfile);
userRouter.put("/profile", updateProfile);
userRouter.put("/change-password", updatePassword);
userRouter.post("/invite/accept", AcceptInvite);
userRouter.post("/invite/reject", RejectInvite);

export default userRouter;
