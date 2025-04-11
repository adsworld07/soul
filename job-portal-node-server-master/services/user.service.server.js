const jobPostingModelServer = require("../models/job-posting/job-posting.model.server");
const mongoose = require("mongoose");
const projectModelServer = require("./../models/project/project.model.server");
const { sendEmail, sendResetEmail } = require("./email.service");
const bcrypt = require("bcrypt");
const jobApplicationSchema = require("../models/job-application/job-application.schema.server");
var JobApplication = mongoose.model("JobApplication", jobApplicationSchema);
var skillSchema = require("../models/skill/skill.schema.server");
var Skill = mongoose.model("Skill", skillSchema);
const ProfileViewHistory = require("../models/profile-view-history/ProfileViewHistory.schema.server.js");
const {
  purchasePoints,
  deductPoints,
  FEATURE_COSTS,
} = require("./credit-points.service.server");
const creditPointsSchema = require("../models/credit-points/credit-points.model.server");
const passport = require("../passport-setup.js");
const crypto = require("crypto");
const userSchema = require("../models/user/user.schema.server.js");

module.exports = function (app) {
  var session = require("express-session");
  app.use(
    session({
      resave: false,
      saveUninitialized: true,
      duration: 30 * 60 * 1000,
      activeDuration: 30 * 60 * 1000,
      secret: "any string",
    })
  );
  var userModel = require("./../models/user/user.model.server");
  var recruiterModel = require("./../models/recruiter-detail/recruiter-detail.model.server");
  var experienceModel = require("./../models/experience/experience.model.server");
  var educationModel = require("./../models/education/education.model.server");
  var skillsModel = require("./../models/skill/skill.model.server");
  var resumepdf = require("./../models/resume-upload/resume-upload.model.server");
  var projectsModel = require("./../models/project/project.model.server");
  //  var  skillsModel  = require('./../models/skill/skill.model.server');
  const UserActivity = require("./../models/user/UserActivity.schema.server.js");

  // admin access
  app.get("/api/user", isAdmin, findAllUsers);
  app.get("/api/user/:userId", findUserById);
  app.get("/api/users/:username", findUserByUsername);
  app.get("/api/pending", isAdmin, findPendingRecruiters);
  app.post("/api/user", createUser);
  app.delete("/api/user/:userId", deleteUser);
  app.post("/api/approve/:userId", approveRecruiter);
  app.post("/api/premium/approve/:userId", grantPremiumAccess);
  app.post("/api/premium/revoke/:userId", revokePremiumAccess);
  app.get("/api/user/user-profile/:userId", getUserProfileById);
  app.get("/api/user/details/:userId", getUserDetails);
  app.get("/api/profile/score/:userId", getProfileCompletionScore);
  // app.get("/api/dashboard/:userId", getDashboardData);
  // users
  app.post("/api/login", login);
  app.post("/api/register", register);
  app.get("/api/profile", getProfile);
  app.get("/api/profile/recruiter", getRecruiterProfile);
  app.post("/api/logout", logout);
  app.put("/api/profile", updateProfile);
  app.delete("/api/user", deleteProfile);

  function isAdmin(req, res, next) {
    if (
      req.session &&
      req.session["user"] &&
      req.session["user"].role === "Admin"
    ) {
      next(); // User is admin, proceed to the next handler
    } else {
      res.status(403).send({ error: "Unauthorized: Admin access required" });
    }
  }

  // async function getDashboardData(req, res) {
  //   try {
  //     const userId = req.params.userId;

  //     // Fetch dashboard stats
  //     const totalApplications = await JobApplication.countDocuments({
  //       user: userId,
  //     });
  //     const totalInterviews = await JobApplication.countDocuments({
  //       user: userId,
  //       status: "Interview Scheduled",
  //     });
  //     const totalOffers = await JobApplication.countDocuments({
  //       user: userId,
  //       status: "Offer Received",
  //     });

  //     // Fetch recent applications
  //     const recentApplications = await JobApplication.find({ user: userId })
  //       .sort({ createdAt: -1 })
  //       .limit(5)
  //       .populate("jobPosting", "title company");

  //     // Fetch upcoming interviews
  //     const upcomingInterviews = await JobApplication.find({
  //       user: userId,
  //       status: "Interview Scheduled",
  //       interviewDate: { $gte: new Date() },
  //     })
  //       .sort({ interviewDate: 1 })
  //       .limit(5)
  //       .populate("jobPosting", "title company");

  //     // Fetch application activity (last 30 days)
  //     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  //     const applicationActivity = await JobApplication.aggregate([
  //       { $match: { user: userId, createdAt: { $gte: thirtyDaysAgo } } },
  //       {
  //         $group: {
  //           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
  //           count: { $sum: 1 },
  //         },
  //       },
  //       { $sort: { _id: 1 } },
  //     ]);

  //     // Fetch skills data
  //     const skills = await Skill.find({ user: userId });
  //     const skillsData = skills.map((skill) => ({
  //       name: skill.name,
  //       level: skill.level,
  //     }));

  //     res.json({
  //       stats: {
  //         totalApplications,
  //         totalInterviews,
  //         totalOffers,
  //       },
  //       recentApplications,
  //       upcomingInterviews,
  //       applicationActivity,
  //       skillsData,
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: "Error fetching dashboard data" });
  //   }
  // }
  function createUser(req, res) {
    if (
      req.session &&
      req.session["user"] &&
      req.session["user"].role === "Admin"
    ) {
      var user = req.body;
      userModel.findUserByUsername(user.username).then(function (u) {
        if (u != null) {
          res.json({ status: false });
        } else {
          userModel.createUser(user).then(function (user) {
            userModel.createUser(user).then(function () {
              res.send({ status: true });
            });
          });
        }
      });
    } else {
      res.json({ status: "no-session-exists" });
    }
  }
  function findAllUsers(req, res) {
    req.session && req.session["user"] && req.session["user"].role === "Admin";
    userModel.findAllUsers().then(function (user) {
      res.send(user);
    });
  }
  function findUserById(req, res) {
    var userId = req.params["userId"];
    userModel.findUserById(userId).then(function (user) {
      res.json(user);
    });
  }

  function findUserByUsername(req, res) {
    const username = req.params["username"]; // Extract username from route params
    userModel
      .findUsername(username) // Call the userModel's findUsername method
      .then((user) => {
        if (user) {
          res.status(200).json(user); // Send user details if found
        } else {
          res.status(404).json({ message: "User not found" }); // User not found
        }
      })
      .catch((error) => {
        console.error("Error finding user:", error);
        res.status(500).json({ message: "Internal server error" }); // Handle errors
      });
  }

  function findPendingRecruiters(req, res) {
    if (
      req.session &&
      req.session["user"] &&
      req.session["user"].role === "Admin"
    ) {
      userModel.findPendingRecruiters().then(function (user) {
        res.json(user);
      });
    }
  }

  function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    return forwarded ? forwarded.split(",")[0].trim() : req.ip;
  }

  function login(req, res) {
    var user = req.body;
    var identifier = user.username; // This can be either username or email
    var password = user.password;

    userModel
      .findUserByCredentials(identifier)
      .then((u) => {
        if (u != null) {
          bcrypt.compare(password, u.password, async function (err, result) {
            if (err) {
              return res.status(500).json({ error: "Internal Server Error" });
            }

            if (result) {
              if (
                u.role === "JobSeeker" ||
                u.role === "Admin" ||
                u.role === "Recruiter"
              ) {
                req.session["user"] = u;

                // Log the login activity
                try {
                  await UserActivity.create({
                    userId: u._id,
                    user: u.username,
                    activityType: "login",
                    ipAddress: req.ip, // Capture user's IP address
                    device: req.headers["user-agent"], // Capture browser/device info
                  });
                } catch (logError) {
                  console.error("Error logging user activity:", logError);
                }

                return res.json({ status: "success", role: u.role });
              } else {
                return res.json({
                  status: "Recruiter verification pending",
                  role: null,
                });
              }
            } else {
              return res.json({ status: "Invalid password", role: null });
            }
          });
        } else {
          return res.json({ status: "user does not exist", role: null });
        }
      })
      .catch(function (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  }

  // function login(req, res) {
  //     var user = req.body;
  //     var identifier = user.username; // This can be either username or email
  //     console.log("$$$$$$$$$$$$$$$$",user.password)
  //     var password = user.password;
  //     userModel.findUserByCredentials(identifier, password)
  //         .then((u) => {
  //             if (u != null) {
  //                 if ((u.role === 'JobSeeker' || u.role === 'Admin') || (u.role === 'Recruiter' && u.requestStatus != 'Pending')) {
  //                     req.session['user'] = u;
  //                     res.json({ status: 'success', role: u.role });
  //                 } else {
  //                     res.json({ status: 'Recruiter verification pending', role: null });
  //                 }
  //             } else {
  //                 res.json({ status: 'user does not exist', role: null });
  //             }
  //         });
  // }
  function register(req, res) {
    var user = req.body;
    var username = user.username;
    var email = user.email;
    userModel.findUserByUsername(username, email).then(function (u) {
      if (u != null) {
        res.json({ status: false });
      } else {
        bcrypt.hash(user.password, 10, function (err, hash) {
          if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
          }
          user.password = hash;
          userModel.createUser(user).then(function (user) {
            user.password = "";
            if (user.role != "Recruiter") {
              req.session["user"] = user;
              // sendEmail(user.email, 'Welcome to Our Service', 'Thank you for registering with us!');
              sendEmail(user.email, "Welcome to Our Service", user.username);

              res.json({ status: true });
            } else {
              recruiterModel
                .createRecruiterDetail({ user: user._id })
                .then(() => {
                  sendEmail(
                    user.email,
                    "Welcome to Our Service",
                    "Thank you for registering with us!"
                  );
                  res.json({ status: true });
                });
            }
          });
        });
      }
    });
  }

  function getProfile(req, res) {
    if (req.session && req.session["user"]) {
      userModel
        .findUserById(req.session["user"]._id)
        .then((user) => res.json(user));
    } else {
      res.send(null);
    }
  }
  function getRecruiterProfile(req, res) {
    if (req.session && req.session["user"]) {
      userModel.findRecruiterbyId(req.session["user"]._id).then((recruiter) => {
        res.json(recruiter);
      });
    } else {
      res.send(null);
    }
  }
  function updateProfile(req, res) {
    if (req.session && req.session["user"]) {
      var user = req.session["user"];
      var id = user._id;
      var newUser = req.body;
      userModel.updateUser(id, newUser).then(function (status) {
        newUser["_id"] = id;
        req.session["user"] = newUser;
        res.send(status);
      });
    } else {
      res.send(null);
    }
  }
  function logout(req, res) {
    if (req.session && req.session["user"]) {
      req.session.destroy();
      res.send("logged-out");
    } else {
      res.send("no-session-exists");
    }
  }
  function deleteUser(req, res) {
    if (
      req.session &&
      req.session["user"] &&
      req.session["user"].role === "Admin"
    ) {
      var id = req.params["userId"];
      userModel.deleteUser(id).then(function (status) {
        res.send(status);
      });
    } else {
      res.json({ status: "no-session-exists" });
    }
  }
  function deleteProfile(req, res) {
    if (
      req.session &&
      req.session["user"] &&
      req.session["user"].role === "Admin"
    ) {
      var id = req.session["user"]._id;
      userModel.deleteUser(id).then(function (status) {
        res.send(status);
      });
    } else {
      res.send("no-session-exists");
    }
  }
  function approveRecruiter(req, res) {
    if (
      req.session &&
      req.session["user"] &&
      req.session["user"].role === "Admin"
    ) {
      var id = req.params["userId"];
      userModel.approveRecruiter(id).then((status) =>
        userModel.findUserById(id).then((user) => {
          sendEmailToUser(user.email, user.username);
          res.send(status);
        })
      );
    } else {
      res.send("no-session-exists");
    }
  }
  function grantPremiumAccess(req, res) {
    if (
      req.session &&
      req.session["user"] &&
      req.session["user"].role === "Admin"
    ) {
      var id = req.params["userId"];
      userModel.grantPremiumAccess(id).then(function (status) {
        res.send(status);
      });
    } else {
      res.send("no-session-exists");
    }
  }
  function revokePremiumAccess(req, res) {
    if (
      req.session &&
      req.session["user"] &&
      req.session["user"].role === "Admin"
    ) {
      var id = req.params["userId"];
      userModel.revokePremiumAccess(id).then(function (status) {
        res.send(status);
      });
    } else {
      res.send("no-session-exists");
    }
  }
  function sendEmailToUser(emailAddress, username) {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: emailAddress,
      from: "JobSearchMadeEasy@enjoy.com",
      subject: "You are verified!!",
      text:
        "Hi " +
        username +
        ",\n" +
        "Welcome to Hyrnow Search Made Easy.\n" +
        "You are now a verified recruiter. Thanks for joining us. Enjoy the features of " +
        "our new application by logging in the best job search website",
    };
    return sgMail.send(msg);
  }
  function getUserProfileById(req, res) {
    var userId = req.params.userId;
    userModel
      .findUserById(userId)
      .then(function (user) {
        res.json(user);
      })
      .catch(function (error) {
        console.error("Error fetching user profile by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  }
  const fetch = require("node-fetch");
  async function getUserDetails(req, res) {
    try {
      const userId = req.params.userId; // Profile being viewed
      const viewerId = req.session["user"]._id; // ID of the user viewing the profile
      const feature = req.query.feature; // Get feature from query parameters
      let creditInfo = null; // Store credit deduction info

      if (!viewerId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Check if the profile has already been viewed within the last year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const existingView = await ProfileViewHistory.findOne({
        viewerId,
        profileId: userId,
        viewedAt: { $gte: oneYearAgo }, // Check if viewed within last year
      });

      if (!existingView && feature === "viewprofile") {
        try {
          // Deduct credits if not viewed in the last year
          const deductionResult = await fetch(
            "http://localhost:5500/api/credits/deduct",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Cookie: req.headers.cookie,
              },
              credentials: "include",
              body: JSON.stringify({ feature: "viewprofile" }),
            }
          );

          creditInfo = await deductionResult.json();

          if (!deductionResult.ok) {
            return res.status(400).json({
              status: "error",
              message: "Insufficient credits to view profile details",
              details: creditInfo.error,
            });
          }

          // Save the profile view history
          await ProfileViewHistory.create({
            viewerId,
            profileId: userId,
            viewedAt: new Date(),
          });
        } catch (error) {
          console.error("Credit deduction error:", error);
          return res.status(500).json({
            status: "error",
            message: "Failed to process credit deduction",
            error: error.message || "Internal server error",
          });
        }
      }

      // Fetch user details
      const user = await userModel.findUserById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      try {
        const [experiences, education, skill, project] = await Promise.all([
          experienceModel.findExperienceByUserId(userId),
          educationModel.findEducationByUserId(userId),
          skillsModel.findSkillByUserId(userId),
          projectsModel.findProjectByUserId(userId),
        ]);

        const response = {
          status: "success",
          data: { user, experiences, education, skill, project },
        };

        // If credits were deducted, include the info
        if (feature === "viewprofile" && creditInfo) {
          response.credits = {
            remainingPoints: creditInfo.remainingPoints,
            transaction: creditInfo.transaction,
          };
        }

        res.json(response);
      } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({
          status: "error",
          message: "Failed to fetch user details",
          error: error.message || "Internal server error",
        });
      }
    } catch (error) {
      console.error("Error in getUserDetails:", error);
      res.status(500).json({
        status: "error",
        message: "Failed to process request",
        error: error.message || "Internal server error",
      });
    }
  }
  function getProfileCompletionScore(req, res) {
    const userId = req.params.userId;

    userModel
      .findUserById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Fetch the related information for the user
        Promise.all([
          experienceModel.findExperienceByUserId(userId),
          educationModel.findEducationByUserId(userId),
          skillsModel.findSkillByUserId(userId),
          projectsModel.findProjectByUserId(userId),
          resumepdf.findResumeUploadByUserId(userId),
        ])
          .then(([experiences, education, skills, projects, resume]) => {
            // Initialize score and remaining sections
            let score = 0;
            const totalSections = 5; // Number of sections considered for profile completion
            const remainingSections = [];

            // Check and assign score for each section
            // if (user.profilePicture) {
            //   score += 1;
            // } else {
            //   remainingSections.push("Profile Picture");
            // }

            if (experiences && experiences.length > 0) {
              score += 1;
            } else {
              remainingSections.push("Work Experience");
            }

            if (education && education.length > 0) {
              score += 1;
            } else {
              remainingSections.push("Education");
            }

            if (skills && skills.length > 0) {
              score += 1;
            } else {
              remainingSections.push("Skills");
            }

            if (projects && projects.length > 0) {
              score += 1;
            } else {
              remainingSections.push("Projects");
            }

            if (resume) {
              score += 1;
            } else {
              remainingSections.push("Resume");
            }

            // Calculate percentage score
            const completionPercentage = (score / totalSections) * 100;

            // Return score and remaining sections
            res.json({
              userId: user._id,
              score: completionPercentage,
              sectionsCompleted: score,
              totalSections: totalSections,
              remainingSections: remainingSections, // List of sections to complete
            });
          })
          .catch(function (error) {
            console.error("Error calculating profile completion score:", error);
            res.status(500).json({ error: "Internal Server Error" });
          });
      })
      .catch(function (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
      });
  }
  app.get("/api/match-jobs/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      // Fetch user details
      const user = await userModel.findUserById(userId).lean();
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Fetch experiences, education, skills, projects, and resume
      const [experiences, education, skills, projects, resume] =
        await Promise.all([
          experienceModel.findExperienceByUserId(userId).lean(),
          educationModel.findEducationByUserId(userId).lean(),
          skillsModel.findSkillByUserId(userId).lean(),
          projectsModel.findProjectByUserId(userId).lean(),
          resumepdf.findResumeUploadByUserId(userId).lean(),
        ]);

      // Extract relevant user details for job matching
      const userSkills = skills.map((skill) => skill.skillName); // Use 'skillName' instead of 'name'
      const userLocation = user.preferredLocation || user.currentLocation;
      const userExp = experiences.reduce((total, exp) => total + exp.years, 0); // Sum experience years
      const preferredJobType = user.preferredJobType;

      // Fetch job postings based on location, experience, and job type
      const jobPostings = await jobPostingModelServer
        .findAllJobPostings({
          location: userLocation,
          minExp: { $lte: userExp },
          maxExp: { $gte: userExp },
          type: preferredJobType,
        })
        .lean();

      // Filter jobs by skills
      const matchedJobs = jobPostings.filter((job) => {
        // Extract skill names from the job's coreSkills array
        const jobSkillNames = job.coreSkills.map((skill) => skill.name);

        // Check if any of the user's skills are in the job's coreSkills
        return userSkills.some((userSkill) =>
          jobSkillNames.includes(userSkill)
        );
      });

      // Respond with matched jobs and user details
      res.json({
        matchedJobs,
      });
    } catch (error) {
      console.error("Error matching jobs:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Purchase points
  app.post("/api/credits/purchase", async (req, res) => {
    if (!req.session || !req.session["user"]) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { amount } = req.body;
      const userId = req.session["user"]._id;
      const result = await purchasePoints(userId, amount);
      res.json({
        success: true,
        points: result.points,
        transaction: result.transactions[result.transactions.length - 1],
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  const {
    purchasePoints,
    deductPoints,
    FEATURE_COSTS,
  } = require("./credit-points.service.server");
  // Deduct points for feature usage
  app.post("/api/credits/deduct", async (req, res) => {
    if (!req.session || !req.session["user"]) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const { feature } = req.body;
      const userId = req.session["user"]._id;
      const result = await deductPoints(userId, feature);
      res.json({
        success: true,
        remainingPoints: result.points,
        transaction: result.transactions[result.transactions.length - 1],
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get credit points balance
  app.get("/api/credits/balance", async (req, res) => {
    // Check authentication first
    // if (!req.session || !req.session["user"]) {
    //   return res.status(401).json({ error: "Not authenticated" });
    // }
    try {
      // Take userId from query params if present, otherwise fallback to session user
      const userId = req.query.userId || req.session["user"]._id;

      const creditPoints = await creditPointsSchema.findOne({ user: userId });

      res.json({
        points: creditPoints ? creditPoints.points : 0,
        features: FEATURE_COSTS,
      });
    } catch (error) {
      console.error("Error fetching balance:", error);
      res.status(500).json({ error: "Error fetching balance" });
    }
  });

  // Get transaction history
  app.get("/api/credits/transactions", async (req, res) => {
    // if (!req.session || !req.session["user"]) {
    //   return res.status(401).json({ error: "Not authenticated" });
    // }

    try {
      // const userId = req.session["user"]._id;
      const userId = req.query.userId || req.session["user"]._id;
      const creditPoints = await creditPointsSchema.findOne({ user: userId });

      // Reverse the transactions array to get the latest transaction first
      const transactions = creditPoints
        ? creditPoints.transactions.reverse()
        : [];

      res.json({ transactions });
    } catch (error) {
      res.status(500).json({ error: "Error fetching transactions" });
    }
  });
  app.get(
    "/api/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/login",
      session: true,
    }),
    (req, res) => {
      // Successful authentication, redirect or send token
      req.session["user"] = req.user;

      // Determine redirect URL based on hostname
      const host = req.hostname;
      const redirectUrl = host.includes("localhost")
        ? "http://localhost:4200/profile-seeker"
        : "https://hiyrnow.in/profile-seeker";

      res.redirect(redirectUrl);
    }
  );

  app.get("/api/current_user", (req, res) => {
    var user = req.session["user"]._id; 
    res.json(user || null);
  });
  //todo
  app.get("/api/user-activity/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const activities = await UserActivity.find({ userId }).sort({
        timestamp: -1,
      });
      return res.json(activities);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Add these routes to the existing module.exports function in the user service file

  // Add credits by admin
  app.post("/api/admin/credits/add", async (req, res) => {
    // Check if admin is logged in
    if (
      !req.session ||
      !req.session["user"] ||
      req.session["user"].role !== "Admin"
    ) {
      return res
        .status(403)
        .json({ error: "Unauthorized. Admin access required." });
    }

    try {
      const { userId, amount } = req.body;

      // Validate input
      if (!userId || !amount || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid user ID or credit amount" });
      }

      // Find or create credit points document for the user
      let creditPoints = await creditPointsSchema.findOne({ user: userId });

      if (!creditPoints) {
        creditPoints = new creditPointsSchema({
          user: userId,
          points: 0,
          transactions: [],
        });
      }

      // Add credits
      const previousBalance = creditPoints.points;
      creditPoints.points += amount;

      // Create transaction record
      const transaction = {
        type: "CREDIT",
        amount: amount * 5,
        points: amount,
        timestamp: new Date(),
        description: "credited By Admin",
        previousBalance: previousBalance,
        newBalance: creditPoints.points,
        adminId: req.session["user"]._id,
      };

      creditPoints.transactions.push(transaction);

      // Save the updated credit points
      await creditPoints.save();

      res.json({
        success: true,
        message: "Credits added successfully",
        newBalance: creditPoints.points,
        transaction: transaction,
      });
    } catch (error) {
      console.error("Error adding credits by admin:", error);
      res
        .status(500)
        .json({ error: "Failed to add credits", details: error.message });
    }
  });

  // Remove credits by admin
  app.post("/api/admin/credits/remove", async (req, res) => {
    // Check if admin is logged in
    if (
      !req.session ||
      !req.session["user"] ||
      req.session["user"].role !== "Admin"
    ) {
      return res
        .status(403)
        .json({ error: "Unauthorized. Admin access required." });
    }

    try {
      const { userId, amount } = req.body;

      // Validate input
      if (!userId || !amount || amount <= 0) {
        return res
          .status(400)
          .json({ error: "Invalid user ID or credit amount" });
      }

      // Find credit points document for the user
      const creditPoints = await creditPointsSchema.findOne({ user: userId });

      if (!creditPoints) {
        return res.status(404).json({ error: "User credit record not found" });
      }

      // Check if user has sufficient credits
      if (creditPoints.points < amount) {
        return res.status(400).json({
          error: "Insufficient credits",
          currentBalance: creditPoints.points,
        });
      }

      // Remove credits
      const previousBalance = creditPoints.points;
      creditPoints.points -= amount;

      // Create transaction record
      const transaction = {
        type: "admin_credit_removal",
        amount: amount,
        timestamp: new Date(),
        previousBalance: previousBalance,
        newBalance: creditPoints.points,
        adminId: req.session["user"]._id,
      };

      creditPoints.transactions.push(transaction);

      // Save the updated credit points
      await creditPoints.save();

      res.json({
        success: true,
        message: "Credits removed successfully",
        newBalance: creditPoints.points,
        transaction: transaction,
      });
    } catch (error) {
      console.error("Error removing credits by admin:", error);
      res
        .status(500)
        .json({ error: "Failed to remove credits", details: error.message });
    }
  });

  // Route to request password reset
  app.post("/api/request-password-reset", async (req, res) => {
    const { email } = req.body;
    try {
      const user = await userModel.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate a reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

      // Update user with reset token and expiry
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // Send email with reset link
      const resetLink = `https://hiyrnow.in/reset-password/${resetToken}`;
      await sendResetEmail(
        user.email,
        "Password Reset Request",
        `Click here to reset your password: ${resetLink}`
      );

      res.json({ message: "Password reset link sent to your email" });
    } catch (error) {
      console.error("Error requesting password reset:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  var mongoose = require("mongoose");
  var users = mongoose.model("users", userSchema);
  // Route to reset password
  app.post("/api/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    try {
      const user = await users.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password and clear reset token
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
};
