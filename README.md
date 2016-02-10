# Wisembly Logging Vendor

> Catches every asynchronous exception that may be triggered by your code, by hooking asynchronous functions.

## Basic usage

```js
var wisemblyLogging = new WisemblyLogging(true);
```

## Constructor options

If the constructor parameter is `true`, all the following options will be enabled:

  - **hookEventListeners** will hook DOM event listeners (both via `addEventListener()` calls and `on{Event}` properties), including XHR ones
  - **hookAnimationFrame** will hook HTML5 `requestionAnimationFrame()`
  - **hookTimeout** will hook `setTimeout`
  - **hookInterval** will hook `setInterval`

## Third-party builtin support

This module will use Logmatic together with Stacktrace.js when available, and degrade gracefully when they're not. It won't do anything if none of them can be located.

## Custom reporting

Should you want to define your own messaging action, feel free to override the `captureMessage` function to do whatever you want. However, overriding `captureException` should probably be avoided (since it uses `captureMessage`, any override that you may have set there will be used by `captureException`).

## Compatibility

This module uses a fair bit of magic, and might conflict with other libraries, even if unlikely (how many other libraries redefine `on{Event}` properties, really?). Your mileage may vary. Caution. Warnung. Prudence. Cautela. Waarschuwingscommando.

## License

MIT. See `LICENSE.md`
