const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth.js");
const Profile = require("../../models/Profile.js");
const User = require("../../models/User.js");
const { check, validationResult } = require("express-validator/check");
const request = require("request");
const config = require("config");
const { response } = require("express");

// @route       GET api/profile/me
// @desc        Get current user's profile
// @access    Private
router.get("/me", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate("User", ["name", "avatar"]);

		if (!profile) {
			return res
				.status(400)
				.json({ msg: "There is no profile for this user." });
		}

		res.json(profile);
	} catch (err) {
		console.log(err.message);
		res.status(500).send({ msg: "Server error." });
	}
});

// @route       POST api/profile
// @desc        Create or Update a user's profile
// @access    Private
router.post(
	"/",
	[
		auth,
		[
			check("status", "Status is required.").not().isEmpty(),
			check("skills", "Skills is required.").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			company,
			website,
			location,
			bio,
			status,
			githubusername,
			skills,
			youtube,
			facebook,
			twitter,
			instagram,
			linkedin,
		} = req.body;

		// Build profile object
		const profileFields = {};
		profileFields.user = req.user.id;

		if (company) profileFields.company = company;
		if (website) profileFields.website = website;
		if (location) profileFields.location = location;
		if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		if (githubusername) profileFields.githubusername = githubusername;

		// Build skills array
		if (skills) {
			profileFields.skills = skills
				.split(", ")
				.map((skill) => skill.trim());
		}

		// Build social object
		profileFields.social = {};
		if (youtube) profileFields.social.youtube = youtube;
		if (twitter) profileFields.social.twitter = twitter;
		if (facebook) profileFields.social.facebook = facebook;
		if (linkedin) profileFields.social.linkedin = linkedin;
		if (instagram) profileFields.social.instagram = instagram;

		try {
			let profile = await Profile.findOne({ user: req.user.id });

			if (profile) {
				// Update profile
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);

				return res.json(profile);
			}

			// Create profile if none is found
			profile = new Profile(profileFields);
			await profile.save();
			res.json(profile);
		} catch (err) {
			console.log(err);
			res.status(500).send("Server error.");
		}
	}
);

// @route       GET api/profile
// @desc        Get all profiles
// @access    Public
router.get("/", async (req, res) => {
	try {
		const profiles = await Profile.find().populate("User", [
			"name",
			"avatar",
		]);
		res.json(profiles);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error.");
	}
});

// @route       GET api/profile/user/:user_id
// @desc        Get profile by user ID
// @access    Public
router.get("/user/:user_id", async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.params.user_id,
		}).populate("User", ["name", "avatar"]);

		if (!profile) {
			return res.status(400).json({ msg: "Profile not found." });
		}

		res.json(profile);
	} catch (err) {
		console.log(err.message);
		if (err.kind == "ObjectId") {
			return res.status(400).json({ msg: "Profile not found." });
		}
		res.status(500).send("Server error.");
	}
});

// @route       DELETE api/profile
// @desc        Delete profile, user & posts
// @access    Private
router.delete("/", auth, async (req, res) => {
	try {
		// Remove user posts
		await Post.deleteMany({ user: req.user.id });

		// Remove profile from DB
		await Profile.findOneAndRemove({ user: req.user.id });

		// Remove user from DB
		await User.findOneAndRemove({ _id: req.user.id });

		res.json({ msg: "User deleted." });
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error.");
	}
});

// @route       PUT api/profile/experience
// @desc        Add profile experience
// @access    Private
router.put(
	"/experience",
	[
		auth,
		[
			check("title", "Title is required.").not().isEmpty(),
			check("company", "Company name is required.").not().isEmpty(),
			check("from", "From Date is required.").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		} = req.body;

		const newExp = {
			title,
			company,
			location,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			//Unshifting experience into the profile.experience array - using unshift instead of push so the newer experience gets pushed to the front of the array
			profile.experience.unshift(newExp);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.log(err);
			res.status(500).send("Server error.");
		}
	}
);

// @route       DELETE api/profile/experience/:exp_id
// @desc        DELETE a profile experience
// @access    Private
router.delete("/experience/:exp_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get remove index
		const removeIndex = profile.experience
			.map((item) => item.id)
			.indexOf(req.params.exp_id);

		// removing the experience based on its index
		profile.experience.splice(removeIndex, 1);

		await profile.save();

		res.json(profile);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error.");
	}
});

// @route       PUT api/profile/education
// @desc        Add profile education
// @access    Private
router.put(
	"/education",
	[
		auth,
		[
			check("school", "School is required.").not().isEmpty(),
			check("degree", "Degree is required.").not().isEmpty(),
			check("fieldofstudy", "Field of study is required.")
				.not()
				.isEmpty(),
			check("from", "From Date is required.").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		} = req.body;

		const newEdu = {
			school,
			degree,
			fieldofstudy,
			from,
			to,
			current,
			description,
		};

		try {
			const profile = await Profile.findOne({ user: req.user.id });

			//Unshifting education into the profile.education array - using unshift instead of push so the newer education gets pushed to the front of the array
			profile.education.unshift(newEdu);

			await profile.save();

			res.json(profile);
		} catch (err) {
			console.log(err);
			res.status(500).send("Server error.");
		}
	}
);

// @route       DELETE api/profile/education/:edu_id
// @desc        DELETE a profile education
// @access    Private
router.delete("/education/:edu_id", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id });

		// Get remove index
		const removeIndex = profile.education
			.map((item) => item.id)
			.indexOf(req.params.edu_id);

		// removing the education based on its index
		profile.education.splice(removeIndex, 1);

		await profile.save();

		res.json(profile);
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error.");
	}
});

// @route       GET api/profile/github/:username
// @desc        GET user repos from github
// @access    Public
router.get("/github/:username", (req, res) => {
	try {
		const options = {
			uri: `https://api.github.com/users/${
				req.params.username
			}/repos?per_page=5&sort=created:asc&client_id=${config.get(
				"githubClientId"
			)}&client_secret=${config.get("githubSecret")}`,
			method: "GET",
			headers: { "user-agent": "node.js" },
		};

		request(options, (error, response, body) => {
			if (error) console.log(error);

			if (response.statusCode !== 200) {
				return res
					.status(404)
					.json({ msg: "No Github profile found." });
			}

			res.json(JSON.parse(body));
		});
	} catch (err) {
		console.log(err.message);
		res.status(500).send("Server error.");
	}
});

module.exports = router;
