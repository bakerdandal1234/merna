// Push Notifications Controller
const PushSubscription = require('../models/PushSubscription');
const webpush = require('web-push');

// Configure VAPID Keys from environment
webpush.setVapidDetails(
  'mailto:' + (process.env.ADMIN_EMAIL || 'admin@example.com'),
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// 1️⃣ Save push subscription for the user
exports.subscribe = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user.id;

    // Validate subscription data
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Ungültige Abonnementdaten'
      });
    }

    // Save or update subscription
    const pushSubscription = await PushSubscription.findOneAndUpdate(
      { userId },
      { 
        subscription,
        enabled: true
      },
      { 
        upsert: true,
        new: true 
      }
    );

    res.json({
      success: true,
      message: 'Benachrichtigungen erfolgreich aktiviert! 🔔',
      data: {
        enabled: pushSubscription.enabled
      }
    });

  } catch (error) {
    console.error('❌ Error saving subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Speichern der Benachrichtigungen'
    });
  }
};

// 2️⃣ Enable/disable notifications
exports.toggleNotifications = async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;

    const pushSubscription = await PushSubscription.findOneAndUpdate(
      { userId },
      { enabled },
      { new: true }
    );

    if (!pushSubscription) {
      return res.status(404).json({
        success: false,
        message: 'Kein Benachrichtigungs-Abonnement gefunden'
      });
    }

    res.json({
      success: true,
      message: enabled ? 'Benachrichtigungen aktiviert ✅' : 'Benachrichtigungen deaktiviert ⏸️',
      data: {
        enabled: pushSubscription.enabled
      }
    });

  } catch (error) {
    console.error('❌ Error toggling notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Aktualisieren der Benachrichtigungen'
    });
  }
};

// 3️⃣ Get notification status for the user
exports.getNotificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const pushSubscription = await PushSubscription.findOne({ userId });

    res.json({
      success: true,
      data: {
        subscribed: !!pushSubscription,
        enabled: pushSubscription ? pushSubscription.enabled : false
      }
    });

  } catch (error) {
    console.error('❌ Error fetching notification status:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen des Benachrichtigungsstatus'
    });
  }
};

// 4️⃣ Send notification to a specific user
exports.sendNotification = async (userId, title, body, data = {}) => {
  try {
    const pushSubscription = await PushSubscription.findOne({ 
      userId,
      enabled: true
    });

    if (!pushSubscription) {
      console.log(`ℹ️ User ${userId} has not enabled notifications`);
      return false;
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: {
        url: '/',
        ...data
      }
    });

    await webpush.sendNotification(pushSubscription.subscription, payload);

    await PushSubscription.findByIdAndUpdate(pushSubscription._id, {
      lastNotificationSent: new Date()
    });

    console.log(`✅ Notification sent to user ${userId}`);
    return true;

  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 410) {
      console.log(`⚠️ Expired subscription for user ${userId}, deleting...`);
      await PushSubscription.deleteOne({ userId });
    } else {
      console.error('❌ Error sending notification:', error);
    }
    return false;
  }
};

// 5️⃣ Unsubscribe from notifications
exports.unsubscribe = async (req, res) => {
  try {
    const userId = req.user.id;

    await PushSubscription.deleteOne({ userId });

    res.json({
      success: true,
      message: 'Benachrichtigungen erfolgreich abgemeldet'
    });

  } catch (error) {
    console.error('❌ Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abmelden der Benachrichtigungen'
    });
  }
};
