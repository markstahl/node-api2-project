const express = require('express');
const db = require('./data/db.js');

const router = express.Router();


router.post('/', async (req, res) => {
  if (!req.body.title || !req.body.contents) {
    res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
  } else {
    try {
      const dbRes = await db.insert(req.body);
      const post = await db.findById(dbRes.id);
      res.status(201).json(post);
    } catch (err) {
      res.status(500).json({ error: "There was an error while saving the post to the database" });
    }
  }
});

router.post('/:id/comments', async (req, res) => {
  const commentObj = { ...req.body, "post_id": req.params.id }
  const post = await db.findById(req.params.id);
  if (!post.length) {
    res.status(404).json({ message: "The post with the specified ID does not exist." });
  } else if (!req.body.text) {
    res.status(400).json({ errorMessage: "Please provide text for the comment." });
  } else {
    try {
      const dbRes = await db.insertComment(commentObj);
      const comment = await db.findCommentById(dbRes.id);
      res.status(201).json(comment);
    } catch (err) {
      res.status(500).json({ error: "There was an error while saving the comment to the database" });
    }
  }
});

router.get("/", async (req,res) => {
  try {
    const posts = await db.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "The posts information could not be retrieved." });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await db.findById(req.params.id);
    if (post.length) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "The post with the specified ID does not exist." });
    }
  } catch (err) {
    res.status(500).json({ error: "The post information could not be retrieved." });
  }
});

router.get('/:id/comments', async (req, res) => {
  const post = await db.findById(req.params.id);
  if (!post.length) {
    res.status(404).json({ message: "The post with the specified ID does not exist." });
  } else {
    try {
      const comments = await db.findPostComments(req.params.id);
      res.status(200).json(comments);
    } catch (err) {
      res.status(500).json({ error: "The comments information could not be retrieved." });
    }
  }
});

router.delete('/:id', async (req, res) => {
  const post = await db.findById(req.params.id);
  if (!post.length) {
    res.status(404).json({ message: "The post with the specified ID does not exist." });
  } else {
    try {
      const success = await db.remove(req.params.id);
      if (success) {
        res.status(200).json(post);
      }
    } catch (err) {
      res.status(500).json({ error: "The post could not be removed" });
    }
  }
});


router.put('/:id', async (req, res) => {
  const post = await db.findById(req.params.id);
  if (!post.length) {
    res.status(404).json({ message: "The post with the specified ID does not exist." });
  } else if (!req.body.title || !req.body.contents) {
    res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
  } else {
    try {
      const success = await db.update(req.params.id, req.body);
      if (success) {
        const updated = await db.findById(req.params.id);
        res.status(200).json(updated);
      }
    } catch (err) {
      res.status(500).json({ error: "The post information could not be modified." });
    }
  }
})

module.exports = router;