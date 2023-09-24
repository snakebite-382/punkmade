const { v4: uuid } = require("uuid");

const defaultCategories = [
    "general",
    "art/Music",
    "political"
]

class votingEntry { // to be implemented

}


class SceneUser {
    id;
    name;

    constructor(user) {
        this.id = user.sub;
        this.name = user.nickname
    }
}

class Like {
    likedBy
    constructor(userID) {
        this.likedBy = userID
    }
}

class Comment { //to be implemented
    content;
    creator;
    timestamp;
    id;
    replies;
    likes;

    constructor(creator, content) {
        this.content = content;
        this.creator = creator;
        this.timestamp = Date();
        this.id = uuid();
        this.replies = []; // to be implemented
        this.likes = [];
    }
}

class Post {
    content;
    creator;
    type; // either text (implemented), image (to be implemented) or mixed media (to be implemented)
    likes; // to be implemented
    comments; // to be implemented
    id;
    timestamp;

    constructor(creator, content, type="text") {
        this.id = uuid();
        this.content = content;
        this.creator = {
            id: creator.id,
            name: creator.name
        };
        this.type = type;
        this.likes = [];
        this.comments = [];
        this.timestamp = Date();
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
    constructor(name, creator, center, range) {
        this.users = [];
        this.users.push(new SceneUser(creator))

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
    Like,
    Comment,
};