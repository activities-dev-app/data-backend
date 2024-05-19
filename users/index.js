import express from "express";
import cookieParser from "cookie-parser";
import { Deta } from "deta";
import { passwordStore } from "../password/index.js";
import { generateCookie } from "../cookies/index.js";
import { User } from "../models/user.js";
import { Session } from "../models/session.js";
import { Hash } from "../models/hash.js";

const users = express.Router();
users.use(express.json());
users.use(cookieParser());

const deta = Deta(process.env.DETA_PROJECT_KEY);

const users_db = deta.Base("users_db");
const sessions_db = deta.Base("sessions_db");
const hashes_db = deta.Base("hashes_db");

users.route("/users")
    .get(async (req, res) => {
        const response = await users_db.fetch(req.query);
        return res.json(response);
    });

users.route("/user/login")
    .post(async (req, res) => {
        try {
            const { email, password } = req.body;

            const userResponse = await users_db.fetch({ email });
            if (userResponse.items.length === 0) {
                //console.log(`Could not find a user with the email ${email}`);
                return res.json({
                    success: false,
                    error: "authentication email",
                });
            }

            const user = new User(userResponse.items[0]);
            //console.log(user);

            const hashResponse = await hashes_db.fetch({ userId: user.key });
            const { hash } = hashResponse.items[0];
            const passwordMatch = await passwordStore.check(password, hash);

            if (!passwordMatch) {
                return res.json({
                    success: false,
                    error: "authentication email"
                });
            }

            const token = generateCookie();

            const newSession = new Session({ token, user });

            const oneHour = 3600; /* 1 hour */
            const oneWeek = 3600 * 24 * 7;

            let expireIn = oneHour;

            if (req.body.rememberMe) {
                expireIn = oneWeek;
            }

            await sessions_db.put(newSession, token, { expireIn });

            res.cookie("login", token, {
                expires: new Date(Date.now() + expireIn * 1000),
                secure: true,
                httpOnly: true,
            })

            return res.json({ success: true });

        } catch (err) {
            //console.log(err);
            return res.json({ success: false, error: err });
        }
    });

users.route("/user/register")
    .post(async (req, res) => {
        try {
            const { user, password } = req.body;
            //console.log(user, password);

            /* Check if email exists */
            const response = await users_db.fetch({ email: user.email });
            //console.log(response.count);
            if (response.count > 0) {
                //console.log("Email exists in base");
                return res.json({ success: false });
            }

            const passwordHash = await passwordStore.hash(password);
            if (!(passwordHash && passwordHash.length === 60)) {
                //console.log("Error while creating hash");
                return res.json({ success: false });
            }

            const newUser = new User(user);
            //console.log("new user: ", newUser);

            const newUserRes = await users_db.put(newUser);

            const newHash = new Hash({ hash: passwordHash, userId: newUserRes.key });
            await hashes_db.put(newHash);

            return res.json({ success: true });
        } catch (err) {
            //console.log(err);
            return res.json({ success: false });
        }
    });

users.put("/user/password/reset", (req, res) => {
    const data = req.body;

    //console.log(data)
    res.json({ data });
});

users.route("/user/:id")
    .get(async (req, res) => {
        const response = await users_db.get(req.params.id);
        res.json(response);
    })
    .put(async (req, res) => {
        const updates = {
            updated_at: Date.now(),
            ...req.body
        };
        const response = await users_db.update(updates, req.params.id);
        res.json(response);
    })
    .delete(async (req, res) => {
        const response = await users_db.delete(req.params.id);
        res.json(response);
    });

users.route("/sessions")
    .get(async (req, res) => {
        const response = await sessions_db.fetch();
        res.json(response.items);
    })
    .post(async (req, res) => {
        const newSession = {
            created_at: Date.now(),
            updated_at: null,
            ...req.body
        };
        const response = await sessions_db.put(newSession);
        res.json(response);
    });

users.get("/session", async (req, res) => {
    try {
        const { token } = req.headers;
        //console.log("Token: ", token);
        if (token && token.length > 0) {
            const session = await sessions_db.get(token);
            //console.log("Found sesion: ", session);
            if (session) {
                return res.json(session);
            }
        }
    } catch (err) {
        //console.log(err);
    }
    return res.json(null);
});

users.delete("/session/:token", async (req, res) => {
    try {
        const { token } = req.params;
        //console.log("delete token: ", token);
        await sessions_db.delete(token);
    } catch (err) {
        //console.log(err);
    }
    return res.json(null);
});

users.route("/session/:userId")
    .get(async (req, res) => {
        const response = await sessions_db.fetch({ userId: req.params.userId });
        res.json(response.items);
    })
    .put(async (req, res) => {
        const updates = {
            updated_at: Date.now(),
            ...req.body
        };
        const { key } = await sessions_db.fetch({ userId: req.params.userId });
        const response = await sessions_db.update(updates, key);
        res.json(response);
    })
    .delete(async (req, res) => {
        const { key } = await sessions_db.fetch({ userId: req.params.userId });
        const response = await sessions_db.delete(key);
        res.json(response);
    });

users.route("/hashes")
    .get(async (req, res) => {
        const response = await hashes_db.fetch();
        res.json(response.items);
    })
    .post(async (req, res) => {
        const newHash = {
            created_at: Date.now(),
            updated_at: null,
            ...req.body
        };
        const response = await hashes_db.put(newHash);
        res.json(response);
    });

users.route("/hash/:userId")
    .get(async (req, res) => {
        const response = await hashes_db.fetch({ userId: req.params.userId });
        res.json(response.items);
    })
    .put(async (req, res) => {
        const updates = {
            updated_at: Date.now(),
            ...req.body
        };
        const fetchResponse = await hashes_db.fetch({ userId: req.params.userId });
        const { key } = fetchResponse.items;
        const response = await hashes_db.update(updates, key);
        res.json(response);
    })
    .delete(async (req, res) => {
        const fetchResponse = await hashes_db.fetch({ userId: req.params.userId });
        const { key } = fetchResponse.items;
        const response = await hashes_db.delete(key);
        res.json(response);
    });

export default users;