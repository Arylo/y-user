import * as mongo from "./mongo";

enum DB_MODE {
    MONGO,
    mongo
}

class UserFactory {
    public mode(mode: DB_MODE | keyof typeof DB_MODE) {
        switch (mode) {
            case "MONGO":
            case "mongo":
            case DB_MODE.MONGO:
            case DB_MODE.mongo:
            return mongo.UserFactory;
        }
    }
}

export = new UserFactory();
