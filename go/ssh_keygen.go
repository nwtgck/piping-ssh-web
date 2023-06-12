package main

import (
	"bytes"
	"crypto/ed25519"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"github.com/mikesmitty/edkey"
	"golang.org/x/crypto/ssh"
)

type GeneratedKeys struct {
	PublicKey  string
	PrivateKey string
}

func generateRsaKeys(keyBits int) (*GeneratedKeys, error) {
	privateKey, err := rsa.GenerateKey(rand.Reader, keyBits)
	if err != nil {
		return nil, err
	}
	privateKeyBlock := pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(privateKey)}
	var buf bytes.Buffer
	if err := pem.Encode(&buf, &privateKeyBlock); err != nil {
		return nil, err
	}
	privateKeyString := buf.String()
	sshPublicKey, err := ssh.NewPublicKey(&privateKey.PublicKey)
	if err != nil {
		return nil, err
	}
	return &GeneratedKeys{
		PublicKey:  string(ssh.MarshalAuthorizedKey(sshPublicKey)),
		PrivateKey: privateKeyString,
	}, nil
}

func generateEd25519Keys() (*GeneratedKeys, error) {
	publicKey, privateKey, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, err
	}
	// ed25519 issue: https://github.com/golang/go/issues/37132
	// NOTE: edkey is used in https://github.com/hashicorp/vault
	privateKeyBlock := pem.Block{Type: "OPENSSH PRIVATE KEY", Bytes: edkey.MarshalED25519PrivateKey(privateKey)}
	var buf bytes.Buffer
	if err := pem.Encode(&buf, &privateKeyBlock); err != nil {
		return nil, err
	}
	privateKeyString := buf.String()

	sshPublicKey, err := ssh.NewPublicKey(publicKey)
	if err != nil {
		return nil, err
	}

	return &GeneratedKeys{
		PublicKey:  string(ssh.MarshalAuthorizedKey(sshPublicKey)),
		PrivateKey: privateKeyString,
	}, nil
}
