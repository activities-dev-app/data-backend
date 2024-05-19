import express from "express";
import { Deta } from "deta";

const api = express.Router();
api.use(express.json());

const deta = Deta(process.env.DETA_PROJECT_KEY);

const categories_db = deta.Base("categories_db");
const activities_db = deta.Base("activities_db");
const objects_db = deta.Base("objects_db");
const orderings_db = deta.Base("orderings_db");

api.use((req, res, next) => {
    console.log(req.url, req.path, req.query);

    next();
});

api.route("/categories")
    .get(async (req, res) => {
        const response = await categories_db.fetch();
        res.json(response.items);
    })
    .post(async (req, res) => {
        const new_category = {
            created_at: Date.now(),
            updated_at: null,
            ...req.body
        };
        const response = await categories_db.put(new_category);
        res.json(response);
    });

api.route("/categories/:userId")
    .get(async (req, res) => {
        const response = await categories_db.fetch({ userId: req.params.userId });
        res.json(response.items);
    });

api.route("/category/:id")
    .get(async (req, res) => {
        const response = await categories_db.get(req.params.id);
        res.json(response);
    })
    .put(async (req, res) => {
        const updates = {
            updated_at: Date.now(),
            ...req.body
        };
        const response = await categories_db.update(updates, req.params.id);
        res.json(response);
    })
    .delete(async (req, res) => {
        const response = await categories_db.delete(req.params.id);
        res.json(response);
    });

api.route("/activities")
    .get(async (req, res) => {
        console.log("QUERY: ", req.query);
        if (req.query) {
            const response = await activities_db.fetch(req.query);
            return res.json(response.items);
        }

        const response = await activities_db.fetch();
        return res.json(response.items);
    })
    .post(async (req, res) => {
        const activity = {
            created_at: Date.now(),
            updated_at: null,
            ...req.body
        };
        const response = await activities_db.put(activity);
        res.json(response);
    });

api.route("/activities/:userId")
    .get(async (req, res) => {
        const response = await activities_db.fetch({ userId: req.params.userId });
        res.json(response.items);
    });

api.route("/activity/:activityId")
    .get(async (req, res) => {
        const response = await activities_db.get(req.params.activityId)
        res.json(response);
    })
    .put(async (req, res) => {
        const updates = {
            updated_at: Date.now(),
            ...req.body
        };
        const response = await activities_db.update(updates, req.params.activityId);
        res.json(response);
    })
    .delete(async (req, res) => {
        const response = await activities_db.delete(req.params.activityId);
        res.json(response);
    });

api.route("/objects")
    .get(async (req, res) => {
        const response = await objects_db.fetch();
        res.json(response.items);
    })
    .post(async (req, res) => {
        const new_object = {
            created_at: Date.now(),
            updated_at: null,
            ...req.body
        };
        const response = await objects_db.put(new_object);
        res.json(response);
    });

api.route("/objects/:userId")
    .get(async (req, res) => {
        const response = await objects_db.fetch({ userId: req.params.userId });
        res.json(response.items);
    });

api.route("/object/:objectId")
    .put(async (req, res) => {
        const updates = {
            updated_at: Date.now(),
            ...req.body
        };

        console.log(updates);

        const response = await objects_db.update(updates, req.params.objectId);
        res.json(response);
    })
    .delete(async (req, res) => {
        const response = await objects_db.delete(req.params.objectId);
        res.json(response);
    });


/* Activity objects orderings */
api.route("/orderings/:userId")
    .get(async (req, res) => {
        const response = await orderings_db.fetch({ userId: req.params.userId });
        res.json(response.items);
    });

api.route("/orderings")
    .post(async (req, res) => {
        const ordering = {
            created_at: Date.now(),
            updated_at: null,
            ...req.body
        };
        const response = await orderings_db.put(ordering);
        res.json(response);
    });

api.route("/ordering/:activityId")
    .get(async (req, res) => {
        const response = await orderings_db.fetch({ activityId: req.params.activityId });
        res.json(response.items);
    })
    .put(async (req, res) => {
        const updates = {
            updated_at: Date.now(),
            ...req.body
        };
        console.log(req.params.activityId);
        const check = (await orderings_db.fetch({ 
            activityId: req.params.activityId 
        })).items;
        console.log(check);
        if (check[0]) {
            const key = check[0].key;
            console.log("KEY: ", key);
            const response = await orderings_db.update(updates, key);
            res.json(response);
        } else {
            console.log("Nothin found");
            res.json([]);
        }
    })
    .delete(async (req, res) => {
        const response = await orderings_db.delete(req.params.activityId);
        res.json(response);
    });

export default api;