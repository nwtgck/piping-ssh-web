# piping-ssh
SSH over HTTPS via [Piping Server](https://github.com/nwtgck/piping-server)

## Application
<https://piping-ssh.netlify.app>


### Requirement
This project requires the latest Google Chrome with enable-experimental-web-platform-features flag for [fetch() upload streaming](https://www.chromestatus.com/feature/5274139738767360) feature (origin trial now).

chrome://flags/ > Experimental Web Platform features > Enabled

## Acknowledgements
This project is highly based on [SSHy]. Thanks original author [@stuicey](https://github.com/stuicey) and other contributors!

The idea of tunneling over [Piping Server] was proposed by [@Cryolite](https://github.com/Cryolite) in a Japanese post, <https://qiita.com/Cryolite/items/ed8fa237dd8eab54ef2f>. Thanks!

## Original project - [SSHy]

The base project, [SSHy], is a fast and responsive SSHv2 web client with end-to-end encryption supplied by [SJCL](https://github.com/bitwiseshiftleft/sjcl). [SSHy] implements a minimal subset of the SSHv2 protocol that provides and controls a pseudo-terminal. The terminal front-end interface is provided by [xterm.js](https://github.com/sourcelair/xterm.js/). Currently in use at https://linuxzoo.net , a non-functional preview is available at https://stuicey.github.io/SSHy/.

## Features powered by [SSHy]

* 8 Preset color schemes & Xresources upload and import
* UTF-8 Character support
* Automatic local echo detection
* Customisable terminal & font size
* Copy and Paste support
* Network Traffic Monitor

## Compatibility powered by [SSHy]

The base project, [SSHy], was designed to be compatible with a majority of SSHv2 servers.
[SSHy] should be able to connect to any standardly configured SSHv2 server that has the following algorithms enabled:

```
diffie-hellman-group-exchange, diffie-hellman-group14, diffie-hellman-group1
ssh-rsa
aes128-ctr
hmac
```

Both SHA1 and SHA256 are supported for diffie-hellman and HMAC algorithms.

## URL fragment parameters

e.g. <https://piping-ssh.netlify.app/#?user=myuser&password=mypass&s_port=22&cs_path=aaa&sc_path=bbb>

* `user`: SSH user name
* `password`: SSH user password
* `server`: Piping Server URL
* `cs_path`: Server-to-client path
* `sc_path`: Client-to-server path
* `s_port`: Server port
* `headers`: HTTP headers to Piping Server
    - (e.g. `[["X-MyExtra1", "myvalue1"], ["Content-Type", "application/myapp"]]`)

## Build & Serve

This project utilises the [Google Closure Compiler](https://github.com/google/closure-compiler) to minify and compile the JavaScript.

```bash
npm run serve
```

Then, open <http://localhost:8080> on your browser.

[Piping Server]: https://github.com/nwtgck/piping-server
[SSHy]: https://github.com/stuicey/SSHy
