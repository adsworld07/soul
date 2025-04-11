module.exports = function (app) {
  var session = require('express-session');
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
var userModel = require('./../models/user/user.model.server'); // Adjust the path based on your file structure
var skillModel = require('./../models/skill/skill.model.server')
const jobApplicationModel = require('./../models/job-application/job-application.model.server');
  var jobPostingModel =
      require('./../models/job-posting/job-posting.model.server');

  app.get('/api/jobPosting/:jobPostingId', findJobPostingById);
  app.get('/api/allJobPosting', findAllJobPostings);
  app.get('/api/jobPosting', findAllJobPostingByUserId);
  app.post('/api/jobPosting', createJobPosting);
  app.put('/api/jobPosting/:jobPostingId', updateJobPosting);
  app.delete('/api/jobPosting/:jobPostingId', deleteJobPosting);
  app.get('/api/jobPosting/applications/count', getJobApplicationsCount);
  app.get('/api/jobPosting/:jobPostingId/matchUsersWithScore', matchUsersWithScore);

  const fetch = require('node-fetch');  // Add this at the top with other requires

  async function createJobPosting(req, res) {
    try {
        if (!req.session || !req.session['user'] || req.session['user'].role === 'JobSeeker') {
            return res.status(401).send({ status: 'session expired' });
        }

        const jobPosting = req.body;
        const userId = req.session['user']._id;

        // Assign the user ID to the job posting
        jobPosting['user'] = userId;

        // Create job posting in the database
        const status = await jobPostingModel.createJobPosting(jobPosting);

        // Return success response
        res.json({
            status: 'success',
            jobPosting: status
        });

    } catch (error) {
        console.error('Job posting creation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create job posting',
            error: error.message || 'Internal server error'
        });
    }
}



async function findAllJobPostingByUserId(req, res) {
    try {
        if (req.session && req.session['user'] && req.session['user'].role !== 'JobSeeker') {
            const userId = req.session['user']._id;
            
            // Get all job postings for the user, sorted by creation date (most recent first)
            const jobPostings = await jobPostingModel.findJobPostingByUserId(userId).sort({ createdAt: -1 });

            // Get application counts for all job postings
            const jobIds = jobPostings.map(job => job._id);
            const applicationCounts = await jobApplicationModel.countApplicationsPerJob(jobIds);

            // Create a map of job ID to application count
            const applicationCountMap = applicationCounts.reduce((map, item) => {
                map[item._id.toString()] = item.applicationCount;
                return map;
            }, {});

            // Combine job postings with their application counts
            const jobPostingsWithApplications = jobPostings.map(job => ({
                ...job.toObject(),  // Convert mongoose document to plain object
                applicationDetails: {
                    totalApplications: applicationCountMap[job._id.toString()] || 0
                }
            }));

            res.json(jobPostingsWithApplications);
        } else {
            res.status(401).send({ status: 'session expired' });
        }
    } catch (error) {
        console.error('Error fetching job postings with applications:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch job postings',
            error: error.message || 'Internal server error'
        });
    }
}


  function findJobPostingById(req, res) {
    const jobPostingId = req.params['jobPostingId'];
    jobPostingModel.findJobPostingById(jobPostingId)
        .then(function (jobPosting) {
            // Check if it's a crawler (LinkedIn, Facebook, etc.)
            const userAgent = req.headers['user-agent'];
            const isCrawler = /facebookexternalhit|LinkedInBot|TwitterBot|Googlebot/i.test(userAgent);

            if (isCrawler) {
                // Render an HTML page with Open Graph metadata
                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta property="og:title" content="${jobPosting.title || 'HiyrNow Job Posting'}">
                        <meta property="og:description" content="${jobPosting.description || 'Find your next career opportunity on HiyrNow.'}">
                        <meta property="og:image" content="${jobPosting.imageUrl || 'https://hiyrnow.in/default-job-image.jpg'}">
                        <meta property="og:url" content="https://hiyrnow.in/job/${jobPostingId}">
                        <meta property="og:type" content="website">
                    </head>
                    <body>
                        <h1>${jobPosting.title || 'Job Posting'}</h1>
                        <p>${jobPosting.description || 'Details about this job are available on HiyrNow.'}</p>
                    </body>
                    </html>
                `);
            } else {
                // Default JSON response for API requests
                res.json(jobPosting);
            }
        })
        .catch(function (error) {
            res.status(500).send('Error fetching job posting');
        });
}


  function findAllJobPostings(req, res) {
      jobPostingModel.findAllJobPostings()
          .then(function (jobPosting) {
              res.json(jobPosting);
          });
  }


  function updateJobPosting(req, res) {
      var jobPosting = req.body;
      var jobPostingId = req.params['jobPostingId'];
      if (req.session && req.session['user'] && req.session['user'].role != 'JobSeeker') {
          jobPostingModel.updateJobPosting(jobPostingId, jobPosting)
              .then(function (status) {
                  res.send(status);
              });
      } else {
          res.send({status: 'session expired'});
      }
  }

  function deleteJobPosting(req, res) {
      if (req.session && req.session['user'] && req.session['user'].role != 'JobSeeker') {
          var id = req.params['jobPostingId'];
          jobPostingModel.deleteJobPosting(id).then(function (status) {
              res.send(status);
          })

      }
      else {
          res.send('session expired');
      }
  }



  async function matchUsersWithScore(req, res) {
    try {
        const jobPostingId = req.params['jobPostingId'];
        const user = req.session?.user; // Assuming the user object is stored in the session

        // Ensure the user is authenticated
        if (!user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        // Retrieve job posting with detailed information
        const jobPosting = await jobPostingModel.findJobPostingById(jobPostingId);
        if (!jobPosting) {
            return res.status(404).json({ error: "Job posting not found" });
        }

        // Authorization: Check if the user is the job owner or an Admin
        const isOwner = jobPosting.user.toString() === user._id.toString();
        const isAdmin = user.role === 'Admin'; // Assuming `role` is part of the user session

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        // Advanced matching criteria with weighted scoring
        const matchedUsers = await Promise.all(
            (await userModel.find({ role: "JobSeeker" })).map(async (user) => {
                let matchScore = {
                    skills: 0,
                    experience: 0,
                    location: 0,
                    salary: 0,
                    qualification: 0,
                    additionalFactors: 0
                };

                // Skill Matching (Most Important)
                const userSkills = await skillModel.findSkillByUserId(user._id).lean();
                const coreSkillNames = jobPosting.coreSkills.map(skill => skill.name.toLowerCase());
                const userSkillNames = userSkills.map(skill => skill.skillName.toLowerCase());
                
                const skillMatchPercentage = calculateSkillMatch(coreSkillNames, userSkillNames);
                matchScore.skills = calculateSkillScore(skillMatchPercentage);

                // Experience Matching
                if (user.totalExp >= jobPosting.minExp && user.totalExp <= jobPosting.maxExp) {
                    matchScore.experience = 25; // High weight for experience match
                } else {
                    matchScore.experience = calculateExperienceScore(user.totalExp, jobPosting.minExp, jobPosting.maxExp);
                }

                // Location Matching
                if (user.currentLocation === jobPosting.location) {
                    matchScore.location = 15;
                } else if (user.preferredLocation === jobPosting.location) {
                    matchScore.location = 10;
                }

                // Salary Matching
                if (user.currentCTC >= jobPosting.minSalary && user.currentCTC <= jobPosting.maxSalary) {
                    matchScore.salary = 20;
                } else {
                    matchScore.salary = calculateSalaryScore(user.currentCTC, jobPosting.minSalary, jobPosting.maxSalary);
                }

                // Qualification Matching
                if (user.qualification === jobPosting.minQualification) {
                    matchScore.qualification = 15;
                }

                // Additional Factors
                matchScore.additionalFactors = calculateAdditionalFactors(user, jobPosting);

                // Calculate Total Score
                const totalScore = Object.values(matchScore).reduce((a, b) => a + b, 0);

                return {
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        profilePicture: user.profilePicture,
                        skills: userSkillNames
                    },
                    matchScoreBreakdown: matchScore,
                    totalScore: totalScore,
                    skillMatchPercentage: skillMatchPercentage
                };
            })
        );

        // Filter and Sort Matches
        const validMatches = matchedUsers
            .filter(match => match.totalScore > 0 && match.skillMatchPercentage > 0)
            .sort((a, b) => b.totalScore - a.totalScore);

        // Recommend Top Matches
        const topMatches = validMatches.slice(0, 10); // Top 10 matches

        res.json({
            totalMatchesFound: validMatches.length,
            topMatches: topMatches
        });

    } catch (err) {
        console.error("Error in matchUsersWithScore:", err.message);
        res.status(500).json({ error: "Internal server error", details: err.message });
    }
}

// Helper Functions
function calculateSkillMatch(jobSkills, userSkills) {
    const matchedSkills = userSkills.filter(skill => jobSkills.includes(skill));
    return (matchedSkills.length / jobSkills.length) * 100;
}

function calculateSkillScore(matchPercentage) {
    if (matchPercentage >= 80) return 40;
    if (matchPercentage >= 60) return 30;
    if (matchPercentage >= 40) return 20;
    if (matchPercentage >= 20) return 10;
    return 0;
}

function calculateExperienceScore(userExp, minExp, maxExp) {
    if (userExp < minExp) {
        // Partial score for slightly less experience
        return Math.max(0, 15 * (1 - (minExp - userExp) / minExp));
    }
    if (userExp > maxExp) {
        // Partial score for slightly more experience
        return Math.max(0, 15 * (1 - (userExp - maxExp) / userExp));
    }
    return 25; // Perfect match
}

function calculateSalaryScore(userSalary, minSalary, maxSalary) {
    if (userSalary >= minSalary && userSalary <= maxSalary) return 20;
    
    // Calculate partial score based on proximity to salary range
    const lowerOffset = Math.abs(userSalary - minSalary);
    const upperOffset = Math.abs(userSalary - maxSalary);
    const rangeSpread = maxSalary - minSalary;
    
    const proximityScore = Math.max(0, 20 * (1 - Math.min(lowerOffset, upperOffset) / rangeSpread));
    return proximityScore;
}

function calculateAdditionalFactors(user, jobPosting) {
    let additionalScore = 0;

    // Language matching
    if (user.languagesKnown && user.languagesKnown.length > 0) {
        additionalScore += 5;
    }

    // Job type preference
    if (user.preferredJobType === jobPosting.type) {
        additionalScore += 5;
    }

    // Notice period consideration
    if (user.noticePeriod && parseInt(user.noticePeriod) <= 90) {
        additionalScore += 5;
    }

    return additionalScore;
}

    // ... (existing code remains the same) ...

    // Add this new route after the existing routes
   

    async function getJobApplicationsCount(req, res) {
        try {
            // Check if user is logged in and is not a JobSeeker
            if (!req.session || !req.session['user'] || req.session['user'].role === 'JobSeeker') {
                return res.status(401).send({ status: 'session expired' });
            }
    
            const userId = req.session['user']._id;
    
            // First get all job postings by this user
            const userJobPostings = await jobPostingModel.findJobPostingByUserId(userId);

            if (!userJobPostings || userJobPostings.length === 0) {
                return res.json({
                    totalApplications: 0,
                    jobWiseCount: []
                });
            }
    
            // Extract job IDs
            const jobIds = userJobPostings.map(job => job._id);
    
            const jobWiseCount = await jobApplicationModel.countApplicationsPerJob(jobIds);

    
            // Convert aggregation result to match job details
            const jobCountMap = jobWiseCount.reduce((map, job) => {
                map[job._id.toString()] = job.applicationCount;
                return map;
            }, {});
    
            const formattedJobWiseCount = userJobPostings.map(job => ({
                jobId: job._id,
                jobTitle: job.title,
                applicationCount: jobCountMap[job._id.toString()] || 0 // Default to 0 if no applications
            }));
    
            // Calculate total applications
            const totalApplications = formattedJobWiseCount.reduce((sum, job) => sum + job.applicationCount, 0);
    
            res.json({
                totalApplications,
                jobWiseCount: formattedJobWiseCount
            });
    
        } catch (err) {
            console.error("Error occurred while getting application counts:", err);
            res.status(500).send({ error: err.message });
        }
    }
    
};
  
  
  
