# piping-ssh
SSH over HTTPS via [Piping Server] on browser

## Application
<https://piping-ssh.nwtgck.org>

## Requirement
This project requires Google Chrome 105 or higher for [fetch() upload streaming](https://www.chromestatus.com/feature/5274139738767360) feature.
You can also use Chromium-based browsers.

## Security
* SSH things are processed only in browser without any server.
* Go language (`golang.org/x/crypto/ssh`) and WebAssembly are used. 
* The data via [Piping Server] are encrypted SSH protocol data. 

## URL fragment parameters

e.g. <https://piping-ssh.nwtgck.org/#?user=myuser&password=mypass&s_port=22&cs_path=aaa&sc_path=bbb>

* `user`: SSH user name
* `password`: SSH user password
* `server`: Piping Server URL
* `cs_path`: Server-to-client path
* `sc_path`: Client-to-server path
* `auto_connect`: Connect automatically
* `s_port`: Server port
* `headers`: HTTP headers to Piping Server
    - (e.g. `[["X-MyExtra1", "myvalue1"], ["Content-Type", "application/myapp"]]`)

## Previous version using SSHy
This project was highly based on [SSHy] and created from scratch using Go language and WebAssembly.  
SSHy version: <https://6453204af3b3fc3555e79371--piping-ssh.netlify.app>

## Acknowledgements
The idea of tunneling over [Piping Server] was proposed by [@Cryolite](https://github.com/Cryolite) in a Japanese post, <https://qiita.com/Cryolite/items/ed8fa237dd8eab54ef2f>. Thanks!

[Piping Server]: https://github.com/nwtgck/piping-server
[SSHy]: https://github.com/stuicey/SSHy
