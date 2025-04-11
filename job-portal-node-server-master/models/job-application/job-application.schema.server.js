var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' },
    createdAt: { type: Date, default: Date.now }
});

var assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    pdfLink: String,
    sentDate: { type: Date, required: true },
    deadline: { type: Date, required: true },
    deadlineDays: { type: Number, required: true },
    status: { type: String, default: 'sent' },
    submissionDate: Date,
    submissionLink: String
});

// New interview details schema
var interviewSchema = new mongoose.Schema({
    startDateTime: { type: Date, required: true },
    duration: { type: Number, required: true }, // in minutes
    meetLink: { type: String, required: true },
    jobTitle: { type: String, required: true },
    applicantName: { type: String, required: true },
    applicantEmail: { type: String, required: true },
    interviewerEmail: { type: String, required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' },
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    rescheduledFrom: Date // If interview was rescheduled, store original date
});

var jobApplicationSchema = mongoose.Schema({
    dateApplied: { type: Date, default: Date.now },
    status: { type: String, default: 'applied' },
    jobSource: String,
    gitHubJobId: String,
    location: String,
    company: String,
    title: String,
    type: String,
    PVC: Boolean,
    coverLetter: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'UserModel' },
    jobPosting: { type: mongoose.Schema.Types.ObjectId, ref: 'JobPostingModel' },
    comments: [commentSchema],
    assignment: assignmentSchema,
    interviews: [interviewSchema] // Allow multiple interviews to be stored
}, { collection: 'JobApplication' });

// Add timestamps to automatically track when documents are created and modified
jobApplicationSchema.set('timestamps', true);

module.exports = jobApplicationSchema;