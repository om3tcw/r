// custom_modules/chat_modules/timeStampModule.js

console.log("[TS_DEBUG] Module Loading (v2.1 - Smart Parser)...");

// === Configuration ===
const TIMEZONE_CONFIG = {
    "UTC": { offset: "+0000", iana: "UTC" },
    "GMT": { offset: "+0000", iana: "Europe/London" },
    "Z":   { offset: "+0000", iana: "UTC" },
    
    "EST": { offset: "-0500", iana: "America/New_York" },
    "EDT": { offset: "-0400", iana: "America/New_York" },
    "CST": { offset: "-0600", iana: "America/Chicago" },
    "CDT": { offset: "-0500", iana: "America/Chicago" },
    "MST": { offset: "-0700", iana: "America/Denver" },
    "MDT": { offset: "-0600", iana: "America/Denver" },
    "PST": { offset: "-0800", iana: "America/Los_Angeles" },
    "PDT": { offset: "-0700", iana: "America/Los_Angeles" },
    
    "BST": { offset: "+0100", iana: "Europe/London" },
    "CET": { offset: "+0100", iana: "Europe/Paris" },
    "CEST":{ offset: "+0200", iana: "Europe/Paris" },
    
    "JST": { offset: "+0900", iana: "Asia/Tokyo" },
    "KST": { offset: "+0900", iana: "Asia/Seoul" },
    "AEST":{ offset: "+1000", iana: "Australia/Sydney" },
    "AEDT":{ offset: "+1100", iana: "Australia/Sydney" },
    "NZST":{ offset: "+1200", iana: "Pacific/Auckland" },
    "NZDT":{ offset: "+1300", iana: "Pacific/Auckland" }
};

const DEFAULT_TZ_STORAGE_KEY = "immergrok_user_default_tz";

// === Helpers ===

function getUserDefaultTimezone() {
    return localStorage.getItem(DEFAULT_TZ_STORAGE_KEY);
}

function normalizeDateString(dateStr) {
    let cleanStr = dateStr.trim();
    
    // 1. Remove ordinal suffixes (e.g. "26th" -> "26")
    cleanStr = cleanStr.replace(/(\d+)(st|nd|rd|th)/ig, "$1");
    
    // 2. Ensure space before am/pm (e.g. "10am" -> "10 am")
    cleanStr = cleanStr.replace(/(\d)(am|pm)/ig, "$1 $2");
    
    // 3. Fix "bare hours" by adding :00 
    // This turns "10 am" into "10:00 am", but leaves "10:30 am" alone.
    // Logic: Find a number + am/pm that is NOT preceded by a colon.
    cleanStr = cleanStr.replace(/(^|[^:\d])(\d+)\s+(am|pm)/ig, "$1$2:00 $3");
    
    return cleanStr;
}

function parseTimeExpression(expression, userDefaultTz) {
    console.log(`[TS_DEBUG] Parsing: "${expression}" | UserTZ: ${userDefaultTz}`);
    
    let parts = expression.trim().split(/\s+/);
    let tzOffset = null;

    // Check for explicit timezone in string (e.g. "10:00 EST")
    const lastPart = parts[parts.length - 1].toUpperCase();
    if (TIMEZONE_CONFIG[lastPart]) {
        tzOffset = TIMEZONE_CONFIG[lastPart].offset;
        parts.pop();
        console.log(`[TS_DEBUG] Explicit TZ found: ${lastPart} (${tzOffset})`);
    } 
    // Fallback to User Default
    else if (userDefaultTz && TIMEZONE_CONFIG[userDefaultTz.toUpperCase()]) {
        tzOffset = TIMEZONE_CONFIG[userDefaultTz.toUpperCase()].offset;
        console.log(`[TS_DEBUG] Using User Default TZ: ${userDefaultTz} (${tzOffset})`);
    }

    let dateString = normalizeDateString(parts.join(" "));
    
    // Add today's date if missing
    const hasDate = /[a-zA-Z]{3}|\d{1,4}[\/\-]\d{1,2}/.test(dateString);
    if (!hasDate) {
        const today = new Date();
        const datePrefix = `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`;
        dateString = `${datePrefix} ${dateString}`;
    }

    let parseString = dateString;
    if (tzOffset) {
        parseString += ` ${tzOffset}`;
    }

    console.log(`[TS_DEBUG] Date.parse string: "${parseString}"`);
    const timestamp = Date.parse(parseString);
    
    if (isNaN(timestamp)) {
        console.warn("[TS_DEBUG] Date.parse failed.");
        return null;
    }
    return new Date(timestamp);
}

// === Logic: Intercept Input (Window Capture) ===

function interceptChatInput(e) {
    if (e.keyCode !== 13 || e.shiftKey) return;
    if (e.target.id !== "chatline") return; 

    const text = e.target.value;
    
    // --- 1. Handle Commands (/settz) ---
    if (text.trim().toLowerCase().startsWith('/settz')) {
        console.log("[TS_DEBUG] Command /settz detected. INTERCEPTING.");
        
        e.preventDefault();           
        e.stopPropagation();           
        e.stopImmediatePropagation();  
        
        e.target.value = ""; 

        const parts = text.trim().split(/\s+/);
        let feedbackMsg = "";

        if (parts.length > 1) {
            const tz = parts[1].toUpperCase();
            if (TIMEZONE_CONFIG[tz]) {
                localStorage.setItem(DEFAULT_TZ_STORAGE_KEY, tz);
                feedbackMsg = `Timezone set to <strong>${tz}</strong>. Both sending and viewing will use this zone.`;
                console.log(`[TS_DEBUG] TZ set to ${tz}`);
            } else {
                feedbackMsg = `<span style="color:red">Unknown timezone: ${tz}. Supported: ${Object.keys(TIMEZONE_CONFIG).join(", ")}</span>`;
            }
        } else {
            localStorage.removeItem(DEFAULT_TZ_STORAGE_KEY);
            feedbackMsg = `Timezone cleared. Using browser system time.`;
        }

        const $msg = $(`<div class="server-whisper">[System] ${feedbackMsg}</div>`);
        $('#messagebuffer').append($msg);
        $('#messagebuffer').scrollTop($('#messagebuffer').prop("scrollHeight"));
        
        return false;
    }

    // --- 2. Handle Timestamp Conversion ---
    if (text.includes('[t:')) {
        const userTz = getUserDefaultTimezone();
        
        const newText = text.replace(/\[t:\s*(.+?)\]/gi, (match, timeStr) => {
            const dateObj = parseTimeExpression(timeStr, userTz);
            if (dateObj) {
                return `[ts:${dateObj.getTime()}]`;
            }
            return match;
        });

        if (newText !== text) {
            console.log(`[TS_DEBUG] Replacing input: "${newText}"`);
            e.target.value = newText;
        }
    }
}

// === Logic: Display Output ===

function processTimestampTags($messageElement) {
    const regex = /\[ts:\s*(\d+)\]/gi;
    const originalHtml = $messageElement.html();

    if (!originalHtml.match(regex)) return;

    // Check if user has a forced timezone setting
    const userTz = getUserDefaultTimezone();
    let displayOptions = {
        weekday: 'short', month: 'short', day: 'numeric', 
        hour: 'numeric', minute: '2-digit'
    };

    // If user has /settz set, force that timezone for display
    if (userTz && TIMEZONE_CONFIG[userTz.toUpperCase()]) {
        const ianaZone = TIMEZONE_CONFIG[userTz.toUpperCase()].iana;
        try {
            displayOptions.timeZone = ianaZone;
        } catch (err) {
            console.error("[TS_DEBUG] Invalid IANA zone:", ianaZone);
        }
    }

    let newHtml = originalHtml.replace(regex, (match, timestamp) => {
        const dateObj = new Date(parseInt(timestamp));
        const localString = dateObj.toLocaleString("en-US", displayOptions);
        
        return `<span class="chat-timestamp" title="${dateObj.toISOString()}" style="
            background-color: rgba(0,0,0,0.2);
            padding: 0 4px;
            border-radius: 4px;
            cursor: help;
            border-bottom: 1px dotted #888;
        ">${localString} ${userTz ? `(${userTz})` : ''}</span>`;
    });

    if (newHtml !== originalHtml) {
        $messageElement.html(newHtml);
    }
}

// === Initialization ===

(async () => {
    await window.waitForFunc("MESSAGE_PROCESSOR");

    MESSAGE_PROCESSOR.addTap(processTimestampTags);
    window.addEventListener("keydown", interceptChatInput, true);

    console.log("[TS_DEBUG] TimeStampModule Loaded (v2.1).");
})();