var admin = require('firebase-admin');

var serviceAccount = require("../config/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://airbnbclone-88e95.firebaseio.com"
});

const userModel = require('../models/user');

module.exports = {
  verifyAccount: function (user) {
    return new Promise(function (resolve, reject) {
      //Place the user info that reached this point in a string into an object
      userJson = JSON.parse(user);
      console.log(user)

      //Check if the user token is valid, this will confirm the user is correctly logged in
      admin.auth().verifyIdToken(userJson.stsTokenManager.accessToken)
        .then(function (decodedToken) {
          userModel.findOne({ googleId: userJson.uid }).then(function (user) {
          console.log("verifyAccount")

            if (!user) {
              
              new userModel({
                name: userJson.displayName,
                picture: userJson.photoURL,
                email: userJson.email,
                googleId: userJson.uid
              }).save().then(function(error, user){
                resolve({
                  code: 200,
                  success: true,
                  message: "auth confirmed: new user created",
                  user: user
                })
              })
            } else {
              console.log("verifyAccount")
              resolve({
                code: 200,
                success: true,
                message: "auth confirmed: existing user",
                user: user
              })
            }
          })
        }).catch(function (error) {
          console.log(error)
          reject({
            code: 401,
            success: false,
            message: "auth denied",
            error: error
          })
        });
    });
  }
};