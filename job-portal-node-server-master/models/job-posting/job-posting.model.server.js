var mongoose =
    require('mongoose');
var jobPostingSchema =
    require('./job-posting.schema.server');
var jobPostingModel = mongoose
    .model('JobPostingModel', jobPostingSchema);


module.exports = {
    findJobPostingById: findJobPostingById,
    findAllJobPostings:findAllJobPostings,
    findJobPostingByLocation: findJobPostingByLocation,
    findJobPostingByType: findJobPostingByType,
    createJobPosting: createJobPosting,
    deleteJobPosting: deleteJobPosting,
    updateJobPosting: updateJobPosting,
    findJobPostingByUserId:findJobPostingByUserId
};

function findAllJobPostings() {
    return jobPostingModel.find().sort({ datePosted: -1 })  ;
}


function findJobPostingById(jobPostingId) {
    return jobPostingModel.findById(jobPostingId);
}
function findJobPostingByUserId(userId) {
    return jobPostingModel.find({user:userId}).sort({ datePosted: -1 });;
}

function findJobPostingByLocation(location) {
    return jobPostingModel.findOne({location: location}).sort({ datePosted: -1 });;
}

function findJobPostingByType(type) {
    return jobPostingModel.findOne({type: type}).sort({ datePosted: -1 });;
}

function createJobPosting(jobPosting) {
    return jobPostingModel.create(jobPosting);
}

function deleteJobPosting(jobPostingId) {
    return jobPostingModel.remove({_id: jobPostingId});
}

function updateJobPosting(jobPostingId, newJobPosting) {
    return jobPostingModel.update({_id: jobPostingId},
        {$set: newJobPosting})

}