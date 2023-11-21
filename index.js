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
    getTicker(SubType).innerHTML = text;
}

function bulkUpdateTickers() {
    for (let ticker in ACTIVITY_LOGS) {
        updateTicker(ticker, FormatText[ticker](ACTIVITY_LOGS[ticker]));
    }
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

function clearActivityLogs() {
    for (let log in ACTIVITY_LOGS) {
        ACTIVITY_LOGS[log] = [];
    }
}

function setTestData() {
    for (let log in TEST_DATA_ACTIVITY_LOGS) {
        ACTIVITY_LOGS[log] = TEST_DATA_ACTIVITY_LOGS[log];
    }
}

const FormatText = {
    "channel.follow": (string) => {
        return string.join(" | ");
    },
    "channel.subscribe": (string) => {
        return string;
    },
    "channel.subscription.gift": (string) => {
        return string;
    },
    "channel.subscription.message": (string) => {
        return string;
    },
    "channel.cheer": (string) => {
        return string;
    },
    "channel.raid": (string) => {
        return string;
    },
}

/******************
 * Initialization *
 ******************/

const _TES = new TES({
    identity: {
        id: Config.TWITCH_CLIENT_ID,
        accessToken: Config.TWITCH_AUTH_TOKEN(),
    },
        listener: {
        type: "websocket",
    }
});

let ActiveKeyboardListening = 0;
addEventListener("keydown", (event) => {
    if (event.isComposing || event.keyCode === 229 || ActiveKeyboardListening === 0) {
        if (event.code === "Slash") { ActiveKeyboardListening = 1; console.log("listening to keyevents"); }
        return;
    }

    console.log(event);

    if (event.code === "Slash") { ActiveKeyboardListening = 0; console.log("ignoring keyevents"); }
    if (event.code === "KeyR") {
        clearActivityLogs();
        bulkUpdateTickers();
    }
    if (event.code === "KeyT") {
        setTestData();
        bulkUpdateTickers();
    }
});


/***********************
 * Data Drives the Bus *
 ***********************/

const TEST_DATA_ACTIVITY_LOGS = {
    "channel.follow": ["Stapleton", "alloybot", "only_cans", "spiteinc", "t__lk__t", "thisisareallylongusernameandithinkitmightbelongenoughforsomecssstyling"],
    "channel.subscribe": ["Stapleton", "alloybot", "only_cans", "spiteinc", "t__lk__t", "thisisareallylongusernameandithinkitmightbelongenoughforsomecssstyling"],
    "channel.subscription.gift": ["Stapleton", "alloybot", "only_cans", "spiteinc", "t__lk__t", "thisisareallylongusernameandithinkitmightbelongenoughforsomecssstyling"],
    "channel.subscription.message": ["Stapleton", "alloybot", "only_cans", "spiteinc", "t__lk__t", "thisisareallylongusernameandithinkitmightbelongenoughforsomecssstyling"],
    "channel.cheer": ["Stapleton", "alloybot", "only_cans", "spiteinc", "t__lk__t", "thisisareallylongusernameandithinkitmightbelongenoughforsomecssstyling"],
    "channel.raid": ["Stapleton", "alloybot", "only_cans", "spiteinc", "t__lk__t", "thisisareallylongusernameandithinkitmightbelongenoughforsomecssstyling"]
}

const ACTIVITY_LOGS = {
    "channel.follow": [],
    "channel.subscribe": [],
    "channel.subscription.gift": [],
    "channel.subscription.message": [],
    "channel.cheer": [],
    "channel.raid": []
}

const SUBSCRIPTIONS_AND_CONDITIONS = {
    // SubscriptionName: [ {condition}, versionNumber ]
    "channel.follow": [{ "broadcaster_user_id": Config.CASTER_USER_ID, "moderator_user_id": Config.CASTER_USER_ID }, 2],/*
    "channel.subscribe": [{ "broadcaster_user_id": Config.CASTER_USER_ID }, 1],
    "channel.subscription.gift": [{ "broadcaster_user_id": Config.CASTER_USER_ID }, 1],
    "channel.subscription.message": [{ "broadcaster_user_id": Config.CASTER_USER_ID }, 1],
    "channel.cheer": [{ "broadcaster_user_id": Config.CASTER_USER_ID }, 1],
    "channel.raid": [{ "to_broadcaster_user_id": Config.CASTER_USER_ID }, 1]*/
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

        let txt = FormatText[subscription.type](getValuesFromArray(ACTIVITY_LOGS[subscription.type], subscription.type));

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
        let a = { cond: SubsAndConditions[SubscriptionName][0], version: SubsAndConditions[SubscriptionName][1] }
        let b = {
            Sub: _TES.subscribe(SubscriptionName, a.cond, a.version),
            Resolve: (value) => {
                console.log(`Created subscription to ${value.type}, subscription id ${value.id}`);
            },
            Reject: (err) => {
                console.error(`Failed to create Subscription: ${SubscriptionName}\n\n${err}`);
            }
        }
        Subs.push(b.Sub);
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
        console.log(p);
        _TES.on(p.value.type, EVENTTYPES_AND_HANDLERS[p.value.type]);
        updateTicker(p.value.type, ACTIVITY_LOGS[p.value.type].join(" | "));
    }
}

/*****************************
 * One Line To Rule Them All *
 *****************************/

RegisterEventHandlers(await Promise.allSettled(RegisterSubscriptions(SUBSCRIPTIONS_AND_CONDITIONS)));