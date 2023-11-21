import {TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI, CASTER_USER_ID} from "./env.js";

const TWITCH_AUTH_SCOPES = [ // %3A is url encoded colon (:)
    "moderator%3Aread%3Afollowers",
    "channel%3Aread%3Asubscriptions",
    "bits%3Aread"
]

const TWITCH_AUTH_URL = function() {
    let parts = {
        base: "https://id.twitch.tv/oauth2/authorize?",
        arguments: [
            "response_type=token",
            `client_id=${TWITCH_CLIENT_ID}`,
            `redirect_uri=${TWITCH_REDIRECT_URI}`,
            `scope=${TWITCH_AUTH_SCOPES.join("+")}`
        ]
    }

    return `${parts.base}${parts.arguments.join("&")}`;
}

const TWITCH_AUTH_TOKEN = function() {
    if (window.localStorage.getItem("TWITCH_AUTH_TOKEN") === null) {
        document.getElementById("TickerHeader").innerHTML = `${TWITCH_AUTH_URL()}`;
    }

    return window.localStorage.getItem("TWITCH_AUTH_TOKEN");
}

document.onreadystatechange = () => {
    if (!document.URL.includes("#access_token")) return;
    window.localStorage.setItem("TWITCH_AUTH_TOKEN", document.URL.split("#")[1].split("&")[0].split("=")[1]);
}

export {
    TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET,
    TWITCH_AUTH_TOKEN,
    CASTER_USER_ID
};
