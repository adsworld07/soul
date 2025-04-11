// resume.server.js
// Add at the top with other requires:
const ResumeParser = require('./resumeParser');
const resumeParser = new ResumeParser();
module.exports = function (app) {
    const session = require('express-session');
    const multer = require('multer');
    const { GridFsStorage } = require('multer-gridfs-storage');
    const mongoose = require('mongoose');
    const Grid = require('gridfs-stream');

    // Access the MongoDB connection created in server.js
    const conn = mongoose.connection;
    let gfs;

    conn.once('open', () => {
        // Initialize GridFS stream
        gfs = Grid(conn.db, mongoose.mongo);
        gfs.collection('resumeFiles');
    });

    app.use(session({
        resave: false,
        saveUninitialized: true,
        duration: 30 * 60 * 1000,
        activeDuration: 30 * 60 * 1000,
        secret: 'any string',
        cookie: {
            sameSite: 'None',
            secure: true, // Set this to true if your app is served over HTTPS
        },
    }));

    // Setting up the storage element
    const storage = new GridFsStorage({
        url: 'mongodb+srv://aditya:k353OKjCl6XfGw13@cluster0.cvuu6yu.mongodb.net/?retryWrites=true&w=majority',
        options: { useNewUrlParser: true, useUnifiedTopology: true },
        file: (req, file) => {
            return {
                filename: file.originalname,
                bucketName: 'resumeFiles',
                metadata: {
                    userId: mongoose.Types.ObjectId(req.session.user._id)
                },
            };
        }
    });

    // Multer configuration for single file uploads
    const upload = multer({ storage: storage }).single('file');

    // Authentication middleware
    const requireLogin = (req, res, next) => {
        if (!req.session || !req.session['user'] || !req.session['user']._id) {
            return res.status(401).json({ params: req.session, responseCode: 1, responseMessage: "Unauthorized" });
        }
        next();
    };




    const User = require('../models/user/user.model.server');
    const Experience = require('../models/experience/experience.model.server');
    const Education = require('../models/education/education.model.server');
    const Skill = require('../models/skill/skill.model.server');
    const Certificate = require('../models/certificate/certificate.model.server');
    const ResumeParser = require("./resumeParser")
  
    app.get('/api/parse-resume', async (req, res) => {
        try {
           
    
            // Find the most recently uploaded resume
            const files = await gfs.files.find({
                'metadata.userId': mongoose.Types.ObjectId(req.session.user._id)
            }).sort({ uploadDate: -1 }).toArray();
    
            if (!files || files.length === 0) {
                return res.status(404).json({
                    responseCode: 1,
                    responseMessage: "No resume found for parsing"
                });
            }
    
            const file = files[0];
            const readstream = gfs.createReadStream({ filename: file.filename });
            const fileBuffer = await streamToBuffer(readstream);
            const fileExtension = file.filename.split('.').pop().toLowerCase();
    
            // Extract and parse text using the new parser
            const extractedText = await resumeParser.extractText(fileBuffer, fileExtension);
            const parsedData = await resumeParser.parseResumeText(extractedText);
    
            const user = req.session.user._id;
    
            // Update user's basic information
            const userUpdateFields = {
                firstName: parsedData.personalInfo?.name?.split(' ')[0] || '',
                lastName: parsedData.personalInfo?.name?.split(' ')[1] || '',
                email: parsedData.contact?.email || '',
                phone: parsedData.contact?.phone || '',
                currentLocation: parsedData.personalInfo?.location || '',
            };
    
            await User.updateUser(user, userUpdateFields);
    
            // Upsert education records
            if (parsedData.education?.length > 0) {
                for (const edu of parsedData.education) {
                    await Education.findOneAndUpdate(
                        { user, institute: edu.institution, degree: edu.degree },
                        { $set: { fieldOfStudy: edu.fieldOfStudy, startDate: edu.startDate, endDate: edu.endDate } },
                        { upsert: true, new: true }
                    );
                }
            }
    
            // Upsert experience records
            if (parsedData.experience?.length > 0) {
                for (const exp of parsedData.experience) {
                    await Experience.findOneAndUpdate(
                        { user, company: exp.company, title: exp.title },
                        { $set: { startDate: exp.startDate, endDate: exp.endDate, description: exp.responsibilities } },
                        { upsert: true, new: true }
                    );
                }
            }
    
            // Upsert skills records
            if (parsedData.skills?.length > 0) {
                for (const skill of parsedData.skills) {
                    await Skill.findOneAndUpdate(
                        { user, skillName: skill },
                        { $set: { skillLevel: '1' } },
                        { upsert: true, new: true }
                    );
                }
            }
    
            res.json({
                responseCode: 0,
                responseMessage: "Resume parsed and updated successfully",
                parsedData: parsedData
            });
    
        } catch (error) {
            res.status(500).json({
                responseCode: 1,
                responseMessage: "Error parsing resume",
                error: error.message
            });
        }
    });
    
    


    
// Utility function to convert stream to buffer
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}

// Utility function to convert stream to buffer
function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    });
}
    // Route for uploading resume
    app.post('/api/upload', requireLogin, (req, res) => {
        const userId = mongoose.Types.ObjectId(req.session.user._id);

        // Check if user already has a resume file
        gfs.files.find({ 'metadata.userId': userId }).toArray((err, files) => {
            if (err) {
                console.error('Error finding existing resume file:', err);
                return res.status(500).json({ error: 'Error finding existing resume file' });
            }

            if (files.length > 0) {
                // User already has a resume file, delete it
                const fileId = files[0]._id;
                gfs.remove({ _id: fileId, root: 'resumeFiles' }, (deleteErr) => {
                    if (deleteErr) {
                        console.error('Error deleting existing resume file:', deleteErr);
                        return res.status(500).json({ error: 'Error deleting existing resume file' });
                    }

                    // Proceed to upload the new file
                    uploadFile();
                });
            } else {
                // No existing resume file, proceed to upload the new file
                uploadFile();
            }
        });

        function uploadFile() {
            upload(req, res, (err) => {
                if (err) {
                    console.error('Error during file upload:', err);
                    return res.json({ error_code: 1, err_desc: err });
                }

                res.json({ error_code: 0, error_desc: null, file_uploaded: true });
            });
        }
    });

    // Route for fetching all uploaded resume files for the logged-in user
    app.get('/api/files', requireLogin, (req, res) => {
        gfs.files.find({ 'metadata.userId': mongoose.Types.ObjectId(req.session['user']._id) }).toArray((err, files) => {
            if (err) {
                return res.status(500).json({ responseCode: 1, responseMessage: "Internal Server Error" });
            }
            if (!files || files.length === 0) {
                return res.status(404).json({ responseCode: 1, responseMessage: "No files found for the user" });
            }
            const filesData = files.map((file) => ({
                originalname: file.originalname,
                filename: file.filename,
                contentType: file.contentType
            }));

            res.json(filesData);
        });
    });

    // Route for fetching a specific resume file by filename for the logged-in user
    app.get('/api/file/:filename', requireLogin, (req, res) => {
        gfs.files.findOne({ filename: req.params.filename, 'metadata.userId': mongoose.Types.ObjectId(req.session['user']._id) }, (err, file) => {
            if (err) {
                return res.status(500).json({ responseCode: 1, responseMessage: "Internal Server Error" });
            }
            if (!file) {
                return res.status(404).json({ responseCode: 1, responseMessage: "File not found for the user" });
            }
            const readstream = gfs.createReadStream({ filename: file.filename });
            res.set('Content-Type', file.contentType);
            return readstream.pipe(res);
        });
    });
    app.get('/api/file/:filename/:userId', requireLogin, (req, res) => {
        // Check if user has access
        const userRole = req.session['user'].role;
        const hasAccess = userRole === "Admin" || userRole === "Recruiter";
    
        if (!hasAccess) {
            return res.status(403).json({ responseCode: 1, responseMessage: "Forbidden: Access Denied" });
        }
    
        const userId = req.params.userId;
    
        gfs.files.findOne({ filename: req.params.filename, 'metadata.userId': mongoose.Types.ObjectId(userId) }, (err, file) => {
            if (err) {
                return res.status(500).json({ responseCode: 1, responseMessage: "Internal Server Error" });
            }
            if (!file) {
                return res.status(404).json({ responseCode: 1, responseMessage: "File not found for the user" });
            }
            const readstream = gfs.createReadStream({ filename: file.filename });
            res.set('Content-Type', file.contentType);
            return readstream.pipe(res);
        });
    });
    


    app.get('/api/user/reusme/:userId', findResumeUploadByUserIdFordetails);
    async function findResumeUploadByUserIdFordetails(req, res) {
        var userId = req.params.userId;
      
        gfs.files.find({ 'metadata.userId': mongoose.Types.ObjectId(userId) }).toArray((err, files) => {
            if (err) {
                return res.status(500).json({ responseCode: 1, responseMessage: "Internal Server Error" });
            }
            if (!files || files.length === 0) {
                return res.status(404).json({ responseCode: 1, responseMessage: "No files found for the user" });
            }
            const filesData = files.map((file) => ({
                originalname: file.originalname,
                filename: file.filename,
                contentType: file.contentType
            }));

            res.json(filesData);
        });
    }
};
