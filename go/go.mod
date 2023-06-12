module github.com/nwtgck/piping-ssh-web/go

go 1.20

require (
	github.com/mikesmitty/edkey v0.0.0-20170222072505-3356ea4e686a
	golang.org/x/crypto v0.9.0
)

// Safety:
// ./golang-crypto diretory is git@github.com:golang/crypto.git, which is Go official mirror.
// All patch is written in ./golang-crypto.patch.
replace golang.org/x/crypto => ./golang-crypto

require golang.org/x/sys v0.8.0 // indirect
