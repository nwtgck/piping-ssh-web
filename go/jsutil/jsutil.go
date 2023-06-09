package jsutil

import (
	"fmt"
	"syscall/js"
)

var Error = js.Global().Get("Error")
var Uint8Array = js.Global().Get("Uint8Array")
var Promise = js.Global().Get("Promise")

func NewError(err error) js.Value {
	return Error.New(fmt.Sprintf("Go error: %+v", err))
}

func BytesToUint8Array(b []byte) js.Value {
	arr := Uint8Array.New(len(b))
	js.CopyBytesToJS(arr, b)
	return arr
}

func Uint8ArrayToBytes(uint8Array js.Value) []byte {
	bs := make([]byte, uint8Array.Get("byteLength").Int())
	js.CopyBytesToGo(bs, uint8Array)
	return bs
}

func NewPromise(f func() (any, error)) js.Value {
	return Promise.New(js.FuncOf(func(this js.Value, args []js.Value) any {
		resolve := args[0]
		reject := args[1]
		go func() {
			value, err := f()
			if err != nil {
				reject.Invoke(NewError(err))
				return
			}
			resolve.Invoke(value)
		}()
		return nil
	}))
}

func AwaitPromise(promise js.Value) (js.Value, error) {
	then := promise.Get("then")
	if then.IsUndefined() || then.Type() != js.TypeFunction {
		return promise, nil
	}
	valueCh := make(chan js.Value)
	errCh := make(chan error)
	promise.Call("then", js.FuncOf(func(this js.Value, args []js.Value) any {
		valueCh <- args[0]
		return nil
	})).Call("catch", js.FuncOf(func(this js.Value, args []js.Value) any {
		errCh <- fmt.Errorf("promise error: %+v", args[0])
		return nil
	}))
	select {
	case value := <-valueCh:
		return value, nil
	case err := <-errCh:
		return js.Value{}, err
	}
}
