const AwsSnsService = require('../services/aws_sns');

const service = new AwsSnsService();

class AwsSnsController {
    async handleEvent(req, res) {
        // Always acknowledge AWS SNS requests immediately
        res.status(200).send('OK');

        try {
            // Some SNS payloads come as JSON strings in the body if content-type isn't set perfectly, 
            // but Express usually handles it if configured. 
            // AWS checks:
            const type = req.headers['x-amz-sns-message-type'] || req.body.Type;
            
            if (!type) {
                // Not a valid SNS request or missing type
                return;
            }

            if (type === 'SubscriptionConfirmation') {
                await service.handleSubscription(req.body);
            } else if (type === 'Notification') {
                await service.handleNotification(req.body);
            }
        } catch (error) {
            console.error("Error processing SNS event:", error);
        }
    }
}

module.exports = new AwsSnsController();
