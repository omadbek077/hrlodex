/**
 * Click Webhook Authentication Middleware
 * Validates requests from Click servers
 */

const { validateSignature } = require('../utils/clickService');

const clickWebhookAuth = (req, res, next) => {
    try {
        const secretKey = process.env.CLICK_SECRET_KEY;
        const strictMode = String(process.env.CLICK_WEBHOOK_STRICT || 'false').toLowerCase() === 'true';

        if (!secretKey) {
            console.error('CLICK_SECRET_KEY not configured');
            return res.json({
                error: -1,
                error_note: 'Configuration error',
            });
        }

        // In production, implement proper signature validation
        // For now, we'll allow the request to proceed
        // TODO: Implement signature validation according to Click documentation

        // Click sends authentication in the request body parameters
        // The sign_string should be validated against our calculation
        const { sign_string, sign_time } = req.body;

        if (!sign_string || !sign_time) {
            console.warn('Click webhook missing signature parameters');
            if (strictMode) {
                return res.json({ error: -1, error_note: 'Invalid signature' });
            }
        }

        // Validate signature
        const isValid = validateSignature(req.body, secretKey);

        if (!isValid) {
            console.warn('Click webhook signature validation failed');
            if (strictMode) {
                return res.json({ error: -1, error_note: 'Invalid signature' });
            }
        }

        next();
    } catch (error) {
        console.error('Click webhook auth error:', error);
        res.json({
            error: -8,
            error_note: 'Authentication error',
        });
    }
};

module.exports = clickWebhookAuth;
