// routes/analytics.js
const express = require('express');
const router = express.Router();
const ViewAnalytics = require('../models/ViewAnalytics');

router.get('/:id/analytics', async (req, res) => {
  const { id } = req.params;
  console.log('test')
  console.log(id);
  
  try {
    console.log('testt')

    const analytics = await ViewAnalytics.findOne({ postId: id });
    console.log(analytics)
    if (!analytics) {
      console.log('testtt')

      return res.status(404).json({ message: 'Analytics data not found' });
    }

    res.status(200).json(analytics.views);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
});

module.exports = router;
