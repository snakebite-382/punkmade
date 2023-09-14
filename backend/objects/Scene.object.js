const { uuid } = require("uuidv4");

const defaultCategories = [
    "General",
    "Art/Music",
    "Political"
]

class votingEntry { // to be implemented

}


class SceneUser {
    id;

    constructor(id) {
        this.id = id;
    }
}

class Like { // to be implemented

}

class Comment { //to be implemented

}

class Post {
    content;
    creator;
    type; // either text (implemented), image (to be implemented) or mixed media (to be implemented)
    likes; // to be implemented
    comments; // to be implemented
    id;

    constructor(creatorID, content, type="text") {
        this.id = uuid();
        this.content = content;
        this.creator = creatorID;
        this.type = type;
        this.likes = [];
        this.comments = [];
    }
}

class Category {
    name;
    posts;

    constructor(name) {
        this.name = name;
        this.posts = [];
    }
}
class Scene {
    users;
    name;
    categories;
    center;
    logo; // to be implemented 
    range; 
    votes; // to be implemented
    constructor(name, creatorID, center, range) {
        this.users = [];
        let creator = new SceneUser(creatorID);
        this.users.push(creator)

        this.center = center;
        
        this.range = range;

        this.name = name;

        this.categories = [];

        defaultCategories.forEach(cat => {
            this.categories.push(new Category(cat))
        })
    }
}

module.exports = {
    Scene, 
    Category,
    Post,
    SceneUser,
};