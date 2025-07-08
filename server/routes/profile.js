import { findOne, findOneAndUpdate } from './../models/userModel';
import { countDocuments, findOne as _findOne, findOneAndUpdate as _findOneAndUpdate } from "../models/postModels";
import express from "express";
import { urlencoded, json } from "body-parser";
const app = express();

app.use(urlencoded({ extended: true }));
app.use(json());

app.post("/data", async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await countDocuments({ userId });
        const userData = await findOne({ _id: userId })
        console.log("USerData", userData)
        const profileData = {
            posts: user,
            followers: userData.followers,
            followings: userData.followings
        }
        res.status(200).json(profileData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/follow", async (req, res) => {
    try {
        const { userId, followerId } = req.body;
        console.log("Getting", req.body)
        const updatedUser = await findOneAndUpdate(
            { _id: userId },
            { $push: { followersList: followerId }, $inc: { followings: 1 } },
            { new: true } // This option ensures that the updated document is returned
        );

        console.log("updatedUser", updatedUser)
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post("/like", async (req, res) => {
    try {
        const { _id, userId } = req.body;
        console.log("Getting", req.body);

        // Check if the user has already liked the post
        const userLiked = await _findOne({ _id: _id, likedUser: userId });

        if (userLiked) {
            const updatedUser = await _findOneAndUpdate(
                { _id: _id, likedUser: userId },
                { $pull: { likedUser: userId }, $inc: { likes: -1 } }, 
                { new: true }
            );

            console.log("updatedUser dec", updatedUser);
            res.status(200).json(updatedUser);
        } else {
            // If the user has not already liked the post, increase the likes count
            const updatedUser = await _findOneAndUpdate(
                { _id: _id },
                { $push: { likedUser: userId }, $inc: { likes: 1 } },
                { new: true }
            );

            console.log("updatedUser inc", updatedUser);
            res.status(200).json(updatedUser);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default app