import {SSHyClient} from "./defines";
import "./Hash";
import "./auth_handler";
import "./crypto";
import "./dhKex";
import "./message";
import "./parceler";
import "./rsaKey";
import "./settings";
import "./transport";
import {Terminal} from "xterm";
import {FitAddon} from 'xterm-addon-fit';
import urlJoin from "url-join";

(() => {
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

        document.getElementById('piping_server').value = parseHashAsQuery().get("server") || "https://ppng.io";
        document.getElementById('username').value = parseHashAsQuery().get("user") || "";
        document.getElementById('password').value = parseHashAsQuery().get("password") || "";

        const pathLen = 3;
        document.getElementById('path1').value = parseHashAsQuery().get("cs_path") || randomString(pathLen);
        document.getElementById('path2').value = parseHashAsQuery().get("sc_path") || randomString(pathLen);
        setCommandHint();

        // Sets the default colorScheme to material
        settings = new SSHyClient.settings();
        settings.setColorScheme(1);

        // Connect upon hitting Enter from the password field
        document.getElementById("password").addEventListener("keyup", function (event) {
            if (event.key !== "Enter") return;
            document.getElementById("connect").click();
            event.preventDefault();
        });
    };

    // Run every time the webpage is resized
    window.onresize = function () {
        resize()
    };

    const fitAddon = new FitAddon();

    // Recalculates the terminal Columns / Rows and sends new size to SSH server + xtermjs
    window.resize = function () {
        if (term) {
            fitAddon.fit();
        }
    }

    // Toggles the settings navigator
    window.toggleNav = function (size) {
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

    window.validate = function (id, text) {
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
    window.display_error = function (err) {
        // remove the loading cog and set the 'connecting' to connect
        document.getElementById('load-container').style.display = "none"
        document.getElementById('connect').value = "connect"

        document.getElementById('failure').innerText = err
        document.getElementById('failure').style.display = "block"
    }

    window.setCommandHint = function () {
        const port = parseHashAsQuery().get("s_port") || "22";
        const hintTextarea = document.getElementById('server_host_command_hint');
        const pipingServerUrl = document.getElementById('piping_server').value;
        const path1 = document.getElementById('path1').value;
        const path2 = document.getElementById('path2').value;

        if (path1 === '' || path2 === '') return;

        const ncCommand = `curl -sSN ${urlJoin(pipingServerUrl, path1)} | nc localhost ${port} | curl -sSNT - ${urlJoin(pipingServerUrl, path2)}`;

        hintTextarea.value = ncCommand;
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
    window.startSSHy = function () {
        var termUsername = document.getElementById('username').value
        var termPassword = document.getElementById('password').value
        const pipingServerUrl = document.getElementById('piping_server').value;
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
            fetch(urlJoin(pipingServerUrl, path1), {
                method: "POST",
                body: readable,
                allowHTTP1ForStreamingUpload: true,
            });

            transport = new SSHyClient.Transport(settings, sendBinaryString);
            transport.auth.termUsername = termUsername;
            transport.auth.termPassword = termPassword;

            const res = await fetch(urlJoin(pipingServerUrl, path2));
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
        term = new Terminal();
        term.loadAddon(fitAddon);

        // start xterm.js
        term.open(document.getElementById('terminal'), true);
        fitAddon.fit();
        term.focus()

        // set the color scheme to whatever the user's changed it to in the mean time
        var colName = document.getElementById('currentColor').innerHTML
        for (var i = 0; i < settings.colorSchemes.length; i++) {
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
    window.startxtermjs = function () {
        termInit();

        term.onData((data) => {
            transport.expect_key(data);
        });
    }
})();
