var mongoose = require('mongoose');
var skillSchema = mongoose.Schema({
    skillName : String,
    skillLevel : String,
    user : {type: mongoose.Schema.Types.ObjectId, ref: 'UserModel'}

}, {collection: 'Skill'});

module.exports = skillSchema;
