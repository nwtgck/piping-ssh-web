//go:build js && wasm

package main

import (
	"fmt"
	"github.com/nwtgck/piping-ssh-web/go/jsutil"
	"golang.org/x/crypto/ssh"
	"syscall/js"
)

func main() {
	js.Global().Get("pipingSshGoExportResolve").Invoke(map[string]any{
		"panicOnPurpose": js.FuncOf(func(this js.Value, args []js.Value) any {
			panic(fmt.Errorf("error on purpose"))
		}),
		"getAuthPublicKeyType": js.FuncOf(func(this js.Value, args []js.Value) any {
			publicKeyStr := args[0].String()
			publicKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(publicKeyStr))
			if err != nil {
				return jsutil.NewError(err)
			}
			return publicKey.Type()
		}),
		"doSsh": js.FuncOf(jsDoSsh),
		"generateRsaKeys": js.FuncOf(func(this js.Value, args []js.Value) any {
			bits := args[0].Int()
			keys, err := generateRsaKeys(bits)
			if err != nil {
				return jsutil.NewError(err)
			}
			return map[string]any{
				"publicKey":  keys.PublicKey,
				"privateKey": keys.PrivateKey,
			}
		}),
		"generateEd25519Keys": js.FuncOf(func(this js.Value, args []js.Value) any {
			keys, err := generateEd25519Keys()
			if err != nil {
				return jsutil.NewError(err)
			}
			return map[string]any{
				"publicKey":  keys.PublicKey,
				"privateKey": keys.PrivateKey,
			}
		}),
		"sshSha256Fingerprint": js.FuncOf(func(this js.Value, args []js.Value) any {
			publicKeyString := args[0].String()
			publicKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(publicKeyString))
			if err != nil {
				return jsutil.NewError(err)
			}
			return ssh.FingerprintSHA256(publicKey)
		}),
		"sshPrivateKeyIsEncrypted": js.FuncOf(func(this js.Value, args []js.Value) any {
			privateKey := args[0].String()
			// NOTE: `strings.Contains(block.Headers["Proc-Type"], "ENCRYPTED") || x509.IsEncryptedPEMBlock(block)` does not return true when encrypted
			_, err := ssh.ParsePrivateKey([]byte(privateKey))
			_, ok := err.(*ssh.PassphraseMissingError)
			return ok
		}),
	})
	select {}
}

func jsDoSsh(this js.Value, args []js.Value) any {
	jsParams := args[0]
	jsFunctions := args[1]
	return jsutil.NewPromise(func() (any, error) {
		jsTransport := jsParams.Get("transport")
		jsReadable := jsTransport.Get("readable")
		jsWritable := jsTransport.Get("writable")
		conn := NewTransportConn(jsReadable, jsWritable)
		defer conn.Close()
		termBytesCh := make(chan []byte)
		jsTermReadable := jsParams.Get("termReadable")
		go func() {
			jsReader := jsTermReadable.Call("getReader")
			for {
				jsResult, err := jsutil.AwaitPromise(jsReader.Call("read"))
				if err != nil {
					// TODO:
					panic(err)
				}
				if jsResult.Get("done").Bool() {
					close(termBytesCh)
					break
				}
				termBytesCh <- []byte(jsResult.Get("value").String())
			}
		}()
		termWrite := func(p []byte) {
			jsFunctions.Call("termWrite", jsutil.BytesToUint8Array(p))
		}
		term := NewTerm(termWrite, termBytesCh, jsParams.Get("initialCols").Int(), jsParams.Get("initialRows").Int())
		onPasswordAuth := func() (string, error) {
			value, err := jsutil.AwaitPromise(jsFunctions.Call("onPasswordAuth"))
			if err != nil {
				return "", err
			}
			return value.String(), nil
		}
		onHostKey := func(value js.Value) (bool, error) {
			value, err := jsutil.AwaitPromise(jsFunctions.Call("onHostKey", value))
			if err != nil {
				return false, err
			}
			return value.Bool(), err
		}
		resizeCh := make(chan TermWindow)
		jsParams.Get("termResizeMessagePort").Set("onmessage", js.FuncOf(func(this js.Value, args []js.Value) any {
			data := args[0].Get("data")
			go func() {
				resizeCh <- TermWindow{
					Cols: data.Get("cols").Int(),
					Rows: data.Get("rows").Int(),
				}
			}()
			return nil
		}))
		var authKeySets []*AuthKeySet
		jsAuthKeySets := jsParams.Get("authKeySets")
		for i := 0; i < jsAuthKeySets.Length(); i++ {
			jsAuthKeySet := jsAuthKeySets.Index(i)
			publicKey, _, _, _, err := ssh.ParseAuthorizedKey([]byte(jsAuthKeySet.Get("publicKey").String()))
			if err != nil {
				return nil, err
			}
			sha256Fingerprint := ssh.FingerprintSHA256(publicKey)
			jsEncrypted := jsAuthKeySet.Get("encrypted").Bool()
			var getPassphrase func() (string, error)
			if jsEncrypted {
				getPassphrase = func() (string, error) {
					jsPassphrase, err := jsutil.AwaitPromise(jsFunctions.Call("getAuthPrivateKeyPassphrase", sha256Fingerprint))
					if err != nil {
						return "", err
					}
					return jsPassphrase.String(), nil
				}
			}
			authKeySets = append(authKeySets, NewAuthKeySet(
				publicKey,
				jsAuthKeySet.Get("privateKey").String(),
				getPassphrase,
				func() {
					jsFunctions.Call("onAuthSigned", sha256Fingerprint)
				},
			))
		}
		err := DoSsh(conn, term, &SSHOptions{
			User:           jsParams.Get("username").String(),
			ResizeCh:       resizeCh,
			OnPasswordAuth: onPasswordAuth,
			OnHostKey:      onHostKey,
			AuthKeySets:    authKeySets,
			OnConnected: func() {
				jsFunctions.Call("onConnected")
			},
		})
		if err != nil {
			return nil, err
		}
		return nil, nil
	})
}
