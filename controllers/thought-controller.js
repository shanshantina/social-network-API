const { User, Thought } = require('../models');

const thoughtController = {
    // get all thoughts
    getAllThought(req, res) {
        Thought.find({})
          .populate({
            path: 'reactions',
            select: '-__v'
          })
          .select('-__v')
          .then(dbThoughtData => res.json(dbThoughtData))
          .catch(err => {
              console.log(err);
              res.status(400).json(err);
          });
    },


    // get single thought
    getThoughtById({params}, res) {
        Thought.findOne({ _id: params.id })
        .populate({
            path: 'reactions',
            select: '-__v'
        })
        .select('-__v')
        .then(dbThoughtData => {
            if(!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        });
    },


    // create thought
    createThought({params, body}, res) {
        console.log(params);
        Thought.create(body)
          .then(({_id}) => {
              return User.findOneAndUpdate(
                  { _id: params.userId },
                  { $push: { thoughts: _id }},
                  { new: true }
              );
          })
          .then(dbUserData => {
              if(!dbUserData) {
                  res.status(404).json({ message: 'No user found with this id!' });
                  return;
              }
              res.json(dbUserData);
          })
          .catch(err => res.status(400).json(err));
    },


    // update thought
    updateThought({params, body}, res) {
        Thought.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
          .then(dbThoughtData => {
            if(!dbThoughtData) {
                res.status(404).json({ message: 'No thought found with this id!' });
                return;
            }
            res.json(dbThoughtData);
          })
          .catch(err => res.status(400).json(err));
    },


    // delete thought
    deleteThought({params}, res) {
        Thought.findOneAndDelete({ _id: params.thoughtId })
          .then(deleteThought => {
              if(!deleteThought) {
                  return res.status(404).json({ message: 'No thought found with this id!' });
              }
              return User.findOneAndUpdate(
                  { _id: params.userId },
                  { $pull: { thoughts: params.thoughtId }},
                  { new: true }
              );
          })
          .then(dbUserData => {
              if(!dbUserData) {
                res.status(404).json({ message: 'No user found with this id!' });
                return;
              }
              res.json(dbUserData);
          })
          .catch(err => res.status(400).json(err));          
    },


    // add reaction
    addReaction({params, body}, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body }},
            { new: true, runValidators: true }
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


    // remove reaction
    removeReaction({params}, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId }}},
            { new: true }
        )
          .then(dbUserData => res.json(dbUserData))
          .catch(err => res.status(400).json(err)); 
    }
};


module.exports = thoughtController;