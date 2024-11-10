/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck

// manually create polyfills for node:streams
import { EventEmitter } from 'events';
import inherits from 'inherits';
import _readable from 'readable-stream/lib/_stream_readable.js';
import _writable from 'readable-stream/lib/_stream_writable.js';
import _duplex from 'readable-stream/lib/_stream_duplex.js';
import _transform from 'readable-stream/lib/_stream_transform.js';
import _passThrough from 'readable-stream/lib/_stream_passthrough.js';
import _finished from 'readable-stream/lib/internal/streams/end-of-stream.js';
import _pipeline from 'readable-stream/lib/internal/streams/pipeline.js';

export default Stream;

var EE = EventEmitter;

inherits(Stream, EE);
Stream.Readable = _readable;
Stream.Writable = _writable;
Stream.Duplex = _duplex;
Stream.Transform = _transform;
Stream.PassThrough = _passThrough;
Stream.finished = _finished;
Stream.pipeline = _pipeline;

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function (dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }

  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};
