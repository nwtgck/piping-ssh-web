package main

import (
	"crypto/x509"
	"fmt"
	"golang.org/x/crypto/ssh"
	"io"
	"net"
	"syscall/js"
)

type TermWindow struct {
	Cols int
	Rows int
}

type Term struct {
	writeFunc func(p []byte)
	readCh    <-chan []byte
	cols      int
	rows      int
}

func NewTerm(writeFunc func(p []byte), readCh <-chan []byte, cols int, rows int) *Term {
	return &Term{writeFunc: writeFunc, readCh: readCh, cols: cols, rows: rows}
}

func (t *Term) Write(p []byte) (int, error) {
	t.writeFunc(p)
	return len(p), nil
}

// TODO: EOF or finish signal
func (t *Term) ReadChunk() []byte {
	return <-t.readCh
}

type SSHOptions struct {
	User           string
	OnPasswordAuth func() (string, error)
	OnHostKey      func(value js.Value) (bool, error)
	ResizeCh       <-chan TermWindow
	AuthKeySets    []*AuthKeySet
	OnConnected    func()
	DisconnectCh   <-chan struct{}
}

// For delay passphrase input
type AuthKeySet struct {
	publicKey ssh.PublicKey

	privateKeyStr string
	getPassphrase func() (string, error)
	cachedSigner  ssh.Signer

	onSigned func()
}

func NewAuthKeySet(publicKey ssh.PublicKey, privateKeyStr string, getPassphrase func() (string, error), onSigned func()) *AuthKeySet {
	return &AuthKeySet{publicKey: publicKey, privateKeyStr: privateKeyStr, getPassphrase: getPassphrase, onSigned: onSigned}
}

var _ ssh.Signer = (*AuthKeySet)(nil)

func (k *AuthKeySet) PublicKey() ssh.PublicKey {
	return k.publicKey
}

func (k *AuthKeySet) Sign(rand io.Reader, data []byte) (*ssh.Signature, error) {
	defer k.onSigned()
	if k.cachedSigner != nil {
		return k.cachedSigner.Sign(rand, data)
	}
	var signer ssh.Signer
	var err error
	if k.getPassphrase == nil {
		signer, err = ssh.ParsePrivateKey([]byte(k.privateKeyStr))
		if err != nil {
			return nil, err
		}
	} else {
		for i := 0; i < 3; i++ {
			passphrase, err := k.getPassphrase()
			if err != nil {
				return nil, err
			}
			signer, err = ssh.ParsePrivateKeyWithPassphrase([]byte(k.privateKeyStr), []byte(passphrase))
			if err == x509.IncorrectPasswordError {
				continue
			}
			if err != nil {
				return nil, err
			}
			goto passphraseOk
		}
		return nil, fmt.Errorf("reach passphrase try limit")
	passphraseOk:
	}
	k.cachedSigner = signer
	return signer.Sign(rand, data)
}

func DoSsh(conn net.Conn, term *Term, options *SSHOptions) error {
	var authSigners []ssh.Signer
	for _, k := range options.AuthKeySets {
		authSigners = append(authSigners, k)
	}
	sshConfig := &ssh.ClientConfig{
		User: options.User,
		Auth: []ssh.AuthMethod{
			ssh.PublicKeys(authSigners...),
			ssh.RetryableAuthMethod(ssh.PasswordCallback(func() (secret string, err error) {
				password, err := options.OnPasswordAuth()
				if err != nil {
					return "", err
				}
				return password, nil
			}), 3),
		},
		HostKeyCallback: func(hostname string, remote net.Addr, key ssh.PublicKey) error {
			ok, err := options.OnHostKey(js.ValueOf(map[string]any{
				"key": map[string]any{
					"type":        key.Type(),
					"fingerprint": ssh.FingerprintSHA256(key),
				},
			}))
			if err != nil {
				return err
			}
			if ok {
				return nil
			}
			return fmt.Errorf("host key error")
		},
	}
	sshConn, chans, reqs, err := ssh.NewClientConn(conn, "dummyaddr", sshConfig)
	if err != nil {
		return err
	}
	defer sshConn.Close()
	go func() {
		<-options.DisconnectCh
		fmt.Println("disconnecting with chan")
		if err := sshDisconnect(sshConn); err != nil {
			fmt.Println("disconnect error", err)
		}
	}()
	defer func() {
		if err := sshDisconnect(sshConn); err != nil {
			fmt.Println("disconnect error", err)
		}
	}()
	options.OnConnected()
	client := ssh.NewClient(sshConn, chans, reqs)
	if err != nil {
		return err
	}
	session, err := client.NewSession()
	if err != nil {
		return err
	}
	if err := session.RequestPty("xterm-256color", term.rows, term.cols, ssh.TerminalModes{}); err != nil {
		session.Close()
		return err
	}
	stdin, err := session.StdinPipe()
	if err != nil {
		return err
	}
	errCh := make(chan error)
	go func() {
		for {
			_, err := stdin.Write(term.ReadChunk())
			if err != nil {
				errCh <- err
			}
		}
	}()
	stdout, err := session.StdoutPipe()
	if err != nil {
		return err
	}
	go func() {
		_, err := io.Copy(term, stdout)
		errCh <- err
	}()
	stderr, err := session.StderrPipe()
	if err != nil {
		return err
	}
	go func() {
		_, err := io.Copy(term, stderr)
		errCh <- err
	}()
	if err := session.Shell(); err != nil {
		return err
	}
	go func() {
		for window := range options.ResizeCh {
			err := session.WindowChange(window.Rows, window.Cols)
			if err != nil {
				fmt.Println("window change error", err)
			}
		}
	}()
	go func() {
		errCh <- session.Wait()
	}()
	if err := <-errCh; err != nil {
		return err
	}
	return nil
}

// proposal: https://github.com/golang/go/issues/37913
func sshDisconnect(sshConn ssh.Conn) (err error) {
	// https://www.rfc-editor.org/rfc/rfc4253#section-12
	const SSH_MSG_DISCONNECT = 1
	// https://www.rfc-editor.org/rfc/rfc4253#section-11.1
	type disconnectMsg struct {
		Reason      uint32
		Description string
		LanguageTag string
	}
	const SSH_DISCONNECT_BY_APPLICATION = 11

	p := append(
		[]byte{SSH_MSG_DISCONNECT},
		ssh.Marshal(disconnectMsg{Reason: SSH_DISCONNECT_BY_APPLICATION, Description: "Finished"})...,
	)
	// See golang-crypto.patch
	return ssh.PublicWritePacket(sshConn, p)
}
