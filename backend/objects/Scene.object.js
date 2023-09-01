class votingEntry { // to be implemented

}

class SceneUser {
    id;
    postIDs;

    constructor(id) {
        this.id = id;
        this.postIDs = [];
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
    usedPostIDs;
    constructor(name, creatorID, center, range) {
        this.users = [];
        let creator = new SceneUser(creatorID);
        this.users.push(creator)

        this.center = center;
        
        this.range = range;

        this.name = name;

        this.usedPostIDs = [];
    }
}

module.exports = {
    Scene,
    SceneUser,
};