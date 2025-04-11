const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let gfs;

mongoose.connection.once('open', () => {
  // Initialize GridFS stream
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'profile-pictures'
  });
});

// MongoDB connection
const connectionString = 'mongodb+srv://aditya:k353OKjCl6XfGw13@cluster0.cvuu6yu.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// Add this route handler for the root path
app.get('/', (req, res) => {
    res.send('Hello, this is your server!');
});
const JobModel = require('./models/job-posting/job-posting.model.server');
const UserModel = require('./models/user/user.model.server');
const BlogModel = require('./models/blog/blog.model.server');

app.get('/sitemap.xml', async (req, res) => {
    try {
        const staticLinks = [
            { url: '/', changefreq: 'daily', priority: 1.0 },
            { url: '/home', changefreq: 'daily', priority: 1.0 },
            { url: '/blogs', changefreq: 'daily', priority: 1.0 },
            { url: '/about', changefreq: 'weekly', priority: 0.8 },
            { url: '/help', changefreq: 'weekly', priority: 0.8 },
            { url: '/pricing', changefreq: 'weekly', priority: 0.8 },
            { url: '/admin', changefreq: 'weekly', priority: 0.6 },
            { url: '/PVC-candidates', changefreq: 'weekly', priority: 0.8 },
            { url: '/register', changefreq: 'weekly', priority: 0.8 },
            { url: '/login', changefreq: 'weekly', priority: 0.8 },
            { url: '/company/profile', changefreq: 'weekly', priority: 0.8 },
            { url: '/profile-seeker', changefreq: 'weekly', priority: 0.8 },
            { url: '/dashboard-recruiter', changefreq: 'weekly', priority: 0.8 },
            { url: '/dashboard-seeker', changefreq: 'weekly', priority: 0.8 },
            { url: '/post', changefreq: 'weekly', priority: 0.8 },
            { url: '/applied-jobs', changefreq: 'weekly', priority: 0.8 }
        ];

        // Fetch dynamic job URLs
        const jobs = await JobModel.findAllJobPostings();
        const jobLinks = jobs.map(job => ({
            url: `/job/${job._id}`,
            changefreq: 'daily',
            priority: 1.0
        }));

        // Fetch dynamic user profile URLs
        const users = await UserModel.findAllUsers();
        const userLinks = users.map(user => ({
            url: `/profile-seeker/${user._id}`,
            changefreq: 'weekly',
            priority: 0.8
        }));

        // Add blog URLs
        const blogs = await BlogModel.findAllBlogs();
        const blogLinks = blogs.map(blog => ({
            url: `/blog/${blog._id}`,
            changefreq: 'daily',
            priority: 0.9
        }));

        // Include blogLinks in allLinks
        const allLinks = [...staticLinks, ...jobLinks, ...userLinks, ...blogLinks];

        const stream = new SitemapStream({ hostname: 'https://hiyrnow.in' });
        const xml = await streamToPromise(Readable.from(allLinks).pipe(stream)).then(data => data.toString());

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Error generating sitemap:', err);
        res.status(500).send('Error generating sitemap');
    }
});

// // Add the sitemap route
// app.get('/sitemap.xml', async (req, res) => {
//     try {
//         const links = [
//             { url: '/', changefreq: 'daily', priority: 1.0 },
//             { url: '/home', changefreq: 'daily', priority: 1.0 },
//             { url: '/blogs', changefreq: 'daily', priority: 1.0 },
//             { url: '/about', changefreq: 'weekly', priority: 0.8 },
//             { url: '/help', changefreq: 'weekly', priority: 0.8 },
//             { url: '/pricing', changefreq: 'weekly', priority: 0.8 },
//             { url: '/admin', changefreq: 'weekly', priority: 0.6 },
//             { url: '/PVC-candidates', changefreq: 'weekly', priority: 0.8 },
//             { url: '/register', changefreq: 'weekly', priority: 0.8 },
//             { url: '/job/:id', changefreq: 'daily', priority: 0.9 },
//             { url: '/login', changefreq: 'weekly', priority: 0.8 },
//             { url: '/company/profile', changefreq: 'weekly', priority: 0.8 },
//             { url: '/profile-seeker', changefreq: 'weekly', priority: 0.8 },
//             { url: '/dashboard-recruiter', changefreq: 'weekly', priority: 0.8 },
//             { url: '/dashboard-seeker', changefreq: 'weekly', priority: 0.8 },
//             { url: '/job-list/:location/:keyword', changefreq: 'daily', priority: 0.1 },
//             { url: '/job-list/:location/:keyword/view-job/:jobId', changefreq: 'daily', priority: 0.9 },
//             { url: '/dashboard-seeker/view-job/:jobId', changefreq: 'daily', priority: 0.9 },
//             { url: '/dashboard-recruiter/view-job/:jobId', changefreq: 'daily', priority: 0.9 },
//             { url: '/post', changefreq: 'weekly', priority: 0.8 },
//             { url: '/applied-jobs', changefreq: 'weekly', priority: 0.8 },
//             { url: '/profile-seeker/:userId', changefreq: 'weekly', priority: 0.8 }
//         ];

//         const stream = new SitemapStream({ hostname: 'https://hiyrnow.in' });
//         const xml = await streamToPromise(Readable.from(links).pipe(stream)).then((data) => data.toString());

//         res.header('Content-Type', 'application/xml');
//         res.send(xml);
//     } catch (err) {
//         console.error('Error generating sitemap:', err);
//         res.status(500).send('Error generating sitemap');
//     }
// });

// Include other services as needed
var userService = require('./services/user.service.server');
userService(app);
var skillService = require('./services/skill.service.server');
skillService(app);
var awardService = require('./services/award.service.server');
awardService(app);
var certificateService = require('./services/certificate.service.server');
certificateService(app);
var educationService = require('./services/education.service.server');
educationService(app);
var extraCurricularService = require('./services/extra-curricular.service.server');
extraCurricularService(app);
var experienceService = require('./services/experience.service.server');
experienceService(app);
var jobApplicationService = require('./services/job-application.service.server');
jobApplicationService(app);
var jobPostingService = require('./services/job-posting.service.server');
jobPostingService(app);
var projectService = require('./services/project.service.server');
projectService(app);
var recruiterService = require('./services/recruiter-detail.service.server');
recruiterService(app);
var resumeUploadService = require('./services/resume.service.server');
resumeUploadService(app);
var profilePictureService = require('./services/profilePicture.service.server');
profilePictureService(app);
var filterService = require('./services/filter.service.server');
filterService(app);
var dashboardService = require('./services/dashboard.service.server');
dashboardService(app);
require('./services/blog.service.server')(app);
require('./services/request.service.server')(app);
require('./services/pvc.service.server')(app);

app.options('*', function (req, res) {
    res.sendStatus(200);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listening on port ${PORT} in ${app.settings.env} mode`);
});
