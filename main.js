function randomString(len){
    const nonConfusingChars = ["a", "b", "c", "d", "e", "f", "h", "i", "j", "k", "m", "n", "p", "r", "s", "t", "u", "v", "w", "x", "y", "z", "2", "3", "4", "5", "6", "7", "8"];
    const randomArr = window.crypto.getRandomValues(new Uint32Array(len));
    return Array.from(randomArr).map(n => nonConfusingChars[n % nonConfusingChars.length]).join('');
}

function parseHashAsQuery() {
    const url = new URL(`a://a${location.hash.substring(1)}`);
    return url.searchParams;
}

window.onload = function () {
    // (base: https://web.dev/fetch-upload-streaming/#feature-detection)
    const supportsRequestStreams = !new Request('', {
        body: new ReadableStream(),
        method: 'POST',
    }).headers.has('Content-Type');

    // If not support fetch() upload streaming
    if (!supportsRequestStreams) {
        // Hide login card
        document.getElementById('login_cred').style.display = "none";
        // Show message
        document.getElementById('not_supported_message').style.display = null;
        return;
    }

    document.getElementById('login_cred').style.display = "block";

    document.getElementById('username').value = parseHashAsQuery().get("user") ?? "";
    document.getElementById('password').value = parseHashAsQuery().get("password") ?? "";

    const pathLen = 3;
    document.getElementById('path1').value = parseHashAsQuery().get("cs_path") ?? randomString(pathLen);
    document.getElementById('path2').value = parseHashAsQuery().get("sc_path") ?? randomString(pathLen);
    setCommandHint();

    // Sets the default colorScheme to material
    settings = new SSHyClient.settings();
    settings.setColorScheme(1);

    // Apply fit addon
    fit.apply(Terminal)

    // Connect upon hitting Enter from the password field
    document.getElementById("password").addEventListener("keyup", function (event) {
        if (event.key !== "Enter") return;
        document.getElementById("connect").click();
        event.preventDefault();
    });
};

// Run every time the webpage is resized
window.onresize = function () {
    clearTimeout(resizeInterval);
    resizeInterval = setTimeout(resize, 400);
}

// Recalculates the terminal Columns / Rows and sends new size to SSH server + xtermjs
function resize() {
    if (term) {
        term.fit()
    }
}

// Toggles the settings navigator
function toggleNav(size) {
    document.getElementById("settingsNav").style.width = size + 'px';
    settings.sidenavElementState = size;
    // We need to update the network traffic whenever the nav is re-opened
    if (size && transport) {
        settings.setNetTraffic(transport.parceler.recieveData, true);
        settings.setNetTraffic(transport.parceler.transmitData, false);
    }
    var element = document.getElementById("gear").style;
    element.visibility = element.visibility === "hidden" ? "visible" : "hidden";
}

function validate(id, text) {
    if (!text) {
        document.getElementById(id).style.borderBottom = 'solid 2px #ff4d4d'
    }
}

// Validates the port is 0 > port < 65536
function validate_port(port_num) {
    if (port_num > 0 && port_num < 65536) {
        return port_num
    } else {
        display_error("Invalid port: port must be between 1 - 65535")
    }
}

// Displays a given err on the page
function display_error(err) {
    // remove the loading cog and set the 'connecting' to connect
    document.getElementById('load-container').style.display = "none"
    document.getElementById('connect').value = "connect"

    document.getElementById('failure').innerText = err
    document.getElementById('failure').style.display = "block"
}

function setCommandHint() {
    const port = parseHashAsQuery().get("s_port") ?? "22";
    const hintTextarea = document.getElementById('server_host_command_hint');
    const pipingServerUrl = document.getElementById('piping_server').value;
    const path1 = document.getElementById('path1').value;
    const path2 = document.getElementById('path2').value;

    if (path1 === '' || path2 === '') return;

    const escapedPipingServerUrl = pipingServerUrl.replace(/:/g, '\\:').replace(/\/$/, '') ;

    const socatCommand = `socat 'EXEC:curl -NsS ${escapedPipingServerUrl}/${path1}!!EXEC:curl -NsST - ${escapedPipingServerUrl}/${path2}' TCP:127.0.0.1:${port}`;

    hintTextarea.value = socatCommand;
}

function stringToUint8Array(str) {
    const numbers= [].map.call(str, (c) => {
        return c.charCodeAt(0);
    });
    return new Uint8Array(numbers);
}

// (base: https://stackoverflow.com/a/12713326/2885946)
function uint8ArrayToString(uint8Arr) {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < uint8Arr.length; i+=CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, uint8Arr.subarray(i, i + CHUNK_SZ)));
    }
    return c.join("");
}

// Starts the SSH client in scripts/transport.js
function startSSHy() {
    var termUsername = document.getElementById('username').value
    var termPassword = document.getElementById('password').value
    const pipingServerUrl = document.getElementById('piping_server').value.replace(/\/$/, '');
    const path1 = document.getElementById('path1').value;
    const path2 = document.getElementById('path2').value;

    if (termUsername.length == 0 || termPassword.length == 0) {
        validate('username', termUsername)
        validate('password', termPassword)
        return
    }

    // Error checking is done so remove any currently displayed errors
    document.getElementById('failure').style.display = "none"
    document.getElementById('connect').value = 'Connecting...'
    document.getElementById('load-container').style.display = "block"

    // Initialise the window title
    document.title = "SSHy Client";

    let controller;
    const readable = new ReadableStream({
        start(ctrl) {
            controller = ctrl;
        }
    });

    function sendBinaryString(binaryString) {
        controller.enqueue(stringToUint8Array(binaryString));
        transport.parceler.transmitData += binaryString.length;
        settings.setNetTraffic(transport.parceler.transmitData, false);
    }

    (async () => {
        fetch(`${pipingServerUrl}/${path1}`, {
            method: "POST",
            body: readable,
            allowHTTP1ForStreamingUpload: true,
        });

        transport = new SSHyClient.Transport(settings, sendBinaryString);
        transport.auth.termUsername = termUsername;
        transport.auth.termPassword = termPassword;

        const res = await fetch(`${pipingServerUrl}/${path2}`);
        const reader = res.body.getReader();
        while(true) {
            const {value, done} = await reader.read();
            if (done) break;
            const str = uint8ArrayToString(value);
            transport.parceler.handle(str);
        }
    })();
}

// Initialises xtermjs
function termInit() {
    // Define the terminal rows/cols
    term = new Terminal({
        cols: 80,
        rows: 24
    });

    // start xterm.js
    term.open(document.getElementById('terminal'), true);
    term.fit()
    term.focus()

    // set the color scheme to whatever the user's changed it to in the mean time
    var colName = document.getElementById('currentColor').innerHTML
    for (i = 0; i < settings.colorSchemes.length; i++) {
        if (settings.colorSchemes[i][0] == colName) {
            settings.setColorScheme(i)
            break
        }
    }

    // clear the modal elements on screen
    document.getElementById('load-container').style.display = "none";
    document.getElementById('login_cred').style.display = "none";
}

// Binds custom listener functions to xtermjs's Terminal object
function startxtermjs() {
    termInit();

    // sets up some listeners for the terminal (keydown, paste)
    // FIXME: use "keydown" but "Enter" not fired in "keydown"
    term.textarea.addEventListener('keyup', function (e) {
        // Sanity Checks
        if (!transport || transport.auth.failedAttempts >= 5 || transport.auth.awaitingAuthentication) {
            return;
        }

        // So we don't spam single control characters
        if (e.key.length > 1 && (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) && e.key != "Backspace") {
            return;
        }

        // We've already authenticated so now any keypress is a command for the SSH server
        var command, pressedKey;

        /** IE isn't very good so it displays one character keys as full names in .key
         EG - e.key = " " to e.key = "Spacebar"
         so assuming .char is one character we'll use that instead **/
        if (e.char && e.char.length == 1) {
            pressedKey = e.char;
        } else {
            pressedKey = e.key
        }

        // Decides if the keypress is an alphanumeric character or needs escaping
        if (pressedKey.length == 1 && (!(e.altKey || e.ctrlKey || e.metaKey) || (e.altKey && e.ctrlKey))) {
            command = pressedKey;
        } else if (pressedKey.length == 1 && (e.shiftKey && e.ctrlKey)) {
            // allows ctrl + shift + v for pasting
            if (pressedKey != 'V') {
                e.preventDefault();
                return;
            }
        } else {
            //xtermjs is kind enough to evaluate our special characters instead of having to translate every char ourself
            command = term._evaluateKeyEscapeSequence(e).key;
        }

        // Decide if we're going to locally' echo this key or not
        if (settings.localEcho) {
            settings.parseKey(e);
        }
        /* Regardless of local echo we still want a reply to confirm / update terminal
           could be controversial? but putty does this too (each key press shows up twice)
           Instead we're checking the our locally echoed key and replacing it if the
           recieved key !== locally echoed key */
        return command === null ? null : transport.expect_key(command);
    });

    term.textarea.onpaste = function (ev) {
        var text

        // Yay IE11 stuff!
        if (window.clipboardData && window.clipboardData.getData) {
            text = window.clipboardData.getData('Text')
        } else if (ev.clipboardData && ev.clipboardData.getData) {
            text = ev.clipboardData.getData('text/plain');
        }

        if (text) {
            // Just don't allow more than 1 million characters to be pasted.
            if (text.length < 1000000) {
                if (text.length > 5000) {
                    // If its a long string then chunk it down to reduce load on SSHyClient.parceler
                    text = splitSlice(text);
                    for (var i = 0; i < text.length; i++) {
                        transport.expect_key(text[i]);
                    }
                    return;
                }
                transport.expect_key(text);
            } else {
                alert('Error: Pasting large strings is not permitted.');
            }
        }
    };
}
