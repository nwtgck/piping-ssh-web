package main

import (
	"bytes"
	"errors"
	"github.com/nwtgck/piping-ssh-web/go/jsutil"
	"net"
	"syscall/js"
	"time"
)

type TransportConn struct {
	jsReadable js.Value
	jsWritable js.Value

	jsReader           js.Value
	readBuffer         bytes.Buffer
	underlyingReadDone bool

	jsWriter js.Value
}

func NewTransportConn(jsReadable js.Value, jsWritable js.Value) net.Conn {
	jsReader := jsReadable.Call("getReader")
	jsWriter := jsWritable.Call("getWriter")
	return &TransportConn{jsReadable: jsReadable, jsWritable: jsWritable, jsReader: jsReader, jsWriter: jsWriter}
}

func (d *TransportConn) Read(p []byte) (int, error) {
	for !d.underlyingReadDone && d.readBuffer.Len() == 0 {
		result, err := jsutil.AwaitPromise(d.jsReader.Call("read"))
		if err != nil {
			return 0, err
		}
		done := result.Get("done").Bool()
		d.underlyingReadDone = done
		if done {
			break
		}
		value := jsutil.Uint8ArrayToBytes(result.Get("value"))
		d.readBuffer.Write(value)
	}
	return d.readBuffer.Read(p)
}

func (d *TransportConn) Write(p []byte) (int, error) {
	_, err := jsutil.AwaitPromise(d.jsWriter.Call("write", jsutil.BytesToUint8Array(p)))
	if err != nil {
		return 0, err
	}
	return len(p), nil
}

func (d *TransportConn) Close() error {
	_, err1 := jsutil.AwaitPromise(d.jsReader.Call("cancel"))
	_, err2 := jsutil.AwaitPromise(d.jsWriter.Call("close"))
	return errors.Join(err1, err2)
}

func (d *TransportConn) LocalAddr() net.Addr {
	return nil
}

func (d *TransportConn) RemoteAddr() net.Addr {
	return nil
}

func (d *TransportConn) SetDeadline(t time.Time) error {
	return nil
}

func (d *TransportConn) SetReadDeadline(t time.Time) error {
	return nil
}

func (d *TransportConn) SetWriteDeadline(t time.Time) error {
	return nil
}
