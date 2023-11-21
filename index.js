 /*
Webcam Dimensions
X: 640px
Y: 360px
Main Source takes up 7/8 of x/y for 1440p
This leaves 1/8 of screen space on two sides of the main source
 */

import * as Config from "./config.js";
//import * as _TES from
 // "https://cdn.jsdelivr.net/gh/mitchwadair/tesjs@v1.0.3/dist/tes.min.js";

/*************
 * Utilities *
 *************/

function getTicker(SubType) {
    return document.getElementById(SubType);
}

function updateTicker(SubType, text) {
    let oldText = getTicker(SubType).innerHTML;
    getTicker(SubType).innerHTML = text;
    return oldText;
}

function getValuesFromArray(ArrayOfObjects, KeyName) {
    let results = [];

    function getValues(Obj) {
        results.push(Obj[KeyName]);
    }

    ArrayOfObjects.forEach(getValues);

    return results;
}

function getKeysFromArray(ArrayOfObjects) {
    let results = [];

    function getKeys(Obj) {
        results.push(Obj.keys());
    }

    ArrayOfObjects.forEach(getKeys);

    return results;
}

/************
 * Init TES *
 ************/

const _TES = new TES({
  identity: {
      id: Config.TWITCH_CLIENT_ID,
      accessToken: Config.TWITCH_AUTH_TOKEN(),
  },
  listener: {
      type: "websocket",
  }
});

/***********************
 * Data Drives the Bus *
 ***********************/

const ACTIVITY_LOGS = {
    "channel.follow": [],
    "channel.subscribe": [],
    "channel.subscription.gift": [],
    "channel.subscription.message": [],
    "channel.cheer": [],
    "channel.raid": []
}

const SUBSCRIPTIONS_AND_CONDITIONS = {
    "channel.follow": { "broadcaster_user_id": Config.CASTER_USER_ID, "moderator_user_id": Config.CASTER_USER_ID },
    "channel.subscribe": { "broadcaster_user_id": Config.CASTER_USER_ID },
    "channel.subscription.gift": { "broadcaster_user_id": Config.CASTER_USER_ID },
    "channel.subscription.message": { "broadcaster_user_id": Config.CASTER_USER_ID },
    "channel.cheer": { "broadcaster_user_id": Config.CASTER_USER_ID },
    "channel.raid": { "to_broadcaster_user_id": Config.CASTER_USER_ID }
};

const EVENTTYPES_AND_HANDLERS = {
    "revocation": (subscriptionData) => {
        console.log(`Subscription ${subscriptionData.id} has been revoked`);
        // perform necessary cleanup here
    },
    "connection_lost": (subscriptions) => {
        // if your subscriptions are important to you, resubscribe to them
        // Object.values(subscriptions).forEach((subscription) => {
            //tes.subscribe(subscription.type, subscription.condition);
        //});
        console.log(`Connection Lost. Wait at least 1 minute before reconnecting.\nLost Subscriptions: ${subscriptions}`)
    },
    "channel.follow": (subscription, event) => {
        let clean = {
            // use the user id for random coloring of something in the Overlay
            "follower_name": event.user_name,
            "caster_name": event.broadcaster_user_name,
            "followed_at": event.followed_at
        }
        ACTIVITY_LOGS[subscription.type].unshift(clean);

        let txt = getValuesFromArray(ACTIVITY_LOGS[subscription.type], subscription.type).join(" | ");

        updateTicker(subscription.type, txt);
    },
    "channel.subscribe": (subscription, event) => {
        let clean = {
            // use the user id for random coloring of something in the Overlay
            "subscriber_name": event.user_name,
            "caster_name": event.broadcaster_user_name,
            "tier": event.tier,
            "is_gift": event.is_gift
        }
        ACTIVITY_LOGS[subscription.type].unshift(clean);
    },
    "channel.subscription.gift": (subscription, event) => {
        let clean = {
            // use the user id for random coloring of something in the Overlay
            "gifter_name": event.user_name,
            "caster_name": event.broadcaster_user_name,
            "total_gifts": event.total,
            "gift_tier": event.tier,
            "gifter_total": event.cumulative_total,
            "is_anonymous": event.is_anonymous
        }
        ACTIVITY_LOGS[subscription.type].unshift(clean);
    },
    "channel.subscription.message": (subscription, event) => {
        let clean = {
            "subscriber_name": event.user_name,
            "caster_name": event.broadcaster_user_name,
            "tier": event.tier,
            "message": event.message,
            "cumulative_months": event.cumulative_months,
            "streak_months": event.streak_months,
            "duration_months": event.duration_months
        }
        ACTIVITY_LOGS[subscription.type].unshift(clean);
    },
    "channel.cheer": (subscription, event) => {
        let clean = {
            "cheerer_name": event.is_anonymous ? "Anonymous" : event.user_name,
            "caster_name": event.broadcaster_user_name,
            "message": event.message,
            "bits": event.bits
        }
        ACTIVITY_LOGS[subscription.type].unshift(clean);
    },
    "channel.raid": (subscription, event) => {
        let clean = {
            "raider_name": event.from_broadcaster_user_name,
            "caster_name": event.to_broadcaster_user_name,
            "raidsize": event.viewers
        }
        ACTIVITY_LOGS[subscription.type].unshift(clean);
    },
}

/*************
 * Registers *
 *************/

function RegisterSubscriptions(SubsAndConditions) {
    let Subs = [];

    for (let SubscriptionName in SubsAndConditions) {
        let a = {
            Sub: _TES.subscribe(SubscriptionName, SubsAndConditions[SubscriptionName]),
            Resolve: (value) => {
                console.log(`Created subscription to ${value.type}, subscription id ${value.id}`);
            },
            Reject: (err) => {
                console.error(`Failed to create Subscription. ${err}`);
            }
        }
        Subs.push(a.Sub.then(a.Resolve).catch(a.Reject));
    }

    return Subs;
}

function RegisterEventHandlers(SettledPromises) {
    for (let promise in SettledPromises) {
        let p = SettledPromises[promise];
        if (p.status === "rejected") {
            console.log(`Failed to register Event Handler for ${p.value.type}\nPromise Failure Reason: ${p.value.reason}`);
            continue;
        }
        _TES.on(p.value.type, EVENTTYPES_AND_HANDLERS[p.value.type]);
    }
}

/*****************************
 * One Line To Rule Them All *
 *****************************/

RegisterEventHandlers(await Promise.allSettled(RegisterSubscriptions(SUBSCRIPTIONS_AND_CONDITIONS)));