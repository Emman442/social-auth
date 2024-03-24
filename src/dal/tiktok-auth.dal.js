const User = require("./models/user.model");

const tiktokAuthDal = {
  registerWithTiktok: async (oauthUser) => {
    const isUserExists = await User.findOne({
      accountId: oauthUser.id,
      provider: oauthUser.provider,
    });
    if (isUserExists) {
      const failure = {
        message: "User already Registered.",
      };
      return { failure };
    }

    const user = new User({
      accountId: oauthUser.id,
      name: oauthUser.displayName,
      provider: oauthUser.provider,
     
    });
    await user.save();
    const success = {
      message: "User Registered.",
    };
    return { success };
  },

};

module.exports = tiktokAuthDal;
