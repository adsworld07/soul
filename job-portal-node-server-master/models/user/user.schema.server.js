var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    email: String,
    googleId: { type: String, unique: true, sparse: true },
    phone: String,
    tagline: String,
    totalExp: String,
    imageUrl: String,
    role: String, // role : Admin, JobSeeker, Recruiter
    requestStatus: String, // status types: 'Pending' && 'Verified'
    premiumRequestStatus: String, // status types: 'Pending' && 'Verified'
    socialContact: [{ socialtype: String, url: String }],
    // recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'RecruiterDetailModel' },
    // experience: { type: mongoose.Schema.Types.ObjectId, ref: 'ExperienceModel' },
    // education: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationModel' },
    // skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SkillModel' }],
    // projects: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    // extraCurricular: { type: mongoose.Schema.Types.ObjectId, ref: 'ExtraCurricularModel' },
    // awards: { type: mongoose.Schema.Types.ObjectId, ref: 'AwardModel' },
    // certificates: { type: mongoose.Schema.Types.ObjectId, ref: 'CertificateModel' },
    profilePicture: String,
    dateOfBirth: Date, // Added date of birth
    gender: String, // Added gender
    maritalStatus: String, // Added marital status
    languagesKnown: [String], // Added languages known
    currentLocation: String, // Added current location
    currentCountry: String, // Added current country
    currentState: String, // Added current state
    preferredLocation: String, // Added preferred location
    preferredLocation: String, // Added current location
    preferredCountry: String, // Added current country
    currentCTC: Number, // Added current CTC
    preferredCTC: Number, // Added preferred CTC
    preferredJobType: String, // Added preferred job type
    preferredJobs: [String], // Added preferred jobs
    noticePeriod: String ,// Added notice period
    PVC: Boolean ,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    accountCreatedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { collection: 'User' });

module.exports = userSchema;
