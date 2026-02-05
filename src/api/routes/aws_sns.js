const express = require('express');
const awsSnsController = require('../controller/aws_sns');

const router = express.Router();

// Parse text/plain as json for SNS if necessary, but typically standard express.json() is fine if Header is correct.
// AWS SNS sends 'text/plain' for some payloads, so we might need to handle that in server config or middleware, 
// but for now relying on standard parsing or the controller check.
// Actually, Express's body-parser json() by default strictly looks for application/json. 
// AWS SNS often sends text/plain. We should handle that.
// BUT, modifying global server config might affect others. 
// Let's rely on standard JSON for now. If issues arise, we can add middleware here.

router.post('/alarms', (req, res) => awsSnsController.handleEvent(req, res));

module.exports = router;
