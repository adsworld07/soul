var mongoose = require('mongoose');
var experienceSchema = require('./experience.schema.server');
var experienceModel = mongoose.model('ExperienceModel', experienceSchema);

module.exports = {
    model: experienceModel,  // Export the model itself
    findAllExperiences: findAllExperiences,
    findExperienceByUserId: findExperienceByUserId,
    createExperience: createExperience,
    deleteExperience: deleteExperience,
    updateExperience: updateExperience,
    findOneAndUpdate: findOneAndUpdate
};

function findAllExperiences() {
    return experienceModel.find();
}

function findExperienceByUserId(userId) {
    return experienceModel.find({user: userId});
}

function createExperience(experience) {

    return experienceModel.create(experience);
}

function deleteExperience(experienceId) {
    return experienceModel.remove({_id: experienceId});
}

function updateExperience(experienceId, newExperience) {
    return experienceModel.update(
        {_id: experienceId},
        {$set: newExperience}
    );
}

function findOneAndUpdate(query, update, options) {
    return experienceModel.findOneAndUpdate(query, update, options);
}