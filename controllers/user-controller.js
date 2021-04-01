const { User, Thought } = require('../models');

const userController = {
    // get all the user
    getAllUser(req, res) {
        User.find({})
          .select('-__v')
          .then(dbUserData => res.json(dbUserData))
          .catch(err => {
              console.log(err);
              res.status(400).json(err);
          });
    },


    // get single user
    getUserById({params}, res) {
        User.findOne({ _id: params.id })
          .populate({
              path: 'thoughts'
          })
          .populate({
            path: 'friends'
          })
          .select('-__v')
          .then(dbUserData => {
              if(!dbUserData) {
                  res.status(404).json({ message: 'No user found with this id!' });
                  return;
              }
              res.json(dbUserData);
          })
          .catch(err => {
              console.log(err);
              res.status(400).json(err);
          });
    },


    // create user
    createUser({body}, res) {
        User.create(body)
          .then(dbUserData => res.json(dbUserData))
          .catch(err => res.status(400).json(err));
    },


    // update user
    updateUser({params, body}, res) {
        User.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
          .then(dbUserData => {
            if(!dbUserData) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
            }
            res.json(dbUserData);
          })
          .catch(err => res.status(400).json(err));
    },


    // delete user
    deleteUser({params}, res) {
        User.findOneAndDelete({ _id: params.id })
          .then(dbUserData => {
            if(!dbUserData) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
            }
            // remove the user from friend list
            User.updateMany(
              {_id: { $in: dbUserData.friends }},
              {$pull: { friends: params.id }},
              { new: true }
            )
            .then(() => {
              // remove the thoughts wrote by deleted user
              Thought.deleteMany({ username: dbUserData.username })
              .then(() => {
                res.json({ message: 'User and associated thoughts had been deleted!' });
              })
              .catch(err => res.status(400).json(err));
            })
            .catch(err => res.status(400).json(err));
          })
          .catch(err => res.status(400).json(err));
    },

    
    // add friend
    addFriend({params}, res) {
        User.findOneAndUpdate(
            { _id: params.id },
            { $push: { friends: params.friendId }},
            { new: true }
        )
          .then(dbUserData => {
            if(!dbUserData) {
              res.status(404).json({ message: 'No user found with this id!' });
              return;
            }
            res.json(dbUserData);
          })
          .catch(err => res.status(400).json(err));
    },


    // remove friend
    removeFriend({params}, res) {
        User.findOneAndUpdate(
            { _id: params.id },
            { $pull: { friends: params.friendId }},
            { new: true }
        )
          .then(dbUserData => {
            if(!dbUserData) {
              res.status(404).json({ message: 'No user found with this id!' });
              return;
            }
            res.json(dbUserData);
          })
          .catch(err => res.status(400).json(err));
    }
};


module.exports = userController;